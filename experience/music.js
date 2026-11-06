// Native media playback is more reliable in iPhone in-app browsers than Web Audio.
// These AAC tracks are rendered from our original weather-specific note patterns.
(() => {
  const button = document.getElementById('sound');
  const audio = document.getElementById('rooftop-bgm');
  const weather = document.getElementById('weather');
  const names = { clear: '맑은 밤 · 작은 건반', rain: '비 오는 밤 · 빗소리와 건반', snow: '눈 내리는 밤 · 유리빛 벨' };
  let wanted = false, pending = false, generation = 0, timeout;
  const label = button.querySelector('span');
  function session(type) { try { if (navigator.audioSession) navigator.audioSession.type = type; } catch {} }
  function show(state, text) {
    button.dataset.playback = state;
    button.setAttribute('aria-pressed', String(state === 'playing'));
    label.textContent = text;
  }
  function stop() {
    generation++; wanted = false; pending = false; clearTimeout(timeout);
    audio.pause(); session('auto'); show('off', 'BGM 켜기');
  }
  function fail(token) {
    if (token !== generation || !wanted) return;
    generation++; wanted = false; pending = false; clearTimeout(timeout);
    audio.pause(); session('auto'); show('retry', 'BGM 다시 켜기');
    toast('소리가 시작되지 않았어요. 다시 눌러주세요. 계속 안 들리면 Safari에서 열어주세요.');
  }
  function start() {
    const token = ++generation;
    wanted = true; pending = true; clearTimeout(timeout);
    session('playback');
    const theme = weather.value in names ? weather.value : 'clear';
    const source = '/audio/' + theme + '.m4a';
    button.dataset.theme = theme; button.title = names[theme];
    show('loading', 'BGM 준비 중');
    if (audio.getAttribute('src') !== source) audio.setAttribute('src', source);
    audio.muted = false;
    timeout = setTimeout(() => fail(token), 15000);
    // Must run directly inside the tap/change handler, before any await or fetch.
    try {
      Promise.resolve(audio.play()).then(() => {
        if (token !== generation || !wanted) return;
        clearTimeout(timeout); pending = false;
        if (audio.paused) { show('retry', 'BGM 다시 켜기'); return; }
        show('playing', 'BGM 끄기'); toast(names[theme] + '이 함께해요.');
      }).catch(() => fail(token));
    } catch { fail(token); }
  }
  button.onclick = () => {
    if (wanted && (pending || !audio.paused)) stop();
    else start();
  };
  weather.addEventListener('change', () => { if (wanted) start(); });
  audio.addEventListener('pause', () => {
    if (wanted && !pending) show('retry', 'BGM 다시 켜기');
  });
  audio.addEventListener('playing', () => { if (wanted) show('playing', 'BGM 끄기'); });
  audio.addEventListener('error', () => { if (wanted) fail(generation); });
  addEventListener('pagehide', stop);
  show('off', 'BGM 켜기');
})();
