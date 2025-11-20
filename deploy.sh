#!/bin/bash

# CampScape Production Deployment Script
# Bu script production deployment için hazırlanmıştır

set -e  # Hata durumunda durdur

echo "🚀 CampScape Deployment Başlatılıyor..."

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kontroller
echo -e "${YELLOW}📋 Ön kontroller yapılıyor...${NC}"

# Node.js kontrolü
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı!${NC}"
    exit 1
fi

# NPM kontrolü
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ NPM bulunamadı!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ön kontroller tamamlandı${NC}"

# Backend Deployment
echo -e "${YELLOW}📦 Backend build ediliyor...${NC}"
cd server

# Dependencies yükle
if [ ! -d "node_modules" ]; then
    echo "📥 Backend dependencies yükleniyor..."
    npm ci --production
fi

# Environment dosyası kontrolü
if [ ! -f ".env" ]; then
    if [ -f "env.example.txt" ]; then
        echo "📝 .env dosyası oluşturuluyor..."
        cp env.example.txt .env
        echo -e "${YELLOW}⚠️  Lütfen server/.env dosyasını düzenleyin!${NC}"
    else
        echo -e "${RED}❌ .env dosyası bulunamadı!${NC}"
        exit 1
    fi
fi

# Build
echo "🔨 Backend build ediliyor..."
npm run build

# Database migrations
echo "🗄️  Database migrations çalıştırılıyor..."
npm run db:migrate || echo -e "${YELLOW}⚠️  Migration hatası (normal olabilir)${NC}"

cd ..

# Frontend Deployment
echo -e "${YELLOW}📦 Frontend build ediliyor...${NC}"

# Dependencies yükle
if [ ! -d "node_modules" ]; then
    echo "📥 Frontend dependencies yükleniyor..."
    npm ci
fi

# Environment dosyası kontrolü
if [ ! -f ".env.production" ]; then
    if [ -f "env.example.txt" ]; then
        echo "📝 .env.production dosyası oluşturuluyor..."
        cp env.example.txt .env.production
        echo -e "${YELLOW}⚠️  Lütfen .env.production dosyasını düzenleyin!${NC}"
    fi
fi

# Build
echo "🔨 Frontend build ediliyor..."
npm run build

echo -e "${GREEN}✅ Build tamamlandı!${NC}"
echo ""
echo -e "${GREEN}🎉 Deployment hazır!${NC}"
echo ""
echo "Sonraki adımlar:"
echo "1. PM2 ile backend'i başlatın: cd server && pm2 start ecosystem.config.js"
echo "2. Nginx yapılandırmasını kontrol edin"
echo "3. SSL sertifikasını kurun (Let's Encrypt)"
echo "4. Health check yapın: curl http://localhost:3000/health"












