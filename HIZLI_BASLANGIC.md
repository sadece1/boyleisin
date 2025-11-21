# ⚡ CampScape - Hızlı Başlangıç (Ubuntu)

Hostinger VPS'e 10 dakikada deployment!

## 🎯 Önkoşullar

- ✅ Hostinger VPS (Ubuntu 20.04 veya 22.04 LTS)
- ✅ SSH erişimi
- ✅ Domain adı (DNS sunucuya yönlendirilmiş)

## 🚀 3 Adımda Kurulum

### 1️⃣ VPS'e Bağlan

```bash
ssh root@your-server-ip
```

### 2️⃣ Dosyaları Yükle

**Seçenek A: Git ile**
```bash
cd /var/www
git clone https://github.com/your-username/campscape.git
cd campscape
```

**Seçenek B: FTP/SFTP ile**
- FileZilla ile dosyaları `/var/www/campscape` dizinine yükleyin

**Seçenek C: SCP ile (Windows/Local)**
```powershell
# PowerShell'den
scp -r "C:\Users\huzey\Desktop\deploy -Kopya\*" root@your-server-ip:/var/www/campscape/
```

### 3️⃣ Otomatik Kurulum

```bash
cd /var/www/campscape
chmod +x ubuntu-quick-deploy.sh
./ubuntu-quick-deploy.sh
```

Script size soracak:
- Domain adınız
- Database şifresi
- Admin email

Sonra otomatik olarak:
- ✅ Node.js, MySQL, Nginx kurar
- ✅ Database oluşturur
- ✅ Backend ve Frontend build eder
- ✅ PM2 ile başlatır
- ✅ SSL sertifikası kurar (opsiyonel)

**Süre:** ~10-15 dakika

---

## 🎉 Tamamlandı!

Website: `https://yourdomain.com`

### Varsayılan Admin Girişi

```
Email: admin@campscape.com
Şifre: Admin123!
```

**ÖNEMLİ:** İlk girişte şifreyi değiştirin!

---

## 📊 Yönetim Komutları

```bash
# Backend restart
pm2 restart campscape-backend

# Logları görüntüle
pm2 logs campscape-backend

# Status kontrolü
pm2 status

# Backend'i durdur
pm2 stop campscape-backend

# Backend'i başlat
pm2 start campscape-backend
```

---

## 🔧 Sorun mu Var?

### Backend çalışmıyor

```bash
# Logları kontrol et
pm2 logs campscape-backend

# Manuel başlat
cd /var/www/campscape/server
node dist/server.js
```

### Frontend görünmüyor

```bash
# Nginx'i restart et
sudo systemctl restart nginx

# Logları kontrol et
sudo tail -f /var/log/nginx/campscape-error.log
```

### Database bağlanamıyor

```bash
# MySQL'i başlat
sudo systemctl start mysql

# Database'i kontrol et
mysql -u campscape_user -p campscape_marketplace
```

---

## 📚 Detaylı Dokümantasyon

Daha fazla bilgi için:
- **Tam Rehber:** `UBUNTU_DEPLOY_GUIDE.md`
- **Backend Kurulum:** `server/BACKEND_SETUP.md`
- **API Dokümantasyonu:** `server/API_DOCUMENTATION.md`

---

## 🆘 Manuel Kurulum (Script Çalışmazsa)

Eğer otomatik script sorun çıkarırsa:

### 1. Sistem Güncelleme

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Node.js Kurulumu

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. MySQL Kurulumu

```bash
sudo apt install -y mysql-server
sudo mysql
```

MySQL'de:
```sql
CREATE DATABASE campscape_marketplace;
CREATE USER 'campscape_user'@'localhost' IDENTIFIED BY 'YourPassword123!';
GRANT ALL PRIVILEGES ON campscape_marketplace.* TO 'campscape_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Nginx Kurulumu

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. PM2 Kurulumu

```bash
sudo npm install -g pm2
```

### 6. Backend Setup

```bash
cd /var/www/campscape/server
npm install
cp env.example.txt .env
nano .env  # Düzenleyin
npm run build
npm run db:migrate
npm run db:seed
pm2 start dist/server.js --name campscape-backend
```

### 7. Frontend Setup

```bash
cd /var/www/campscape
npm install
npm run build
sudo mkdir -p /var/www/campscape/frontend
sudo cp -r dist/* /var/www/campscape/frontend/
```

### 8. Nginx Config

`UBUNTU_DEPLOY_GUIDE.md` dosyasındaki Nginx config'i kopyalayın:

```bash
sudo nano /etc/nginx/sites-available/campscape
sudo ln -s /etc/nginx/sites-available/campscape /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. SSL (Opsiyonel)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ✅ Kontrol Listesi

Deployment sonrası kontrol edin:

- [ ] Backend çalışıyor: `curl http://localhost:3000/health`
- [ ] Frontend görünüyor: `http://yourdomain.com`
- [ ] Admin paneli erişilebilir: `/admin/login`
- [ ] API çalışıyor: `/api/campsites`
- [ ] SSL aktif: `https://yourdomain.com`
- [ ] PM2 otomatik başlatma: `pm2 startup`

---

## 🔄 Güncelleme

```bash
cd /var/www/campscape

# Git'ten çek (Git kullanıyorsanız)
git pull origin main

# Backend güncelle
cd server
npm install
npm run build
pm2 restart campscape-backend

# Frontend güncelle
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/campscape/frontend/
sudo systemctl reload nginx
```

---

## 📞 Destek

Sorun mu yaşıyorsunuz?

1. **Logları kontrol edin:**
   ```bash
   pm2 logs campscape-backend
   sudo tail -f /var/log/nginx/campscape-error.log
   ```

2. **Detaylı rehbere bakın:** `UBUNTU_DEPLOY_GUIDE.md`

3. **Health check:**
   ```bash
   curl http://localhost:3000/health
   ```

---

**🎉 Başarılar!**


