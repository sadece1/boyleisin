#!/bin/bash

# VPS Deployment Script - Hostinger VPS için
# Kullanım: bash vps-deploy.sh

set -e  # Hata durumunda dur

echo "🚀 VPS Deployment Başlatılıyor..."
echo "=================================="

# Proje dizinine git
cd /var/www/campscape

# Git remote URL'i güncelle
echo ""
echo "📡 Git remote URL güncelleniyor..."
git remote set-url origin https://github.com/sadece1/amk.git

# Son değişiklikleri çek
echo ""
echo "📥 GitHub'dan son değişiklikler çekiliyor..."
git pull origin main

# Dependencies güncelle
echo ""
echo "📦 Dependencies yükleniyor/güncelleniyor..."
npm install

# Frontend build
echo ""
echo "🔨 Frontend build ediliyor..."
npm run build

# PM2 restart (eğer varsa)
if command -v pm2 &> /dev/null; then
    echo ""
    echo "🔄 PM2 servisleri yeniden başlatılıyor..."
    pm2 restart all || echo "⚠️  PM2 restart başarısız, manuel kontrol edin"
else
    echo ""
    echo "ℹ️  PM2 bulunamadı, atlanıyor..."
fi

# Nginx restart (gerekirse)
if command -v nginx &> /dev/null; then
    echo ""
    echo "🔄 Nginx yeniden başlatılıyor..."
    sudo systemctl restart nginx || echo "⚠️  Nginx restart başarısız, manuel kontrol edin"
else
    echo ""
    echo "ℹ️  Nginx bulunamadı, atlanıyor..."
fi

echo ""
echo "=================================="
echo "✅ Deployment tamamlandı!"
echo ""
echo "📋 Kontrol için:"
echo "   - Frontend: https://your-domain.com"
echo "   - Backend API: https://your-domain.com/api"
echo "   - PM2 durumu: pm2 status"
echo "   - Nginx durumu: sudo systemctl status nginx"

