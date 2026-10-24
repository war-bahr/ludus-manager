/* Ludus Manager service worker.
 * Bump CACHE when the app shell should replace older cached files.
 * Current cache name: ludus-manager-v4
 */
const CACHE = 'ludus-manager-v4';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './sprites/murmillo.png',
  './sprites/retiarius.png',
  './sprites/thraex.png',
  './sprites/dimachaerus.png',
  './sprites/secutor.png',
  './sprites/coin.png',
  './sprites/sword.png',
  './sprites/armor.png',
  './sprites/helm.png',
  './sprites/bandage.png',
  './sprites/barracks.png',
  './sprites/yard.png',
  './sprites/infirmary.png',
  './sprites/armory.png',
  './sprites/mythic-vampire.png',
  './sprites/mythic-werewolf.png',
  './sprites/mythic-cyclops.png',
  './sprites/mythic-titan.png',
  './sprites/mythic-gorgon.png',
  './sprites/mythic-minotaur.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const shell = await caches.match('./index.html');
          if (shell) return shell;
        }
        return new Response('Offline, and this page is not cached yet.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }),
  );
});
