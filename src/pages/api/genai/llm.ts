import type { NextApiRequest, NextApiResponse } from 'next';

// Server-side backend URL — never exposed to the browser
const BACKEND = process.env.API_BACKEND_URL || 'http://142.93.177.153:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const response = await fetch(`${BACKEND}/api/genai/llm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(502).json({ error: `Backend unreachable: ${err.message}` });
  }
}
