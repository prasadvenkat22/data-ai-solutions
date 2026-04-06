import type { NextApiRequest, NextApiResponse } from 'next';

// Server-side backend URL — never exposed to the browser
const BACKEND = process.env.API_BACKEND_URL || 'http://142.93.177.153:8000';

// Disable Next.js body parser so we can stream raw multipart data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the raw multipart body from the incoming request
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks);

    // Forward the raw multipart body to FastAPI with the same Content-Type header
    // (preserves the boundary parameter that FastAPI needs to parse the files)
    const contentType = req.headers['content-type'] || '';
    const response = await fetch(`${BACKEND}/api/genai/query/upload`, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(502).json({ error: `Backend unreachable: ${err.message}` });
  }
}
