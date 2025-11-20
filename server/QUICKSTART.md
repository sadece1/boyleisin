# 🚀 CampScape Backend - Hızlı Başlangıç

## 📋 Ön Gereksinimler

1. **Node.js** 18+ yüklü olmalı
2. **MySQL** 8.0+ çalışıyor olmalı
3. **npm** veya **yarn** paket yöneticisi

## ⚡ Hızlı Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
cd server
npm install
```

### 2. MySQL Database Oluşturun

MySQL'de veritabanını oluşturun:

```sql
CREATE DATABASE campscape_marketplace;
CREATE USER 'campscape_user'@'localhost' IDENTIFIED BY 'CampscapeApp2025!';
GRANT ALL PRIVILEGES ON campscape_marketplace.* TO 'campscape_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Environment Dosyasını Oluşturun

`.env` dosyası oluşturun (`.env.example` dosyasını kopyalayın):

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyerek database bilgilerinizi güncelleyin.

### 4. Database'i Hazırlayın

```bash
# Schema oluştur
npm run db:migrate

# Örnek verileri yükle (ÖNERİLİR!)
npm run db:seed

# Veya ikisini birden yap
npm run db:reset
```

### 5. Server'ı Başlatın

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server `http://localhost:3000` adresinde çalışacak.

## 🔑 Varsayılan Giriş Bilgileri (Seed'den sonra)

### Admin Hesabı
- **Email**: `admin@campscape.com`
- **Şifre**: `Admin123!`
- **Rol**: Admin (tüm yetkilere sahip)

### Kullanıcı Hesapları
- **Email**: `user1@campscape.com` / **Şifre**: `User123!`
- **Email**: `user2@campscape.com` / **Şifre**: `User123!`
- **Rol**: User (normal kullanıcı)

## 📊 Seed Verileri İçeriği

Seed script'i şunları oluşturur:

- ✅ 3 kullanıcı (1 admin, 2 normal kullanıcı)
- ✅ 5 kategori (Çadırlar, Uyku Tulumları, Pişirme, Aydınlatma, Sırt Çantaları)
- ✅ 3 kamp alanı (Marmaris, Kapadokya, Antalya)
- ✅ 5 kamp ekipmanı (çadır, uyku tulumu, ocak, fener, sırt çantası)
- ✅ 3 blog yazısı (featured ve normal)
- ✅ 4 yorum (kamp alanları ve ekipmanlar için)
- ✅ Rating'ler otomatik hesaplanır

## 🧪 API Test Etme

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Kullanıcı Girişi

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@campscape.com",
    "password": "Admin123!"
  }'
```

Response'dan gelen `token`'ı kaydedin.

### 3. Kamp Alanlarını Listele

```bash
curl http://localhost:3000/api/campsites
```

### 4. Authenticated Request (Token ile)

```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 API Endpoints

Tüm endpoint'ler için `README.md` dosyasına bakın.

### Önemli Endpoint'ler:

- `GET /api/campsites` - Kamp alanlarını listele
- `GET /api/gear` - Ekipmanları listele
- `GET /api/blog` - Blog yazılarını listele
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/profile` - Profil bilgisi (auth gerekli)

## 🐳 Docker ile Çalıştırma

```bash
docker-compose up -d
```

Bu komut MySQL ve backend'i birlikte başlatır.

## 🔧 Sorun Giderme

### Database Bağlantı Hatası
- MySQL'in çalıştığından emin olun
- `.env` dosyasındaki database bilgilerini kontrol edin
- Database ve kullanıcının oluşturulduğundan emin olun

### Port Zaten Kullanılıyor
- `.env` dosyasında `PORT` değerini değiştirin
- Veya o portu kullanan uygulamayı kapatın

### Migration Hatası
- Database'in boş olduğundan emin olun
- Veya mevcut tabloları silin ve tekrar deneyin

## 📚 Daha Fazla Bilgi

Detaylı dokümantasyon için `README.md` dosyasına bakın.













