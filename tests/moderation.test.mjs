import assert from 'node:assert/strict';
import {isBlockedMessage} from '../lib/message-moderation.mjs';
const blocked=['너 죽여버린다','너 죽일 거야','야동 보자','섹스 하자','시 발','야.동','섹\u200b스','ㅅㅂ','s e x','p0rn','I will kill you','send nudes','강간','옷 벗어','가슴 보여줘'];
const allowed=['오늘도 수고했어요.','달이 예쁘네요','폭력 피해 상담을 받고 싶어요','성교육 수업이 있었어요','죽도록 공부했어','책을 다시 읽어보지 않을래?','같이 자지 말고 공부하자','Essex is quiet','I am tired'];
for(const text of blocked)assert.equal(isBlockedMessage(text),true,'must block: '+text);
// Korean homonyms need contextual handling rather than unqualified substrings.
for(const text of allowed)assert.equal(isBlockedMessage(text),false,'must allow: '+text);
console.log(`PASS: ${blocked.length} blocked / ${allowed.length} safe cases`);
