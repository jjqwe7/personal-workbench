/**
 * Service Worker - 个人工作台 PWA
 * 版本: v14
 * 策略: 网络优先 + 安装时清除所有旧缓存
 */

const CACHE_NAME = 'workbench-v14';

// 安装事件：立即清除所有旧缓存，然后跳过等待
self.addEventListener('install', (event) => {
  console.log('[SW v14] 安装中，清除所有旧缓存');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // 安装时就删除所有缓存（包括旧的v12/v13）
        return Promise.all(
          cacheNames.map((name) => {
            console.log('[SW v14] 安装时删除缓存:', name);
            return caches.delete(name);
          })
        );
      })
      .then(() => {
        // 立即激活
        return self.skipWaiting();
      })
  );
});

// 激活事件：再次清理 + 接管客户端
self.addEventListener('activate', (event) => {
  console.log('[SW v14] 激活中');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: 'v14' });
        });
      })
  );
});

// 请求拦截：网络优先
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, responseToCache))
            .catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html') || caches.match('./');
            }
            return new Response('离线状态', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});
