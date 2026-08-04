/**
 * Service Worker - 个人工作台 PWA
 * 版本: v13
 * 策略: 网络优先（确保用户总是获取最新代码）
 */

const CACHE_NAME = 'workbench-v13';

// 需要预缓存的资源列表
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './app.js',
  './content-data.js',
  './content-renderer.js'
];

// 安装事件：跳过预缓存，直接激活
self.addEventListener('install', (event) => {
  console.log('[SW v13] 安装中');
  // 立即激活，不等待旧SW退出
  self.skipWaiting();
});

// 激活事件：清理所有旧缓存，通知客户端刷新
self.addEventListener('activate', (event) => {
  console.log('[SW v13] 激活中，清理旧缓存');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // 删除所有非当前版本的缓存
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW v13] 删除旧缓存:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // 预缓存核心资源
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(PRECACHE_URLS).catch(() => {});
        });
      })
      .then(() => {
        // 立即接管所有客户端
        return self.clients.claim();
      })
      .then(() => {
        // 通知所有客户端刷新页面
        return self.clients.matchAll({ type: 'window' });
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_UPDATED', version: 'v13' });
        });
      })
  );
});

// 请求拦截：网络优先策略
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只处理GET请求
  if (request.method !== 'GET') return;

  // 跳过非同源请求
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    // 先尝试网络
    fetch(request)
      .then((networkResponse) => {
        // 网络成功：返回响应，同时更新缓存
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, responseToCache))
            .catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        // 网络失败：回退到缓存
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 如果是HTML请求且无缓存，返回缓存的首页
            if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html') || caches.match('./');
            }
            return new Response('离线状态，暂无缓存', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// 监听消息：手动清除缓存
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      Promise.all(names.map((name) => caches.delete(name))).then(() => {
        event.source.postMessage({ type: 'CACHE_CLEARED' });
      });
    });
  }
});
