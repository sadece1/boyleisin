# VPS Migration Komutları

## Referanslar ve Marka Logo Migration

VPS'te migration dosyasını çalıştırmak için:

### 1. Önce Git Pull Yap
```bash
cd /var/www/campscape
git pull origin main
```

### 2. Migration Dosyasını Çalıştır

**Seçenek 1: MySQL komut satırı ile (önerilen)**
```bash
cd /var/www/campscape
mysql -u root -p < server/src/migrations/add_references_and_brand_logo.sql
```

**Seçenek 2: Veritabanı adını belirt**
```bash
cd /var/www/campscape
mysql -u root -p campscape < server/src/migrations/add_references_and_brand_logo.sql
```

**Seçenek 3: SQL içeriğini doğrudan çalıştır**
```bash
cd /var/www/campscape
mysql -u root -p << EOF
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
EOF
```

### 3. Backend'i Restart Et
```bash
pm2 restart campscape-backend
# veya
pm2 restart all
```

### 4. Kontrol Et
```bash
mysql -u root -p -e "USE campscape; DESCRIBE brands; DESCRIBE project_references;"
```

## Hızlı Komut (Tüm Adımlar)
```bash
cd /var/www/campscape && \
git pull origin main && \
mysql -u root -p campscape < server/src/migrations/add_references_and_brand_logo.sql && \
pm2 restart all
```


