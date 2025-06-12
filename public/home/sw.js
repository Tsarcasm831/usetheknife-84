// Service Worker to precache background music files
const CACHE_NAME = 'bgm-cache-v1';
const BGM_FILES = [
  '/assets/sounds/town1.mp3',
  '/assets/sounds/town2.mp3'
];

let modelFiles = [];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      modelFiles = await fetch('/assets/manifest.json').then(r => r.json());
      await cache.addAll([...BGM_FILES, ...modelFiles]);
    } catch (err) {
      console.warn('SW manifest fetch failed:', err);
      await cache.addAll(BGM_FILES);
    }
  })());
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (BGM_FILES.includes(requestUrl.pathname) || modelFiles.includes(requestUrl.pathname)) {
    event.respondWith(
      caches.match(event.request).then(resp => resp || fetch(event.request).then(networkResp => {
        const respClone = networkResp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
        return networkResp;
      }))
    );
  }
});
