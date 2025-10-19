export const onRequest = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || 'aggregate';

  try {
    const kv = env.STATUS_KV as any;
    if (kv) {
      const value = await kv.get(`status:${key}`, { type: 'json' });
      if (value) {
        return new Response(JSON.stringify(value), { status: 200, headers: { 'content-type': 'application/json' } });
      }
    }
  } catch (e) {
    // fall through to static
  }

  // Fallback: serve file from public
  try {
    const res = await fetch(new URL('/pow3r.v3.status.json', url.origin));
    if (res.ok) {
      return new Response(res.body, { status: 200, headers: { 'content-type': 'application/json' } });
    }
  } catch (e) {}

  return new Response(JSON.stringify({ success: false, error: 'No status available' }), { status: 404, headers: { 'content-type': 'application/json' } });
};
