import pool from '../config/database';
import { generateId } from '../utils/helpers';
import logger from '../utils/logger';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const seedData = async () => {
  try {
    logger.info('🌱 Starting database seeding...');

    // Clear existing data (optional - be careful in production!)
    logger.info('Clearing existing data...');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.execute('TRUNCATE TABLE reservation_gear');
    await pool.execute('TRUNCATE TABLE reservations');
    await pool.execute('TRUNCATE TABLE reviews');
    await pool.execute('TRUNCATE TABLE favorites');
    await pool.execute('TRUNCATE TABLE blog_posts');
    await pool.execute('TRUNCATE TABLE gear');
    await pool.execute('TRUNCATE TABLE campsites');
    await pool.execute('TRUNCATE TABLE categories');
    await pool.execute('TRUNCATE TABLE newsletter_subscriptions');
    await pool.execute('TRUNCATE TABLE appointments');
    await pool.execute('TRUNCATE TABLE contact_messages');
    await pool.execute('TRUNCATE TABLE users');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Create Admin User
    logger.info('Creating admin user...');
    const adminId = generateId();
    const adminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
    await pool.execute(
      `INSERT INTO users (id, email, name, password_hash, role, is_active) 
       VALUES (?, ?, ?, ?, 'admin', TRUE)`,
      [adminId, 'admin@campscape.com', 'Admin User', adminPassword]
    );

    // Create Test Users
    logger.info('Creating test users...');
    const userId1 = generateId();
    const userId2 = generateId();
    const userPassword = await bcrypt.hash('User123!', SALT_ROUNDS);
    
    await pool.execute(
      `INSERT INTO users (id, email, name, password_hash, role, is_active) 
       VALUES (?, ?, ?, ?, 'user', TRUE)`,
      [userId1, 'user1@campscape.com', 'John Doe', userPassword]
    );

    await pool.execute(
      `INSERT INTO users (id, email, name, password_hash, role, is_active) 
       VALUES (?, ?, ?, ?, 'user', TRUE)`,
      [userId2, 'user2@campscape.com', 'Jane Smith', userPassword]
    );

    // Create Categories
    logger.info('Creating categories...');
    const tentCategoryId = generateId();
    const sleepingBagCategoryId = generateId();
    const cookingCategoryId = generateId();
    const lightingCategoryId = generateId();
    const backpackCategoryId = generateId();

    await pool.execute(
      `INSERT INTO categories (id, name, slug, description, parent_id, icon, \`order\`) 
       VALUES (?, ?, ?, ?, NULL, 'tent', 1)`,
      [tentCategoryId, 'Çadırlar', 'tent', 'Kamp çadırları ve aksesuarları']
    );

    await pool.execute(
      `INSERT INTO categories (id, name, slug, description, parent_id, icon, \`order\`) 
       VALUES (?, ?, ?, ?, NULL, 'sleeping-bag', 2)`,
      [sleepingBagCategoryId, 'Uyku Tulumları', 'sleeping-bag', 'Uyku tulumları ve matlar']
    );

    await pool.execute(
      `INSERT INTO categories (id, name, slug, description, parent_id, icon, \`order\`) 
       VALUES (?, ?, ?, ?, NULL, 'cooking', 3)`,
      [cookingCategoryId, 'Pişirme Ekipmanları', 'cooking', 'Kamp ocakları ve pişirme aletleri']
    );

    await pool.execute(
      `INSERT INTO categories (id, name, slug, description, parent_id, icon, \`order\`) 
       VALUES (?, ?, ?, ?, NULL, 'lighting', 4)`,
      [lightingCategoryId, 'Aydınlatma', 'lighting', 'Fenerler ve kamp aydınlatmaları']
    );

    await pool.execute(
      `INSERT INTO categories (id, name, slug, description, parent_id, icon, \`order\`) 
       VALUES (?, ?, ?, ?, NULL, 'backpack', 5)`,
      [backpackCategoryId, 'Sırt Çantaları', 'backpack', 'Kamp sırt çantaları']
    );

    // Create Campsites
    logger.info('Creating campsites...');
    const campsite1Id = generateId();
    const campsite2Id = generateId();
    const campsite3Id = generateId();

    await pool.execute(
      `INSERT INTO campsites (
        id, name, description, location_address, location_city, location_region,
        location_lat, location_lng, images, amenities, rules, capacity,
        price_per_night, rating, review_count, available, owner_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campsite1Id,
        'Muğla Koyları Kamp Alanı',
        'Ege kıyılarında huzurlu bir kamp deneyimi. Denize sıfır konumda, temiz hava ve muhteşem manzara. Su, elektrik ve tuvalet altyapısı mevcut.',
        'Datça Yolu, Marmaris',
        'Marmaris',
        'Muğla',
        36.8556,
        28.2741,
        JSON.stringify([
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'
        ]),
        JSON.stringify(['Su', 'Elektrik', 'Tuvalet', 'Duş', 'Mangal Alanı', 'Park Yeri', 'WiFi']),
        JSON.stringify(['Kamp ateşi yalnızca belirlenmiş alanlarda yakılabilir', 'Sessizlik saatleri: 23:00 - 07:00', 'Hayvanlar tasmalı tutulmalıdır']),
        20,
        850.00,
        4.5,
        12,
        true,
        adminId
      ]
    );

    await pool.execute(
      `INSERT INTO campsites (
        id, name, description, location_address, location_city, location_region,
        location_lat, location_lng, images, amenities, rules, capacity,
        price_per_night, rating, review_count, available, owner_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campsite2Id,
        'Kapadokya Doğa Kampı',
        'Peri bacaları manzaralı eşsiz bir kamp deneyimi. Gökyüzü manzarası ve doğa ile iç içe bir ortam. Çadır ve karavan alanları mevcut.',
        'Göreme Yolu, Nevşehir',
        'Göreme',
        'Nevşehir',
        38.6431,
        34.8331,
        JSON.stringify([
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          'https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?w=800'
        ]),
        JSON.stringify(['Su', 'Elektrik', 'Tuvalet', 'Mangal Alanı', 'Park Yeri', 'Müze Girişi']),
        JSON.stringify(['Kamp ateşi yalnızca belirlenmiş alanlarda yakılabilir', 'Çevre temizliğine dikkat edilmelidir']),
        15,
        650.00,
        4.8,
        8,
        true,
        adminId
      ]
    );

    await pool.execute(
      `INSERT INTO campsites (
        id, name, description, location_address, location_city, location_region,
        location_lat, location_lng, images, amenities, rules, capacity,
        price_per_night, rating, review_count, available, owner_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campsite3Id,
        'Antalya Orman Kampı',
        'Çam ormanları içinde nefes kesen bir kamp alanı. Yürüyüş parkurları ve doğa sporları için ideal. Tam donanımlı altyapı.',
        'Saklıkent Yolu, Antalya',
        'Antalya',
        'Antalya',
        36.8841,
        30.7056,
        JSON.stringify([
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
          'https://images.unsplash.com/photo-1464822759844-d150ad6bfc2d?w=800'
        ]),
        JSON.stringify(['Su', 'Elektrik', 'Tuvalet', 'Duş', 'Mangal Alanı', 'Park Yeri', 'Yürüyüş Parkuru']),
        JSON.stringify(['Doğaya zarar verilmemelidir', 'Atıklar geri dönüşüm kutularına atılmalıdır']),
        25,
        750.00,
        4.3,
        15,
        true,
        userId1
      ]
    );

    // Create Gear
    logger.info('Creating gear items...');
    const gear1Id = generateId();
    const gear2Id = generateId();
    const gear3Id = generateId();
    const gear4Id = generateId();
    const gear5Id = generateId();

    await pool.execute(
      `INSERT INTO gear (
        id, name, description, category_id, images, price_per_day,
        deposit, available, status, specifications, brand, color,
        recommended_products, owner_id, rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gear1Id,
        'Coleman Çadır 4 Kişilik',
        'Su geçirmez, rüzgar dirençli 4 kişilik kamp çadırı. Kolay kurulum, hafif ve dayanıklı.',
        tentCategoryId,
        JSON.stringify([
          'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
          'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800'
        ]),
        150.00,
        500.00,
        true,
        'for-sale',
        JSON.stringify({
          'Kapasite': '4 kişi',
          'Ağırlık': '5.2 kg',
          'Su Geçirmezlik': '3000 mm',
          'Malzeme': 'Polyester'
        }),
        'Coleman',
        'Mavi',
        JSON.stringify([gear4Id]),
        adminId,
        4.7
      ]
    );

    await pool.execute(
      `INSERT INTO gear (
        id, name, description, category_id, images, price_per_day,
        deposit, available, status, specifications, brand, color,
        recommended_products, owner_id, rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gear2Id,
        'Karaca Uyku Tulumu -10°C',
        'Kış kampı için ideal, kompakt ve sıcak tutan uyku tulumu. Hafif ve taşınabilir.',
        sleepingBagCategoryId,
        JSON.stringify([
          'https://images.unsplash.com/photo-1520509414578-d9cbf09933a1?w=800'
        ]),
        80.00,
        200.00,
        true,
        'for-sale',
        JSON.stringify({
          'Sıcaklık': '-10°C',
          'Ağırlık': '1.2 kg',
          'Malzeme': 'Polyester dolgu',
          'Boyut': '210x80 cm'
        }),
        'Karaca',
        'Siyah',
        JSON.stringify([gear5Id]),
        adminId,
        4.5
      ]
    );

    await pool.execute(
      `INSERT INTO gear (
        id, name, description, category_id, images, price_per_day,
        deposit, available, status, specifications, brand, color,
        recommended_products, owner_id, rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gear3Id,
        'Campingaz Ocak Seti',
        'Taşınabilir gazlı kamp ocağı. Hızlı ısınma, güvenli kullanım.',
        cookingCategoryId,
        JSON.stringify([
          'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'
        ]),
        60.00,
        150.00,
        true,
        'for-sale',
        JSON.stringify({
          'Güç': '2000 W',
          'Yakıt': 'Gaz kartuşu',
          'Ağırlık': '0.8 kg'
        }),
        'Campingaz',
        'Kırmızı',
        JSON.stringify([]),
        userId1,
        4.6
      ]
    );

    await pool.execute(
      `INSERT INTO gear (
        id, name, description, category_id, images, price_per_day,
        deposit, available, status, specifications, brand, color,
        recommended_products, owner_id, rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gear4Id,
        'LED Kamp Feneri',
        'Güçlü ve uzun ömürlü LED kamp feneri. Su geçirmez, şarj edilebilir.',
        lightingCategoryId,
        JSON.stringify([
          'https://images.unsplash.com/photo-1509773896068-7fd3d9152b0b?w=800'
        ]),
        30.00,
        50.00,
        true,
        'for-sale',
        JSON.stringify({
          'Işık Gücü': '500 lümen',
          'Pil': '18650 lityum',
          'Çalışma Süresi': '8 saat'
        }),
        'LED Lenser',
        'Siyah',
        JSON.stringify([]),
        adminId,
        4.8
      ]
    );

    await pool.execute(
      `INSERT INTO gear (
        id, name, description, category_id, images, price_per_day,
        deposit, available, status, specifications, brand, color,
        recommended_products, owner_id, rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gear5Id,
        'Deuter Sırt Çantası 65L',
        'Dayanıklı ve ergonomik kamp sırt çantası. Geniş hacim, rahat taşıma.',
        backpackCategoryId,
        JSON.stringify([
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'
        ]),
        100.00,
        300.00,
        true,
        'for-sale',
        JSON.stringify({
          'Hacim': '65 litre',
          'Ağırlık': '2.1 kg',
          'Malzeme': 'Ripstop naylon'
        }),
        'Deuter',
        'Yeşil',
        JSON.stringify([]),
        userId2,
        4.9
      ]
    );

    // Create Blog Posts
    logger.info('Creating blog posts...');
    const blog1Id = generateId();
    const blog2Id = generateId();
    const blog3Id = generateId();

    await pool.execute(
      `INSERT INTO blog_posts (
        id, title, excerpt, content, author, author_avatar, category,
        image, read_time, tags, featured, views, recommended_posts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        blog1Id,
        'Kamp Yapmaya Başlamak İçin İpuçları',
        'Kamp yapmaya yeni başlayanlar için kapsamlı bir rehber. İhtiyacınız olan ekipmanlar, güvenlik önerileri ve daha fazlası.',
        'Kamp yapmak, doğayla iç içe olmak ve şehir hayatından uzaklaşmak için harika bir yöntemdir. Bu yazıda kamp yapmaya yeni başlayanlar için önemli ipuçları bulacaksınız.\n\n1. Doğru Ekipman Seçimi\nKamp yapmadan önce ihtiyacınız olan temel ekipmanları belirlemelisiniz. Kaliteli bir çadır, uyku tulumu, mat ve temel kamp gereçleri olmazsa olmazlardır.\n\n2. Güvenlik Önlemleri\nKamp yaparken güvenlik her şeyden önemlidir. İlk yardım çantası, harita, pusula ve iletişim cihazları yanınızda bulunmalıdır.\n\n3. Doğaya Saygı\nKamp yaparken doğaya zarar vermemeye özen göstermelisiniz. Atıklarınızı toplamalı, kamp ateşini doğru şekilde söndürmelisiniz.',
        'Ahmet Yılmaz',
        'https://ui-avatars.com/api/?name=Ahmet+Yilmaz',
        'Rehber',
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
        5,
        JSON.stringify(['kamp', 'rehber', 'yeni başlayanlar', 'ipuçları']),
        true,
        125,
        JSON.stringify([blog2Id])
      ]
    );

    await pool.execute(
      `INSERT INTO blog_posts (
        id, title, excerpt, content, author, author_avatar, category,
        image, read_time, tags, featured, views, recommended_posts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        blog2Id,
        'Türkiye\'nin En İyi Kamp Alanları',
        'Türkiye\'de kamp yapmak için en güzel ve popüler destinasyonları keşfedin. Ege, Akdeniz ve Karadeniz\'den öneriler.',
        'Türkiye, kamp severler için sayısız harika destinasyon sunuyor. Bu yazıda ülkemizin en güzel kamp alanlarını bulacaksınız.\n\n1. Ege Kıyıları\nMarmaris, Bodrum ve Çeşme gibi popüler destinasyonlarda denize sıfır kamp alanları bulunmaktadır.\n\n2. Kapadokya\nPeri bacaları manzaralı eşsiz bir kamp deneyimi için Kapadokya ideal bir seçimdir.\n\n3. Karadeniz Yaylaları\nYeşilin her tonunu görebileceğiniz Karadeniz yaylaları, doğa severler için mükemmel bir ortam sunar.',
        'Ayşe Demir',
        'https://ui-avatars.com/api/?name=Ayse+Demir',
        'Destinasyonlar',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        7,
        JSON.stringify(['kamp alanları', 'türkiye', 'destinasyon', 'seyahat']),
        true,
        89,
        JSON.stringify([blog1Id, blog3Id])
      ]
    );

    await pool.execute(
      `INSERT INTO blog_posts (
        id, title, excerpt, content, author, author_avatar, category,
        image, read_time, tags, featured, views, recommended_posts
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        blog3Id,
        'Kamp Mutfağı: Lezzetli Kamp Tarifleri',
        'Kamp alanında yapabileceğiniz pratik ve lezzetli tarifler. Minimal ekipmanla harika yemekler hazırlayın.',
        'Kamp yaparken de lezzetli yemekler yiyebilirsiniz! Bu yazıda kamp mutfağı için pratik ve lezzetli tarifler bulacaksınız.\n\n1. Kahvaltı\nYumurta, peynir ve zeytinden oluşan klasik Türk kahvaltısı kamp için idealdir.\n\n2. Ana Yemekler\nIzgara et, balık veya sebze yemekleri kamp mutfağının vazgeçilmezleridir.\n\n3. Atıştırmalıklar\nEnerji veren kuruyemişler ve meyveler kamp sırasında ihtiyacınız olan enerjiyi sağlar.',
        'Mehmet Kaya',
        'https://ui-avatars.com/api/?name=Mehmet+Kaya',
        'Yemek',
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200',
        4,
        JSON.stringify(['kamp mutfağı', 'tarif', 'yemek', 'lezzet']),
        false,
        45,
        JSON.stringify([blog1Id])
      ]
    );

    // Create Sample Reviews
    logger.info('Creating reviews...');
    const review1Id = generateId();
    const review2Id = generateId();
    const review3Id = generateId();
    const review4Id = generateId();

    await pool.execute(
      `INSERT INTO reviews (id, user_id, campsite_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [
        review1Id,
        userId1,
        campsite1Id,
        5,
        'Harika bir kamp deneyimi yaşadık! Denize sıfır konum ve temiz altyapı. Kesinlikle tekrar geleceğiz.'
      ]
    );

    await pool.execute(
      `INSERT INTO reviews (id, user_id, campsite_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [
        review3Id,
        userId2,
        campsite1Id,
        4,
        'Güzel bir yer, manzara muhteşem. Sadece biraz daha sessiz bir alan isterdim.'
      ]
    );

    await pool.execute(
      `INSERT INTO reviews (id, user_id, gear_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [
        review2Id,
        userId2,
        gear1Id,
        5,
        'Çadır çok kaliteli ve kolay kuruldu. Yağmurlu gecede bile içeriye su sızmadı. Mükemmel bir ürün!'
      ]
    );

    await pool.execute(
      `INSERT INTO reviews (id, user_id, gear_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [
        review4Id,
        userId1,
        gear2Id,
        4,
        'Uyku tulumu çok sıcak tutuyor. Kış kampı için ideal. Sadece biraz ağır.'
      ]
    );

    // Update ratings after creating reviews
    logger.info('Updating ratings...');
    await pool.execute(
      `UPDATE campsites SET 
       rating = (SELECT AVG(rating) FROM reviews WHERE campsite_id = ?),
       review_count = (SELECT COUNT(*) FROM reviews WHERE campsite_id = ?)
       WHERE id = ?`,
      [campsite1Id, campsite1Id, campsite1Id]
    );

    await pool.execute(
      `UPDATE gear SET 
       rating = (SELECT AVG(rating) FROM reviews WHERE gear_id = ?)
       WHERE id = ?`,
      [gear1Id, gear1Id]
    );

    await pool.execute(
      `UPDATE gear SET 
       rating = (SELECT AVG(rating) FROM reviews WHERE gear_id = ?)
       WHERE id = ?`,
      [gear2Id, gear2Id]
    );

    logger.info('✅ Database seeding completed successfully!');
    logger.info('');
    logger.info('📧 Login Credentials:');
    logger.info('   Admin: admin@campscape.com / Admin123!');
    logger.info('   User 1: user1@campscape.com / User123!');
    logger.info('   User 2: user2@campscape.com / User123!');
    logger.info('');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedData();
