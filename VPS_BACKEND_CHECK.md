# Backend Kontrol ve Düzeltme

## 1. Backend Loglarını Kontrol Et
```bash
pm2 logs campscape-backend --lines 100
```

## 2. Port 3000'de Test Et (5000 değil!)
```bash
curl http://localhost:3000/api/references
curl http://localhost:3000/api/health
```

## 3. Hangi Portta Çalıştığını Kontrol Et
```bash
netstat -tulpn | grep node
# veya
ss -tulpn | grep node
```

## 4. .env Dosyasını Kontrol Et
```bash
cd /var/www/campscape/server
cat .env | grep PORT
```

## 5. Eğer Çok Fazla Restart Varsa
```bash
# Logları temizle ve yeniden başlat
pm2 delete campscape-backend
cd /var/www/campscape/server
pm2 start ecosystem.config.js
pm2 logs campscape-backend
```

