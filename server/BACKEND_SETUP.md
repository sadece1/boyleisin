# Backend Sunucusunu Başlatma Rehberi

## ⚠️ ÖNEMLİ: 500 Hatalarını Çözmek İçin

API çağrıları 500 hatası veriyorsa, backend sunucusunun çalışmadığı anlamına gelir. Bu rehberi takip ederek backend'i başlatın.

## Hızlı Başlangıç

### 1. Gerekli Ortam Değişkenlerini Ayarlayın

`server` klasöründe `.env` dosyası oluşturun:

**Windows PowerShell:**
```powershell
cd server
Copy-Item env.example.txt .env
```

**Linux/Mac:**
```bash
cd server
cp env.example.txt .env
```

`.env` dosyasını düzenleyin ve şu değerleri ayarlayın:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=campscape_marketplace
DB_PORT=3306

# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration (development için kısa şifre kabul edilir)
JWT_SECRET=development-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. Veritabanını Oluşturun

MySQL'de veritabanını oluşturun:

```sql
CREATE DATABASE IF NOT EXISTS campscape_marketplace;
```

### 3. Bağımlılıkları Yükleyin

```bash
cd server
npm install
```

### 4. Veritabanı Tablolarını Oluşturun

```bash
npm run db:migrate
```

### 5. Test Verilerini Yükleyin (Opsiyonel)

```bash
npm run db:seed
```

Bu komut varsayılan admin kullanıcısı oluşturur:
- **E-posta:** admin@campscape.com
- **Şifre:** Admin123!

### 6. Backend Sunucusunu Başlatın

```bash
npm run dev
```

Sunucu başarıyla başladığında şu mesajı göreceksiniz:
```
🚀 Server is running on port 3000 in development mode
📡 API endpoint: http://localhost:3000/api
🏥 Health check: http://localhost:3000/health
```

## Sorun Giderme

### 500 Internal Server Error

Eğer API çağrıları 500 hatası veriyorsa:

1. **Backend sunucusunun çalıştığından emin olun:**
   ```bash
   cd server
   npm run dev
   ```

2. **Veritabanı bağlantısını kontrol edin:**
   - MySQL servisinin çalıştığından emin olun
   - `.env` dosyasındaki veritabanı bilgilerinin doğru olduğundan emin olun
   - Windows'ta MySQL servisini kontrol edin: `services.msc`

3. **Port çakışması kontrolü:**
   Windows PowerShell:
   ```powershell
   netstat -ano | findstr ":3000"
   ```
   Eğer port kullanılıyorsa, farklı bir port kullanın veya kullanan işlemi durdurun.

### Veritabanı Bağlantı Hatası

Eğer veritabanı bağlantı hatası alıyorsanız:

1. MySQL'in çalıştığından emin olun
2. Veritabanının oluşturulduğundan emin olun:
   ```sql
   CREATE DATABASE IF NOT EXISTS campscape_marketplace;
   ```
3. Kullanıcı adı ve şifrenin doğru olduğundan emin olun (Windows'ta genellikle şifre boş)

### Environment Variables Hatası

Development modunda `.env` dosyası olmasa bile çalışabilir, ancak veritabanı bağlantısı için en azından şunlar gerekli:
- `DB_HOST`
- `DB_USER`
- `DB_NAME`

`DB_PASSWORD` ve `JWT_SECRET` development modunda boş bırakılabilir (uyarı verir ama çalışır).

## Varsayılan Admin Bilgileri

Seed çalıştırdıktan sonra:

- **Admin E-posta:** admin@campscape.com
- **Admin Şifre:** Admin123!

## Frontend'i Başlatma

Backend çalıştıktan sonra, frontend'i başlatın:

```bash
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacaktır ve API çağrıları otomatik olarak `http://localhost:3000/api` adresine proxy edilecektir.







