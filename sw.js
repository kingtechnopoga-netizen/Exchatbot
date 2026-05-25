/* ExChatBot service worker — minimal offline shell, network-first */
const VERSION = "v2.1.0";
const CACHE = "excb-" + VERSION;

const SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./icon-192.svg",
  "./icon-512.svg",
  "./icon-maskable.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Cross-origin (puter.js, etc.) always go to network — never cached here.
  if (url.origin !== self.location.origin) return;

  // Network-first for everything same-origin: ensures updates ship instantly.
  // Cache is only used as offline fallback.
  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(req).then((cached) => cached || caches.match("./index.html"))
    )
  );
});
