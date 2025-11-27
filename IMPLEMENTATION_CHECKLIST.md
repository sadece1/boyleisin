# SSR ve Optimizasyon Uygulama Checklist

## ✅ Tamamlananlar

### 1. Server-Side Meta Tags ✅
- [x] `server/src/middleware/ssrMetaTags.ts` oluşturuldu
- [x] `server/src/app.ts`'e eklendi
- [x] Route-specific meta tags desteği
- [x] Open Graph ve Twitter Card support

### 2. Code-Splitting ✅
- [x] Vite otomatik code-splitting aktif
- [x] Route-based lazy loading
- [x] Dynamic imports
- [x] Tree shaking (aggressive)

### 3. Compression ✅
- [x] Gzip aktif (Nginx)
- [x] Brotli config hazır (modül yüklüyse aktif)
- [x] Cache headers (static assets için 1 yıl)

### 4. Image Optimization ✅
- [x] `OptimizedImage` component
- [x] WebP/AVIF support
- [x] Responsive srcset
- [x] Lazy loading

### 5. Font Display ✅
- [x] `font-display: swap` eklendi

---

## ⚠️ Yapılacaklar

### 1. Prerendering (Opsiyonel)
- [ ] Puppeteer kurulumu: `npm install --save-dev puppeteer`
- [ ] Prerender script test: `node scripts/prerender.js`
- [ ] Nginx config'e prerendered HTML support ekle

### 2. Backend Build ve Deploy
- [ ] Backend'i build et: `cd server && npm run build`
- [ ] PM2 restart: `pm2 restart campscape-backend`
- [ ] Meta tags test: `curl https://sadece1deneme.com/ | grep og:title`

### 3. Nginx Reload
- [ ] Nginx config test: `sudo nginx -t`
- [ ] Nginx reload: `sudo systemctl reload nginx`
- [ ] Header test: `curl -I https://sadece1deneme.com/`

---

## 🧪 Test Komutları

### Server-Side Meta Tags Test
```bash
# Ana sayfa meta tags
curl https://sadece1deneme.com/ | grep -i "og:title\|twitter:card\|canonical"

# Blog sayfası meta tags
curl https://sadece1deneme.com/blog | grep -i "og:title"
```

### Compression Test
```bash
# Gzip test
curl -H "Accept-Encoding: gzip" -I https://sadece1deneme.com/ | grep -i "content-encoding"

# Brotli test (if installed)
curl -H "Accept-Encoding: br" -I https://sadece1deneme.com/ | grep -i "content-encoding"
```

### Code-Splitting Test
```bash
# Build output kontrolü
npm run build
ls -lh dist/assets/js/ | head -10
```

### Image Optimization Test
```bash
# WebP test
curl -I "https://sadece1deneme.com/tent-4534210_1280.jpg?w=400&fm=webp"

# AVIF test
curl -I "https://sadece1deneme.com/tent-4534210_1280.jpg?w=400&fm=avif"
```

---

## 📊 Beklenen Sonuçlar

### Server-Side Meta Tags
- ✅ SEO skoru: +20-30 puan
- ✅ Social sharing: Perfect preview cards
- ✅ Google indexing: Better crawlability

### Code-Splitting (Zaten var)
- ✅ Initial bundle: ~70 KB (index.js)
- ✅ Route chunks: ~10-50 KB each
- ✅ Vendor chunk: ~495 KB (gzip: ~175 KB)

### Compression (Zaten var)
- ✅ Gzip: ~70% compression
- ✅ Brotli: ~75-80% compression (if installed)
- ✅ Transfer size: -60-80%

### Image Optimization (Zaten var)
- ✅ WebP/AVIF: -30-50% file size
- ✅ Responsive: Only load needed size
- ✅ Lazy loading: Faster initial load

---

## 🚀 Hızlı Deploy (VPS)

```bash
# 1. Git pull
cd /var/www/campscape
git pull origin main

# 2. Frontend build
npm run build

# 3. Backend build
cd server
npm run build
cd ..

# 4. PM2 restart
pm2 restart campscape-backend

# 5. Nginx reload
sudo nginx -t
sudo systemctl reload nginx

# 6. Test
curl -I https://sadece1deneme.com/ | grep -i "strict-transport\|cache-control"
```

---

**Son Güncelleme**: 2025-11-27

