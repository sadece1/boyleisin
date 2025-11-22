# 🚀 VPS Deployment Komutları

## Hostinger VPS için Hızlı Deployment

### ⚡ Tek Komut ile Tüm İşlemler

```bash
cd /var/www/campscape && git remote set-url origin https://github.com/sadece1/amk.git && git pull origin main && npm install && npm run build && pm2 restart all
```

### 📝 Adım Adım Deployment

#### 1. SSH ile VPS'e Bağlan
```bash
ssh root@your-vps-ip
```

#### 2. Proje Dizinine Git
```bash
cd /var/www/campscape
```

#### 3. Git Remote URL Güncelle
```bash
git remote set-url origin https://github.com/sadece1/amk.git
```

#### 4. Son Değişiklikleri Çek
```bash
git pull origin main
```

#### 5. Dependencies Güncelle
```bash
npm install
```

#### 6. Frontend Build Et
```bash
npm run build
```

#### 7. PM2 Restart (Backend)
```bash
pm2 restart all
# veya
pm2 restart campscape-backend
```

#### 8. Nginx Restart (Gerekirse)
```bash
sudo systemctl restart nginx
```

---

## 🎯 Script ile Deployment

### Script'i Çalıştırılabilir Yap
```bash
chmod +x vps-deploy.sh
```

### Script'i Çalıştır
```bash
bash vps-deploy.sh
```

---

## ⚡ Hızlı Update (Sadece Kod Güncellemesi)

Eğer sadece kod güncellemesi yapıyorsanız (dependencies değişmediyse):

```bash
cd /var/www/campscape
git pull origin main
npm run build
pm2 restart all
```

---

## 🔧 Sorun Giderme

### Build Hatası
```bash
# Node modules'ı temizle ve yeniden yükle
cd /var/www/campscape
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Git Pull Hatası (Conflict)
```bash
# Değişiklikleri stash et
git stash
git pull origin main
git stash pop
```

### Permission Hatası
```bash
# Dosya izinlerini düzelt
sudo chown -R $USER:$USER /var/www/campscape
chmod -R 755 /var/www/campscape
```

### PM2 Hatası
```bash
# PM2 durumunu kontrol et
pm2 status
pm2 logs

# PM2'yi yeniden başlat
pm2 restart all
pm2 save
```

### Nginx Hatası
```bash
# Nginx durumunu kontrol et
sudo systemctl status nginx
sudo nginx -t

# Nginx loglarını kontrol et
sudo tail -f /var/log/nginx/error.log
```

### Port Kullanımı Kontrolü
```bash
# Port 3000 (backend) kontrolü
sudo lsof -i :3000
# veya
sudo netstat -tulpn | grep :3000

# Port 80/443 (nginx) kontrolü
sudo lsof -i :80
sudo lsof -i :443
```

---

## 📊 Deployment Sonrası Kontroller

### 1. Frontend Kontrolü
```bash
# Build dosyalarını kontrol et
ls -la /var/www/campscape/dist/

# Build başarılı mı?
ls -la /var/www/campscape/dist/index.html
```

### 2. Backend Kontrolü
```bash
# PM2 durumu
pm2 status

# Backend logları
pm2 logs campscape-backend --lines 50

# API test
curl http://localhost:3000/api/health
```

### 3. Nginx Kontrolü
```bash
# Nginx durumu
sudo systemctl status nginx

# Nginx config test
sudo nginx -t

# Nginx logları
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Otomatik Deployment (Cron Job)

Her gün otomatik güncelleme için:

```bash
# Crontab'ı düzenle
crontab -e

# Her gün saat 03:00'te güncelle
0 3 * * * cd /var/www/campscape && git pull origin main && npm install && npm run build && pm2 restart all >> /var/log/campscape-deploy.log 2>&1
```

---

## 📝 Notlar

- **GitHub Repository**: https://github.com/sadece1/amk.git
- **Proje Dizini**: /var/www/campscape
- **Frontend Build**: `npm run build` → `dist/` klasörü
- **Backend**: PM2 ile çalışıyor (port 3000)
- **Nginx**: Reverse proxy (port 80/443 → 3000)

---

## 🆘 Acil Durum Komutları

### Tüm Servisleri Yeniden Başlat
```bash
pm2 restart all
sudo systemctl restart nginx
```

### Son Çalışan Versiyona Geri Dön
```bash
cd /var/www/campscape
git log --oneline -10  # Son commit'leri gör
git checkout <commit-hash>  # İstediğiniz commit'e dön
npm run build
pm2 restart all
```

### Tüm Logları Temizle
```bash
pm2 flush
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log
```

