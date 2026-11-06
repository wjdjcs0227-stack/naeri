import { isBlockedMessage } from './message-moderation.mjs';
import { env } from 'cloudflare:workers';
export const dynamic = 'force-dynamic';
const rooms = new Set(['all', 'work', 'study']);
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }
export async function readWhispers(request: Request) {
 const url = new URL(request.url), room = url.searchParams.get('room') || 'all';
 const after = Number(url.searchParams.get('after') || 0);
 if (!rooms.has(room) || !Number.isSafeInteger(after) || after < 0) return json({ error: '잘못된 공간이에요.' }, 400);
 try {
  const db = env.DB;
  if (!db) return json({ error: '잠시 연결을 준비하고 있어요.' }, 503);
  const now = Date.now();
  await db.prepare('DELETE FROM whispers WHERE created_at < ?').bind(now - 60000).run();
  const result = await db.prepare('SELECT id, body FROM whispers WHERE room = ? AND id > ? AND created_at > ? ORDER BY id DESC LIMIT 12').bind(room, after, now - 6000).all();
  const recent = result.results.reverse();
  const messages = recent.filter((m: any) => !isBlockedMessage(m.body));
  return json({ messages, cursor: Math.max(after, ...recent.map((m: any) => m.id)) });
 } catch { return json({ error: '연결이 잠시 쉬어가고 있어요.' }, 503); }
}
export async function writeWhisper(request: Request) {
 const origin = request.headers.get('origin');
 if (origin && origin !== new URL(request.url).origin) return json({ error: '이 옥상에서 한마디를 보내주세요.' }, 403);
 if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: '올바른 형식이 아니에요.' }, 415);
 const user = request.headers.get('oai-authenticated-user-id');
 // CF-Connecting-IP is supplied by the edge, not the browser. A shared
 // fallback deliberately limits anonymous traffic if edge identity is unavailable.
 const network = request.headers.get('cf-connecting-ip');
 const visitor = network ? 'network:' + network : user ? 'account:' + user : 'anonymous-shared';
 const raw = await request.text();
 if (raw.length > 1000) return json({ error: '60자 안으로 적어주세요.' }, 413);
 let data;
 try { data = JSON.parse(raw); } catch { return json({ error: '올바른 형식이 아니에요.' }, 400); }
 if (!data || typeof data.body !== 'string' || !rooms.has(data.room)) return json({ error: '공간과 한마디를 확인해주세요.' }, 400);
 const body = data.body.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
 if (!body || body.length > 60) return json({ error: '1~60자로 적어주세요.' }, 400);
 if (isBlockedMessage(body)) return json({ error: '폭력적이거나 성적인 표현, 욕설은 띄울 수 없어요. 다정한 말로 바꿔주세요.', code: 'message_blocked' }, 422);
 const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(visitor));
 const author = [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, '0')).join('');
 try {
  const db = env.DB;
  if (!db) return json({ error: '잠시 연결을 준비하고 있어요.' }, 503);
  const now = Date.now();
  // One atomic insert prevents concurrent requests from bypassing the cooldown.
  const message = await db.prepare('INSERT INTO whispers (room, body, author, created_at) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM whispers WHERE author = ? AND created_at > ?) RETURNING id, body').bind(data.room, body, author, now, author, now - 2000).first();
  if (!message) return json({ error: '한마디 사이에 2초만 쉬어주세요.' }, 429);
  await db.prepare('DELETE FROM whispers WHERE created_at < ?').bind(now - 60000).run();
  return json({ message }, 201);
 } catch { return json({ error: '전송하지 못했어요. 잠시 후 다시 시도해주세요.' }, 503); }
}
