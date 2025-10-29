export const config = { runtime: 'edge' };

export default async function handler(): Promise<Response> {
  const isProd = (process.env as any).VERCEL_ENV === 'production' || (process.env as any).NODE_ENV === 'production';
  const cookie = [
    `__session=`,
    `Path=/`,
    isProd ? 'Secure' : '',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ].filter(Boolean).join('; ');

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' },
  });
}


