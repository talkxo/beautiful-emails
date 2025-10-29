export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Allow': 'POST', 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const provided = body?.key as string | undefined;
    const master = (process.env as any).MASTER_KEY || (process.env as any).master_key;
    if (!master) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    if (!provided || provided !== master) {
      return new Response(JSON.stringify({ error: 'Invalid key' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const isProd = (process.env as any).VERCEL_ENV === 'production' || (process.env as any).NODE_ENV === 'production';
    const cookie = [
      `__session=ok`,
      `Path=/`,
      isProd ? 'Secure' : '',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${60 * 60 * 12}`,
    ].filter(Boolean).join('; ');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json',
      },
    });
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}


