# VPS'te References API'yi Düzeltme

## 1. Kodları Güncelle
```bash
cd /var/www/campscape
git pull origin main
```

## 2. Backend Dependencies Kontrol Et
```bash
cd server
npm install
```

## 3. Migration'ı Çalıştır (Eğer yapmadıysanız)
```bash
mysql -u root -p
# Şifre: MySecurePass123!@#
```

MySQL'de:
```sql
USE campscape;

ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo VARCHAR(500) NULL;

CREATE TABLE IF NOT EXISTS project_references (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    image VARCHAR(500) NOT NULL,
    location VARCHAR(200),
    year VARCHAR(10),
    description TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (order_index),
    INDEX idx_year (year)
);

EXIT;
```

## 4. Backend'i Restart Et
```bash
cd /var/www/campscape
pm2 restart all
# veya
pm2 restart server
```

## 5. Backend Loglarını Kontrol Et
```bash
pm2 logs server --lines 50
```

## 6. API'yi Test Et
```bash
curl http://localhost:5000/api/references
# veya
curl http://your-domain.com/api/references
```

## 7. Eğer Hala 404 Alıyorsanız

### Backend'in Çalışıp Çalışmadığını Kontrol Et:
```bash
pm2 list
pm2 logs server
```

### Backend'i Manuel Başlat:
```bash
cd /var/www/campscape/server
npm run dev
# veya production için
npm start
```

### Port Kontrolü:
```bash
netstat -tulpn | grep :5000
# veya
lsof -i :5000
```

