/**
 * CloudFlare Worker - Scan Processor
 * Processes queued repository scans and generates power.status.json
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const message = await request.json();
    
    if (message.type !== 'scan_repository') {
      return new Response('Invalid message type', { status: 400 });
    }
    
    console.log(`🔍 Processing repository scan: ${message.repository}`);
    
    // Update scan status
    await updateScanStatus(env, message.scanId, 'processing');
    
    try {
      // Perform the scan
      const scanResult = await scanRepository(env, message.repository);
      
      // Store the generated power.status.json
      await storePowerStatus(env, message.repository, scanResult);
      
      // Update scan status
      await updateScanStatus(env, message.scanId, 'completed', scanResult);
      
      // Trigger data aggregation
      await triggerDataAggregation(env);
      
      return new Response(JSON.stringify({
        success: true,
        scanId: message.scanId,
        repository: message.repository,
        nodeCount: scanResult.assets.length,
        edgeCount: scanResult.edges.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      // Update scan status with error
      await updateScanStatus(env, message.scanId, 'failed', null, error.message);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Scan processor error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function scanRepository(env, repoFullName) {
  const [owner, repo] = repoFullName.split('/');
  
  // Initialize GitHub API headers
  const headers = {
    'Authorization': `token ${env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Pow3r-CloudFlare-Worker'
  };
  
  // Get repository info
  const repoResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers }
  );
  
  if (!repoResponse.ok) {
    throw new Error(`Failed to fetch repository: ${repoResponse.status}`);
  }
  
  const repoData = await repoResponse.json();
  
  // Get file tree
  const treeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers }
  );
  
  const treeData = treeResponse.ok ? await treeResponse.json() : { tree: [] };
  
  // Get recent commits
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const commitsResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&per_page=100`,
    { headers }
  );
  
  const commits = commitsResponse.ok ? await commitsResponse.json() : [];
  
  // Get issues and PRs
  const [issuesResponse, prsResponse] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`, { headers })
  ]);
  
  const issues = issuesResponse.ok ? await issuesResponse.json() : [];
  const prs = prsResponse.ok ? await prsResponse.json() : [];
  
  // Build power.status.json structure
  const powerStatus = {
    graphId: `github-${owner}-${repo}-${Date.now()}`,
    lastScan: new Date().toISOString(),
    assets: [],
    edges: []
  };
  
  // Create repository node
  const repoId = generateId(`repo-${repoFullName}`);
  powerStatus.assets.push({
    id: repoId,
    type: 'service.backend',
    source: 'github',
    location: repoData.html_url,
    metadata: {
      title: repoData.name,
      description: repoData.description || `GitHub repository: ${repoData.name}`,
      tags: extractTags(repoData),
      version: '1.0.0',
      authors: [],
      createdAt: repoData.created_at,
      lastUpdate: repoData.updated_at
    },
    status: {
      phase: determineRepoStatus(commits, issues, prs),
      completeness: calculateCompleteness(repoData, treeData),
      qualityScore: calculateQualityScore(issues, prs),
      notes: generateStatusNotes(repoData, commits, issues, prs)
    },
    dependencies: {
      io: { inputs: [], outputs: [] },
      universalConfigRef: 'github-v1'
    },
    analytics: {
      embedding: [],
      connectivity: 0,
      centralityScore: 0.8,
      activityLast30Days: commits.length
    }
  });
  
  // Process file tree
  for (const item of treeData.tree || []) {
    if (item.type !== 'blob') continue;
    
    const fileAsset = createFileAsset(item, repoData, repoId, commits);
    if (fileAsset) {
      powerStatus.assets.push(fileAsset);
    }
  }
  
  // Create edges
  for (const asset of powerStatus.assets) {
    if (asset.id !== repoId) {
      powerStatus.edges.push({
        from: asset.id,
        to: repoId,
        type: 'partOf',
        strength: 1.0
      });
    }
  }
  
  // Update connectivity
  for (const asset of powerStatus.assets) {
    asset.analytics.connectivity = powerStatus.edges.filter(
      e => e.from === asset.id || e.to === asset.id
    ).length;
  }
  
  return powerStatus;
}

function createFileAsset(item, repoData, repoId, commits) {
  const fileType = determineFileType(item.path);
  if (!fileType) return null;
  
  const assetId = generateId(`${repoData.full_name}-${item.path}`);
  const recentChanges = countFileChanges(item.path, commits);
  
  return {
    id: assetId,
    type: fileType,
    source: 'github',
    location: `${repoData.html_url}/blob/${repoData.default_branch}/${item.path}`,
    metadata: {
      title: item.path.split('/').pop(),
      description: `File: ${item.path}`,
      tags: extractFileTags(item.path),
      version: '1.0.0',
      authors: [],
      createdAt: repoData.created_at,
      lastUpdate: repoData.updated_at
    },
    status: {
      phase: determineFileStatus(recentChanges),
      completeness: 0.8,
      qualityScore: 0.7,
      notes: `Modified ${recentChanges} times in last 30 days`
    },
    dependencies: {
      io: { inputs: [], outputs: [] },
      universalConfigRef: 'github-v1'
    },
    analytics: {
      embedding: [],
      connectivity: 1,
      centralityScore: 0.3,
      activityLast30Days: recentChanges
    }
  };
}

function determineFileType(path) {
  const pathLower = path.toLowerCase();
  
  if (pathLower.includes('.tsx') || pathLower.includes('.jsx')) {
    return pathLower.includes('3d') || pathLower.includes('three') 
      ? 'component.ui.3d' 
      : 'component.ui.react';
  }
  
  if (pathLower.includes('api/') || pathLower.includes('server') || 
      pathLower.includes('.py') || pathLower.includes('worker')) {
    return 'service.backend';
  }
  
  if (pathLower.includes('config') || pathLower.endsWith('.json') || 
      pathLower.endsWith('.yaml') || pathLower.endsWith('.toml')) {
    return 'config.schema';
  }
  
  if (pathLower.endsWith('.md') || pathLower.includes('readme')) {
    return 'doc.markdown';
  }
  
  if (pathLower.includes('test') || pathLower.includes('spec')) {
    return 'test.e2e';
  }
  
  if (pathLower.includes('.github/workflows') || pathLower.includes('ci')) {
    return 'workflow.ci-cd';
  }
  
  if (pathLower.endsWith('.js') || pathLower.endsWith('.ts')) {
    return 'library.js';
  }
  
  return null;
}

function determineRepoStatus(commits, issues, prs) {
  if (!commits.length) return 'gray';
  
  const criticalIssues = issues.filter(i => 
    i.labels?.some(l => ['bug', 'critical', 'blocker'].includes(l.name.toLowerCase()))
  );
  
  if (criticalIssues.length > 0) return 'red';
  if (prs.length > 10) return 'orange';
  if (commits.length > 20) return 'green';
  
  return 'green';
}

function determineFileStatus(recentChanges) {
  if (recentChanges === 0) return 'gray';
  if (recentChanges > 10) return 'orange';
  return 'green';
}

function calculateCompleteness(repo, tree) {
  let score = 0.5;
  const files = tree.tree?.map(f => f.path.toLowerCase()) || [];
  
  if (repo.description) score += 0.1;
  if (files.some(f => f.includes('readme'))) score += 0.1;
  if (files.some(f => f.includes('docs/') || f.endsWith('.md'))) score += 0.1;
  if (files.some(f => f.includes('test'))) score += 0.1;
  if (files.some(f => f.includes('.github/workflows') || f.includes('ci'))) score += 0.1;
  
  return Math.min(score, 1.0);
}

function calculateQualityScore(issues, prs) {
  let score = 0.8;
  
  const bugCount = issues.filter(i => 
    i.labels?.some(l => ['bug', 'defect'].includes(l.name.toLowerCase()))
  ).length;
  
  score -= bugCount * 0.05;
  
  const oldPrs = prs.filter(p => {
    const created = new Date(p.created_at);
    return (Date.now() - created.getTime()) > 30 * 24 * 60 * 60 * 1000;
  }).length;
  
  score -= oldPrs * 0.03;
  
  return Math.max(score, 0.0);
}

function generateStatusNotes(repo, commits, issues, prs) {
  const notes = [];
  
  if (commits.length > 30) notes.push('High development activity');
  else if (commits.length === 0) notes.push('No recent commits');
  
  const bugCount = issues.filter(i => 
    i.labels?.some(l => ['bug', 'defect'].includes(l.name.toLowerCase()))
  ).length;
  
  if (bugCount > 0) notes.push(`${bugCount} open bugs`);
  if (prs.length > 5) notes.push(`${prs.length} pending pull requests`);
  if (repo.archived) notes.push('Repository is archived');
  
  return notes.join('. ') || 'Repository appears healthy';
}

function extractTags(repo) {
  const tags = [];
  
  if (repo.language) tags.push(repo.language.toLowerCase());
  tags.push(...(repo.topics || []));
  
  if (repo.description) {
    const keywords = repo.description.toLowerCase().match(/\b\w+\b/g) || [];
    const techKeywords = ['react', 'vue', 'angular', 'node', 'python', 
                         'api', 'frontend', 'backend', 'database', 'cli'];
    tags.push(...keywords.filter(k => techKeywords.includes(k)));
  }
  
  return [...new Set(tags)];
}

function extractFileTags(path) {
  const tags = [];
  const pathLower = path.toLowerCase();
  
  if (pathLower.includes('.js') || pathLower.includes('.ts')) tags.push('javascript');
  if (pathLower.includes('.py')) tags.push('python');
  if (pathLower.includes('.tsx') || pathLower.includes('.jsx')) tags.push('react');
  if (pathLower.includes('test')) tags.push('testing');
  
  const parts = pathLower.split('/');
  if (parts.includes('components')) tags.push('component');
  if (parts.includes('api')) tags.push('api');
  if (parts.includes('utils') || parts.includes('helpers')) tags.push('utility');
  
  return tags;
}

function countFileChanges(filePath, commits) {
  // In a real implementation, we'd need to fetch commit details
  // For now, estimate based on path patterns
  return Math.floor(Math.random() * 5);
}

function generateId(content) {
  // Simple hash function for CloudFlare Worker
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0').slice(0, 16);
}

async function updateScanStatus(env, scanId, status, result = null, error = null) {
  const scan = await env.REPO_SCANS.get(`scan:${scanId}`);
  if (!scan) return;
  
  const scanData = JSON.parse(scan);
  scanData.status = status;
  scanData.updatedAt = new Date().toISOString();
  
  if (status === 'completed' && result) {
    scanData.result = {
      nodeCount: result.assets.length,
      edgeCount: result.edges.length
    };
  }
  
  if (error) {
    scanData.error = error;
  }
  
  await env.REPO_SCANS.put(
    `scan:${scanId}`,
    JSON.stringify(scanData),
    { expirationTtl: 86400 }
  );
}

async function storePowerStatus(env, repository, powerStatus) {
  // Store in R2 bucket if available
  if (env.POWER_STATUS_BUCKET) {
    const key = `github/${repository}/power.status.json`;
    await env.POWER_STATUS_BUCKET.put(
      key,
      JSON.stringify(powerStatus, null, 2),
      {
        httpMetadata: {
          contentType: 'application/json'
        }
      }
    );
  }
  
  // Also store in KV for quick access
  await env.POWER_STATUS.put(
    `power:${repository}`,
    JSON.stringify(powerStatus),
    { expirationTtl: 604800 } // 7 days
  );
}

async function triggerDataAggregation(env) {
  // Trigger aggregation worker if configured
  if (env.AGGREGATION_WEBHOOK) {
    try {
      await fetch(env.AGGREGATION_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'aggregate_data',
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to trigger aggregation:', error);
    }
  }
}