import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { handlePresence, PRESENCE_TTL } from '../lib/presence-api.mjs';
const sqlite = new DatabaseSync(':memory:');
for (const file of readdirSync('drizzle').filter(f => f.endsWith('.sql')).sort()) sqlite.exec(readFileSync(`drizzle/${file}`, 'utf8'));
const db = {
 prepare(sql) { return { sql, args: [], bind(...args) { this.args = args; return this; } }; },
 async batch(statements) { sqlite.exec('BEGIN'); try { const rows = statements.map(s => ({ results: sqlite.prepare(s.sql).all(...s.args) })); sqlite.exec('COMMIT'); return rows; } catch (e) { sqlite.exec('ROLLBACK'); throw e; } },
};
const a = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', b = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const t1 = '11111111-1111-1111-1111-111111111111', t2 = '22222222-2222-2222-2222-222222222222', t3 = '33333333-3333-3333-3333-333333333333';
const start = 1000000;
async function send(visitorId, tabId, action = 'heartbeat', now = start) {
 const res = await handlePresence(new Request('https://roof.test/api/presence', { method:'POST', headers: {'Content-Type':'application/json', Origin:'https://roof.test'}, body:JSON.stringify({visitorId,tabId,action}) }), db, now);
 assert.equal(res.status,200); return res.json();
}
assert.equal((await send(a,t1)).count,1);
assert.equal((await send(a,t1)).count,1, 'heartbeat must not double count');
assert.equal((await send(a,t2)).count,1, 'same browser two tabs count once');
assert.equal((await send(b,t3)).count,2, 'second browser is distinct');
assert.equal((await send(a,t1,'leave')).count,2, 'other tab remains');
assert.equal((await send(a,t2,'leave')).count,1);
assert.equal((await send(a,t1,'heartbeat',start+PRESENCE_TTL)).count,1,'expired visitor removed at TTL');
assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM rooftop_presence').get().count,1);
assert.equal((await send(a,t1,'leave',start+PRESENCE_TTL)).count,0);
for(const [body,status] of [['{',400],[JSON.stringify({visitorId:'bad',tabId:t1,action:'heartbeat'}),400],['x'.repeat(501),413]]) {
 const r=await handlePresence(new Request('https://roof.test/api/presence',{method:'POST',headers:{'Content-Type':'application/json'},body}),db,start);assert.equal(r.status,status);
}
assert.equal((await handlePresence(new Request('https://roof.test/api/presence'),db)).status,405);
assert.equal((await handlePresence(new Request('https://roof.test/api/presence',{method:'POST',headers:{Origin:'https://other.test'}}),db)).status,403);
sqlite.close();
console.log('PASS presence: migration, deduplication, separate browsers, tab departure, expiry and input/origin checks');
