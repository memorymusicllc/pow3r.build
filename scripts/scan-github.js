#!/usr/bin/env node
/**
 * GitHub Scanner
 * - Scans an organization or a list of repositories
 * - Generates pow3r.status.json for each repository with architecture and dev status
 * - Optionally aggregates and writes public/data.json
 *
 * Env vars:
 *   GITHUB_TOKEN      - Required for authenticated GitHub API access
 *   GITHUB_ORG        - Organization name to scan (optional if GITHUB_REPOS provided)
 *   GITHUB_REPOS      - Comma-separated list of full repo names (e.g., org/repo1,org/repo2)
 *   OUTPUT_DIR        - Directory to write outputs (default: ./output/github)
 *   AGGREGATE_OUTPUT  - If 'true', also write a combined config to public/pow3r.status.config.json
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_ORG = process.env.GITHUB_ORG || '';
const GITHUB_REPOS = process.env.GITHUB_REPOS || '';
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, '../output/github');
const AGGREGATE_OUTPUT = (process.env.AGGREGATE_OUTPUT || 'true').toLowerCase() === 'true';

if (!GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN is required');
  process.exit(1);
}

const headers = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'pow3r.build-scanner'
};

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status} ${res.statusText} for ${url}: ${text}`);
  }
  return res.json();
}

function daysBetween(a, b) {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function computeStatusFromRecency(lastPushedAt) {
  if (!lastPushedAt) return 'gray';
  const days = daysBetween(lastPushedAt, new Date().toISOString());
  if (days <= 7) return 'green';
  if (days <= 30) return 'orange';
  return 'red';
}

async function getCommitCounts(owner, repo) {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [commits30, commits14] = await Promise.all([
    fetchJson(`${GITHUB_API}/repos/${owner}/${repo}/commits?since=${encodeURIComponent(since30)}&per_page=100&page=1`).then(r => (Array.isArray(r) ? r.length : 0)).catch(() => 0),
    fetchJson(`${GITHUB_API}/repos/${owner}/${repo}/commits?since=${encodeURIComponent(since14)}&per_page=100&page=1`).then(r => (Array.isArray(r) ? r.length : 0)).catch(() => 0)
  ]);

  return { totalCommitsLast30Days: commits30, totalCommitsLast14Days: commits14 };
}

async function getTreeStats(owner, repo, branch) {
  try {
    const commit = await fetchJson(`${GITHUB_API}/repos/${owner}/${repo}/commits/${encodeURIComponent(branch)}`);
    const treeSha = commit?.commit?.tree?.sha;
    if (!treeSha) throw new Error('Missing tree sha');
    const tree = await fetchJson(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
    let fileCount = 0;
    let totalBytes = 0;
    let topDirs = new Map();

    for (const item of tree.tree || []) {
      if (item.type === 'blob') {
        fileCount += 1;
        if (typeof item.size === 'number') totalBytes += item.size;
        const parts = item.path.split('/');
        const top = parts[0];
        topDirs.set(top, (topDirs.get(top) || 0) + 1);
      }
    }

    return {
      fileCount,
      sizeMB: Math.round((totalBytes / (1024 * 1024)) * 100) / 100,
      topDirectories: Array.from(topDirs.entries()).map(([name, count]) => ({ name, count }))
    };
  } catch (e) {
    return { fileCount: 0, sizeMB: 0, topDirectories: [] };
  }
}

async function generateRepoStatus(owner, repo) {
  const repoMeta = await fetchJson(`${GITHUB_API}/repos/${owner}/${repo}`);
  const defaultBranch = repoMeta.default_branch || 'main';

  const [languages, commits, treeStats] = await Promise.all([
    fetchJson(`${GITHUB_API}/repos/${owner}/${repo}/languages`).catch(() => ({})),
    getCommitCounts(owner, repo).catch(() => ({ totalCommitsLast30Days: 0, totalCommitsLast14Days: 0 })),
    getTreeStats(owner, repo, defaultBranch).catch(() => ({ fileCount: 0, sizeMB: 0, topDirectories: [] }))
  ]);

  const primaryLanguage = Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] || (repoMeta.language || 'Unknown');
  const status = computeStatusFromRecency(repoMeta.pushed_at || repoMeta.updated_at);

  const repoNodeId = `${owner}/${repo}`;

  const languageNodes = Object.keys(languages).slice(0, 4).map((lang, idx) => ({
    id: `${repoNodeId}-lang-${idx}-${lang}`,
    name: lang,
    type: 'data',
    category: 'Language',
    status: 'green',
    fileType: 'data.language',
    tags: ['language'],
    metadata: { language: lang },
    position: { x: -200 + idx * 100, y: 80, z: 0 }
  }));

  const directoryNodes = (treeStats.topDirectories || [])
    .filter(d => d.name && d.name !== 'node_modules' && !d.name.startsWith('.'))
    .slice(0, 12)
    .map((dir, idx) => ({
      id: `${repoNodeId}-dir-${idx}-${dir.name}`,
      name: dir.name,
      type: 'component',
      category: 'Directory',
      status: status,
      fileType: 'component.module',
      tags: ['dir'],
      metadata: { directory: dir.name, fileCount: dir.count },
      position: { x: -300 + (idx % 6) * 120, y: -60 - Math.floor(idx / 6) * 120, z: 0 }
    }));

  const nodes = [
    {
      id: repoNodeId,
      name: repoMeta.name,
      type: 'service',
      category: 'Repository',
      description: repoMeta.description || '',
      status,
      fileType: 'repo.github',
      tags: ['github', owner],
      metadata: {
        owner,
        repo,
        defaultBranch,
        visibility: repoMeta.private ? 'private' : 'public',
        url: repoMeta.html_url
      },
      stats: {
        ...commits,
        fileCount: treeStats.fileCount,
        sizeMB: treeStats.sizeMB,
        primaryLanguage,
        workingTreeClean: true
      },
      quality: {
        completeness: status === 'green' ? 0.9 : status === 'orange' ? 0.7 : 0.5,
        qualityScore: status === 'green' ? 0.85 : status === 'orange' ? 0.7 : 0.5
      },
      position: { x: 0, y: 0, z: 0 }
    },
    ...languageNodes,
    ...directoryNodes
  ];

  const edges = [
    ...languageNodes.map(n => ({
      id: `${repoNodeId}->${n.id}`,
      from: repoNodeId,
      to: n.id,
      type: 'uses',
      label: 'uses'
    })),
    ...directoryNodes.map(n => ({
      id: `${repoNodeId}->${n.id}`,
      from: repoNodeId,
      to: n.id,
      type: 'contains',
      label: 'contains'
    }))
  ];

  const config = {
    projectName: `${owner}/${repo}`,
    lastUpdate: new Date().toISOString(),
    source: 'remote',
    repositoryPath: repoMeta.html_url,
    branch: defaultBranch,
    status,
    stats: {
      totalCommitsLast30Days: nodes[0].stats.totalCommitsLast30Days,
      totalCommitsLast14Days: nodes[0].stats.totalCommitsLast14Days,
      fileCount: nodes[0].stats.fileCount,
      sizeMB: nodes[0].stats.sizeMB,
      primaryLanguage,
      workingTreeClean: true
    },
    nodes,
    edges,
    metadata: {
      repoId: repoMeta.id,
      visibility: repoMeta.private ? 'private' : 'public'
    }
  };

  return config;
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function writeJson(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
}

function makeAggregateConfig(configs) {
  const nodes = [];
  const edges = [];

  configs.forEach((cfg, idx) => {
    const offsetX = (idx % 5) * 500 - 1000;
    const offsetY = Math.floor(idx / 5) * 400 - 400;
    const idPrefix = `repo-${idx}-`;

    cfg.nodes.forEach(n => {
      nodes.push({
        ...n,
        id: idPrefix + n.id,
        position: n.position ? { x: (n.position.x || 0) + offsetX, y: (n.position.y || 0) + offsetY, z: n.position.z || 0 } : undefined
      });
    });
    cfg.edges.forEach(e => {
      edges.push({
        ...e,
        id: idPrefix + e.id,
        from: idPrefix + e.from,
        to: idPrefix + e.to
      });
    });
  });

  return {
    projectName: GITHUB_ORG ? `${GITHUB_ORG} Repositories` : 'GitHub Repositories',
    lastUpdate: new Date().toISOString(),
    source: 'remote',
    status: 'green',
    stats: {
      totalCommitsLast30Days: configs.reduce((s, c) => s + (c.stats?.totalCommitsLast30Days || 0), 0),
      totalCommitsLast14Days: configs.reduce((s, c) => s + (c.stats?.totalCommitsLast14Days || 0), 0),
      fileCount: configs.reduce((s, c) => s + (c.stats?.fileCount || 0), 0),
      sizeMB: Math.round(configs.reduce((s, c) => s + (c.stats?.sizeMB || 0), 0) * 100) / 100,
      primaryLanguage: 'Mixed',
      workingTreeClean: true
    },
    nodes,
    edges,
    metadata: { repos: configs.map(c => c.projectName) }
  };
}

async function scan() {
  console.log('🔍 Starting GitHub scan...');
  const reposToScan = [];

  if (GITHUB_REPOS) {
    GITHUB_REPOS.split(',').map(s => s.trim()).filter(Boolean).forEach(full => {
      const [owner, repo] = full.split('/');
      if (owner && repo) reposToScan.push({ owner, repo });
    });
  } else if (GITHUB_ORG) {
    let page = 1;
    while (true) {
      const pageRepos = await fetchJson(`${GITHUB_API}/orgs/${GITHUB_ORG}/repos?per_page=100&page=${page}`);
      if (!Array.isArray(pageRepos) || pageRepos.length === 0) break;
      pageRepos.forEach(r => reposToScan.push({ owner: r.owner.login, repo: r.name }));
      if (pageRepos.length < 100) break;
      page += 1;
    }
  } else {
    console.error('Provide GITHUB_ORG or GITHUB_REPOS');
    process.exit(1);
  }

  console.log(`📦 Found ${reposToScan.length} repositories to scan.`);

  const configs = [];
  for (const { owner, repo } of reposToScan) {
    try {
      console.log(`➡️  ${owner}/${repo}`);
      const cfg = await generateRepoStatus(owner, repo);
      configs.push(cfg);
      const outPath = path.join(OUTPUT_DIR, owner, repo, 'pow3r.status.json');
      await writeJson(outPath, cfg);
      console.log(`   ✅ Wrote ${outPath}`);
    } catch (e) {
      console.warn(`   ⚠️  Failed ${owner}/${repo}: ${e.message}`);
    }
  }

  if (AGGREGATE_OUTPUT && configs.length > 0) {
    const aggregate = makeAggregateConfig(configs);
    const aggregatePath = path.join(__dirname, '../public/pow3r.status.config.json');
    await writeJson(aggregatePath, aggregate);
    console.log(`🧩 Wrote aggregate ${aggregatePath}`);
  }

  console.log('✨ Scan complete.');
}

if (require.main === module) {
  scan().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { scan, generateRepoStatus };
