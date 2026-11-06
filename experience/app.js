const $=id=>document.getElementById(id);let seated=false,cup='',start=0,breathInterval;
let toastTimer;function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4300)}$('weather').onchange=e=>{rooftop.weather=e.target.value;toast({clear:'구름 사이로 달이 보여요.',rain:'빗소리에 오늘을 흘려보내요.',snow:'옥상에 조용히 눈이 내려요.'}[rooftop.weather])};$('time').onchange=e=>rooftop.mode=e.target.value;$('moon').onchange=e=>rooftop.moon=e.target.value;function updateClock(){if(seated){let secs=Math.floor((Date.now()-start)/1000);$('timer').textContent=String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0')}}updateClock();setInterval(updateClock,1000);$('sit').onclick=()=>{seated=true;rooftop.seated=true;start=Date.now();$('sit').hidden=true;$('rest').hidden=false;toast('편하게 앉아요. 서두를 일은 없어요.')};$('stand').onclick=()=>{seated=false;rooftop.seated=false;$('sit').hidden=false;$('rest').hidden=true;toast('다시 쉬고 싶을 때 들러요.')};$('drink').onclick=()=>$('drinks').showModal();document.querySelectorAll('[data-drink]').forEach(b=>b.onclick=()=>{cup=b.dataset.drink;rooftop.cup=cup;$('drinks').close();toast('자리 옆에 한 잔 놓아두었어요.')});$('remove').onclick=()=>{cup='';rooftop.cup='';$('drinks').close();toast('음료를 치웠어요.')};const greetings=[
'오늘 하루, 여기까지 온 것만으로 충분해요.','저 불 켜진 창문에도 누군가의 하루가 있겠죠.','내일의 일은 내일의 나에게 잠시 맡겨요.','오늘 못다 한 말은 바람이 데려갈 거예요.','아무 말 없이 같이 달을 봐요.','당신의 밤이 조금은 포근했으면 해요.','잘하고 있는지 몰라도, 잘 버티고 있어요.','늦게 핀 마음에도 달빛은 닿아요.','퇴근한 마음까지 이제 쉬어도 괜찮아요.','펼쳐둔 책은 잠깐 덮어두어요.','오늘의 작은 기쁨 하나만 챙겨가요.','누군가 당신에게도 수고했다고 말해주길.','아무것도 이루지 않는 밤도 필요해요.','따뜻한 한 잔처럼 다정한 밤이길.','여기는 잠깐 멈춰도 되는 곳이에요.','불빛이 하나 꺼져도, 달은 남아 있어요.','남들보다 느린 걸음에도 풍경은 있어요.','괜찮다는 말이 오늘은 당신에게 닿기를.','이 밤을 지나면 또 다른 빛이 오겠죠.','지금만큼은 당신 편이 되어주세요.','마음의 짐도 신발처럼 잠깐 벗어두어요.','저 골목 끝에는 무슨 이야기가 있을까요.','바람이 좋아서, 조금 더 앉아 있고 싶네요.','오늘도 무사히 돌아와줘서 고마워요.','답이 없는 날에는 달을 올려다봐요.','혼자여도 쓸쓸하지만은 않은 밤이길.','당신이 좋아하는 것들을 잊지 않았으면 해요.','내일은 작은 행운 하나가 찾아오기를.','지친 마음에도 빈 의자 하나 내어주세요.','이 순간에는 아무것도 증명하지 않아도 돼요.','잘 자요. 아직 잠들지 않더라도.','조금 가벼워진 마음으로 내려가요.'
];let greetingBag=[];function greet(){if(!greetingBag.length){greetingBag=[...greetings];for(let i=greetingBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[greetingBag[i],greetingBag[j]]=[greetingBag[j],greetingBag[i]]}}toast(greetingBag.pop())}$('greet').onclick=greet;$('breathe').onclick=()=>{$('breathing').showModal();$('breathtext').textContent='천천히 들이마셔요';let inhale=true;clearInterval(breathInterval);breathInterval=setInterval(()=>{inhale=!inhale;$('breathtext').textContent=inhale?'천천히 들이마셔요':'천천히 내쉬어요'},4000)};$('breathing').addEventListener('close',()=>clearInterval(breathInterval));document.querySelectorAll('.close').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));// Guidance yields to typing and incoming messages, without keyboard flicker.
(()=>{
let deadline=Date.now()+30000, readingUntil=0;
const toggle=$('toggle-guidance');
function reveal(){
 document.body.classList.remove('guidance-hidden','chat-reading');
 document.querySelectorAll('.ambience-controls').forEach(el=>el.inert=false);
 toggle.textContent='안내 숨기기';toggle.setAttribute('aria-pressed','false');
 deadline=Date.now()+30000;$('fade-count').textContent='30';
}
function hide(){
 document.body.classList.add('guidance-hidden');
 document.querySelectorAll('.ambience-controls').forEach(el=>el.inert=true);
 toggle.textContent='안내 보기';toggle.setAttribute('aria-pressed','true');
}
function chatView(duration=0){
 readingUntil=Math.max(readingUntil,Date.now()+duration);
 document.body.classList.add('chat-reading');hide();
}
const isChat=target=>target?.closest?.('.chat-dock,#whisper-field');
function interact(e){
 if(toggle.contains(e.target))return;
 if(isChat(e.target)){chatView();return;}
 if(Date.now()<readingUntil)return;
 reveal();
}
toggle.onclick=()=>document.body.classList.contains('guidance-hidden')?reveal():hide();
document.addEventListener('pointerdown',interact);
document.addEventListener('keydown',interact);
document.addEventListener('focusin',e=>{if(isChat(e.target))chatView()});
document.addEventListener('rooftop-chat-reading',e=>chatView(e.detail?.duration||0));
setInterval(()=>{
 if(document.activeElement?.matches('input,select,textarea')||document.querySelector('dialog[open]')){deadline=Date.now()+30000;return}
 const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));
 $('fade-count').textContent=remaining;
 if(!remaining&&!document.body.classList.contains('guidance-hidden'))hide();
},1000);
for(const key of ['weather','time','moon']){try{const val=localStorage.getItem('rooftop-'+key);if(val&&[...$(key).options].some(o=>o.value===val)){$(key).value=val;rooftop[key==='time'?'mode':key]=val}}catch{}$(key).addEventListener('change',()=>{try{localStorage.setItem('rooftop-'+key,$(key).value)}catch{}})}
})();
