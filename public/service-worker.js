// Implement a service worker so that users can use the app offline.
// SW will need to cache static assets to display the app offline.
// SW should cache transaction data, using the cached data as a fallback
// when the app is used offline.
// Use two caches:
// One for the static assets such ass html, css, js, images
// One for dynamic data from requests to routes beginning with '/api'

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/assets/css/styles.css",
  "/assets/js/index.js",
  "/assets/js/db.js",
  "/assets/images/icons/icon-192x192.png",
  "/assets/images/icons/icon-512x512.png",
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

// cache above files for use later
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // clear previous cache
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // cache successful GET requests to the API
  if (e.request.url.includes("/api/") && e.request.method === "GET") {
    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(e.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(e.request, response.clone());
              }

              return response;
            })
            .catch(() => {
              // Network request failed, try to get it from the cache.
              return cache.match(e.request);
            });
        })
        .catch((err) => console.log(err))
    );

    // stop execution of the fetch event callback
    return;
  }

  // if the request is not for the API, serve static assets using
  // "offline-first" approach
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
