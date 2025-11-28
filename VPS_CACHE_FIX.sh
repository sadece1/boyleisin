#!/bin/bash

# VPS Cache Fix Script - HTML için agresif no-cache headers
# Bu script Nginx config'ini güncelleyip HTML cache sorununu çözer

set -e

echo "🔧 Nginx cache fix uygulanıyor..."

# 1. Git pull
cd /var/www/campscape
echo "📥 Git pull yapılıyor..."
git pull origin main

# 2. Nginx config'i kopyala
echo "📋 Nginx config güncelleniyor..."
sudo cp nginx-optimized.config.conf /etc/nginx/sites-available/campscape-optimized
sudo ln -sf /etc/nginx/sites-available/campscape-optimized /etc/nginx/sites-enabled/campscape

# 3. Nginx config test
echo "✅ Nginx config test ediliyor..."
sudo nginx -t

# 4. Nginx reload
echo "🔄 Nginx reload ediliyor..."
sudo systemctl reload nginx

# 5. Frontend build (HTML meta tag'leri için)
echo "🏗️  Frontend build yapılıyor..."
npm run build

echo ""
echo "✅ Cache fix tamamlandı!"
echo ""
echo "📋 Test komutları:"
echo "  curl -I https://sadece1deneme.com/ | grep -i cache-control"
echo "  curl -I https://sadece1deneme.com/index.html | grep -i cache-control"
echo ""
echo "Beklenen: Cache-Control: no-cache, no-store, must-revalidate, max-age=0"

