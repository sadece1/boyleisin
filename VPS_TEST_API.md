# API Test Komutları

## Backend Port 3000'de Çalışıyor!

Loglardan görüldüğü üzere:
- ✅ Backend çalışıyor
- ✅ Port: 3000 (5000 değil!)
- ✅ Veritabanı bağlantısı başarılı

## Test Komutları

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. References API
```bash
curl http://localhost:3000/api/references
```

### 3. Brands API
```bash
curl http://localhost:3000/api/brands
```

### 4. Frontend'ten Erişim
Frontend'in backend'e bağlanabilmesi için:
- Frontend'in `.env` dosyasında `VITE_API_URL=http://localhost:3000` veya production URL'i olmalı
- Nginx reverse proxy ayarları kontrol edilmeli

## Nginx Reverse Proxy Kontrolü

Eğer frontend'ten erişim sorunu varsa, Nginx ayarlarını kontrol edin:

```bash
cat /etc/nginx/sites-available/campscape
# veya
cat /etc/nginx/sites-enabled/campscape
```

Nginx config'de şöyle olmalı:
```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

