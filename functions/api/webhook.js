/**
 * Cloudflare Pages Function - GitHub Webhook
 * Verifies signature, fetches/creates pow3r.v3.status.json for the repo,
 * and updates KV (projects:data) for the visualization.
 */

function timingSafeEqual(a, b) {
  const aBuf = new TextEncoder().encode(a);
  const bBuf = new TextEncoder().encode(b);
  if (aBuf.length !== bBuf.length) return false;
  let out = 0;
  for (let i = 0; i < aBuf.length; i++) out |= aBuf[i] ^ bBuf[i];
  return out === 0;
}

async function verifyGithubSignature(request, secret) {
  if (!secret) return false;
  const signature = request.headers.get('X-Hub-Signature-256');
  if (!signature || !signature.startsWith('sha256=')) return false;

  const body = await request.clone().arrayBuffer();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, body);
  const digest = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  const computed = `sha256=${digest}`;
  return timingSafeEqual(signature, computed);
}

async function fetchGhJson(url, token) {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

async function fetchPow3rStatus(owner, repo, ref, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/pow3r.status.json?ref=${encodeURIComponent(ref)}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch pow3r.status.json from ${owner}/${repo}@${ref}`);
  const meta = await res.json();
  const decoded = atob(meta.content);
  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const ok = await verifyGithubSignature(request, env.GITHUB_WEBHOOK_SECRET);
    if (!ok) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid signature' }), { status: 401 });
    }

    const event = request.headers.get('X-GitHub-Event');
    const payload = await request.json();

    // Determine repo
    const repo = payload.repository?.name;
    const owner = payload.repository?.owner?.login;
    const ref = payload.ref?.replace('refs/heads/', '') || payload.repository?.default_branch || 'main';
    if (!repo || !owner) {
      return new Response(JSON.stringify({ success: false, error: 'Missing repo info' }), { status: 400 });
    }

    // Try to fetch pow3r.status.json; fallback to generate minimal structure using languages/commit activity
    let status = await fetchPow3rStatus(owner, repo, ref, env.GITHUB_TOKEN);

    if (!status) {
      const langs = await fetchGhJson(`https://api.github.com/repos/${owner}/${repo}/languages`, env.GITHUB_TOKEN).catch(() => ({}));
      const commits = await fetchGhJson(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`, env.GITHUB_TOKEN).catch(() => []);
      const last4 = Array.isArray(commits) ? commits.slice(-4).reduce((s, w) => s + (w.total || 0), 0) : 0;
      const phase = last4 > 20 ? 'green' : last4 > 0 ? 'orange' : 'gray';
      status = {
        graphId: `${owner}-${repo}`,
        lastScan: new Date().toISOString(),
        assets: [
          {
            id: `${repo}-root`,
            type: 'component.ui.react',
            source: 'github',
            location: `https://github.com/${owner}/${repo}`,
            metadata: { title: repo, tags: Object.keys(langs || {}) },
            status: { phase, completeness: 0.5, qualityScore: 0.5 },
            dependencies: { io: {}, universalConfigRef: 'v1.0' },
            analytics: { embedding: [], connectivity: 0, centralityScore: 0.5, activityLast30Days: last4 }
          }
        ],
        edges: [],
        metadata: { owner, repo, ref, configType: 'v2' }
      };
    }

    // Update KV aggregate
    const kv = env.POW3R_STATUS_KV;
    if (kv) {
      const raw = await kv.get('projects:data');
      let aggregate = raw ? JSON.parse(raw) : { success: true, count: 0, projects: [] };
      const idx = aggregate.projects.findIndex(p => (p.metadata?.owner === owner && p.metadata?.repo === repo) || p.projectName === repo);
      if (idx >= 0) {
        aggregate.projects[idx] = status;
      } else {
        aggregate.projects.push(status);
        aggregate.count = aggregate.projects.length;
      }
      aggregate.timestamp = new Date().toISOString();
      await kv.put('projects:data', JSON.stringify(aggregate));
    }

    return new Response(JSON.stringify({ success: true, repo: `${owner}/${repo}`, event }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
