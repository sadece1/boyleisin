#!/bin/bash
# test_rating_specs_category.sh - Rating, Specifications ve Category Test Script
# Bu script, güncelleme sonrası rating, specifications ve category değerlerinin korunup korunmadığını test eder

echo "=========================================="
echo "🔍 RATING, SPECIFICATIONS & CATEGORY TEST"
echo "=========================================="

# Test için gear ID (kullanıcı değiştirebilir)
GEAR_ID="74af800d-01da-4fcd-a6d5-18ec846493f7"

# MySQL bilgileri
DB_USER="root"
DB_PASS="MySecurePass123!@#"
DB_NAME="campscape_marketplace"

echo ""
echo "1️⃣ Veritabanı Kontrolü (Güncelleme ÖNCESİ):"
echo "----------------------------------------"
mysql -u $DB_USER -p"$DB_PASS" $DB_NAME -e "
SELECT 
  id,
  name,
  rating,
  category_id,
  specifications,
  price_per_day,
  deposit
FROM gear 
WHERE id = '$GEAR_ID';
" 2>/dev/null

echo ""
echo "2️⃣ Backend API Test (GET - Güncelleme ÖNCESİ):"
echo "----------------------------------------"
echo "Rating:"
curl -s http://localhost:3000/api/gear/$GEAR_ID | jq -r '.data.rating // "null"' 2>/dev/null || echo "null"
echo "Category ID:"
curl -s http://localhost:3000/api/gear/$GEAR_ID | jq -r '.data.category_id // "null"' 2>/dev/null || echo "null"
echo "Specifications:"
curl -s http://localhost:3000/api/gear/$GEAR_ID | jq -r '.data.specifications // "{}"' 2>/dev/null || echo "{}"

echo ""
echo "3️⃣ Test Senaryosu:"
echo "----------------------------------------"
echo "📝 Şimdi admin panelinden sadece FİYAT güncelleyin (pricePerDay değiştirin)"
echo "📝 Rating, Specifications ve Category'yi DEĞİŞTİRMEYİN"
echo "📝 Güncelleme yapın ve 5 saniye bekleyin..."
echo ""
read -p "Güncelleme yaptınız mı? (Enter'a basın devam etmek için): " 

echo ""
echo "4️⃣ Veritabanı Kontrolü (Güncelleme SONRASI):"
echo "----------------------------------------"
mysql -u $DB_USER -p"$DB_PASS" $DB_NAME -e "
SELECT 
  id,
  name,
  rating,
  category_id,
  specifications,
  price_per_day,
  deposit,
  updated_at
FROM gear 
WHERE id = '$GEAR_ID';
" 2>/dev/null

echo ""
echo "5️⃣ Backend API Test (GET - Güncelleme SONRASI):"
echo "----------------------------------------"
echo "Rating (korunmalı):"
RATING_AFTER=$(curl -s http://localhost:3000/api/gear/$GEAR_ID | jq -r '.data.rating // "null"' 2>/dev/null || echo "null")
echo "$RATING_AFTER"

echo "Category ID (korunmalı):"
CATEGORY_AFTER=$(curl -s http://localhost:3000/api/gear/$GEAR_ID | jq -r '.data.category_id // "null"' 2>/dev/null || echo "null")
echo "$CATEGORY_AFTER"

echo "Specifications (korunmalı):"
SPECS_AFTER=$(curl -s http://localhost:3000/api/gear/$GEAR_ID | jq -r '.data.specifications // "{}"' 2>/dev/null || echo "{}")
echo "$SPECS_AFTER"

echo ""
echo "6️⃣ Son Backend Log'ları (Rating ile ilgili):"
echo "----------------------------------------"
pm2 logs campscape-backend --lines 50 --nostream | grep -i "rating\|specifications\|category" | tail -20

echo ""
echo "=========================================="
echo "✅ Test tamamlandı!"
echo "=========================================="
echo ""
echo "📊 SONUÇ:"
echo "  - Rating: $RATING_AFTER (null değilse korunmuş demektir)"
echo "  - Category ID: $CATEGORY_AFTER (boş değilse korunmuş demektir)"
echo "  - Specifications: $SPECS_AFTER ({} değilse korunmuş demektir)"
echo ""
echo "⚠️  Eğer değerler null/boş ise, güncelleme sırasında korunmamış demektir!"
echo ""

