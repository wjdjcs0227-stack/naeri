(() => {
  const label = document.getElementById('presence-count');
  const key = 'rooftop-visitor';
  let visitorId;
  try {
    visitorId = localStorage.getItem(key);
    if (!/^[a-f0-9-]{36}$/i.test(visitorId || '')) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(key, visitorId);
    }
  } catch { visitorId = crypto.randomUUID(); }
  // Unique per document: closing one tab must not remove another tab's heartbeat.
  const tabId = crypto.randomUUID();
  let timer, controller, generation = 0;
  const payload = action => JSON.stringify({ visitorId, tabId, action });
  async function heartbeat() {
    clearTimeout(timer);
    if (document.hidden) return;
    const current = ++generation;
    controller?.abort();
    const currentController = new AbortController();
    controller = currentController;
    const timeout = setTimeout(() => currentController.abort(), 10000);
    try {
      const response = await fetch('/api/presence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload('heartbeat'), cache: 'no-store', signal: currentController.signal });
      if (!response.ok) throw new Error('offline');
      const data = await response.json();
      if (!Number.isSafeInteger(data.count) || data.count < 0) throw new Error('invalid');
      if (current === generation) label.textContent = `지금 함께 머무는 ${data.count.toLocaleString('ko-KR')}명`;
    } catch {
      if (current === generation) label.textContent = '머무는 인원 확인 중';
    } finally {
      clearTimeout(timeout);
      if (current === generation && !document.hidden) timer = setTimeout(heartbeat, 30000);
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      generation++; clearTimeout(timer); controller?.abort();
    } else heartbeat();
  });
  addEventListener('pagehide', () => {
    generation++; clearTimeout(timer); controller?.abort();
    navigator.sendBeacon('/api/presence', new Blob([payload('leave')], { type: 'application/json' }));
  });
  addEventListener('pageshow', event => { if (event.persisted) heartbeat(); });
  addEventListener('online', heartbeat);
  heartbeat();
})();
