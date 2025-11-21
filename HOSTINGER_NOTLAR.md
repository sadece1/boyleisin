# 📝 Hostinger VPS - Önemli Notlar

## 🎯 Hostinger'a Özel Bilgiler

### VPS Planı Seçimi

**Minimum Gereksinim:**
- KVM 1: 1 vCPU, 4 GB RAM, 50 GB SSD - **₺149.99/ay**
- ✅ CampScape için yeterli

**Önerilen:**
- KVM 2: 2 vCPU, 8 GB RAM, 100 GB SSD - **₺299.99/ay**
- ✅ Daha iyi performans
- ✅ Daha fazla trafik kapasitesi

### İşletim Sistemi

Hostinger VPS Panel'den:
1. "Operating System" sekmesine gidin
2. **Ubuntu 22.04 64bit** seçin
3. "Change OS" butonuna tıklayın

**ÖNEMLİ:** OS değişimi tüm verileri siler!

---

## 🔐 SSH Bağlantı Bilgileri

Hostinger hPanel'den (VPS > SSH Access):

```bash
# SSH bilgileri
Host: your-vps-ip
Port: 22
Username: root
Password: (hPanel'den bakın)
```

### İlk SSH Bağlantısı

```bash
# Windows (PowerShell)
ssh root@your-vps-ip

# İlk girişte şifre değiştirin
passwd
```

---

## 🌐 Domain Ayarları

### A Kaydı Ekleme (Hostinger hPanel)

1. **Domains** > domain seçin > **DNS / Name Servers**
2. **Manage** butonuna tıklayın

**Eklenecek Kayıtlar:**

| Type | Name | Points to | TTL |
|------|------|-----------|-----|
| A | @ | your-vps-ip | 14400 |
| A | www | your-vps-ip | 14400 |

3. **Add Record** butonuna tıklayın
4. Değerleri girin ve **Save** edin

### DNS Propagasyon

DNS değişiklikleri 5-30 dakika sürebilir.

**Kontrol:**
```bash
# Windows (PowerShell)
nslookup yourdomain.com

# Linux/Mac
dig yourdomain.com
ping yourdomain.com
```

---

## 📦 Dosya Yükleme Yöntemleri

### Yöntem 1: Git (Önerilen)

```bash
# VPS'te
cd /var/www
git clone https://github.com/your-username/campscape.git
cd campscape
```

### Yöntem 2: SFTP (FileZilla)

**FileZilla Ayarları:**
- **Protocol:** SFTP
- **Host:** your-vps-ip
- **Port:** 22
- **Username:** root
- **Password:** (hPanel'den)

**Yükleme:**
1. Local site: `C:\Users\huzey\Desktop\deploy -Kopya`
2. Remote site: `/var/www/campscape`
3. Tüm dosyaları sürükle-bırak

### Yöntem 3: SCP (PowerShell)

```powershell
# Windows PowerShell'den
scp -r "C:\Users\huzey\Desktop\deploy -Kopya\*" root@your-vps-ip:/var/www/campscape/
```

**Not:** Büyük dosyalar için zaman alabilir.

### Yöntem 4: Hostinger File Manager

1. hPanel > **VPS** > **File Manager**
2. `/var/www` dizinine gidin
3. **Upload** butonuna tıklayın
4. Dosyaları seçin ve yükleyin

**Not:** Büyük projeler için pratik değil.

---

## 🔥 Firewall (UFW) Ayarları

Hostinger VPS'te firewall manuel yapılandırılmalı:

```bash
# Firewall durumunu kontrol et
sudo ufw status

# SSH, HTTP, HTTPS portlarını aç
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Firewall'u etkinleştir
sudo ufw enable

# Kontrolü yap
sudo ufw status verbose
```

**ÖNEMLİ:** SSH portunu açmadan firewall etkinleştirmeyin!

---

## 🔒 SSL Sertifikası (Let's Encrypt)

### Önkoşullar

1. ✅ Domain DNS'i sunucuya yönlendirilmiş
2. ✅ Nginx çalışıyor
3. ✅ Port 80 ve 443 açık

### Kurulum

```bash
# Certbot kur
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al (otomatik Nginx config)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Email girin (bildirimler için)
# Terms kabul edin
# Redirect HTTP to HTTPS: Yes
```

### Otomatik Yenileme

```bash
# Test et
sudo certbot renew --dry-run

# Cron job kontrol (otomatik eklenir)
sudo systemctl status certbot.timer
```

Sertifikalar **90 günde** bir otomatik yenilenir.

---

## 💾 Backup Stratejisi

### Database Backup

```bash
# Manuel backup
mysqldump -u campscape_user -p campscape_marketplace > backup-$(date +%Y%m%d).sql

# Backup'ı indir
scp root@your-vps-ip:/var/www/campscape/server/backup-*.sql ./
```

### Otomatik Backup Script

`/var/www/campscape/backup.sh` dosyası oluşturun:

```bash
#!/bin/bash
BACKUP_DIR="/var/www/campscape/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u campscape_user -p'YourPassword' campscape_marketplace > "$BACKUP_DIR/db-$DATE.sql"

# Uploads backup
tar -czf "$BACKUP_DIR/uploads-$DATE.tar.gz" /var/www/campscape/server/uploads/

# 7 günden eski backupları sil
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Cron Job (Günlük Otomatik Backup)

```bash
# Crontab düzenle
crontab -e

# Her gece 2:00'de backup al
0 2 * * * /var/www/campscape/backup.sh >> /var/log/campscape-backup.log 2>&1
```

---

## 📊 Monitoring ve Performans

### PM2 Monitoring

```bash
# Gerçek zamanlı monitoring
pm2 monit

# Status
pm2 status

# Loglar
pm2 logs campscape-backend --lines 100

# Memory kullanımı
pm2 describe campscape-backend
```

### System Resources

```bash
# CPU ve Memory
htop

# Disk kullanımı
df -h

# Nginx connections
sudo netstat -tulpn | grep nginx

# MySQL connections
sudo mysqladmin -u root -p processlist
```

### Web Performance Testing

```bash
# Backend response time
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:3000/health

# Frontend load time
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://yourdomain.com
```

---

## 🔧 Hostinger VPS Panel

### Useful Features

1. **VPS Information**
   - IP adresi
   - CPU/RAM kullanımı
   - Bandwidth

2. **Operating System**
   - OS değiştirme
   - VPS rebuild

3. **Backups** (Ücretli)
   - Snapshot alma
   - Restore

4. **File Manager**
   - Web tabanlı dosya yönetimi

5. **SSH Access**
   - Bağlantı bilgileri
   - Root şifre değiştirme

### hPanel Erişim

```
https://hpanel.hostinger.com
```

---

## ⚠️ Yaygın Sorunlar ve Çözümleri

### 1. SSH Bağlantı Hatası

**Sorun:** `Connection refused`

**Çözüm:**
```bash
# Hostinger hPanel'den "Rebuild VPS" veya
# Support'a ticket açın
```

### 2. Disk Alanı Dolu

**Sorun:** `No space left on device`

**Çözüm:**
```bash
# Disk kullanımını kontrol et
df -h

# Büyük dosyaları bul
sudo du -h --max-depth=1 /var | sort -hr | head -10

# Log dosyalarını temizle
sudo truncate -s 0 /var/log/nginx/*.log
pm2 flush

# Apt cache temizle
sudo apt clean
sudo apt autoremove -y
```

### 3. MySQL "Too many connections"

**Sorun:** Backend MySQL'e bağlanamıyor

**Çözüm:**
```bash
# MySQL config düzenle
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Ekle:
# max_connections = 200

# MySQL'i restart et
sudo systemctl restart mysql
```

### 4. Port Engelli

**Sorun:** Port 80/443 erişilemiyor

**Çözüm:**
```bash
# Firewall kontrol
sudo ufw status

# Port açık mı kontrol et
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Nginx çalışıyor mu
sudo systemctl status nginx
```

---

## 📈 Performans Optimizasyonu

### 1. MySQL Tuning

```bash
# MySQL config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Ekle/Düzenle:
[mysqld]
max_connections = 100
innodb_buffer_pool_size = 1G
query_cache_size = 64M
tmp_table_size = 64M
max_heap_table_size = 64M
```

### 2. Nginx Caching

```nginx
# /etc/nginx/sites-available/campscape

# Cache zone ekle (http bloğu içine)
proxy_cache_path /var/cache/nginx/campscape levels=1:2 
    keys_zone=campscape_cache:10m 
    max_size=100m 
    inactive=60m 
    use_temp_path=off;
```

### 3. Node.js Cluster Mode

```bash
# PM2 ile cluster mode
pm2 start dist/server.js --name campscape-backend -i 2
pm2 save
```

### 4. Gzip Compression

Nginx config'te zaten var, test edin:

```bash
curl -I -H "Accept-Encoding: gzip" https://yourdomain.com
```

---

## 🔐 Güvenlik Önerileri

### 1. Root Kullanıcısı Yerine Sudo Kullanıcı

```bash
# Yeni kullanıcı oluştur
adduser campscape
usermod -aG sudo campscape

# SSH config düzenle
sudo nano /etc/ssh/sshd_config

# PermitRootLogin no
# PasswordAuthentication no (SSH key kullanıyorsanız)

sudo systemctl restart sshd
```

### 2. Fail2Ban (Brute Force Koruması)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Otomatik Güvenlik Güncellemeleri

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Admin Şifresini Değiştirin

İlk giriş yaptıktan sonra:
1. Admin paneli > Profile
2. Yeni güçlü şifre belirleyin
3. Email değiştirin

---

## 📞 Hostinger Destek

### Support Ticket

1. hPanel > **Help** > **Create Ticket**
2. Problem kategorisi seçin
3. Detaylı açıklama yazın

### Live Chat

- hPanel sağ alt köşe
- 7/24 destek

### Knowledge Base

```
https://www.hostinger.com/tutorials/vps
```

### Community Forum

```
https://www.hostinger.com/community
```

---

## 📚 Faydalı Linkler

- **Hostinger VPS Tutorial:** https://www.hostinger.com/tutorials/vps
- **Ubuntu Server Guide:** https://ubuntu.com/server/docs
- **PM2 Documentation:** https://pm2.keymetrics.io/docs/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/docs/

---

## ✅ Post-Deployment Checklist

Deployment sonrası yapılacaklar:

- [ ] Admin şifresini değiştir
- [ ] Admin emailini değiştir
- [ ] SSL sertifikası kuruldu
- [ ] Firewall yapılandırıldı
- [ ] Otomatik backup ayarlandı
- [ ] DNS propagasyonu tamamlandı
- [ ] Google Analytics eklendi (opsiyonel)
- [ ] SEO ayarları yapıldı
- [ ] Site haritası oluşturuldu
- [ ] Performance test yapıldı
- [ ] Security scan yapıldı

---

**Son Güncelleme:** 2025  
**Platform:** Hostinger VPS  
**OS:** Ubuntu 22.04 LTS


