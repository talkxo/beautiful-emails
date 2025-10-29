import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';

const MAX_BYTES = 500 * 1024; // 500KB

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const filenameParam = (req.query.filename as string) || '';
  if (!filenameParam) {
    return res.status(400).json({ error: 'Missing filename query parameter' });
  }

  try {
    const chunks: Buffer[] = [];
    let total = 0;
    await new Promise<void>((resolve, reject) => {
      req
        .on('data', (chunk) => {
          const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          total += buf.length;
          if (total > MAX_BYTES) {
            reject(new Error('File exceeds 500KB limit'));
            return;
          }
          chunks.push(buf);
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    const buffer = Buffer.concat(chunks);
    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Empty file body' });
    }

    const upload = await put(filenameParam, buffer, { access: 'public' });
    return res.status(200).json({ url: upload.url, size: upload.size, pathname: upload.pathname });
  } catch (err: any) {
    const message = err?.message || 'Upload failed';
    return res.status(400).json({ error: message });
  }
}


