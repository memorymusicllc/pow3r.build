/**
 * CloudFlare Worker - Data Aggregator
 * Aggregates all power.status.json files and serves them for 3D visualization
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    console.log('📊 Aggregating power.status.json files...');
    
    const projects = [];
    const summary = {
      totalProjects: 0,
      totalNodes: 0,
      totalEdges: 0,
      sources: new Set()
    };
    
    // 1. Get local repository data from KV
    const localData = await env.POWER_STATUS.get('power:local');
    if (localData) {
      const project = formatProject('pow3r-build', JSON.parse(localData), 'local');
      projects.push(project);
      updateSummary(summary, project);
    }
    
    // 2. Get GitHub repositories from KV
    const githubList = await env.POWER_STATUS.list({ prefix: 'power:' });
    for (const key of githubList.keys) {
      if (key.name === 'power:local') continue;
      
      const data = await env.POWER_STATUS.get(key.name);
      if (data) {
        const repoName = key.name.replace('power:', '');
        const project = formatProject(repoName, JSON.parse(data), 'github');
        projects.push(project);
        updateSummary(summary, project);
      }
    }
    
    // 3. Get from R2 bucket if available
    if (env.POWER_STATUS_BUCKET) {
      const objects = await env.POWER_STATUS_BUCKET.list({ prefix: 'github/' });
      
      for (const object of objects.objects) {
        const repoName = object.key.replace('github/', '').replace('/power.status.json', '');
        
        // Skip if already in KV
        if (projects.some(p => p.name === repoName)) continue;
        
        const objectData = await env.POWER_STATUS_BUCKET.get(object.key);
        if (objectData) {
          const data = JSON.parse(await objectData.text());
          const project = formatProject(repoName, data, 'github');
          projects.push(project);
          updateSummary(summary, project);
        }
      }
    }
    
    // Build response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalProjects: summary.totalProjects,
        totalNodes: summary.totalNodes,
        totalEdges: summary.totalEdges,
        sources: Array.from(summary.sources)
      },
      projects: projects
    };
    
    // Cache the response
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('❌ Aggregation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    if (body.type === 'aggregate_data') {
      // Trigger aggregation (could be more complex in production)
      console.log('📊 Manual aggregation triggered');
      
      // Clear any caches
      // In production, you might want to invalidate CDN caches here
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Aggregation triggered',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Invalid request type', { status: 400 });
    
  } catch (error) {
    console.error('❌ POST error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function formatProject(name, powerStatus, source) {
  // Extract nodes and edges
  const nodes = [];
  const edges = powerStatus.edges || [];
  
  // Process assets as nodes
  for (const asset of powerStatus.assets || []) {
    const node = {
      id: asset.id,
      name: asset.metadata?.title || 'Unknown',
      type: mapAssetType(asset.type),
      status: asset.status?.phase || 'gray',
      size: calculateNodeSize(asset),
      activity: asset.analytics?.activityLast30Days || 0,
      centrality: asset.analytics?.centralityScore || 0.5,
      metadata: {
        description: asset.metadata?.description || '',
        tags: asset.metadata?.tags || [],
        location: asset.location || '',
        qualityScore: asset.status?.qualityScore || 0.7,
        completeness: asset.status?.completeness || 0.8,
        notes: asset.status?.notes || ''
      }
    };
    nodes.push(node);
  }
  
  // Calculate project metrics
  const totalActivity = nodes.reduce((sum, n) => sum + n.activity, 0);
  const avgQuality = nodes.length > 0 
    ? nodes.reduce((sum, n) => sum + n.metadata.qualityScore, 0) / nodes.length 
    : 0;
  
  // Determine project status
  const statusCounts = {};
  for (const node of nodes) {
    statusCounts[node.status] = (statusCounts[node.status] || 0) + 1;
  }
  
  let projectStatus = 'green';
  if (statusCounts.red > 0) {
    projectStatus = 'red';
  } else if (statusCounts.orange > nodes.length * 0.3) {
    projectStatus = 'orange';
  } else if (statusCounts.gray > nodes.length * 0.5) {
    projectStatus = 'gray';
  }
  
  // Format edges for visualization
  const formattedEdges = edges.map(edge => ({
    source: edge.from,
    target: edge.to,
    type: edge.type,
    strength: edge.strength || 0.5
  }));
  
  return {
    name: name,
    description: `${source.charAt(0).toUpperCase() + source.slice(1)} repository with ${nodes.length} components`,
    source: source,
    lastScan: powerStatus.lastScan || new Date().toISOString(),
    status: projectStatus,
    metrics: {
      nodeCount: nodes.length,
      edgeCount: formattedEdges.length,
      totalActivity: totalActivity,
      avgQuality: Math.round(avgQuality * 100) / 100,
      statusBreakdown: statusCounts
    },
    nodes: nodes,
    edges: formattedEdges
  };
}

function mapAssetType(assetType) {
  const typeMapping = {
    'component.ui.react': 'ui',
    'component.ui.3d': '3d',
    'service.backend': 'service',
    'config.schema': 'config',
    'doc.markdown': 'doc',
    'plugin.obsidian': 'plugin',
    'agent.abacus': 'ai',
    'library.js': 'lib',
    'workflow.ci-cd': 'workflow',
    'test.e2e': 'test',
    'knowledge.particle': 'knowledge'
  };
  return typeMapping[assetType] || 'file';
}

function calculateNodeSize(asset) {
  let baseSize = 8;
  
  // Factor in centrality
  const centrality = asset.analytics?.centralityScore || 0.5;
  baseSize *= (0.5 + centrality);
  
  // Factor in activity
  const activity = asset.analytics?.activityLast30Days || 0;
  if (activity > 10) {
    baseSize *= 1.5;
  } else if (activity > 5) {
    baseSize *= 1.2;
  }
  
  // Factor in connectivity
  const connectivity = asset.analytics?.connectivity || 0;
  if (connectivity > 10) {
    baseSize *= 1.3;
  } else if (connectivity > 5) {
    baseSize *= 1.1;
  }
  
  return Math.round(baseSize * 10) / 10;
}

function updateSummary(summary, project) {
  summary.totalProjects++;
  summary.totalNodes += project.metrics.nodeCount;
  summary.totalEdges += project.metrics.edgeCount;
  summary.sources.add(project.source);
}

// Handle CORS preflight
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}