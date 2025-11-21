# SSL Sertifikası Kurulumu (Let's Encrypt)

## VPS'te tek komutla SSL kur:

```bash
sudo apt update && sudo apt install -y certbot python3-certbot-nginx && sudo certbot --nginx -d sadece1deneme.com -d www.sadece1deneme.com --non-interactive --agree-tos --email admin@sadece1deneme.com --redirect && sudo systemctl reload nginx && echo "✅ SSL kuruldu!"
```

## Adım adım:

```bash
# 1. Certbot kur
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 2. SSL sertifikası al ve Nginx'e otomatik ekle
sudo certbot --nginx \
  -d sadece1deneme.com \
  -d www.sadece1deneme.com \
  --non-interactive \
  --agree-tos \
  --email admin@sadece1deneme.com \
  --redirect

# 3. Nginx reload
sudo systemctl reload nginx
```

## Otomatik yenileme:

```bash
# Certbot otomatik yenileme için cron job ekle
sudo certbot renew --dry-run
```

## Manuel kontrol:

```bash
# SSL durumunu kontrol et
sudo certbot certificates

# Nginx config'i kontrol et
sudo nginx -t
```

## Not:
- Email adresini kendi email'inle değiştir
- `--redirect` parametresi HTTP'yi HTTPS'e yönlendirir
- Sertifika 90 günde bir otomatik yenilenir

