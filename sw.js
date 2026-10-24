/* Ludus Manager service worker.
 * Bump CACHE when the app shell should replace older cached files.
 * Current cache name: ludus-manager-v10
 */
const CACHE = 'ludus-manager-v10';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './sprites/murmillo.png',
  './sprites/murmillo-back.png',
  './sprites/retiarius.png',
  './sprites/retiarius-back.png',
  './sprites/thraex.png',
  './sprites/thraex-back.png',
  './sprites/dimachaerus.png',
  './sprites/dimachaerus-back.png',
  './sprites/secutor.png',
  './sprites/secutor-back.png',
  './sprites/coin.png',
  './sprites/sword.png',
  './sprites/armor.png',
  './sprites/helm.png',
  './sprites/bandage.png',
  './sprites/barracks.png',
  './sprites/yard.png',
  './sprites/infirmary.png',
  './sprites/armory.png',
  './sprites/gate.png',
  './sprites/court.png',
  './sprites/gear/gladius.png',
  './sprites/gear/gladius-bronze.png',
  './sprites/gear/gladius-gold.png',
  './sprites/gear/sica.png',
  './sprites/gear/trident.png',
  './sprites/gear/net.png',
  './sprites/gear/spatha.png',
  './sprites/gear/paired.png',
  './sprites/gear/manica.png',
  './sprites/gear/subarmalis.png',
  './sprites/gear/cardio.png',
  './sprites/gear/scale.png',
  './sprites/gear/scale-back.png',
  './sprites/gear/plate.png',
  './sprites/gear/plate-back.png',
  './sprites/gear/galea.png',
  './sprites/gear/galea-bronze.png',
  './sprites/gear/galea-gold.png',
  './sprites/gear/gilded.png',
  './sprites/gear/crested.png',
  './sprites/gear/galea-back.png',
  './sprites/gear/galea-back-bronze.png',
  './sprites/gear/galea-back-gold.png',
  './sprites/gear/crested-back.png',
  './sprites/mythic-vampire.png',
  './sprites/mythic-vampire-back.png',
  './sprites/mythic-werewolf.png',
  './sprites/mythic-werewolf-back.png',
  './sprites/mythic-cyclops.png',
  './sprites/mythic-cyclops-back.png',
  './sprites/mythic-titan.png',
  './sprites/mythic-titan-back.png',
  './sprites/mythic-gorgon.png',
  './sprites/mythic-gorgon-back.png',
  './sprites/mythic-minotaur.png',
  './sprites/mythic-minotaur-back.png',
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
