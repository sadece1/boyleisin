# VPS Deploy Komutları

## Tüm Değişiklikleri Deploy Etme

```bash
# Proje dizinine git
cd /var/www/campscape

# Son değişiklikleri çek
git pull origin main

# Backend build ve restart
cd server
npm install
npm run build
pm2 restart campscape-backend

# Frontend build ve restart
cd ..
npm install
npm run build
pm2 restart all
```

## Sadece Backend Deploy

```bash
cd /var/www/campscape
git pull origin main
cd server
npm install
npm run build
pm2 restart campscape-backend
```

## Sadece Frontend Deploy

```bash
cd /var/www/campscape
git pull origin main
npm install
npm run build
pm2 restart all
```

## PM2 Durum Kontrolü

```bash
# Tüm process'leri görüntüle
pm2 status

# Backend log'larını görüntüle
pm2 logs campscape-backend --lines 50

# Tüm log'ları görüntüle
pm2 logs --lines 50
```

## Hızlı Deploy (npm install olmadan)

```bash
cd /var/www/campscape
git pull origin main
cd server
npm run build
pm2 restart campscape-backend
cd ..
npm run build
pm2 restart all
```

