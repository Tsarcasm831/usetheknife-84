// Service Worker to precache background music files
const CACHE_NAME = 'bgm-cache-v1';
const BGM_FILES = [
    '/assets/sounds/town1.mp3',
    '/assets/sounds/town2.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(BGM_FILES))
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    if (BGM_FILES.includes(requestUrl.pathname)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
});
