// Deterministic, server-side baseline. Not a semantic classifier: false positives
// and novel euphemisms remain possible. Keep patterns and regression cases together.
const forbidden = [
 /시발|씨발|씨팔|개새끼|병신|좆|씹새|ㅅㅂ|ㅆㅂ|ㅂㅅ/,
 /죽여|죽일|죽인다|죽여버|쳐죽|처죽|패버|패죽|때려죽|칼로찌|칼로쑤|찔러죽|목을따|목따버|총으로쏴|총쏴죽|강간|성폭행|자살해|자살하라고|뒤져라|뒤져버|살해하|살해할|토막살인|폭탄만들/,
 /섹스|쎅스|섹쓰|쎅쓰|야동|포르노|성기노출|성기사진|자위|딸딸이|꼬추사진|고추사진|정액|사정해|사정하|질내|항문섹|후장|펠라|오럴섹|애널|누드사진|알몸사진|벗은사진|가슴사진|가슴만져|젖꼭지|몸캠|섹파|섹친|조건만남|원조교제|미성년.*성관계|성관계.*미성년/,
 /옷벗어|팬티벗|속옷벗|벗고보여|가슴보여|성매매|성착취|음란물|딥페이크야/,
].map(rule => new RegExp(rule.source.normalize('NFKC'), rule.flags));
const english = /\b(porn(?:ography)?|nudes?|naked|masturbat\w*|blowjob|handjob|cumshot|fuck\w*|rape|raping|sex(?:ting|ual)?|dick|cock|pussy)\b|\b(kill|murder|stab|shoot)\s+(you|him|her|them|everyone)\b|\bkill\s+yourself\b/i;
export function isBlockedMessage(input) {
 if(typeof input !== 'string') return true;
 const normalized=input.normalize('NFKC').toLowerCase().replace(/[\p{Cf}\p{M}]/gu,'');
 const compact=normalized.replace(/[^\p{L}]/gu,'');
 if (/^(보지|자지)$|(?:보지|자지)(?:사진|보여|빨아|만져|핥아)/.test(compact)) return true;
 if(forbidden.some(rule=>rule.test(compact))) return true;
 // Canonical decomposition also catches syllables split by invisible separators.
 const decomposed=normalized.normalize('NFD').replace(/[^\p{L}]/gu,'');
 if(['섹스','야동','죽여','시발','강간'].some(word=>decomposed.includes(word.normalize('NFD'))))return true;
 const leet=normalized.replace(/0/g,'o').replace(/[1!]/g,'i').replace(/3/g,'e').replace(/4/g,'a').replace(/[5$]/g,'s').replace(/7/g,'t');
 if(english.test(leet))return true;
 return /(?:^|[^a-z])s[\s._*-]*e[\s._*-]*x(?:$|[^a-z])|(?:^|[^a-z])p[\s._*-]*o[\s._*-]*r[\s._*-]*n(?:$|[^a-z])/i.test(leet);
}
