import assert from 'node:assert/strict';
const base='http://127.0.0.1:8791';
const unique='test-'+Date.now();
async function post(body, user=unique, origin=base){const r=await fetch(base+'/api/whispers',{method:'POST',headers:{'Content-Type':'application/json',...(user?{'oai-authenticated-user-id':user}:{}),Origin:origin},body:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
assert.equal((await post({room:'all',body:'로그인 없이 쉬어가요.'},null)).status,201);
for(const body of ['너 죽여버린다','야.동 보자','send nudes']) {
 const denied=await post({room:'work',body}); assert.equal(denied.status,422); assert.equal(denied.data.code,'message_blocked');
 const feed=await (await fetch(base+'/api/whispers?room=work')).json(); assert.ok(!feed.messages.some(m=>m.body===body));
}
assert.equal((await post({room:'invalid',body:'test'})).status,400);
assert.equal((await post({room:'all',body:'x'.repeat(61)})).status,400);
assert.equal((await post({room:'all',body:'test'},unique,'https://other.example')).status,403);
await new Promise(r=>setTimeout(r,5100)); // Guest and signed-in requests share this local network.
const first=await post({room:'work',body:'연결 확인: 오늘도 수고했어요.'});assert.equal(first.status,201);
assert.deepEqual(Object.keys(first.data.message).sort(),['body','id']);
assert.equal((await post({room:'work',body:'too fast'})).status,429);
const work=await (await fetch(base+'/api/whispers?room=work')).json();assert.ok(work.messages.some(m=>m.id===first.data.message.id));
const study=await (await fetch(base+'/api/whispers?room=study')).json();assert.ok(!study.messages.some(m=>m.id===first.data.message.id));
const cursor=await (await fetch(base+'/api/whispers?room=work&after='+first.data.message.id)).json();assert.ok(!cursor.messages.some(m=>m.id===first.data.message.id));
await new Promise(r=>setTimeout(r,5100));
const concurrent=await Promise.all([post({room:'all',body:'one'},unique+'race'),post({room:'all',body:'two'},unique+'race')]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[201,429]);
await new Promise(r=>setTimeout(r,6200));
const expired=await (await fetch(base+'/api/whispers?room=work')).json();assert.ok(!expired.messages.some(m=>m.id===first.data.message.id));
console.log('PASS: guest posting, moderation rejected before storage, validation, cross-origin, send/read, privacy, cooldown, room isolation, cursor, concurrent throttle, expiry');
