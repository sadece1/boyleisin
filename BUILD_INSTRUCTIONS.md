# Build Instructions for VPS

## Frontend Build (Temiz Build)

```bash
cd /var/www/campscape

# Eski build dosyalarını temizle
rm -rf dist

# Yeni build yap
npm run build

# Build başarılı mı kontrol et
ls -la dist/assets/ | head -20

# Nginx'i reload et (gerekirse)
sudo systemctl reload nginx
```

## Backend Build

```bash
cd /var/www/campscape/server

# Build yap
npm run build

# PM2'yi restart et
pm2 restart campscape-backend

# Logları kontrol et
pm2 logs campscape-backend --lines 50
```

## Sorun Giderme

### 404 Hatası (Dosya Bulunamadı)
- Build dosyalarının güncel olduğundan emin ol
- `dist` klasörünü tamamen sil ve yeniden build yap
- Nginx'in `root /var/www/campscape/dist;` olarak ayarlandığından emin ol

### Build Hatası
- Node.js versiyonunu kontrol et: `node -v` (20.19+ veya 22.12+ olmalı)
- `npm install` çalıştır
- `npm run build` tekrar dene

### Dosya İzinleri
```bash
sudo chown -R www-data:www-data /var/www/campscape/dist
sudo chmod -R 755 /var/www/campscape/dist
```

