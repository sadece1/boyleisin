# VPS'te Kodları Güncelle ve Build Et

## 1. Kodları Güncelle
```bash
cd /var/www/campscape
git pull origin main
```

## 2. Backend Dependencies Kontrol Et
```bash
cd /var/www/campscape/server
npm install
```

## 3. Backend'i Build Et
```bash
cd /var/www/campscape/server
npm run build
```

## 4. Backend'i Restart Et
```bash
pm2 restart campscape-backend
# veya
pm2 delete campscape-backend
cd /var/www/campscape/server
pm2 start ecosystem.config.js
pm2 save
```

## 5. Test Et
```bash
curl http://localhost:3000/api/references
curl http://localhost:3000/api/brands
```

## 6. Logları Kontrol Et
```bash
pm2 logs campscape-backend --lines 50
```

