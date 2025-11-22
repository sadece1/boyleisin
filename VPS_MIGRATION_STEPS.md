# VPS Migration Adımları

## 1. MySQL'e Yeni Şifre ile Giriş Yap
```bash
mysql -u root -p
# Şifre: MySecurePass123!@#
```

## 2. Veritabanını Seç ve Migration Çalıştır

MySQL prompt'unda (`mysql>`) şunları çalıştırın:

```sql
-- Önce veritabanlarını görelim
SHOW DATABASES;

-- Veritabanını seç (genellikle campscape veya benzeri)
USE campscape;

-- Migration komutlarını çalıştır
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

-- Kontrol et
DESCRIBE brands;
DESCRIBE project_references;

-- Çıkış
EXIT;
```

## 3. Backend'i Restart Et
```bash
pm2 restart all
```

## 4. Frontend'i Güncelle
```bash
cd /var/www/campscape
git pull origin main
npm install
npm run build
pm2 restart all
```

