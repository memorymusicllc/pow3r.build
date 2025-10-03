/**
 * Cloudflare Pages Function - Get All Projects
 * Replaces Express /api/projects endpoint
 */

// This is a static data approach since we can't scan filesystem on edge
// In production, this should be generated during build time

export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    // For Cloudflare Pages, we need to embed the data
    // This will be generated during deployment
    
    // Load from KV storage if configured
    if (env.PROJECTS_KV) {
      const data = await env.PROJECTS_KV.get('projects', { type: 'json' });
      if (data) {
        return new Response(JSON.stringify({
          success: true,
          count: data.length,
          source: 'kv',
          timestamp: new Date().toISOString(),
          projects: data
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300'
          }
        });
      }
    }
    
    // Fallback: Return empty array with helpful message
    return new Response(JSON.stringify({
      success: true,
      count: 0,
      source: 'static',
      message: 'No projects configured. This static deployment needs data embedded during build.',
      timestamp: new Date().toISOString(),
      projects: [],
      instructions: {
        local: 'For local development, run: ./start-visualization.sh',
        production: 'Configure KV storage or embed data during build'
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
    
  } catch (error) {
    console.error('Error in projects API:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'For full functionality, run locally: ./start-visualization.sh'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

