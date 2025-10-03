/**
 * Cloudflare Pages Function - Get Statistics
 * Replaces Express /api/stats endpoint
 */

export async function onRequest(context) {
  const { env } = context;
  
  try {
    // Load projects from KV if available
    let projects = [];
    
    if (env.PROJECTS_KV) {
      projects = await env.PROJECTS_KV.get('projects', { type: 'json' }) || [];
    }
    
    // Calculate statistics
    const stats = {
      total: projects.length,
      byStatus: {
        green: projects.filter(p => {
          const phase = p.status?.phase || p.status;
          return phase === 'green';
        }).length,
        orange: projects.filter(p => {
          const phase = p.status?.phase || p.status;
          return phase === 'orange';
        }).length,
        red: projects.filter(p => {
          const phase = p.status?.phase || p.status;
          return phase === 'red';
        }).length,
        gray: projects.filter(p => {
          const phase = p.status?.phase || p.status;
          return phase === 'gray';
        }).length
      },
      byLanguage: {},
      totalNodes: projects.reduce((sum, p) => {
        const assets = p.assets || p.nodes || [];
        return sum + assets.length;
      }, 0),
      totalEdges: projects.reduce((sum, p) => sum + (p.edges?.length || 0), 0),
      totalCommits30Days: projects.reduce((sum, p) => {
        const activity = p.analytics?.activityLast30Days || 
                        p.stats?.totalCommitsLast30Days || 0;
        return sum + activity;
      }, 0),
      totalFiles: projects.reduce((sum, p) => sum + (p.stats?.fileCount || 0), 0),
      totalSizeMB: Math.round(projects.reduce((sum, p) => sum + (p.stats?.sizeMB || 0), 0) * 100) / 100
    };
    
    // Count by language
    projects.forEach(p => {
      const lang = p.stats?.primaryLanguage || 'unknown';
      stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
    });
    
    return new Response(JSON.stringify({
      success: true,
      stats: stats
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
    
  } catch (error) {
    console.error('Error calculating stats:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

