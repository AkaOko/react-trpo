const CACHE_NAME = "react-trpo-cache-v1";
const urlsToCache = ["/", "/index.html", "/assets/", "/images/placeholder.svg"];

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
    // Для загрузки файлов используем прямую передачу без кэширования
    if (url.pathname === "/api/upload") {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
          })
          .catch((error) => {
            console.error("File upload error:", error);
            return new Response(
              JSON.stringify({
                error: "Upload error",
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

    event.respondWith(
      fetchWithRetry(event.request, 3)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        })
        .catch((error) => {
          console.error("API fetch error:", error);
          // Проверяем кэш для GET запросов
          if (event.request.method === "GET") {
            return caches.match(event.request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response(
                JSON.stringify({
                  error: "Network error",
                  details: error.message,
                  url: event.request.url,
                }),
                {
                  status: error.message.includes("404") ? 404 : 500,
                  headers: { "Content-Type": "application/json" },
                }
              );
            });
          }
          return new Response(
            JSON.stringify({
              error: "Network error",
              details: error.message,
              url: event.request.url,
            }),
            {
              status: error.message.includes("404") ? 404 : 500,
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
          // Для изображений возвращаем placeholder
          if (event.request.destination === "image") {
            return caches.match("/images/placeholder.svg");
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

// Добавляем функцию для повторных попыток
async function fetchWithRetry(request, retries) {
  try {
    // Создаем новый объект Request для каждой попытки
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      mode: request.mode,
      credentials: request.credentials,
      cache: request.cache,
      redirect: request.redirect,
      referrer: request.referrer,
      integrity: request.integrity,
    });

    const response = await fetch(newRequest);
    if (!response.ok && retries > 0) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(request, retries - 1);
    }
    throw error;
  }
}
