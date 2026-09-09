const CACHE_NAME = 'roohpro-app-cache-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // تجاوز طلبات إعلانات الطرف الثالث أو السيرفرات الخارجية لتجنب اعتراضها
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // وضع الاستجابة الفورية من الكاش مع التحديث الشبكي
  e.respondWith(
    caches.match(e.request).then((res) => {
      return (
        res ||
        fetch(e.request)
          .then((networkRes) => {
            // تخزين الأصول الثابتة والصور فقط تلقائياً إذا كانت ناجحة
            if (
              networkRes &&
              networkRes.status === 200 &&
              (url.pathname.endsWith('.js') ||
                url.pathname.endsWith('.css') ||
                url.pathname.endsWith('.png') ||
                url.pathname.endsWith('.jpg') ||
                url.pathname.endsWith('.svg') ||
                url.pathname.endsWith('.woff2'))
            ) {
              const resClone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
            }
            return networkRes;
          })
          .catch(() => caches.match('/'))
      );
    })
  );
});
