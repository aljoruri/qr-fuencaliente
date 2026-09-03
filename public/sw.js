const CACHE_NAME = "qr-fuencaliente-offline-v1";
const META_PREFIX = "__offline_meta__/";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

function metaRequest(selection) {
  return new Request(new URL(`${META_PREFIX}${encodeURIComponent(selection)}`, self.registration.scope));
}

async function notify(client, message) {
  if (client && "postMessage" in client) client.postMessage(message);
}

async function downloadSelection({ client, requestId, selection, version, urls }) {
  const cache = await caches.open(CACHE_NAME);
  const failed = [];

  for (let index = 0; index < urls.length; index += 1) {
    const url = new URL(urls[index], self.location.origin).href;
    try {
      const response = await fetch(new Request(url, { cache: "reload", credentials: "same-origin" }));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await cache.put(url, response.clone());
    } catch {
      failed.push(url);
    }

    await notify(client, {
      type: "OFFLINE_PROGRESS",
      requestId,
      completed: index + 1,
      total: urls.length,
    });
  }

  if (failed.length > 0) {
    await notify(client, { type: "OFFLINE_ERROR", requestId, failed: failed.length });
    return;
  }

  await cache.put(
    metaRequest(selection),
    new Response(JSON.stringify({ version, savedAt: new Date().toISOString() }), {
      headers: { "content-type": "application/json" },
    }),
  );

  if (selection === "all") {
    const keep = new Set(urls.map((url) => new URL(url, self.location.origin).href));
    const requests = await cache.keys();
    await Promise.all(requests.map((request) => {
      const url = new URL(request.url);
      if (url.pathname.includes(`/${META_PREFIX}`) || keep.has(request.url)) return undefined;
      return cache.delete(request);
    }));
  }

  await notify(client, { type: "OFFLINE_COMPLETE", requestId, version });
}

self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message !== "object") return;

  if (message.type === "OFFLINE_STATUS") {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(metaRequest(message.selection));
      const metadata = response ? await response.json() : null;
      await notify(event.source, {
        type: "OFFLINE_STATUS_RESULT",
        requestId: message.requestId,
        ready: metadata?.version === message.version,
        savedAt: metadata?.savedAt ?? null,
      });
    })());
    return;
  }

  if (message.type === "OFFLINE_DOWNLOAD" && Array.isArray(message.urls)) {
    event.waitUntil(downloadSelection({
      client: event.source,
      requestId: message.requestId,
      selection: message.selection,
      version: message.version,
      urls: message.urls,
    }));
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.includes(`/${META_PREFIX}`)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch {
      let cached = await cache.match(event.request, { ignoreSearch: true });
      if (!cached && !requestUrl.pathname.endsWith("/") && !requestUrl.pathname.split("/").pop()?.includes(".")) {
        const directoryUrl = new URL(`${requestUrl.pathname}/${requestUrl.search}`, requestUrl.origin);
        cached = await cache.match(directoryUrl.href, { ignoreSearch: true });
      }
      if (cached) return cached;
      const home = await cache.match(self.registration.scope);
      return home ?? new Response("Contenido no descargado para uso sin conexión.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  })());
});
