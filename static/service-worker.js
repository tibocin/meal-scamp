/// <reference lib="webworker" />
const CACHE = 'meal-scamp-v1';
const OFFLINE_URLS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(OFFLINE_URLS)));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Only cache GET requests to same-origin, skip API routes
  const isSameOrigin = url.origin === self.location.origin;
  const isAPI = url.pathname.startsWith('/api/');
  
  if (e.request.method !== 'GET' || !isSameOrigin || isAPI) return;

  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, copy));
      return resp;
    }).catch(() => caches.match('/')))
  );
});
