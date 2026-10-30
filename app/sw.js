/* EPC 에어컨 현황 앱 — 화면 파일 캐시 (데이터는 캐시하지 않음) */
const V = 'ac-app-v4.4';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', '../floors/A-1F.png', '../floors/A-2F.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;                                            // 저장·신고는 항상 서버로
  if (/script\.google(usercontent)?\.com$/.test(url.hostname)) return;       // 서버 데이터는 캐시하지 않음
  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {            // 화면: 새 버전 우선, 끊기면 저장본
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {                               // 그림·라이브러리·글꼴: 저장본 먼저, 뒤에서 갱신
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
