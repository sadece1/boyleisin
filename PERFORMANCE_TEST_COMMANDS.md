# Performance Test Commands - Hazır Komutlar

## 🚀 Hızlı Test Komutları

### 1. HTTP Header Testi (curl)

```bash
# Basit HEAD isteği - Header'ları kontrol et
curl -I https://sadece1deneme.com/

# Detaylı header kontrolü (verbose)
curl -v -I https://sadece1deneme.com/

# Compression kontrolü (gzip/brotli)
curl -v --compressed -H "Accept-Encoding: gzip, deflate, br" https://sadece1deneme.com/ > /dev/null

# Tam içerik ve header'ları kaydet
curl -v --compressed https://sadece1deneme.com/ -o homepage.html 2>&1 | grep -i "content-encoding\|cache-control\|strict-transport"
```

**Kontrol Edilecek Header'lar:**
- `Content-Encoding: gzip` veya `br` (Brotli)
- `Cache-Control: public, max-age=...`
- `Strict-Transport-Security: max-age=31536000`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`

---

### 2. Lighthouse CLI Testi

```bash
# Lighthouse HTML raporu oluştur (desktop)
npx -y lighthouse https://sadece1deneme.com/ \
  --output html \
  --output-path=./lighthouse-report.html \
  --chrome-flags="--headless" \
  --preset=desktop

# Lighthouse JSON raporu (mobile)
npx -y lighthouse https://sadece1deneme.com/ \
  --output json \
  --output-path=./lighthouse-mobile.json \
  --chrome-flags="--headless" \
  --preset=mobile

# Lighthouse sadece performans metrikleri
npx -y lighthouse https://sadece1deneme.com/ \
  --only-categories=performance \
  --output json \
  --output-path=./lighthouse-performance.json \
  --chrome-flags="--headless"

# Lighthouse tüm kategoriler (HTML + JSON)
npx -y lighthouse https://sadece1deneme.com/ \
  --output html,json \
  --output-path=./lighthouse-full \
  --chrome-flags="--headless"
```

**Önkoşul:** Node.js ve Chrome/Chromium yüklü olmalı

---

### 3. Google PageSpeed Insights API (curl)

```bash
# API Key gerekiyor: https://developers.google.com/speed/docs/insights/v5/get-started
APIKEY="YOUR_API_KEY"

# Mobile test
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://sadece1deneme.com/&strategy=mobile&key=$APIKEY" \
  | jq '.lighthouseResult.categories.performance.score'

# Desktop test
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://sadece1deneme.com/&strategy=desktop&key=$APIKEY" \
  | jq '.lighthouseResult.categories.performance.score'

# Tüm metrikler
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://sadece1deneme.com/&strategy=mobile&key=$APIKEY" \
  | jq '.lighthouseResult.audits | {
    fcp: .["first-contentful-paint"].numericValue,
    lcp: .["largest-contentful-paint"].numericValue,
    tbt: .["total-blocking-time"].numericValue,
    cls: .["cumulative-layout-shift"].numericValue,
    speedIndex: .["speed-index"].numericValue
  }'
```

---

### 4. GTmetrix API Testi

```bash
# GTmetrix API Key gerekiyor: https://gtmetrix.com/api/
GTMETRIX_API_KEY="YOUR_API_KEY"
GTMETRIX_EMAIL="your@email.com"

# Test başlat
curl -X POST "https://gtmetrix.com/api/0.1/test" \
  -u "$GTMETRIX_EMAIL:$GTMETRIX_API_KEY" \
  -d "url=https://sadece1deneme.com/" \
  -d "location=2" \
  -d "browser=3" \
  -d "device=1" \
  -d "connection=1"

# Test sonucunu al (test_id ile)
curl -u "$GTMETRIX_EMAIL:$GTMETRIX_API_KEY" \
  "https://gtmetrix.com/api/0.1/test/TEST_ID"
```

---

### 5. WebPageTest API

```bash
# WebPageTest API Key: https://www.webpagetest.org/getkey.php
WPT_API_KEY="YOUR_API_KEY"

# Test başlat
curl "http://www.webpagetest.org/runtest.php?url=https://sadece1deneme.com/&k=$WPT_API_KEY&f=json" \
  | jq -r '.data.testId'

# Test sonucunu al
curl "http://www.webpagetest.org/jsonResult.php?test=TEST_ID" \
  | jq '.data.median.firstView'
```

---

### 6. Response Time Testi

```bash
# Basit response time
curl -o /dev/null -s -w "Time: %{time_total}s\nSize: %{size_download} bytes\nSpeed: %{speed_download} bytes/s\n" \
  https://sadece1deneme.com/

# Multiple requests (average)
for i in {1..10}; do
  curl -o /dev/null -s -w "%{time_total}\n" https://sadece1deneme.com/
done | awk '{sum+=$1; count++} END {print "Average:", sum/count, "s"}'

# TTFB (Time To First Byte)
curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" \
  https://sadece1deneme.com/
```

---

### 7. Security Headers Testi

```bash
# SecurityHeaders.com API
curl "https://api.securityheaders.com/?q=https://sadece1deneme.com" | jq

# SSL Labs SSL Test (manual)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=sadece1deneme.com
```

---

### 8. Compression Testi

```bash
# Gzip test
curl -H "Accept-Encoding: gzip" -v https://sadece1deneme.com/ 2>&1 | grep -i "content-encoding"

# Brotli test
curl -H "Accept-Encoding: br" -v https://sadece1deneme.com/ 2>&1 | grep -i "content-encoding"

# Compression ratio
UNCOMPRESSED=$(curl -s -H "Accept-Encoding: identity" https://sadece1deneme.com/ | wc -c)
COMPRESSED=$(curl -s -H "Accept-Encoding: gzip" https://sadece1deneme.com/ | wc -c)
echo "Compression ratio: $(echo "scale=2; ($UNCOMPRESSED - $COMPRESSED) / $UNCOMPRESSED * 100" | bc)%"
```

---

### 9. Bundle Size Analysis

```bash
# Build output analizi
cd /var/www/campscape
npm run build
du -sh dist/assets/js/*
du -sh dist/assets/css/*

# En büyük dosyalar
find dist/assets -type f -exec du -h {} + | sort -rh | head -10
```

---

### 10. Network Waterfall Analysis

```bash
# Chrome DevTools Protocol ile network trace
# (Chrome headless gerekli)
npx lighthouse https://sadece1deneme.com/ \
  --output json \
  --output-path=./network-trace.json \
  --chrome-flags="--headless" \
  --only-categories=performance

# Network requests analizi
cat network-trace.json | jq '.audits["network-requests"].details.items[] | {url: .url, size: .transferSize, time: .duration}'
```

---

## 📊 Sonuçları Karşılaştırma

### Before/After Karşılaştırma Scripti

```bash
#!/bin/bash
# compare-performance.sh

URL="https://sadece1deneme.com/"

echo "=== Performance Test ==="
echo "URL: $URL"
echo ""

# Lighthouse test
echo "Running Lighthouse..."
npx -y lighthouse "$URL" \
  --output json \
  --output-path=./lighthouse-before.json \
  --chrome-flags="--headless" \
  --quiet

# Extract key metrics
FCP=$(cat lighthouse-before.json | jq -r '.audits["first-contentful-paint"].numericValue')
LCP=$(cat lighthouse-before.json | jq -r '.audits["largest-contentful-paint"].numericValue')
TBT=$(cat lighthouse-before.json | jq -r '.audits["total-blocking-time"].numericValue')
CLS=$(cat lighthouse-before.json | jq -r '.audits["cumulative-layout-shift"].numericValue')
SCORE=$(cat lighthouse-before.json | jq -r '.categories.performance.score * 100')

echo "Performance Score: $SCORE"
echo "FCP: ${FCP}ms"
echo "LCP: ${LCP}ms"
echo "TBT: ${TBT}ms"
echo "CLS: $CLS"
```

---

## 🎯 Hızlı Kontrol Checklist

```bash
# 1. Header kontrolü
curl -I https://sadece1deneme.com/ | grep -i "cache-control\|content-encoding\|strict-transport"

# 2. Compression kontrolü
curl -H "Accept-Encoding: gzip" -I https://sadece1deneme.com/ | grep -i "content-encoding"

# 3. SSL kontrolü
curl -vI https://sadece1deneme.com/ 2>&1 | grep -i "ssl\|tls"

# 4. Response time
time curl -s https://sadece1deneme.com/ > /dev/null

# 5. Bundle size
curl -s https://sadece1deneme.com/ | grep -o 'assets/js/[^"]*' | head -5
```

---

## 📝 Notlar

1. **Lighthouse CLI**: İlk çalıştırmada Chrome indirilebilir (yaklaşık 100MB)
2. **API Keys**: PageSpeed Insights, GTmetrix, WebPageTest için API key gerekiyor
3. **Rate Limits**: API'lerde rate limit olabilir, dikkatli kullanın
4. **Network Conditions**: Lighthouse varsayılan olarak throttled network kullanır (gerçekçi test)

---

**Son Güncelleme**: 2025-11-27

