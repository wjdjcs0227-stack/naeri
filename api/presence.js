// Preserve the existing moderated D1 service while hosting the frontend on Vercel.
const upstream = 'https://midnight-rooftop-nov03.aitout.chatgpt.site';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['POST'].includes(req.method)) {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: '지원하지 않는 요청이에요.' });
  }
  if (req.method === 'POST' && req.headers.origin) {
    let origin;
    try { origin = new URL(req.headers.origin); } catch { return res.status(403).json({ error: '이 옥상에서 보내주세요.' }); }
    if (origin.host !== req.headers.host) return res.status(403).json({ error: '이 옥상에서 보내주세요.' });
  }
  const url = new URL('/api/presence', upstream);
  const incoming = new URL(req.url, 'https://localhost');
  for (const key of ['room', 'after']) if (incoming.searchParams.has(key)) url.searchParams.set(key, incoming.searchParams.get(key));
  const body = req.method === 'POST' ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined;
  if (body && body.length > 1000) return res.status(413).json({ error: '60자 안으로 적어주세요.' });
  try {
    const response = await fetch(url, { method: req.method, headers: { 'Content-Type': 'application/json', Origin: upstream }, body, signal: AbortSignal.timeout(10000), redirect: 'error' });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch {
    return res.status(503).json({ error: '연결이 잠시 쉬어가고 있어요.' });
  }
}
