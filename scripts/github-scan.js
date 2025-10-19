#!/usr/bin/env node
/**
 * GitHub Org Scanner
 * Fetches pow3r.v3.status.json from all repositories in an org/user
 * and writes a consolidated public/data.json used by the 3D graph app.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.PAT_GITHUB;
const GITHUB_ORG = process.env.GITHUB_ORG || process.env.GITHUB_USER || 'memorymusicllc';
const OUTPUT_FILE = path.join(__dirname, '../public/data.json');

async function safeFetch(url, init = {}) {
  const res = await fetch(url, init);
  return res;
}

async function fetchJson(url, headers = {}) {
  const res = await safeFetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}: ${text}`);
  }
  return res.json();
}

function ghHeaders() {
  if (!GITHUB_TOKEN) return { 'Accept': 'application/vnd.github+json' };
  return {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

async function listAllRepos() {
  const repos = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=100&page=${page}`;
    const data = await fetchJson(url, ghHeaders());
    if (!Array.isArray(data) || data.length === 0) break;
    repos.push(...data);
    if (data.length < 100) break;
    page += 1;
  }
  return repos;
}

async function getCommitActivity(owner, repo) {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`;
    const data = await fetchJson(url, ghHeaders());
    if (!Array.isArray(data)) return 0;
    // Sum last 4 weeks
    const last4Weeks = data.slice(-4);
    return last4Weeks.reduce((sum, w) => sum + (w.total || 0), 0);
  } catch {
    return 0;
  }
}

async function getLanguages(owner, repo) {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/languages`;
    const data = await fetchJson(url, ghHeaders());
    return data;
  } catch {
    return {};
  }
}

function inferAssetTypeFromLanguages(langs) {
  const keys = Object.keys(langs || {}).map(k => k.toLowerCase());
  if (keys.some(k => ['typescript', 'javascript'].includes(k))) return 'component.ui.react';
  if (keys.some(k => ['python', 'go', 'rust', 'java', 'kotlin', 'c#', 'csharp'].includes(k))) return 'service.backend';
  if (keys.some(k => ['markdown'].includes(k))) return 'doc.markdown';
  return 'library.js';
}

function phaseFromCommits(commits30d) {
  if (commits30d > 20) return 'green';
  if (commits30d > 0) return 'orange';
  return 'gray';
}

function sha16(input) {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

async function getPow3rStatus(owner, repo, ref) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/config/pow3r.v3.status.json?ref=${encodeURIComponent(ref)}`;
  const res = await safeFetch(url, { headers: ghHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch pow3r.v3.status.json from ${owner}/${repo}@${ref}`);
  const contentMeta = await res.json();
  if (contentMeta && contentMeta.content) {
    const decoded = Buffer.from(contentMeta.content, 'base64').toString('utf8');
    try {
      const json = JSON.parse(decoded);
      // Attach metadata for the frontend to use
      json.metadata = {
        ...(json.metadata || {}),
        path: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/config/pow3r.v3.status.json`,
        relativePath: `${repo}/config/pow3r.v3.status.json`,
        configType: 'v2',
        owner,
        repo,
        ref
      };
      return json;
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function fetchTree(owner, repo, ref) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
  try {
    const data = await fetchJson(url, ghHeaders());
    return Array.isArray(data?.tree) ? data.tree : [];
  } catch {
    return [];
  }
}

function classifyDirectory(name) {
  const n = name.toLowerCase();
  if (['src', 'client', 'frontend', 'web', 'app'].some(p => n === p)) return { type: 'component.ui.react', category: 'Frontend' };
  if (['server', 'backend', 'api'].some(p => n === p)) return { type: 'service.backend', category: 'Backend' };
  if (['functions', 'workers', 'cloudflare'].some(p => n.includes(p))) return { type: 'service.serverless', category: 'Functions' };
  if (['components', 'widgets', 'ui'].some(p => n.includes(p))) return { type: 'component.ui.react', category: 'UI Components' };
  if (['docs', 'documentation'].some(p => n.includes(p))) return { type: 'doc.markdown', category: 'Documentation' };
  if (['tests', '__tests__', 'e2e', 'spec'].some(p => n.includes(p))) return { type: 'test.e2e', category: 'Testing' };
  if (['config', '.github', '.circleci'].some(p => n.includes(p))) return { type: 'config.schema', category: 'Configuration' };
  if (['scripts', 'tools'].some(p => n.includes(p))) return { type: 'workflow.automation', category: 'Automation' };
  return { type: 'library.js', category: 'Library' };
}

async function generateFallbackStatus(owner, repo, ref = 'main') {
  const commits30d = await getCommitActivity(owner, repo);
  const languages = await getLanguages(owner, repo);
  const assetType = inferAssetTypeFromLanguages(languages);
  const phase = phaseFromCommits(commits30d);
  const now = new Date().toISOString();
  const graphId = sha16(`${owner}/${repo}@${now}`);

  // Build assets from tree (top-level directories)
  const tree = await fetchTree(owner, repo, ref);
  const topDirs = new Set();
  for (const item of tree) {
    if (item.type === 'tree' && item.path && !item.path.includes('/')) topDirs.add(item.path);
  }

  const assets = [];
  // project root asset
  assets.push({
    id: `${repo}-root`,
    type: assetType,
    source: 'github',
    location: `https://github.com/${owner}/${repo}`,
    metadata: {
      title: repo,
      description: `Auto-generated status for ${owner}/${repo}`,
      tags: Object.keys(languages),
      version: '1.0.0',
      authors: [],
      createdAt: now,
      lastUpdate: now
    },
    status: {
      phase,
      completeness: 0.6,
      qualityScore: 0.55,
      notes: commits30d > 0 ? 'Active repository' : 'No recent activity'
    },
    dependencies: {
      io: {},
      universalConfigRef: 'v1.0'
    },
    analytics: {
      embedding: [],
      connectivity: 0,
      centralityScore: 0.5,
      activityLast30Days: commits30d
    }
  });

  const edges = [];
  let assetIndex = 0;
  for (const dir of topDirs) {
    const cls = classifyDirectory(dir);
    const assetId = `${repo}-${dir}`;
    assets.push({
      id: assetId,
      type: cls.type,
      source: 'github',
      location: `https://github.com/${owner}/${repo}/tree/${ref}/${dir}`,
      metadata: {
        title: dir,
        description: `${cls.category} directory`,
        tags: [cls.category.toLowerCase(), ...Object.keys(languages)],
        version: '1.0.0',
        authors: [],
        createdAt: now,
        lastUpdate: now
      },
      status: {
        phase,
        completeness: 0.5,
        qualityScore: 0.5,
        notes: 'Generated from repository structure'
      },
      dependencies: { io: {}, universalConfigRef: 'v1.0' },
      analytics: { embedding: [], connectivity: 1, centralityScore: 0.4, activityLast30Days: commits30d }
    });
    edges.push({ from: `${repo}-root`, to: assetId, type: 'partOf', strength: 0.9 });
    assetIndex += 1;
  }

  return {
    graphId,
    lastScan: now,
    assets,
    edges,
    metadata: {
      owner,
      repo,
      ref,
      path: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/config/pow3r.v3.status.json`,
      relativePath: `${repo}/config/pow3r.v3.status.json`,
      configType: 'v2'
    }
  };
}

async function main() {
  if (!GITHUB_TOKEN) {
    console.warn('⚠️  GITHUB_TOKEN not set. Skipping GitHub scan.');
    return 0;
  }
  console.log(`\n🔎 Scanning GitHub org: ${GITHUB_ORG}`);
  const repos = await listAllRepos();
  console.log(`📦 Found ${repos.length} repositories`);

  const projects = [];
  for (const repo of repos) {
    const owner = repo.owner?.login || GITHUB_ORG;
    const name = repo.name;
    const ref = repo.default_branch || 'main';
    try {
      const cfg = await getPow3rStatus(owner, name, ref);
      if (cfg) {
        projects.push(cfg);
        console.log(`  ✓ ${owner}/${name} → pow3r.v3.status.json`);
      } else {
        const fallback = await generateFallbackStatus(owner, name);
        projects.push(fallback);
        console.log(`  • ${owner}/${name} → generated fallback`);
      }
    } catch (e) {
      console.warn(`  ✗ ${owner}/${name}: ${e.message}`);
    }
  }

  const data = {
    success: true,
    count: projects.length,
    basePath: `github:${GITHUB_ORG}`,
    timestamp: new Date().toISOString(),
    generatedBy: 'github-scan.js',
    projects
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`\n✅ Wrote ${projects.length} projects → ${OUTPUT_FILE}`);
  return projects.length;
}

if (require.main === module) {
  main()
    .then((count) => {
      console.log(`🎉 GitHub scan complete (${count})`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = { main };
