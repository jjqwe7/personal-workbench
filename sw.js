/**
 * Service Worker - 个人工作台 PWA
 * 版本: v1
 * 功能: 缓存首页HTML及静态资源，支持离线访问
 */

const CACHE_NAME = 'workbench-v12';

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

// 安装事件：预缓存核心资源
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中，版本:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 预缓存资源列表:', PRECACHE_URLS);
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        // 立即激活，不等待旧SW退出
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn('[SW] 预缓存部分资源失败（开发模式下可能正常）:', err);
        return self.skipWaiting();
      })
  );
});

// 激活事件：清理旧版本缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中，版本:', CACHE_NAME);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] 删除旧缓存:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // 立即接管所有客户端
        return self.clients.claim();
      })
  );
});

// 请求拦截：缓存优先策略，离线可用
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只处理GET请求
  if (request.method !== 'GET') return;

  // 跳过非同源请求（如API调用）
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 有缓存则返回缓存，同时在后台更新
          fetchAndCache(request);
          return cachedResponse;
        }

        // 无缓存则从网络获取并缓存
        return fetchAndCache(request);
      })
      .catch(() => {
        // 网络不可用且无缓存时的降级处理
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html') || caches.match('./');
        }
        // 对于其他资源返回离线提示
        return new Response('离线状态，暂无缓存', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

/**
 * 从网络获取资源并更新缓存
 */
function fetchAndCache(request) {
  return fetch(request)
    .then((networkResponse) => {
      // 检查响应是否有效
      if (!networkResponse || networkResponse.status !== 200) {
        return networkResponse;
      }

      // 克隆响应，一份返回给页面，一份存入缓存
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, responseToCache);
        })
        .catch((err) => {
          console.warn('[SW] 缓存写入失败:', err);
        });

      return networkResponse;
    })
    .catch((err) => {
      console.warn('[SW] 网络请求失败:', err);
      throw err;
    });
}