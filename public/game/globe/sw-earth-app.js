// Simple service worker to block WebSim requests and handle React errors
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Block requests to WebSim domains
  const url = event.request.url;
  if (url.includes('websim.ai') || 
      url.includes('project-screenshots') || 
      url.includes('images.websim')) {
    // Return empty response
    event.respondWith(new Response('{}', {
      headers: { 'Content-Type': 'application/json' }
    }));
    return;
  }
  
  // Let all other requests pass through normally
});

// Handle any errors that occur in the service worker
self.addEventListener('error', function(event) {
  console.warn('Service worker error suppressed:', event.message);
  event.preventDefault();
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', function(event) {
  console.warn('Service worker unhandled rejection suppressed:', event.reason);
  event.preventDefault();
});