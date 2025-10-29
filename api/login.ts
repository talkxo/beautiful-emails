import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const provided = body?.key as string | undefined;
    const master = process.env.MASTER_KEY || (process.env as any).master_key;
    if (!master) return res.status(500).json({ error: 'Server not configured' });
    if (!provided || provided !== master) return res.status(401).json({ error: 'Invalid key' });

    const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
    const cookie = [
      `__session=ok`,
      `Path=/`,
      isProd ? 'Secure' : '',
      'HttpOnly',
      'SameSite=Lax',
      // 12h expiry
      `Max-Age=${60 * 60 * 12}`,
    ]
      .filter(Boolean)
      .join('; ');

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: 'Bad request' });
  }
}


