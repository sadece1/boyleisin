# Nginx Dosya Boyutu Limiti Düzeltme

VPS'te şu komutu çalıştır:

```bash
sudo nano /etc/nginx/sites-available/campscape
```

Aşağıdaki satırı bul:
```
location /api/ {
```

Hemen üstüne veya `server` bloğunun başına ekle:
```
client_max_body_size 50M;
```

Tam örnek:
```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name sadece1deneme.com www.sadece1deneme.com;
    
    # Dosya yükleme limiti (50MB)
    client_max_body_size 50M;
    
    root /var/www/campscape/dist;
    index index.html;
    
    location /api {
        proxy_pass http://campscape_backend/api;
        proxy_http_version 1.1;
        
        # Dosya yükleme için önemli
        proxy_request_buffering off;
        proxy_buffering off;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # ... diğer location'lar
}
```

Kaydet ve test et:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

