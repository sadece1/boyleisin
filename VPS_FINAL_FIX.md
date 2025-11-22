# VPS'te Son Düzeltmeler

## 1. Kodları Güncelle (TypeScript hatası düzeltildi)
```bash
cd /var/www/campscape
git pull origin main
```

## 2. Backend'i Build Et
```bash
cd /var/www/campscape/server
npm run build
```

## 3. Migration'ı Çalıştır (VERİTABANI TABLOSU EKSİK!)
```bash
mysql -u root -p
# Şifre: MySecurePass123!@#
```

MySQL'de:
```sql
USE campscape;
-- Eğer campscape_marketplace kullanıyorsanız:
-- USE campscape_marketplace;

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
SHOW TABLES;
DESCRIBE project_references;
DESCRIBE brands;

EXIT;
```

## 4. Backend'i Restart Et
```bash
cd /var/www/campscape/server
pm2 restart campscape-backend
```

## 5. Test Et
```bash
curl http://localhost:3000/api/references
curl http://localhost:3000/api/brands
```

## 6. Logları Kontrol Et
```bash
pm2 logs campscape-backend --lines 20
```

