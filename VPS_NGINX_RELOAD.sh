#!/bin/bash
# VPS Nginx Reload Script - Security Headers ve Cache Kontrolü

echo "=== Nginx Config Test ==="
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config test başarılı"
    echo ""
    echo "=== Nginx Reload ==="
    sudo systemctl reload nginx
    echo "✅ Nginx reload edildi"
    echo ""
    echo "=== Header Kontrolü ==="
    echo "Security Headers:"
    curl -I https://sadece1deneme.com/ 2>&1 | grep -i "strict-transport-security\|x-content-type-options\|x-frame-options\|x-xss-protection"
    echo ""
    echo "Cache Headers:"
    curl -I https://sadece1deneme.com/ 2>&1 | grep -i "cache-control"
    echo ""
    echo "Compression:"
    curl -H "Accept-Encoding: gzip, br" -I https://sadece1deneme.com/ 2>&1 | grep -i "content-encoding"
    echo ""
    echo "=== Static Assets Cache Test ==="
    echo "CSS/JS Cache:"
    curl -I https://sadece1deneme.com/assets/css/index-*.css 2>&1 | head -10 | grep -i "cache-control\|expires"
    echo ""
    echo "Image Cache:"
    curl -I https://sadece1deneme.com/tent-4534210_1280.jpg 2>&1 | head -10 | grep -i "cache-control\|expires"
else
    echo "❌ Nginx config test başarısız!"
    exit 1
fi

