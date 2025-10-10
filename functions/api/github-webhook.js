/**
 * CloudFlare Worker - GitHub Webhook Handler
 * Automatically updates pow3r.status.json when repositories change
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    // Verify GitHub webhook signature
    const signature = request.headers.get('X-Hub-Signature-256');
    const event = request.headers.get('X-GitHub-Event');
    
    if (!signature || !event) {
      return new Response('Missing GitHub headers', { status: 400 });
    }
    
    // Get webhook payload
    const payload = await request.json();
    
    console.log(`📨 GitHub webhook received: ${event}`);
    console.log(`Repository: ${payload.repository?.full_name}`);
    
    // Verify signature using KV-stored secret
    const secret = await env.STATUS_KV.get('GITHUB_WEBHOOK_SECRET');
    if (!secret) {
      console.error('GITHUB_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }
    
    const verified = await verifySignature(
      JSON.stringify(payload),
      signature,
      secret
    );
    
    if (!verified) {
      console.error('Invalid signature');
      return new Response('Invalid signature', { status: 401 });
    }
    
    // Handle different GitHub events
    const result = await handleGitHubEvent(event, payload, env);
    
    return new Response(JSON.stringify({
      success: true,
      event,
      repository: payload.repository?.full_name,
      result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Verify GitHub webhook signature
 */
async function verifySignature(payload, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signed = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  
  const expectedSignature = 'sha256=' + Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return signature === expectedSignature;
}

/**
 * Handle different GitHub events
 */
async function handleGitHubEvent(event, payload, env) {
  const repository = payload.repository;
  if (!repository) {
    throw new Error('No repository in payload');
  }
  
  const repoFullName = repository.full_name;
  const repoName = repository.name;
  
  // Events that should trigger status update
  const updateEvents = [
    'push',
    'pull_request',
    'release',
    'create',
    'delete',
    'repository'
  ];
  
  if (!updateEvents.includes(event)) {
    console.log(`Ignoring event: ${event}`);
    return { action: 'ignored', reason: 'Event type not tracked' };
  }
  
  console.log(`Processing ${event} for ${repoFullName}`);
  
  // Get GitHub token from KV storage
  const githubToken = await env.STATUS_KV.get('GITHUB_TOKEN');
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN not configured');
  }
  
  // Generate updated status for this repository
  const status = await generateRepositoryStatus(repository, githubToken);
  
  // Store in KV with repo name as key
  const key = `status:${repoName}`;
  await env.STATUS_KV.put(key, JSON.stringify(status), {
    metadata: {
      repository: repoFullName,
      updated: new Date().toISOString(),
      event
    }
  });
  
  console.log(`✓ Updated status for ${repoName}`);
  
  // Trigger aggregation update
  await triggerAggregation(env);
  
  return {
    action: 'updated',
    repository: repoFullName,
    key,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate status config for a repository
 */
async function generateRepositoryStatus(repo, githubToken) {
  const headers = {
    'Authorization': `token ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json'
  };
  
  // Fetch additional repository data
  const [commits, languages, contributors, branches] = await Promise.all([
    fetchGitHubAPI(`/repos/${repo.full_name}/commits?per_page=100`, headers),
    fetchGitHubAPI(`/repos/${repo.full_name}/languages`, headers),
    fetchGitHubAPI(`/repos/${repo.full_name}/contributors?per_page=100`, headers),
    fetchGitHubAPI(`/repos/${repo.full_name}/branches?per_page=100`, headers)
  ]);
  
  // Infer development status
  const status = inferStatus(repo, commits);
  
  // Generate component nodes
  const components = await discoverComponents(repo, languages, headers);
  
  // Create status config
  const config = {
    graphId: generateHash(repo.full_name + Date.now()),
    projectName: repo.name,
    lastScan: new Date().toISOString(),
    source: 'github',
    repositoryPath: repo.html_url,
    branch: repo.default_branch,
    status,
    
    stats: {
      totalCommitsLast30Days: countRecentCommits(commits, 30),
      totalCommitsLast14Days: countRecentCommits(commits, 14),
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      openIssues: repo.open_issues_count,
      primaryLanguage: repo.language || 'Unknown',
      languages,
      contributors: contributors.length,
      branches: branches.length
    },
    
    metadata: {
      version: '2.0',
      configType: 'v2',
      created: repo.created_at,
      updated: repo.updated_at,
      pushed: repo.pushed_at,
      description: repo.description || `${repo.name} repository`,
      homepage: repo.homepage,
      topics: repo.topics || [],
      license: repo.license?.name || null,
      visibility: repo.private ? 'private' : 'public',
      archived: repo.archived,
      disabled: repo.disabled
    },
    
    nodes: components.nodes,
    edges: components.edges
  };
  
  return config;
}

/**
 * Fetch from GitHub API
 */
async function fetchGitHubAPI(endpoint, headers) {
  try {
    const response = await fetch(`https://api.github.com${endpoint}`, { headers });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return [];
  }
}

/**
 * Count recent commits
 */
function countRecentCommits(commits, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate > cutoff;
  }).length;
}

/**
 * Infer development status
 */
function inferStatus(repo, commits) {
  if (repo.archived || repo.disabled) {
    return 'gray';
  }
  
  const recentCommits = countRecentCommits(commits, 30);
  
  if (recentCommits === 0) {
    const pushedAt = new Date(repo.pushed_at);
    const daysSincePush = (Date.now() - pushedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSincePush > 90 ? 'gray' : 'orange';
  }
  
  const commits14d = countRecentCommits(commits, 14);
  
  if (commits14d >= 5) return 'green';
  if (commits14d >= 2) return 'orange';
  if (repo.open_issues_count > 10) return 'red';
  return 'orange';
}

/**
 * Discover components from repository structure
 */
async function discoverComponents(repo, languages, headers) {
  // Fetch root contents
  const contents = await fetchGitHubAPI(
    `/repos/${repo.full_name}/contents`,
    headers
  );
  
  const nodes = [];
  const edges = [];
  
  // Main repository node
  nodes.push({
    id: `${repo.name}-main`,
    name: repo.name,
    type: 'service.repository',
    category: 'Repository',
    description: repo.description || `${repo.name} repository`,
    status: inferStatus(repo, []),
    tags: repo.topics || [],
    metadata: {
      nodeId: `${repo.name}-main`,
      category: 'Repository',
      type: 'service',
      language: repo.language
    },
    position: { x: 0, y: 0, z: 0 }
  });
  
  // Component patterns
  const patterns = {
    'src': { type: 'component.source', category: 'Source' },
    'public': { type: 'component.ui', category: 'Frontend' },
    'server': { type: 'service.backend', category: 'Backend' },
    'api': { type: 'service.api', category: 'API' },
    'functions': { type: 'service.serverless', category: 'Functions' },
    'components': { type: 'component.ui.react', category: 'UI' },
    'lib': { type: 'library.js', category: 'Library' },
    'docs': { type: 'doc.markdown', category: 'Documentation' },
    'tests': { type: 'test.e2e', category: 'Testing' }
  };
  
  let edgeId = 0;
  
  if (Array.isArray(contents)) {
    contents.forEach(item => {
      if (item.type === 'dir' && patterns[item.name]) {
        const pattern = patterns[item.name];
        const nodeId = `${repo.name}-${item.name}`;
        
        nodes.push({
          id: nodeId,
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
          type: pattern.type,
          category: pattern.category,
          description: `${pattern.category} component`,
          status: inferStatus(repo, []),
          tags: [item.name],
          metadata: {
            nodeId,
            category: pattern.category,
            type: pattern.type
          },
          position: { x: (edgeId - 2) * 50, y: 0, z: 0 }
        });
        
        edges.push({
          id: `edge-${edgeId}`,
          from: `${repo.name}-main`,
          to: nodeId,
          type: 'contains',
          label: 'Contains',
          strength: 1.0,
          metadata: {
            edgeId: `edge-${edgeId}`,
            type: 'contains'
          }
        });
        
        edgeId++;
      }
    });
  }
  
  return { nodes, edges };
}

/**
 * Generate simple hash
 */
function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 16);
}

/**
 * Trigger aggregation of all status configs
 */
async function triggerAggregation(env) {
  console.log('Triggering status aggregation...');
  
  try {
    // List all status keys
    const list = await env.STATUS_KV.list({ prefix: 'status:' });
    
    const allStatuses = [];
    
    // Fetch all status configs
    for (const key of list.keys) {
      const status = await env.STATUS_KV.get(key.name);
      if (status) {
        allStatuses.push(JSON.parse(status));
      }
    }
    
    console.log(`Found ${allStatuses.length} status configs`);
    
    // Create aggregated config
    const aggregated = {
      graphId: generateHash('aggregated-' + Date.now()),
      projectName: 'All GitHub Repositories',
      lastUpdate: new Date().toISOString(),
      source: 'github-aggregated',
      totalProjects: allStatuses.length,
      
      nodes: [],
      edges: [],
      
      stats: {
        totalNodes: 0,
        totalEdges: 0,
        statusCounts: { green: 0, orange: 0, red: 0, gray: 0 }
      },
      
      metadata: {
        version: '2.0',
        configType: 'unified',
        created: new Date().toISOString(),
        description: 'Auto-aggregated from GitHub webhooks'
      }
    };
    
    // Aggregate nodes and edges
    allStatuses.forEach((status, idx) => {
      // Add project node
      aggregated.nodes.push(...(status.nodes || []));
      aggregated.edges.push(...(status.edges || []));
      
      // Track status
      const projectStatus = status.status || 'gray';
      aggregated.stats.statusCounts[projectStatus]++;
    });
    
    aggregated.stats.totalNodes = aggregated.nodes.length;
    aggregated.stats.totalEdges = aggregated.edges.length;
    
    // Store aggregated config
    await env.STATUS_KV.put('aggregated-status', JSON.stringify(aggregated));
    
    console.log('✓ Aggregated status updated');
    console.log(`  Nodes: ${aggregated.stats.totalNodes}`);
    console.log(`  Edges: ${aggregated.stats.totalEdges}`);
    
    return aggregated;
    
  } catch (error) {
    console.error('Aggregation error:', error);
    throw error;
  }
}
