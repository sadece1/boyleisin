# ERR_TOO_MANY_REDIRECTS Hatası - Çözüm Rehberi

## 🔴 Sorun Nedir?

`ERR_TOO_MANY_REDIRECTS` hatası, tarayıcının sonsuz bir redirect döngüsüne yakalandığını gösterir. Bu genellikle şu durumlarda oluşur:

1. **HTTPS Redirect Loop**: HTTP'den HTTPS'e yönlendirme yapılırken döngü oluşması
2. **Backend ve Nginx İkili Redirect**: Hem backend hem Nginx aynı anda redirect yapması
3. **SSL Sertifikası Sorunları**: SSL yapılandırması hatalı olduğunda
4. **Helmet Security Headers**: `upgradeInsecureRequests` ayarı yanlış yapılandırıldığında

---

## 🔍 Sorunun Tespiti

### 1. Tarayıcı Console'da Hata Kontrolü
```javascript
// Console'da şu hatayı görüyorsanız:
GET https://sadece1deneme.com/api/gear net::ERR_TOO_MANY_REDIRECTS
```

### 2. Network Tab'de İnceleme
- Chrome DevTools > Network sekmesinde
- İsteklerin sürekli 301/302 redirect döndüğünü görüyorsanız
- Redirect sayısı 10'u geçiyorsa sorun var demektir

### 3. Nginx Log Kontrolü
```bash
# Nginx error log'larını kontrol edin
sudo tail -f /var/log/nginx/campscape-error.log

# Sürekli redirect mesajları görüyorsanız sorun var
```

---

## ✅ Çözüm Adımları

### Çözüm 1: Helmet `upgradeInsecureRequests` Devre Dışı Bırakma

**Sorun**: Helmet'in `upgradeInsecureRequests` ayarı production'da aktif olduğunda, backend her HTTP isteğini HTTPS'e yönlendirir. Nginx zaten HTTPS yönetiyorsa, bu bir döngü oluşturur.

**Dosya**: `server/src/app.ts`

**Önceki Kod** (Hatalı):
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      // ...
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
}));
```

**Düzeltilmiş Kod**:
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      // ...
      upgradeInsecureRequests: null, // Disabled - Nginx handles HTTPS redirect
    },
  },
}));
```

**Açıklama**: Nginx zaten HTTP'den HTTPS'e yönlendirme yapıyorsa, backend'de bu ayarı devre dışı bırakmalısınız.

---

### Çözüm 2: Backend HTTPS Enforcement Devre Dışı

**Sorun**: Backend'de `enforceHttps` middleware'i aktifse ve Nginx proxy üzerinden gelen istekleri de redirect ediyorsa döngü oluşur.

**Dosya**: `server/src/app.ts`

**Kontrol Edin**:
```typescript
// Bu satırlar yorum satırı olmalı (zaten öyle)
// if (process.env.NODE_ENV === 'production') {
//   app.use(enforceHttps);
// }
```

**Açıklama**: Nginx proxy kullanıyorsanız, backend'de HTTPS enforcement yapmamalısınız. Nginx zaten bunu yönetiyor.

---

### Çözüm 3: Nginx SSL Yapılandırması

#### Durum A: SSL Sertifikası YOK

**Kullanılacak Config**: `nginx-campscape-config.conf`

```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name sadece1deneme.com www.sadece1deneme.com;
    
    # SSL redirect YOK - sadece HTTP
    # ...
    
    location /api {
        proxy_pass http://campscape_backend/api;
        proxy_set_header X-Forwarded-Proto $scheme;  # HTTP olarak kalır
        # ...
    }
}
```

**Kurulum**:
```bash
sudo cp /var/www/campscape/nginx-campscape-config.conf /etc/nginx/sites-available/campscape
sudo nginx -t
sudo systemctl reload nginx
```

#### Durum B: SSL Sertifikası VAR (Certbot ile kurulu)

**Kullanılacak Config**: `nginx-campscape-ssl.config.conf`

```nginx
# HTTP -> HTTPS Redirect (Sadece bir kez)
server {
    listen 80;
    listen [::]:80;
    server_name sadece1deneme.com www.sadece1deneme.com;
    return 301 https://$server_name$request_uri;  # Tek yönlendirme
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name sadece1deneme.com www.sadece1deneme.com;
    
    ssl_certificate /etc/letsencrypt/live/sadece1deneme.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sadece1deneme.com/privkey.pem;
    
    location /api {
        proxy_pass http://campscape_backend/api;
        proxy_set_header X-Forwarded-Proto https;  # HTTPS olarak işaretle
        # ...
    }
}
```

**Kurulum**:
```bash
sudo cp /var/www/campscape/nginx-campscape-ssl.config.conf /etc/nginx/sites-available/campscape
sudo nginx -t
sudo systemctl reload nginx
```

---

### Çözüm 4: Backend Trust Proxy Ayarı

**Dosya**: `server/src/app.ts`

**Kontrol Edin**:
```typescript
// Trust proxy ayarı olmalı
app.set('trust proxy', 1);
```

**Açıklama**: Nginx proxy kullanıyorsanız, Express'in proxy'yi güvenilir olarak tanıması gerekir. Bu sayede `X-Forwarded-Proto` header'ı doğru okunur.

---

### Çözüm 5: CORS ve Origin Kontrolü

**Dosya**: `server/src/app.ts`

**Kontrol Edin**:
```typescript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [process.env.FRONTEND_URL || 'http://localhost:5173'];
    
    // Proxy'den gelen istekler için origin yok olabilir
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
```

**Açıklama**: Nginx proxy üzerinden gelen isteklerde `origin` header'ı olmayabilir. Bu durumda CORS hatası oluşmamalı.

---

## 🔧 Hızlı Kontrol Listesi

### 1. Backend Kontrolleri
- [ ] `helmet` `upgradeInsecureRequests: null` olmalı
- [ ] `enforceHttps` middleware yorum satırı olmalı
- [ ] `app.set('trust proxy', 1)` aktif olmalı
- [ ] CORS origin kontrolü proxy isteklerini kabul etmeli

### 2. Nginx Kontrolleri
- [ ] SSL yoksa: `nginx-campscape-config.conf` kullanılmalı
- [ ] SSL varsa: `nginx-campscape-ssl.config.conf` kullanılmalı
- [ ] `proxy_set_header X-Forwarded-Proto` doğru ayarlanmalı
- [ ] HTTP'den HTTPS'e sadece bir kez redirect olmalı

### 3. SSL Durumu Kontrolü
```bash
# SSL sertifikası var mı?
ls -la /etc/letsencrypt/live/sadece1deneme.com/

# Varsa SSL config kullan
# Yoksa normal config kullan
```

---

## 🚀 Uygulama Adımları

### Adım 1: Backend Güncellemesi
```bash
cd /var/www/campscape
git pull origin main
cd server
npm run build
pm2 restart campscape-backend
```

### Adım 2: Nginx Config Seçimi
```bash
# SSL durumunu kontrol et
if [ -f "/etc/letsencrypt/live/sadece1deneme.com/fullchain.pem" ]; then
    echo "SSL var - SSL config kullan"
    sudo cp /var/www/campscape/nginx-campscape-ssl.config.conf /etc/nginx/sites-available/campscape
else
    echo "SSL yok - Normal config kullan"
    sudo cp /var/www/campscape/nginx-campscape-config.conf /etc/nginx/sites-available/campscape
fi

# Nginx test ve reload
sudo nginx -t
sudo systemctl reload nginx
```

### Adım 3: Test
```bash
# Backend health check
curl http://localhost:3000/health

# API test (SSL yoksa HTTP, SSL varsa HTTPS)
curl https://sadece1deneme.com/api/gear?page=1&limit=10

# Redirect sayısını kontrol et (10'dan az olmalı)
curl -I https://sadece1deneme.com/api/gear 2>&1 | grep -i "location\|301\|302" | wc -l
```

---

## 🐛 Debug İpuçları

### 1. Nginx Log İnceleme
```bash
# Real-time log takibi
sudo tail -f /var/log/nginx/campscape-access.log
sudo tail -f /var/log/nginx/campscape-error.log
```

### 2. Backend Log İnceleme
```bash
# PM2 log takibi
pm2 logs campscape-backend
```

### 3. Network Tab Analizi
- Chrome DevTools > Network
- İstekleri inceleyin
- Redirect chain'i kontrol edin
- Her redirect'in nedenini anlayın

### 4. cURL ile Test
```bash
# Redirect chain'i görmek için
curl -I -L https://sadece1deneme.com/api/gear

# -I: Headers only
# -L: Follow redirects
```

---

## 📝 Özet

**Ana Sorun**: Hem Nginx hem Backend aynı anda redirect yapıyor.

**Çözüm**: 
1. Backend'de `upgradeInsecureRequests` devre dışı
2. Backend'de `enforceHttps` devre dışı
3. Nginx'te tek bir redirect (HTTP → HTTPS)
4. `X-Forwarded-Proto` header'ı doğru ayarlanmalı

**Sonuç**: Redirect sadece Nginx tarafında bir kez yapılır, backend sadece istekleri işler.

---

## ⚠️ Önemli Notlar

1. **SSL Kurulumu**: Eğer SSL sertifikası yoksa, SSL config kullanmayın. Bu sonsuz döngüye neden olur.

2. **Production vs Development**: 
   - Development: Mock data kullanılabilir
   - Production: Sadece backend API kullanılmalı

3. **Proxy Header'ları**: Nginx proxy kullanıyorsanız, `X-Forwarded-Proto`, `X-Real-IP`, `X-Forwarded-For` header'ları mutlaka ayarlanmalı.

4. **Trust Proxy**: Express'te `app.set('trust proxy', 1)` mutlaka olmalı.

---

## 🔗 İlgili Dosyalar

- `server/src/app.ts` - Backend yapılandırması
- `nginx-campscape-config.conf` - HTTP config (SSL yoksa)
- `nginx-campscape-ssl.config.conf` - HTTPS config (SSL varsa)
- `server/src/middleware/httpsEnforcement.ts` - HTTPS enforcement middleware (devre dışı)

---

## 📞 Destek

Sorun devam ederse:
1. Nginx ve backend log'larını kontrol edin
2. Network tab'de redirect chain'i inceleyin
3. SSL durumunu kontrol edin
4. Config dosyalarını doğrulayın

