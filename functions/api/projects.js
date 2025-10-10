/**
 * Cloudflare Pages Function - Aggregated Projects API
 * Returns merged pow3r.status.json data from KV if available,
 * otherwise serves bundled public/data.json.
 */

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const kv = env.POW3R_STATUS_KV;
    let payload = null;

    if (kv) {
      const value = await kv.get('projects:data');
      if (value) {
        payload = JSON.parse(value);
      }
    }

    if (!payload) {
      // Fallback to static file
      const url = new URL('/data.json', context.request.url);
      const res = await fetch(url.toString());
      if (res.ok) {
        payload = await res.json();
      } else {
        payload = { success: true, count: 0, projects: [] };
      }
    }

    return new Response(JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
