import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
class Element extends EventTarget {
  dataset={};attrs={};textContent='';value='clear';paused=true;calls=[];
  querySelector(){return this.label||(this.label={textContent:''});}
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return this.attrs[k];}
  pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
  load(){this.loads=(this.loads||0)+1;this.error=null;}
  play(){this.paused=false;return new Promise((resolve,reject)=>this.calls.push({resolve,reject}));}
}
const button=new Element(),audio=new Element(),weather=new Element(),timers=new Map();let tid=0;
const elements={sound:button,'rooftop-bgm':audio,weather};
const navigator={audioSession:{type:'auto'}};
const document=new EventTarget();document.getElementById=id=>elements[id];document.visibilityState='visible';
const script=readFileSync('experience/music.js','utf8');
vm.runInNewContext(script,{document,navigator,toast(){},addEventListener(){},setTimeout:f=>{timers.set(++tid,f);return tid},clearTimeout:id=>timers.delete(id)});
const flush=async()=>{await new Promise(r=>setImmediate(r));};
assert.equal(audio.calls.length,0,'no autoplay');
button.onclick();assert.equal(audio.calls.length,1,'play is synchronous inside tap');
assert.equal(navigator.audioSession.type,'playback');assert.equal(button.dataset.playback,'loading');
assert.equal(audio.attrs.src,'/audio/clear.m4a');
audio.calls[0].resolve();await flush();assert.equal(button.dataset.playback,'playing');
weather.value='rain';weather.dispatchEvent(new Event('change'));assert.equal(audio.attrs.src,'/audio/rain.m4a');
weather.value='snow';weather.dispatchEvent(new Event('change'));assert.equal(audio.attrs.src,'/audio/snow.m4a?v=2');
audio.calls[1].reject(new Error('old track aborted'));await flush();assert.equal(button.dataset.playback,'loading','old rejection cannot stop new source');
audio.calls[2].resolve();await flush();assert.equal(button.dataset.playback,'playing');
audio.pause();assert.equal(button.dataset.playback,'retry','interruption reflected honestly');
button.onclick();assert.equal(audio.calls.length,4);audio.calls[3].reject(new Error('NotAllowedError'));await flush();assert.equal(button.dataset.playback,'retry');assert.equal(audio.paused,true);
button.onclick();button.onclick();audio.calls[4].resolve();await flush();assert.equal(button.dataset.playback,'off','cancel during load stays off');
button.onclick();[...timers.values()][0]();assert.equal(button.dataset.playback,'retry','hung start is retryable');
const loads=audio.loads||0;
delete navigator.audioSession; // Android/desktop need no experimental Audio Session API.
button.onclick();assert.equal(audio.loads,loads+1,'retry resets failed or stalled resource');
audio.calls.at(-1).resolve();await flush();assert.equal(button.dataset.playback,'playing');
audio.dispatchEvent(new Event('waiting'));assert.equal(button.dataset.playback,'loading');
audio.dispatchEvent(new Event('playing'));assert.equal(button.dataset.playback,'playing');assert.equal(timers.size,0);
audio.paused=true;document.dispatchEvent(new Event('visibilitychange'));assert.equal(button.dataset.playback,'retry');
button.onclick();audio.calls.at(-1).resolve();await flush();
audio.error={code:2};audio.dispatchEvent(new Event('error'));assert.equal(button.dataset.playback,'retry');
button.onclick();assert.equal(audio.error,null);audio.calls.at(-1).resolve();await flush();
audio.dispatchEvent(new Event('waiting'));[...timers.values()][0]();assert.equal(button.dataset.playback,'retry');
audio.play=()=>{throw new Error('NotAllowedError')};button.onclick();assert.equal(button.dataset.playback,'retry');
console.log('PASS media: gesture, weather races, blocked playback, cancellation, timeout, Android API absence, load recovery and resume');
