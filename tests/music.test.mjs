import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
class Element extends EventTarget {
  dataset={};attrs={};textContent='';value='clear';paused=true;calls=[];
  querySelector(){return this.label||(this.label={textContent:''});}
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return this.attrs[k];}
  pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
  play(){this.paused=false;return new Promise((resolve,reject)=>this.calls.push({resolve,reject}));}
}
const button=new Element(),audio=new Element(),weather=new Element(),timers=new Map();let tid=0;
const elements={sound:button,'rooftop-bgm':audio,weather};
const navigator={audioSession:{type:'auto'}};
vm.runInNewContext(readFileSync('experience/music.js','utf8'),{document:{getElementById:id=>elements[id]},navigator,toast(){},addEventListener(){},setTimeout:f=>{timers.set(++tid,f);return tid},clearTimeout:id=>timers.delete(id)});
const flush=async()=>{await new Promise(r=>setImmediate(r));};
assert.equal(audio.calls.length,0,'no autoplay');
button.onclick();assert.equal(audio.calls.length,1,'play is synchronous inside tap');
assert.equal(navigator.audioSession.type,'playback');assert.equal(button.dataset.playback,'loading');
assert.equal(audio.attrs.src,'/audio/clear.m4a');
audio.calls[0].resolve();await flush();assert.equal(button.dataset.playback,'playing');
weather.value='rain';weather.dispatchEvent(new Event('change'));assert.equal(audio.attrs.src,'/audio/rain.m4a');
weather.value='snow';weather.dispatchEvent(new Event('change'));assert.equal(audio.attrs.src,'/audio/snow.m4a');
audio.calls[1].reject(new Error('old track aborted'));await flush();assert.equal(button.dataset.playback,'loading','old rejection cannot stop new source');
audio.calls[2].resolve();await flush();assert.equal(button.dataset.playback,'playing');
audio.pause();assert.equal(button.dataset.playback,'retry','interruption reflected honestly');
button.onclick();assert.equal(audio.calls.length,4);audio.calls[3].reject(new Error('NotAllowedError'));await flush();assert.equal(button.dataset.playback,'retry');assert.equal(audio.paused,true);
button.onclick();button.onclick();audio.calls[4].resolve();await flush();assert.equal(button.dataset.playback,'off','cancel during load stays off');
button.onclick();[...timers.values()][0]();assert.equal(button.dataset.playback,'retry','hung start is retryable');
console.log('PASS media: gesture start, no autoplay, weather races, interruption, blocked playback, cancellation and timeout');
