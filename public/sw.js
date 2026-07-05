// Service worker DynamiTeam — cache HANYA aset statis. Data (activity, nyawa,
// leaderboard, admin, session) SELALU dari jaringan agar tak pernah basi.
const CACHE = 'dynamiteam-v1';
const PRECACHE = [
  '/offline.html',
  '/favicon.png',
  '/logo-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Jangan sentuh non-GET (login, upload foto, PATCH activity, dll).
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // hanya same-origin

  // 1) API & auth: SELALU jaringan, TIDAK PERNAH di-cache (data real-time & session).
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req));
    return;
  }

  // 2) Navigasi halaman: network-first. Kalau offline → tampilkan offline.html.
  //    Halaman TIDAK di-cache supaya dashboard/nyawa/leaderboard selalu terbaru.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    return;
  }

  // 3) Aset statis immutable (_next/static, icon, logo): cache-first (aman & cepat, offline-ready).
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    PRECACHE.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
      )
    );
    return;
  }

  // 4) Sisanya: coba jaringan, fallback ke cache bila ada.
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
