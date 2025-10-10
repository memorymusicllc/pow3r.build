/**
 * CloudFlare Worker - Data API
 * Serves aggregated power.status.json data for 3D visualization
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    console.log('📊 Serving aggregated data for visualization');
    
    // Get all power.status.json files from KV
    const powerStatusList = await env.POWER_STATUS.list({ prefix: 'power:' });
    
    const projects = [];
    let totalNodes = 0;
    let totalEdges = 0;
    
    // Process each power.status.json
    for (const key of powerStatusList.keys) {
      try {
        const powerStatusData = await env.POWER_STATUS.get(key.name);
        if (!powerStatusData) continue;
        
        const powerStatus = JSON.parse(powerStatusData);
        const repoName = key.name.replace('power:', '');
        
        // Format project data for visualization
        const project = formatProjectForVisualization(repoName, powerStatus);
        projects.push(project);
        
        totalNodes += project.nodes.length;
        totalEdges += project.edges.length;
        
      } catch (error) {
        console.error(`Error processing ${key.name}:`, error);
      }
    }
    
    // Check R2 bucket for additional files if available
    if (env.POWER_STATUS_BUCKET) {
      const r2Projects = await getR2Projects(env);
      projects.push(...r2Projects);
      
      for (const project of r2Projects) {
        totalNodes += project.nodes.length;
        totalEdges += project.edges.length;
      }
    }
    
    // Create response data
    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalProjects: projects.length,
        totalNodes: totalNodes,
        totalEdges: totalEdges,
        sources: ['github', 'cloudflare']
      },
      projects: projects
    };
    
    return new Response(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      }
    });
    
  } catch (error) {
    console.error('❌ Data API error:', error);
    
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

function formatProjectForVisualization(repoName, powerStatus) {
  // Extract nodes and edges
  const nodes = [];
  const edges = [];
  
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
  
  // Process relationships as edges
  for (const edge of powerStatus.edges || []) {
    edges.push({
      source: edge.from,
      target: edge.to,
      type: edge.type,
      strength: edge.strength || 0.5
    });
  }
  
  // Calculate project metrics
  const totalActivity = nodes.reduce((sum, n) => sum + n.activity, 0);
  const avgQuality = nodes.length > 0 
    ? nodes.reduce((sum, n) => sum + n.metadata.qualityScore, 0) / nodes.length 
    : 0;
  
  // Determine project status
  const statusCounts = nodes.reduce((acc, node) => {
    acc[node.status] = (acc[node.status] || 0) + 1;
    return acc;
  }, {});
  
  let projectStatus = 'green';
  if (statusCounts.red > 0) {
    projectStatus = 'red';
  } else if (statusCounts.orange > nodes.length * 0.3) {
    projectStatus = 'orange';
  } else if (statusCounts.gray > nodes.length * 0.5) {
    projectStatus = 'gray';
  }
  
  return {
    name: repoName.split('/').pop() || repoName,
    description: `GitHub repository with ${nodes.length} components`,
    source: 'github',
    lastScan: powerStatus.lastScan || new Date().toISOString(),
    status: projectStatus,
    metrics: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      totalActivity: totalActivity,
      avgQuality: Math.round(avgQuality * 100) / 100,
      statusBreakdown: statusCounts
    },
    nodes: nodes,
    edges: edges
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

async function getR2Projects(env) {
  const projects = [];
  
  try {
    // List objects in R2 bucket
    const objects = await env.POWER_STATUS_BUCKET.list({
      prefix: 'github/',
      limit: 100
    });
    
    for (const object of objects.objects) {
      if (object.key.endsWith('power.status.json')) {
        try {
          // Get object from R2
          const r2Object = await env.POWER_STATUS_BUCKET.get(object.key);
          if (!r2Object) continue;
          
          const powerStatus = await r2Object.json();
          const repoName = object.key.replace('github/', '').replace('/power.status.json', '');
          
          const project = formatProjectForVisualization(repoName, powerStatus);
          projects.push(project);
          
        } catch (error) {
          console.error(`Error processing R2 object ${object.key}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error accessing R2 bucket:', error);
  }
  
  return projects;
}

// OPTIONS endpoint for CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}