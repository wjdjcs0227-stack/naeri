export const PRESENCE_TTL = 90000;
const validId = /^[a-f0-9-]{36}$/i;
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
export async function handlePresence(request, db, now = Date.now()) {
  if (request.method !== 'POST') return json({ error: '지원하지 않는 요청이에요.' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: '이 옥상에서 연결해주세요.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: '올바른 형식이 아니에요.' }, 415);
  const raw = await request.text();
  if (raw.length > 500) return json({ error: '요청이 너무 커요.' }, 413);
  let data;
  try { data = JSON.parse(raw); } catch { return json({ error: '올바른 형식이 아니에요.' }, 400); }
  if (!data || !validId.test(data.visitorId || '') || !validId.test(data.tabId || '') || !['heartbeat', 'leave'].includes(data.action)) return json({ error: '연결 정보를 확인해주세요.' }, 400);
  if (!db) return json({ error: '인원 확인을 잠시 쉬고 있어요.' }, 503);
  try {
    const mutation = data.action === 'leave'
      ? db.prepare('DELETE FROM rooftop_presence WHERE tab_id = ? AND visitor_id = ?').bind(data.tabId, data.visitorId)
      : db.prepare('INSERT INTO rooftop_presence (tab_id, visitor_id, last_seen) VALUES (?, ?, ?) ON CONFLICT(tab_id) DO UPDATE SET visitor_id = excluded.visitor_id, last_seen = excluded.last_seen').bind(data.tabId, data.visitorId, now);
    const results = await db.batch([
      db.prepare('DELETE FROM rooftop_presence WHERE last_seen <= ?').bind(now - PRESENCE_TTL),
      mutation,
      db.prepare('SELECT COUNT(DISTINCT visitor_id) AS count FROM rooftop_presence WHERE last_seen > ?').bind(now - PRESENCE_TTL),
    ]);
    return json({ count: Number(results[2].results[0].count), windowSeconds: PRESENCE_TTL / 1000 });
  } catch { return json({ error: '인원 확인을 잠시 쉬고 있어요.' }, 503); }
}
