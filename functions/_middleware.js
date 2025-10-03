/**
 * Cloudflare Pages Functions - Middleware
 * The Watchmen - Auto-deployment monitoring
 */

export async function onRequest(context) {
  const { request, env, next } = context;
  
  // Add custom headers
  const response = await next();
  
  // Clone response to modify headers
  const newResponse = new Response(response.body, response);
  
  // Add security headers
  newResponse.headers.set('X-Powered-By', 'The Watchmen');
  newResponse.headers.set('X-Deployment-Time', new Date().toISOString());
  
  return newResponse;
}

