export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  const signature = request.headers.get('x-hub-signature-256');
  // Optionally validate signature here with env.GITHUB_WEBHOOK_SECRET

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Determine repo and owner
  const repo = payload?.repository?.name;
  const owner = payload?.repository?.owner?.login;
  if (!repo || !owner) {
    return new Response('Missing repository info', { status: 400 });
  }

  const repoKey = `status:${owner}/${repo}`;

  // Minimal status update document (repo-level node)
  const node = {
    id: `${owner}/${repo}`,
    name: repo,
    type: 'service',
    category: 'Repository',
    status: 'orange',
    metadata: { owner, repo },
  };

  const doc = {
    projectName: `${owner}/${repo}`,
    lastUpdate: new Date().toISOString(),
    source: 'remote',
    status: 'orange',
    stats: {
      totalCommitsLast30Days: 0,
      totalCommitsLast14Days: 0,
      fileCount: 0,
      sizeMB: 0,
      primaryLanguage: 'Unknown',
      workingTreeClean: true
    },
    nodes: [node],
    edges: [],
    metadata: { event: payload?.action || 'push' }
  };

  try {
    const kv = env.STATUS_KV as KVNamespace | undefined;
    if (kv) {
      // Store per-repo snapshot
      await kv.put(repoKey, JSON.stringify(doc), { expirationTtl: 60 * 60 * 24 });

      // Update aggregate
      const aggregateKey = 'status:aggregate';
      const existing = await kv.get(aggregateKey, { type: 'json' }) as any;
      const aggregate = existing && existing.nodes ? existing : {
        projectName: 'GitHub Repositories',
        lastUpdate: new Date().toISOString(),
        source: 'remote',
        status: 'green',
        stats: {
          totalCommitsLast30Days: 0,
          totalCommitsLast14Days: 0,
          fileCount: 0,
          sizeMB: 0,
          primaryLanguage: 'Mixed',
          workingTreeClean: true
        },
        nodes: [],
        edges: [],
        metadata: { repos: [] }
      };

      // Replace or insert repo node
      const nodes = Array.isArray(aggregate.nodes) ? aggregate.nodes : [];
      const idx = nodes.findIndex((n: any) => n.id === node.id);
      if (idx >= 0) nodes[idx] = node; else nodes.push(node);

      aggregate.nodes = nodes;
      aggregate.lastUpdate = new Date().toISOString();
      aggregate.metadata = aggregate.metadata || {};
      const reposList: string[] = Array.isArray(aggregate.metadata.repos) ? aggregate.metadata.repos : [];
      if (!reposList.includes(`${owner}/${repo}`)) reposList.push(`${owner}/${repo}`);
      aggregate.metadata.repos = reposList;

      await kv.put(aggregateKey, JSON.stringify(aggregate));
    }
  } catch (e) {
    return new Response(`KV error: ${(e as Error).message}`, { status: 500 });
  }

  return new Response('OK', { status: 200 });
};
