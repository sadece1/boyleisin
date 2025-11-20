#!/bin/bash

#############################################
# CampScape - Ubuntu Quick Deploy Script
# Hostinger VPS için otomatik kurulum
#############################################

set -e  # Hata durumunda durdur

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
cat << "EOF"
   ____                   ____                      
  / ___|__ _ _ __ ___  __/ ___|  ___ __ _ _ __   ___ 
 | |   / _` | '_ ` _ \/ _\___ \ / __/ _` | '_ \ / _ \
 | |__| (_| | | | | | |  ___) | (_| (_| | |_) |  __/
  \____\__,_|_| |_| |_| |____/ \___\__,_| .__/ \___|
                                        |_|          
     Ubuntu Server Deployment Script v1.0
EOF
echo -e "${NC}"

echo -e "${GREEN}🚀 CampScape Ubuntu Quick Deployment Başlatılıyor...${NC}"
echo ""

# Root kontrolü
if [[ $EUID -ne 0 ]]; then
   echo -e "${YELLOW}⚠️  Bu script bazı işlemler için sudo yetkisi gerektirir${NC}"
fi

# Bilgi toplama
echo -e "${BLUE}📋 Kurulum Bilgileri${NC}"
echo ""

read -p "Domain adınız (örn: example.com): " DOMAIN_NAME
read -p "MySQL root şifresi (yeni kurulum için boş bırakabilirsiniz): " MYSQL_ROOT_PASS
read -p "Database kullanıcı şifresi: " DB_PASSWORD
read -p "Admin email adresi: " ADMIN_EMAIL

echo ""
echo -e "${YELLOW}Kurulum bilgileri:${NC}"
echo "Domain: $DOMAIN_NAME"
echo "Admin Email: $ADMIN_EMAIL"
echo ""
read -p "Devam etmek istiyor musunuz? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}İptal edildi${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}1. SİSTEM GÜNCELLEMESİ${NC}"
echo -e "${GREEN}============================================${NC}"

sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y

echo -e "${GREEN}✅ Sistem güncellendi${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}2. GEREKLİ YAZILIMLARI KURMA${NC}"
echo -e "${GREEN}============================================${NC}"

# Node.js 18 kontrolü
if ! command -v node &> /dev/null; then
    echo "📦 Node.js 18 LTS kuruluyor..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js $(node --version) kuruldu${NC}"
else
    echo -e "${GREEN}✅ Node.js zaten kurulu: $(node --version)${NC}"
fi

# Build tools
echo "📦 Build tools kuruluyor..."
sudo apt install -y build-essential

# Git kontrolü
if ! command -v git &> /dev/null; then
    echo "📦 Git kuruluyor..."
    sudo apt install -y git
    echo -e "${GREEN}✅ Git kuruldu${NC}"
else
    echo -e "${GREEN}✅ Git zaten kurulu${NC}"
fi

# PM2 kontrolü
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 kuruluyor..."
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 kuruldu${NC}"
else
    echo -e "${GREEN}✅ PM2 zaten kurulu${NC}"
fi

# Nginx kontrolü
if ! command -v nginx &> /dev/null; then
    echo "📦 Nginx kuruluyor..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo -e "${GREEN}✅ Nginx kuruldu${NC}"
else
    echo -e "${GREEN}✅ Nginx zaten kurulu${NC}"
fi

# MySQL kontrolü
if ! command -v mysql &> /dev/null; then
    echo "📦 MySQL 8.0 kuruluyor..."
    sudo apt install -y mysql-server
    sudo systemctl enable mysql
    sudo systemctl start mysql
    echo -e "${GREEN}✅ MySQL kuruldu${NC}"
else
    echo -e "${GREEN}✅ MySQL zaten kurulu${NC}"
fi

# Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Certbot (SSL) kuruluyor..."
    sudo apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot kuruldu${NC}"
else
    echo -e "${GREEN}✅ Certbot zaten kurulu${NC}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}3. FIREWALL YAPILANDIRMASI${NC}"
echo -e "${GREEN}============================================${NC}"

sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

echo -e "${GREEN}✅ Firewall yapılandırıldı${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}4. MYSQL DATABASE OLUŞTURMA${NC}"
echo -e "${GREEN}============================================${NC}"

# MySQL secure installation (otomatik)
if [ ! -z "$MYSQL_ROOT_PASS" ]; then
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASS}';"
fi

# Database ve kullanıcı oluştur
sudo mysql -e "CREATE DATABASE IF NOT EXISTS campscape_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'campscape_user'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON campscape_marketplace.* TO 'campscape_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo -e "${GREEN}✅ Database oluşturuldu${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}5. PROJE DİZİNİ OLUŞTURMA${NC}"
echo -e "${GREEN}============================================${NC}"

PROJECT_DIR="/var/www/campscape"

# Dizin yoksa oluştur
if [ ! -d "$PROJECT_DIR" ]; then
    sudo mkdir -p $PROJECT_DIR
    sudo chown -R $USER:$USER $PROJECT_DIR
    echo -e "${GREEN}✅ Proje dizini oluşturuldu: $PROJECT_DIR${NC}"
else
    echo -e "${YELLOW}⚠️  Proje dizini zaten var: $PROJECT_DIR${NC}"
fi

# Mevcut dizindeki dosyaları kopyala
echo "📦 Proje dosyaları kopyalanıyor..."
CURRENT_DIR=$(pwd)

# Eğer script'i proje dizininde çalıştırıyorsak
if [ "$CURRENT_DIR" != "$PROJECT_DIR" ]; then
    sudo cp -r "$CURRENT_DIR"/* "$PROJECT_DIR/" 2>/dev/null || true
    sudo chown -R $USER:$USER "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"
echo -e "${GREEN}✅ Proje dizinine geçildi${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}6. BACKEND DEPLOYMENT${NC}"
echo -e "${GREEN}============================================${NC}"

cd "$PROJECT_DIR/server"

# Dependencies yükle
echo "📦 Backend dependencies yükleniyor..."
npm install

# JWT Secret oluştur
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# .env dosyası oluştur
echo "📝 Backend .env dosyası oluşturuluyor..."
cat > .env << EOF
# Production Environment Configuration
# Generated by ubuntu-quick-deploy.sh

# Database Configuration
DB_HOST=localhost
DB_USER=campscape_user
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=campscape_marketplace
DB_PORT=3306

# Server Configuration
NODE_ENV=production
PORT=3000

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://${DOMAIN_NAME}
ALLOWED_ORIGINS=https://${DOMAIN_NAME},https://www.${DOMAIN_NAME}

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
SESSION_SECRET=${SESSION_SECRET}

# Admin Configuration
ADMIN_EMAIL=${ADMIN_EMAIL}
EOF

echo -e "${GREEN}✅ Backend .env dosyası oluşturuldu${NC}"

# Build
echo "🔨 Backend build ediliyor..."
npm run build

# Upload ve log dizinleri
mkdir -p uploads/quarantine logs
chmod 755 uploads logs

# Database migration
echo "🗄️  Database migration çalıştırılıyor..."
npm run db:migrate || echo -e "${YELLOW}⚠️  Migration hatası (normal olabilir)${NC}"

# Database seed
echo "🌱 Seed data yükleniyor..."
npm run db:seed || echo -e "${YELLOW}⚠️  Seed hatası (normal olabilir)${NC}"

echo -e "${GREEN}✅ Backend hazır${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}7. FRONTEND DEPLOYMENT${NC}"
echo -e "${GREEN}============================================${NC}"

cd "$PROJECT_DIR"

# Dependencies yükle
echo "📦 Frontend dependencies yükleniyor..."
npm install

# .env.production dosyası oluştur
echo "📝 Frontend .env.production dosyası oluşturuluyor..."
cat > .env.production << EOF
# Production Environment
VITE_API_BASE_URL=https://${DOMAIN_NAME}/api
VITE_APP_NAME=CampScape
VITE_APP_DESCRIPTION=Türkiye'nin En Kapsamlı Kamp Ekipmanı Marketi
EOF

# Build
echo "🔨 Frontend build ediliyor..."
npm run build

# Build dosyalarını Nginx dizinine kopyala
FRONTEND_DIR="/var/www/campscape/frontend"
sudo mkdir -p "$FRONTEND_DIR"
sudo cp -r dist/* "$FRONTEND_DIR/"
sudo chown -R www-data:www-data "$FRONTEND_DIR"
sudo chmod -R 755 "$FRONTEND_DIR"

echo -e "${GREEN}✅ Frontend hazır${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}8. NGINX YAPILANDIRMASI${NC}"
echo -e "${GREEN}============================================${NC}"

# Nginx config oluştur
echo "📝 Nginx config oluşturuluyor..."
sudo tee /etc/nginx/sites-available/campscape > /dev/null << EOF
# CampScape Nginx Configuration
# Generated by ubuntu-quick-deploy.sh

upstream campscape_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};
    
    root /var/www/campscape/frontend;
    index index.html;
    
    access_log /var/log/nginx/campscape-access.log;
    error_log /var/log/nginx/campscape-error.log;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    location /api/ {
        proxy_pass http://campscape_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /health {
        proxy_pass http://campscape_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        access_log off;
    }
    
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        alias /var/www/campscape/server/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Config'i aktifleştir
sudo ln -sf /etc/nginx/sites-available/campscape /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx test
sudo nginx -t

# Nginx reload
sudo systemctl reload nginx

echo -e "${GREEN}✅ Nginx yapılandırıldı${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}9. PM2 İLE BACKEND BAŞLATMA${NC}"
echo -e "${GREEN}============================================${NC}"

cd "$PROJECT_DIR/server"

# PM2 ile başlat
pm2 delete campscape-backend 2>/dev/null || true
pm2 start dist/server.js --name campscape-backend

# PM2 startup
pm2 startup systemd -u $USER --hp $HOME
pm2 save

echo -e "${GREEN}✅ Backend PM2 ile başlatıldı${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}10. SSL SERTİFİKASI (OPSIYONEL)${NC}"
echo -e "${GREEN}============================================${NC}"

echo ""
echo -e "${YELLOW}SSL sertifikası kurmak ister misiniz? (Let's Encrypt)${NC}"
echo -e "${YELLOW}Not: Domain DNS ayarları sunucuya yönlendirilmiş olmalı!${NC}"
read -p "SSL kurmak istiyor musunuz? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📜 SSL sertifikası kuruluyor..."
    sudo certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME" --non-interactive --agree-tos --email "$ADMIN_EMAIL" --redirect
    echo -e "${GREEN}✅ SSL sertifikası kuruldu${NC}"
else
    echo -e "${YELLOW}⚠️  SSL kurulumu atlandı${NC}"
    echo -e "${YELLOW}Manuel kurulum için: sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME${NC}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT TAMAMLANDI!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Test et
echo "🧪 Backend test ediliyor..."
sleep 3
HEALTH_CHECK=$(curl -s http://localhost:3000/health || echo "fail")

if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo -e "${GREEN}✅ Backend çalışıyor!${NC}"
else
    echo -e "${RED}❌ Backend başlatılamadı, loglara bakın: pm2 logs campscape-backend${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}       🎉 CampScape Deployment Bilgileri${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}🌐 Website:${NC} http://$DOMAIN_NAME"
echo -e "${GREEN}🔧 Backend API:${NC} http://$DOMAIN_NAME/api"
echo -e "${GREEN}🏥 Health Check:${NC} http://$DOMAIN_NAME/health"
echo ""
echo -e "${YELLOW}👤 Varsayılan Admin Giriş Bilgileri:${NC}"
echo -e "   Email: admin@campscape.com"
echo -e "   Şifre: Admin123!"
echo -e "   ${RED}ÖNEMLİ: İlk girişte şifreyi değiştirin!${NC}"
echo ""
echo -e "${BLUE}📊 Yönetim Komutları:${NC}"
echo -e "   Backend restart:  ${YELLOW}pm2 restart campscape-backend${NC}"
echo -e "   Backend logs:     ${YELLOW}pm2 logs campscape-backend${NC}"
echo -e "   Backend status:   ${YELLOW}pm2 status${NC}"
echo -e "   Nginx reload:     ${YELLOW}sudo systemctl reload nginx${NC}"
echo -e "   Nginx logs:       ${YELLOW}sudo tail -f /var/log/nginx/campscape-error.log${NC}"
echo ""
echo -e "${BLUE}📚 Dokümantasyon:${NC}"
echo -e "   Detaylı rehber: ${YELLOW}$PROJECT_DIR/UBUNTU_DEPLOY_GUIDE.md${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Başarıyla tamamlandı! 🚀${NC}"
echo ""

