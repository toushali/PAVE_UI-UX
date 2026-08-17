/* ============================================================
   Kivie patient PWA — service worker (S16)

   Caching strategy per M1 §4:
     · stale-while-revalidate for CSS and JS — see the note below
     · cache-first        for images and fonts
     · stale-while-revalidate for HTML, so a returning patient sees
       something instantly and gets the fresh copy next load
     · offline fallback   to app/offline.html when nothing is cached

   IMPORTANT — no PHI is cached. This prototype has no API, but the
   fetch handler below only ever caches same-origin GET requests for
   static documents and assets, and explicitly skips anything under an
   /api/ path. FSD §3.4 forbids PHI in unsecured locations, and a
   service-worker cache is exactly that.
   ============================================================ */
/* Bump this on any change to PRECACHE or the strategies below.
   v3: the portal folder was renamed, so every cached URL changed. This is a
   cache generation, not a portal version — do not tie it to a folder name. */
const VERSION = "kivie-v3";
const SHELL = VERSION + "-shell";

/* The app shell: enough to open offline and reach the offline page. */
const PRECACHE = [
  "app/today.html",
  "app/offline.html",
  "css/tokens.css",
  "css/base.css",
  "css/components.css",
  "js/app.js",
  "manifest.json",
  "assets/icons/icon-192.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())   /* a missing file must not block install */
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith(VERSION) && k !== SHELL)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  /* Never touch non-GET, cross-origin, or anything API-shaped. A cached
     clinical response would be PHI sitting in unsecured storage. */
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/api/")) return;

  const isDoc = req.mode === "navigate" || req.destination === "document";

  if (isDoc) {
    /* stale-while-revalidate */
    event.respondWith(
      caches.open(SHELL).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => cached || cache.match("app/offline.html"));
        return cached || network;
      })
    );
    return;
  }

  /* CSS and JS use stale-while-revalidate, NOT cache-first.
     M1 §4 specifies cache-first for static assets, and that is correct when
     filenames are content-hashed. This build serves `components.css` and
     `app.js` at fixed paths, so cache-first pins them at whatever version a
     device first saw — a style change then never reaches that device. That
     is a real defect, not a theoretical one: it silently froze the styling
     of an onboarding change during review. */
  if (req.destination === "style" || req.destination === "script") {
    event.respondWith(
      caches.open(SHELL).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  /* cache-first is still right for images and fonts — they are versioned by
     filename and do not change under an existing name. */
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res.ok && ["image", "font"].includes(req.destination)) {
        const copy = res.clone();
        caches.open(SHELL).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => cached))
  );
});
