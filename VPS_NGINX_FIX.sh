#!/bin/bash

# ERR_TOO_MANY_REDIRECTS - Nginx Config Düzeltme Scripti
# Bu script redirect loop'unu önlemek için Nginx config'ini düzeltir

echo "=========================================="
echo "Nginx Redirect Loop Düzeltme"
echo "=========================================="
echo ""

# 1. Mevcut Nginx config'ini yedekle
echo "1. Mevcut config yedekleniyor..."
sudo cp /etc/nginx/sites-available/campscape /etc/nginx/sites-available/campscape.backup.$(date +%Y%m%d_%H%M%S)
echo "   ✓ Yedek oluşturuldu"
echo ""

# 2. SSL durumunu kontrol et
echo "2. SSL durumunu kontrol ediliyor..."
if [ -f "/etc/letsencrypt/live/sadece1deneme.com/fullchain.pem" ]; then
    echo "   ✓ SSL sertifikası bulundu"
    USE_SSL=true
else
    echo "   ✗ SSL sertifikası bulunamadı"
    USE_SSL=false
fi
echo ""

# 3. Yeni Nginx config oluştur
echo "3. Yeni Nginx config oluşturuluyor..."
if [ "$USE_SSL" = true ]; then
    echo "   SSL config kullanılıyor..."
    cat > /tmp/campscape-nginx.conf << 'NGINX_EOF'
upstream campscape_backend {
    server localhost:3000;
    keepalive 64;
}

# HTTP -> HTTPS Redirect (Sadece bir kez)
server {
    listen 80;
    listen [::]:80;
    server_name sadece1deneme.com www.sadece1deneme.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sadece1deneme.com www.sadece1deneme.com;
    
    ssl_certificate /etc/letsencrypt/live/sadece1deneme.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sadece1deneme.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    client_max_body_size 50M;
    root /var/www/campscape/dist;
    index index.html;
    
    access_log /var/log/nginx/campscape-access.log;
    error_log /var/log/nginx/campscape-error.log;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # API Proxy - CRITICAL: X-Forwarded-Proto https olmalı
    location /api {
        proxy_pass http://campscape_backend/api;
        proxy_http_version 1.1;
        
        proxy_request_buffering off;
        proxy_buffering off;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;  # CRITICAL: https olarak işaretle
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port 443;
        
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    location /health {
        proxy_pass http://campscape_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        access_log off;
    }
    
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        etag on;
        try_files $uri =404;
    }
    
    # HTML dosyaları cache'lenmemeli
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        try_files $uri =404;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        alias /var/www/campscape/server/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    location / {
        # HTML dosyaları cache'lenmemeli
        if ($request_uri ~* \.html$) {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            expires -1;
        }
        try_files $uri $uri/ /index.html;
    }
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINX_EOF
else
    echo "   Normal config kullanılıyor..."
    cat > /tmp/campscape-nginx.conf << 'NGINX_EOF'
upstream campscape_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name sadece1deneme.com www.sadece1deneme.com;
    
    client_max_body_size 50M;
    root /var/www/campscape/dist;
    index index.html;
    
    access_log /var/log/nginx/campscape-access.log;
    error_log /var/log/nginx/campscape-error.log;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # API Proxy - CRITICAL: X-Forwarded-Proto http olmalı
    location /api {
        proxy_pass http://campscape_backend/api;
        proxy_http_version 1.1;
        
        proxy_request_buffering off;
        proxy_buffering off;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto http;  # CRITICAL: http olarak işaretle
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port 80;
        
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    location /health {
        proxy_pass http://campscape_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto http;
        access_log off;
    }
    
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        etag on;
        try_files $uri =404;
    }
    
    # HTML dosyaları cache'lenmemeli
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        try_files $uri =404;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        alias /var/www/campscape/server/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    location / {
        # HTML dosyaları cache'lenmemeli
        if ($request_uri ~* \.html$) {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            expires -1;
        }
        try_files $uri $uri/ /index.html;
    }
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINX_EOF
fi

# 4. Config'i uygula
echo "4. Config uygulanıyor..."
sudo cp /tmp/campscape-nginx.conf /etc/nginx/sites-available/campscape
sudo rm /tmp/campscape-nginx.conf
echo "   ✓ Config uygulandı"
echo ""

# 5. Nginx test
echo "5. Nginx config test ediliyor..."
if sudo nginx -t; then
    echo "   ✓ Nginx config geçerli"
    sudo systemctl reload nginx
    echo "   ✓ Nginx yeniden yüklendi"
else
    echo "   ✗ Nginx config hatası!"
    echo "   Yedek config geri yükleniyor..."
    sudo cp /etc/nginx/sites-available/campscape.backup.* /etc/nginx/sites-available/campscape
    exit 1
fi
echo ""

# 6. Test
echo "6. Test ediliyor..."
echo "   Backend health:"
curl -s http://localhost:3000/health | head -1
echo ""
echo "   API test:"
if [ "$USE_SSL" = true ]; then
    curl -s -I https://sadece1deneme.com/api/gear?page=1&limit=10 2>&1 | head -3
else
    curl -s -I http://sadece1deneme.com/api/gear?page=1&limit=10 2>&1 | head -3
fi
echo ""

echo "=========================================="
echo "Düzeltme tamamlandı!"
echo "=========================================="
echo ""
echo "Önemli: X-Forwarded-Proto header'ı doğru ayarlandı:"
if [ "$USE_SSL" = true ]; then
    echo "  - HTTPS için: X-Forwarded-Proto = https"
else
    echo "  - HTTP için: X-Forwarded-Proto = http"
fi
echo ""

