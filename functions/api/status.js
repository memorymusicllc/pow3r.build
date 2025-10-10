/**
 * CloudFlare Worker - Status API
 * Serves aggregated pow3r.status.config.json from KV storage
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    // Get repository name from query params
    const url = new URL(request.url);
    const repo = url.searchParams.get('repo');
    
    let status;
    
    if (repo) {
      // Get specific repository status
      const key = `status:${repo}`;
      const data = await env.STATUS_KV.get(key);
      
      if (!data) {
        return new Response(JSON.stringify({
          error: 'Repository not found',
          repository: repo
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      status = JSON.parse(data);
      
    } else {
      // Get aggregated status for all repos
      const data = await env.STATUS_KV.get('aggregated-status');
      
      if (!data) {
        return new Response(JSON.stringify({
          error: 'No aggregated status available',
          message: 'Run the GitHub scanner or wait for webhook updates'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      status = JSON.parse(data);
    }
    
    // Return status
    return new Response(JSON.stringify(status), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
    
  } catch (error) {
    console.error('Status API error:', error);
    return new Response(JSON.stringify({
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
