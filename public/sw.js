const CACHE_NAME = "react-trpo-cache-v1";
const urlsToCache = ["/", "/index.html", "/assets/", "/placeholder.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Пропускаем запросы к API
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        })
        .catch((error) => {
          console.error("API fetch error:", error);
          return new Response(
            JSON.stringify({
              error: "Network error",
              details: error.message,
              url: event.request.url,
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        })
    );
    return;
  }

  // Для остальных запросов используем стратегию "Network First"
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          return new Response(
            JSON.stringify({
              error: "Network error",
              url: event.request.url,
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        });
      })
  );
});
