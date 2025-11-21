# 🚀 CampScape - Ubuntu Server Deployment Rehberi (Hostinger)

Bu rehber, CampScape uygulamasının Hostinger VPS'te Ubuntu 20.04/22.04 LTS üzerine kurulumunu adım adım anlatır.

## 📋 İçindekiler

1. [VPS Hazırlığı](#1-vps-hazırlığı)
2. [Güvenlik Ayarları](#2-güvenlik-ayarları)
3. [Gerekli Yazılımları Kurma](#3-gerekli-yazılımları-kurma)
4. [MySQL Kurulumu ve Yapılandırma](#4-mysql-kurulumu-ve-yapılandırma)
5. [Projeyi Sunucuya Aktarma](#5-projeyi-sunucuya-aktarma)
6. [Backend Deployment](#6-backend-deployment)
7. [Frontend Deployment](#7-frontend-deployment)
8. [Nginx Yapılandırması](#8-nginx-yapılandırması)
9. [SSL Sertifikası (Let's Encrypt)](#9-ssl-sertifikası-lets-encrypt)
10. [PM2 ile Otomatik Başlatma](#10-pm2-ile-otomatik-başlatma)
11. [Monitoring ve Logs](#11-monitoring-ve-logs)
12. [Sorun Giderme](#12-sorun-giderme)

---

## 1. VPS Hazırlığı

### 1.1 Hostinger VPS Gereksinimleri

**Minimum Sistem Gereksinimleri:**
- Ubuntu 20.04 LTS veya 22.04 LTS
- 2 GB RAM
- 1 CPU Core
- 30 GB Disk Alan
- Root veya sudo yetkisi

**Önerilen:**
- 4 GB RAM
- 2 CPU Core
- 50 GB SSD

### 1.2 VPS'e Bağlanma

```bash
# SSH ile bağlanın (Hostinger'dan aldığınız bilgilerle)
ssh root@your-server-ip

# Veya kullanıcı adınızla
ssh username@your-server-ip
```

### 1.3 Sistem Güncellemesi

```bash
# Paket listelerini güncelle
sudo apt update

# Sistemdeki tüm paketleri güncelle
sudo apt upgrade -y

# Gereksiz paketleri temizle
sudo apt autoremove -y

# Sistemi yeniden başlat (önerilir)
sudo reboot
```

---

## 2. Güvenlik Ayarları

### 2.1 Sudo Yetkili Kullanıcı Oluşturma (Root kullanıyorsanız)

```bash
# Yeni kullanıcı oluştur
adduser campscape

# Sudo yetkisi ver
usermod -aG sudo campscape

# Yeni kullanıcıya geç
su - campscape
```

### 2.2 Firewall Yapılandırması

```bash
# UFW firewall'u aktifleştir
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# Durumu kontrol et
sudo ufw status
```

### 2.3 SSH Güvenliği (Opsiyonel ama Önerilir)

```bash
# SSH yapılandırmasını düzenle
sudo nano /etc/ssh/sshd_config

# Şu ayarları değiştir:
# PermitRootLogin no
# PasswordAuthentication no  (SSH key kullanıyorsanız)
# Port 2222  (Port değiştirmek isterseniz)

# SSH servisini yeniden başlat
sudo systemctl restart sshd
```

---

## 3. Gerekli Yazılımları Kurma

### 3.1 Node.js 18 LTS Kurulumu

```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js kur
sudo apt install -y nodejs

# Versiyonu kontrol et
node --version  # v18.x.x olmalı
npm --version   # 9.x.x veya üzeri
```

### 3.2 PM2 Kurulumu (Process Manager)

```bash
# PM2'yi global olarak kur
sudo npm install -g pm2

# Versiyonu kontrol et
pm2 --version
```

### 3.3 Nginx Kurulumu

```bash
# Nginx kur
sudo apt install -y nginx

# Nginx'i başlat ve otomatik başlatmayı aktifleştir
sudo systemctl start nginx
sudo systemctl enable nginx

# Durumu kontrol et
sudo systemctl status nginx
```

### 3.4 Git Kurulumu

```bash
# Git kur
sudo apt install -y git

# Versiyonu kontrol et
git --version
```

### 3.5 Diğer Gerekli Araçlar

```bash
# Build araçları
sudo apt install -y build-essential

# Certbot (SSL için)
sudo apt install -y certbot python3-certbot-nginx

# Unzip (gerekirse)
sudo apt install -y unzip
```

---

## 4. MySQL Kurulumu ve Yapılandırma

### 4.1 MySQL 8.0 Kurulumu

```bash
# MySQL Server kur
sudo apt install -y mysql-server

# MySQL servisini başlat
sudo systemctl start mysql
sudo systemctl enable mysql

# Durumu kontrol et
sudo systemctl status mysql
```

### 4.2 MySQL Güvenlik Yapılandırması

```bash
# Güvenlik scriptini çalıştır
sudo mysql_secure_installation

# Sorulara cevaplar:
# - Root şifresi belirle: Evet, güçlü bir şifre gir
# - Anonymous users kaldır: Evet
# - Root'un remote login yapmasını engelle: Evet
# - Test database'i kaldır: Evet
# - Privilege tabloları yeniden yükle: Evet
```

### 4.3 Database ve Kullanıcı Oluşturma

```bash
# MySQL'e root olarak gir
sudo mysql -u root -p

# MySQL komutları (MySQL içinde çalıştırın):
```

```sql
-- Database oluştur
CREATE DATABASE campscape_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kullanıcı oluştur
CREATE USER 'campscape_user'@'localhost' IDENTIFIED BY 'GüçlüŞifre123!';

-- Yetkileri ver
GRANT ALL PRIVILEGES ON campscape_marketplace.* TO 'campscape_user'@'localhost';

-- Yetkileri uygula
FLUSH PRIVILEGES;

-- Çıkış
EXIT;
```

### 4.4 MySQL Bağlantısını Test Et

```bash
# Yeni kullanıcıyla giriş yap
mysql -u campscape_user -p

# Başarılı giriş yaptıysanız çıkın
EXIT;
```

---

## 5. Projeyi Sunucuya Aktarma

### 5.1 Proje Dizini Oluşturma

```bash
# Ana proje dizini oluştur
sudo mkdir -p /var/www/campscape
sudo chown -R $USER:$USER /var/www/campscape
cd /var/www/campscape
```

### 5.2 Projeyi Git ile Klonlama (Git Kullanıyorsanız)

```bash
# Git repository'den klonla
git clone https://github.com/your-username/campscape.git .

# Veya private repo için SSH key kullanın
git clone git@github.com:your-username/campscape.git .
```

### 5.3 Projeyi FTP/SFTP ile Yükleme (Alternatif)

```bash
# Yerel bilgisayarınızdan (Windows PowerShell veya WSL):
scp -r "C:\Users\huzey\Desktop\deploy -Kopya\*" username@your-server-ip:/var/www/campscape/

# Veya FileZilla gibi FTP client kullanın
# Host: your-server-ip
# Protocol: SFTP
# Port: 22
```

### 5.4 Proje Dosyalarını Kontrol Et

```bash
cd /var/www/campscape
ls -la

# Şu dosyaları görmelisiniz:
# - server/
# - src/
# - package.json
# - deploy.sh
# - nginx.conf
# vb.
```

---

## 6. Backend Deployment

### 6.1 Backend Dizinine Git

```bash
cd /var/www/campscape/server
```

### 6.2 Environment Dosyası Oluştur

```bash
# env.example.txt'yi kopyala
cp env.example.txt .env

# .env dosyasını düzenle
nano .env
```

### 6.3 .env Dosyası İçeriği (Production Ayarları)

```env
# Production Environment Configuration

# Database Configuration
DB_HOST=localhost
DB_USER=campscape_user
DB_PASSWORD=GüçlüŞifre123!
DB_NAME=campscape_marketplace
DB_PORT=3306

# Server Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration (güçlü bir secret kullanın)
JWT_SECRET=your-very-secure-random-jwt-secret-key-min-32-characters-long-change-this
JWT_EXPIRES_IN=7d

# Frontend URL (domain adresiniz)
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
ENABLE_VIRUS_SCAN=false
REQUIRE_VIRUS_SCAN=false
ENABLE_CSRF=true
HTTPS_ENFORCE=true

# Session Configuration
SESSION_SECRET=your-very-secure-session-secret-change-this-in-production

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
```

### 6.4 JWT Secret Oluşturma

```bash
# Güçlü bir random secret oluştur
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Çıktıyı kopyalayın ve .env dosyasındaki JWT_SECRET'a yapıştırın
```

### 6.5 Dependencies Yükleme

```bash
# Production dependencies kur
npm ci --production

# Eğer development dependencies de gerekiyorsa (build için):
npm install
```

### 6.6 TypeScript Build

```bash
# Projeyi build et
npm run build

# dist/ klasörü oluşmalı
ls -la dist/
```

### 6.7 Database Migration

```bash
# Veritabanı tablolarını oluştur
npm run db:migrate

# Başarılı mesajı görmelisiniz
```

### 6.8 Database Seed (Test Verileri)

```bash
# Test/örnek verileri yükle
npm run db:seed

# Bu şunları oluşturur:
# - Admin kullanıcı: admin@campscape.com / Admin123!
# - Örnek kamp alanları, ekipmanlar, blog yazıları
```

### 6.9 Upload ve Log Dizinlerini Oluştur

```bash
# Dizinleri oluştur
mkdir -p uploads/quarantine logs

# İzinleri ayarla
chmod 755 uploads logs
```

### 6.10 Backend'i PM2 ile Başlat

```bash
# PM2 ile başlat (ecosystem.config.js kullanarak)
pm2 start ecosystem.config.js

# Veya doğrudan:
pm2 start dist/server.js --name campscape-backend

# PM2 listesini görüntüle
pm2 list

# Logları kontrol et
pm2 logs campscape-backend
```

### 6.11 Backend'i Test Et

```bash
# Health check
curl http://localhost:3000/health

# Başarılı response:
# {"status":"ok","timestamp":"..."}

# API test
curl http://localhost:3000/api/campsites
```

---

## 7. Frontend Deployment

### 7.1 Frontend Dizinine Git

```bash
cd /var/www/campscape
```

### 7.2 Environment Dosyası Oluştur

```bash
# Production environment dosyası oluştur
nano .env.production
```

### 7.3 .env.production İçeriği

```env
# API Base URL (production domain)
VITE_API_BASE_URL=https://yourdomain.com/api

# App Configuration
VITE_APP_NAME=CampScape
VITE_APP_DESCRIPTION=Türkiye'nin En Kapsamlı Kamp Ekipmanı Marketi
```

### 7.4 Dependencies Yükleme

```bash
# Dependencies kur
npm install
```

### 7.5 Frontend Build

```bash
# Production build
npm run build

# dist/ klasörü oluşmalı
ls -la dist/

# İçinde index.html, assets/ vb. olmalı
```

### 7.6 Build Dosyalarını Nginx Dizinine Taşı

```bash
# Nginx için dizin oluştur
sudo mkdir -p /var/www/campscape/frontend

# Build dosyalarını kopyala
sudo cp -r dist/* /var/www/campscape/frontend/

# İzinleri ayarla
sudo chown -R www-data:www-data /var/www/campscape/frontend
sudo chmod -R 755 /var/www/campscape/frontend
```

---

## 8. Nginx Yapılandırması

### 8.1 Nginx Config Dosyası Oluştur

```bash
# Site config dosyası oluştur
sudo nano /etc/nginx/sites-available/campscape
```

### 8.2 Nginx Config İçeriği

```nginx
# CampScape Nginx Configuration

# Upstream backend server
upstream campscape_backend {
    server localhost:3000;
    keepalive 64;
}

# HTTP server (SSL yoksa bu kullanılır)
server {
    listen 80;
    listen [::]:80;
    
    server_name yourdomain.com www.yourdomain.com;
    
    # Root directory
    root /var/www/campscape/frontend;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/campscape-access.log;
    error_log /var/log/nginx/campscape-error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # API proxy
    location /api/ {
        proxy_pass http://campscape_backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://campscape_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }
    
    # Static files with cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # Images with cache
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Uploaded files (backend uploads)
    location /uploads/ {
        alias /var/www/campscape/server/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Frontend routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 8.3 Config'i Domain Adınıza Göre Düzenle

```bash
# yourdomain.com yerine gerçek domain adınızı yazın
sudo sed -i 's/yourdomain.com/your-actual-domain.com/g' /etc/nginx/sites-available/campscape
```

### 8.4 Config'i Aktifleştir

```bash
# Symbolic link oluştur
sudo ln -s /etc/nginx/sites-available/campscape /etc/nginx/sites-enabled/

# Default config'i devre dışı bırak (isteğe bağlı)
sudo rm /etc/nginx/sites-enabled/default

# Nginx config'i test et
sudo nginx -t

# Başarılı mesajı görmelisiniz:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Nginx'i yeniden yükle
sudo systemctl reload nginx
```

### 8.5 Nginx'i Test Et

```bash
# Tarayıcıdan veya curl ile:
curl http://your-server-ip

# Frontend sayfası görünmeli
```

---

## 9. SSL Sertifikası (Let's Encrypt)

### 9.1 Domain Ayarları

**Önemli:** SSL sertifikası için domain'iniz sunucuya yönlendirilmiş olmalı.

Hostinger Domain Panel'den:
- A kaydı: `@` -> `your-server-ip`
- A kaydı: `www` -> `your-server-ip`

DNS propagasyonunu kontrol edin (5-30 dakika sürebilir):
```bash
nslookup yourdomain.com
```

### 9.2 Certbot ile SSL Kurulumu

```bash
# Certbot'u çalıştır (otomatik Nginx yapılandırması)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Sorulara cevaplar:
# - Email: admin@yourdomain.com
# - Terms of service: Agree
# - Share email: No
# - Redirect HTTP to HTTPS: Yes (2 seçin)
```

### 9.3 SSL Sertifikasını Test Et

```bash
# HTTPS ile siteye eriş
curl -I https://yourdomain.com

# HTTP Status 200 görmelisiniz
```

### 9.4 SSL Otomatik Yenileme

```bash
# Certbot otomatik yenileme testi
sudo certbot renew --dry-run

# Başarılı mesajı görürseniz, otomatik yenileme ayarlanmıştır
```

Sertifikalar 90 günde bir otomatik yenilenir.

---

## 10. PM2 ile Otomatik Başlatma

### 10.1 PM2'yi Sistem Başlangıcına Ekle

```bash
# PM2 startup script oluştur
pm2 startup systemd

# Çıktıdaki komutu çalıştırın (sudo komutunu kopyalayıp çalıştırın)
# Örnek: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username

# Mevcut PM2 process'lerini kaydet
pm2 save
```

### 10.2 Backend Yeniden Başlatma

```bash
cd /var/www/campscape/server

# Backend'i yeniden başlat
pm2 restart campscape-backend

# Veya ecosystem.config.js ile:
pm2 restart ecosystem.config.js

# Auto-restart memory limiti (opsiyonel)
pm2 start ecosystem.config.js --max-memory-restart 500M
```

### 10.3 PM2 Komutları

```bash
# Process'leri listele
pm2 list

# Logları görüntüle
pm2 logs

# Belirli process'in logları
pm2 logs campscape-backend

# Process bilgisi
pm2 show campscape-backend

# Process'i durdur
pm2 stop campscape-backend

# Process'i başlat
pm2 start campscape-backend

# Process'i restart
pm2 restart campscape-backend

# Process'i sil
pm2 delete campscape-backend

# Tüm process'leri yönet
pm2 stop all
pm2 restart all
pm2 delete all
```

---

## 11. Monitoring ve Logs

### 11.1 Backend Logs

```bash
# PM2 logs
pm2 logs campscape-backend --lines 100

# Backend'in kendi logları
tail -f /var/www/campscape/server/logs/combined.log
tail -f /var/www/campscape/server/logs/error.log
```

### 11.2 Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/campscape-access.log

# Error logs
sudo tail -f /var/log/nginx/campscape-error.log

# Hata analizi
sudo grep "error" /var/log/nginx/campscape-error.log | tail -20
```

### 11.3 MySQL Logs

```bash
# MySQL error log
sudo tail -f /var/log/mysql/error.log

# Slow query log (aktifse)
sudo tail -f /var/log/mysql/slow-query.log
```

### 11.4 System Resource Monitoring

```bash
# Sistem kaynakları
htop

# Disk kullanımı
df -h

# Memory kullanımı
free -h

# PM2 monitoring
pm2 monit

# Node.js process'lerini görüntüle
ps aux | grep node
```

### 11.5 PM2 WebOpsiyonel) Monitoring (

```bash
# PM2 Plus (ücretsiz hesap oluşturun)
pm2 link your-secret-key your-public-key

# Web arayüzden monitoring: https://app.pm2.io
```

---

## 12. Sorun Giderme

### 12.1 Backend Başlamıyor

**Sorun:** Backend PM2'de error veriyor

```bash
# Logları kontrol et
pm2 logs campscape-backend --err

# Manuel başlatmayı dene
cd /var/www/campscape/server
node dist/server.js

# Environment değişkenlerini kontrol et
cat .env

# Database bağlantısını test et
mysql -u campscape_user -p campscape_marketplace
```

**Yaygın Hatalar:**
- `ECONNREFUSED` -> MySQL çalışmıyor: `sudo systemctl start mysql`
- `JWT_SECRET too short` -> .env'de JWT_SECRET'i güçlü yapın (32+ karakter)
- `Module not found` -> `npm install` tekrar çalıştırın

### 12.2 Frontend 404 Hatası

**Sorun:** Sayfa yenilediğinde 404 hatası

```bash
# Nginx config'i kontrol et
sudo nginx -t

# SPA routing'in doğru olduğundan emin olun
# try_files $uri $uri/ /index.html; satırı olmalı

# Nginx'i reload edin
sudo systemctl reload nginx
```

### 12.3 API 502 Bad Gateway

**Sorun:** API çağrıları 502 hatası veriyor

```bash
# Backend'in çalıştığını kontrol et
pm2 list
curl http://localhost:3000/health

# Backend loglarını kontrol et
pm2 logs campscape-backend

# Backend'i restart et
pm2 restart campscape-backend

# Port'un açık olduğundan emin olun
netstat -tlnp | grep :3000
```

### 12.4 Database Connection Error

**Sorun:** Backend database'e bağlanamıyor

```bash
# MySQL'in çalıştığını kontrol et
sudo systemctl status mysql

# MySQL'i başlat
sudo systemctl start mysql

# Bağlantıyı test et
mysql -u campscape_user -p campscape_marketplace

# .env dosyasındaki bilgileri kontrol et
cat /var/www/campscape/server/.env | grep DB_
```

### 12.5 Disk Dolu

**Sorun:** Disk alanı tükendi

```bash
# Disk kullanımını kontrol et
df -h

# En çok yer kaplayan dizinleri bul
sudo du -sh /* | sort -hr | head -10

# Log dosyalarını temizle
sudo truncate -s 0 /var/log/nginx/*.log
pm2 flush  # PM2 logları temizle

# Eski log dosyalarını sil
sudo find /var/log -type f -name "*.log.*" -delete

# Apt cache temizle
sudo apt clean
sudo apt autoremove -y
```

### 12.6 Port Zaten Kullanımda

**Sorun:** Port 3000 zaten kullanılıyor

```bash
# Port'u kullanan process'i bul
sudo lsof -i :3000

# Process'i öldür (PID numarasını kullanarak)
sudo kill -9 PID_NUMBER

# Veya PM2'deki tüm process'leri temizle
pm2 delete all
```

### 12.7 SSL Sertifika Hatası

**Sorun:** SSL sertifikası çalışmıyor

```bash
# Certbot loglarını kontrol et
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Sertifikaları yenile
sudo certbot renew

# Nginx'i restart et
sudo systemctl restart nginx

# Domain DNS'ini kontrol et
nslookup yourdomain.com
```

### 12.8 Permission Denied Hatası

**Sorun:** Dosya izin hataları

```bash
# Proje dosyalarının sahipliğini düzelt
sudo chown -R $USER:$USER /var/www/campscape

# Upload dizini izinleri
sudo chmod 755 /var/www/campscape/server/uploads
sudo chown -R www-data:www-data /var/www/campscape/server/uploads

# Frontend izinleri
sudo chmod -R 755 /var/www/campscape/frontend
sudo chown -R www-data:www-data /var/www/campscape/frontend
```

### 12.9 Memory Leak

**Sorun:** Sunucu yavaşlıyor, memory dolmuş

```bash
# Memory kullanımını kontrol et
free -h
pm2 monit

# Backend'i restart et (memory temizlenir)
pm2 restart campscape-backend

# Auto-restart memory limiti ayarla
pm2 start ecosystem.config.js --max-memory-restart 500M
pm2 save
```

### 12.10 Nginx Test Edilemiyor

**Sorun:** `nginx -t` başarısız

```bash
# Syntax hatalarını göster
sudo nginx -t

# Config dosyasını kontrol et
sudo nano /etc/nginx/sites-available/campscape

# Yaygın hatalar:
# - Noktalı virgül eksik
# - Süslü parantez uyuşmuyor
# - upstream server tanımsız

# Nginx'i restart et (config düzelttikten sonra)
sudo systemctl restart nginx
```

---

## 📊 Deployment Checklist

Deployment tamamlandıktan sonra kontrol edin:

- [ ] Backend çalışıyor: `curl http://localhost:3000/health`
- [ ] Frontend görünüyor: `https://yourdomain.com`
- [ ] API çalışıyor: `https://yourdomain.com/api/campsites`
- [ ] Database bağlantısı çalışıyor
- [ ] SSL sertifikası aktif (tarayıcıda kilit ikonu)
- [ ] PM2 otomatik başlatma ayarlandı: `pm2 startup`
- [ ] Firewall yapılandırıldı: `sudo ufw status`
- [ ] Nginx logları çalışıyor: `tail /var/log/nginx/campscape-access.log`
- [ ] Gzip compression aktif (Network tab'de kontrol edin)
- [ ] Admin paneli erişilebilir: `https://yourdomain.com/admin/login`
- [ ] File upload çalışıyor
- [ ] Email bildirimleri çalışıyor (varsa)

---

## 🔄 Güncelleme (Update) Prosedürü

Proje güncellemesi yapacağınızda:

```bash
# 1. SSH ile sunucuya bağlan
ssh username@your-server-ip

# 2. Proje dizinine git
cd /var/www/campscape

# 3. Git'ten son değişiklikleri çek (Git kullanıyorsanız)
git pull origin main

# 4. Backend güncelleme
cd server
npm install
npm run build
pm2 restart campscape-backend

# 5. Frontend güncelleme
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/campscape/frontend/

# 6. Nginx'i reload et
sudo systemctl reload nginx

# 7. Database migration (gerekirse)
cd server
npm run db:migrate

# 8. Logları kontrol et
pm2 logs campscape-backend
```

---

## 🎯 Production Optimization

### Cache Ayarları

```bash
# Nginx cache dizini oluştur
sudo mkdir -p /var/cache/nginx/campscape
sudo chown -R www-data:www-data /var/cache/nginx/campscape
```

Nginx config'e cache ekleyin:
```nginx
# /etc/nginx/sites-available/campscape dosyasına ekleyin

# Cache zone tanımla (http bloğuna)
proxy_cache_path /var/cache/nginx/campscape levels=1:2 keys_zone=campscape_cache:10m max_size=100m inactive=60m use_temp_path=off;

# location /api/ bloğuna ekleyin:
proxy_cache campscape_cache;
proxy_cache_valid 200 5m;
proxy_cache_bypass $http_cache_control;
add_header X-Cache-Status $upstream_cache_status;
```

### Gzip Compression

Nginx'te zaten var ama test edin:
```bash
curl -I -H "Accept-Encoding: gzip" https://yourdomain.com

# Response'da şu satır olmalı:
# Content-Encoding: gzip
```

---

## 📱 Domain ve DNS Ayarları

Hostinger Domain Panel'den (hPanel):

1. **A Records:**
   - Type: A
   - Name: @
   - Points to: your-server-ip
   - TTL: 14400

   - Type: A
   - Name: www
   - Points to: your-server-ip
   - TTL: 14400

2. **Test edin:**
   ```bash
   ping yourdomain.com
   ping www.yourdomain.com
   ```

---

## 🔐 Güvenlik En İyi Uygulamaları

1. **Düzenli güncellemeler:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Fail2ban kurulumu (Brute force koruması):**
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Güçlü şifreler kullanın:**
   - Database şifresi: 16+ karakter
   - JWT secret: 64+ karakter (hex)

4. **Backups:**
   ```bash
   # MySQL backup
   mysqldump -u campscape_user -p campscape_marketplace > backup-$(date +%Y%m%d).sql

   # Otomatik backup scripti oluşturabilirsiniz (cron job)
   ```

5. **Log rotation:**
   ```bash
   # PM2 log rotation
   pm2 install pm2-logrotate
   ```

---

## 🆘 Yardım ve Destek

- **CampScape GitHub:** [Issues](https://github.com/your-repo/issues)
- **Hostinger Destek:** https://www.hostinger.com/tutorials/vps
- **Ubuntu Dokümantasyon:** https://help.ubuntu.com/
- **Nginx Dokümantasyon:** https://nginx.org/en/docs/

---

## ✅ Başarılı Deployment!

Tebrikler! CampScape uygulamanız artık production'da çalışıyor. 🎉

**Siteye erişin:** https://yourdomain.com
**Admin paneli:** https://yourdomain.com/admin/login

**Varsayılan admin bilgileri (değiştirin!):**
- Email: admin@campscape.com
- Şifre: Admin123!

---

## 📝 Notlar

- Bu rehber Ubuntu 20.04 ve 22.04 LTS için test edilmiştir
- Production ortamında mutlaka güvenlik önlemlerini alın
- Düzenli backup almayı unutmayın
- SSL sertifikası 90 günde bir otomatik yenilenir
- Monitoring ve logging'i takip edin

---

**Hazırlayan:** CampScape Dev Team  
**Versiyon:** 1.0  
**Son Güncelleme:** 2025



