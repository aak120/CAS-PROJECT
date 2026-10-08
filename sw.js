// Offline support: cache the app shell so MoneyQuest works without internet once loaded.
// Bump VERSION whenever you change any file so phones pick up the update.
const VERSION = 'mq-v6';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/styles.css',
  './js/content.js', './js/country.js', './js/ui.js', './js/state.js', './js/app.js', './js/adaptive.js', './js/personality.js',
  './js/games.js', './js/games2.js', './js/sims.js', './js/lifesim.js', './js/portfolio.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Network first (so updates show up), falling back to the cache when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
