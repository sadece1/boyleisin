# VPS'te Veritabanı Düzeltme

## 1. Veritabanı Adını Bul
```bash
mysql -u root -p
# Şifre: MySecurePass123!@#
```

MySQL'de:
```sql
SHOW DATABASES;
```

## 2. Doğru Veritabanını Seç ve Migration Çalıştır

Eğer `campscape_marketplace` görünüyorsa:
```sql
USE campscape_marketplace;

-- brands tablosuna logo ekle (ALTER TABLE IF NOT EXISTS çalışmaz, kontrol et)
SHOW COLUMNS FROM brands LIKE 'logo';
-- Eğer logo yoksa:
ALTER TABLE brands ADD COLUMN logo VARCHAR(500) NULL;

-- project_references tablosunu oluştur
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

-- Kontrol et
SHOW TABLES;
DESCRIBE project_references;
DESCRIBE brands;

EXIT;
```

## 3. Kodları Güncelle ve Build Et
```bash
cd /var/www/campscape
git pull origin main
cd server
npm run build
```

## 4. Backend'i Restart Et
```bash
pm2 restart campscape-backend
```

## 5. Test Et
```bash
curl http://localhost:3000/api/references
curl http://localhost:3000/api/brands
```

