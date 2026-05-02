// ============================================================
//  Service Worker — ระบบบันทึกข้อมูลอุบัติเหตุจราจร
//  © 2569 พ.ต.ท.กฤษณกันต์ เกรียงทวีชัย
// ============================================================
const CACHE_NAME = 'traffic-v9';
const CACHE_FILES = [
  '/traffic-reporter/',
  '/traffic-reporter/index.html',
  '/traffic-reporter/icon-192.png',
  '/traffic-reporter/icon-512.png'
];

// Install — cache ไฟล์หลัก
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate — ลบ cache เก่า
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — Network first, cache fallback
self.addEventListener('fetch', e => {
  // ข้าม request ที่ไม่ใช่ GET
  if (e.request.method !== 'GET') return;
  // ข้าม API calls (Cloudflare Worker, GAS, LINE)
  if (e.request.url.includes('workers.dev') ||
      e.request.url.includes('script.google.com') ||
      e.request.url.includes('api.line.me') ||
      e.request.url.includes('drive.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // cache response ใหม่
        var clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
