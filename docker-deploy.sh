#!/bin/bash
# CampScape Docker Deployment Script
set -e

echo "🚀 CampScape Docker Deployment Başlatılıyor..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env dosyası bulunamadı. env.example.txt'den kopyalanıyor...${NC}"
    if [ -f env.example.txt ]; then
        cp env.example.txt .env
        echo -e "${YELLOW}⚠️  Lütfen .env dosyasını düzenleyin!${NC}"
    else
        echo -e "${RED}❌ .env dosyası bulunamadı!${NC}"
        exit 1
    fi
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Stop existing containers
echo "🛑 Mevcut container'lar durduruluyor..."
docker-compose down

# Build and start services
echo "🔨 Servisler build ediliyor ve başlatılıyor..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Servislerin hazır olması bekleniyor..."
sleep 10

# Check service status
echo "📊 Servis durumları kontrol ediliyor..."
docker-compose ps

# Run database migrations
echo "🗄️  Database migrations çalıştırılıyor..."
docker-compose exec -T backend npm run db:migrate || echo -e "${YELLOW}⚠️  Migration hatası (normal olabilir)${NC}"

# Show logs
echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo ""
echo "📋 Sonraki adımlar:"
echo "  - Logları görmek için: docker-compose logs -f"
echo "  - Servisleri durdurmak için: docker-compose down"
echo "  - Servisleri yeniden başlatmak için: docker-compose restart"
echo ""
echo "🌐 Frontend: http://localhost:${FRONTEND_PORT:-8080}"
echo "🔧 Backend API: http://localhost:${BACKEND_PORT:-3000}"
echo "💾 MySQL: localhost:${MYSQL_PORT:-3306}"

