# VPS Build Komutları - mutlaka-bunu-kullan.webp için

## 🔧 Sorun
`mutlaka-bunu-kullan.webp` dosyası 404 hatası veriyor çünkü VPS'de build yapılmamış.

## ✅ Çözüm
VPS'de frontend build yapılması gerekiyor. Vite build sırasında `public` klasöründeki dosyaları `dist` klasörüne kopyalar.

## 📋 VPS Komutları

```bash
# 1. Proje dizinine git
cd /var/www/campscape

# 2. Son değişiklikleri çek
git pull origin main

# 3. Frontend build yap (public klasöründeki dosyalar dist'e kopyalanır)
npm run build

# 4. Build sonrası dosyanın varlığını kontrol et
ls -la dist/mutlaka-bunu-kullan.webp

# 5. Nginx'i reload et (gerekirse)
sudo systemctl reload nginx
```

## 🔍 Kontrol

```bash
# Dosyanın dist'te olduğunu kontrol et
ls -la /var/www/campscape/dist/mutlaka-bunu-kullan.webp

# Dosyanın web'de erişilebilir olduğunu kontrol et
curl -I https://sadece1deneme.com/mutlaka-bunu-kullan.webp
```

## 📝 Not
Vite build sırasında `public` klasöründeki tüm dosyalar `dist` root'una kopyalanır. Hash eklenmez, dosya adı aynı kalır.

