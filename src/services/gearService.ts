import api from './api';
import { Gear, GearFilters, PaginatedResponse } from '@/types';
import { config } from '@/config';

const STORAGE_KEY = 'camp_gear_storage';

// Initial mock gear data
const initialMockGear: Gear[] = [
  {
    id: '1',
    name: 'Premium Çadır 4 Kişilik',
    description: 'Su geçirmez, rüzgara dayanıklı premium kamp çadırı. 4 kişilik konforlu bir konaklama için ideal.',
    category: 'tent',
    images: [],
    pricePerDay: 250,
    available: true,
    brand: 'Coleman',
    color: 'Yeşil',
    rating: 4.5,
    specifications: {
      'Kişi Kapasitesi': '4',
      'Ağırlık': '5.2 kg',
      'Su Geçirmezlik': '3000mm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Uyku Tulumu -10°C',
    description: 'Soğuk hava koşullarına dayanıklı, kaliteli uyku tulumu. -10°C\'ye kadar koruma sağlar.',
    category: 'sleeping-bag',
    images: [],
    pricePerDay: 80,
    available: true,
    brand: 'The North Face',
    color: 'Turuncu',
    rating: 4.8,
    specifications: {
      'Sıcaklık Derecesi': '-10°C',
      'Ağırlık': '1.8 kg',
      'Malzeme': 'Kaz Tüyü',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Kamp Ocağı',
    description: 'Portatif gaz ocağı. Yemek pişirmek için pratik ve güvenli.',
    category: 'cooking',
    images: [],
    pricePerDay: 50,
    available: true,
    brand: 'MSR',
    color: 'Siyah',
    rating: 4.2,
    specifications: {
      'Yakıt Tipi': 'Gaz',
      'Ağırlık': '0.5 kg',
      'Güç': '3000W',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'LED Kamp Feneri',
    description: 'Parlak LED kamp feneri. Uzun ömürlü pil ile saatlerce ışık.',
    category: 'lighting',
    images: [],
    pricePerDay: 30,
    available: true,
    brand: 'Black Diamond',
    color: 'Sarı',
    rating: 4.6,
    specifications: {
      'Işık Gücü': '1000 Lumen',
      'Pil Ömrü': '12 saat',
      'Su Geçirmez': 'IPX4',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Sırt Çantası 60L',
    description: 'Büyük hacimli, ergonomik sırt çantası. Uzun yürüyüşler için ideal.',
    category: 'backpack',
    images: [],
    pricePerDay: 120,
    available: false,
    brand: 'Osprey',
    color: 'Mavi',
    rating: 4.7,
    specifications: {
      'Hacim': '60L',
      'Ağırlık': '2.1 kg',
      'Destek': 'Bel ve Omuz Desteği',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kartuş Tüpler
  {
    id: 'gear-kartus-1',
    name: 'Gaz Kartuşu 220g',
    description: 'Kamp ocakları için standart gaz kartuşu. Yüksek kaliteli butan/propan karışımı.',
    category: 'kartus-tup',
    categoryId: 'cat-kartus-tup',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 25,
    available: true,
    specifications: {
      'Ağırlık': '220g',
      'Yakıt Tipi': 'Butan/Propan',
      'Kapasite': '220g',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-kartus-2',
    name: 'Gaz Kartuşu 450g',
    description: 'Uzun kamp süreleri için büyük kapasiteli gaz kartuşu.',
    category: 'kartus-tup',
    categoryId: 'cat-kartus-tup',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 40,
    available: true,
    specifications: {
      'Ağırlık': '450g',
      'Yakıt Tipi': 'Butan/Propan',
      'Kapasite': '450g',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Pürmüzler
  {
    id: 'gear-purmuz-1',
    name: 'Kamp Pürmüzü Portatif',
    description: 'Hızlı ateş yakmak için portatif pürmüz. Kolay kullanım, güvenli tasarım.',
    category: 'purmuz',
    categoryId: 'cat-purmuz',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 35,
    available: true,
    specifications: {
      'Alev Sıcaklığı': '1300°C',
      'Yakıt': 'Gaz Kartuşu',
      'Ağırlık': '0.3 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-purmuz-2',
    name: 'Profesyonel Kamp Pürmüzü',
    description: 'Güçlü alev çıkışı ile profesyonel kamp pürmüzü. Mangal ve barbekü için ideal.',
    category: 'purmuz',
    categoryId: 'cat-purmuz',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 50,
    available: true,
    specifications: {
      'Alev Sıcaklığı': '1500°C',
      'Yakıt': 'Propan',
      'Ağırlık': '0.5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Çadırları
  {
    id: 'gear-cadir-1',
    name: 'Kamp Çadırı 2 Kişilik',
    description: 'Hafif ve kompakt 2 kişilik kamp çadırı. Hızlı kurulum, dayanıklı yapı.',
    category: 'cadir',
    categoryId: 'cat-cadir',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 150,
    available: true,
    brand: 'REI',
    color: 'Turuncu',
    rating: 4.4,
    specifications: {
      'Kapasite': '2 Kişi',
      'Ağırlık': '2.8 kg',
      'Su Geçirmezlik': '3000mm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-cadir-2',
    name: 'Kamp Çadırı 4 Kişilik Aile',
    description: 'Aileler için geniş 4 kişilik kamp çadırı. Yüksek tavan, ferah iç mekan.',
    category: 'cadir',
    categoryId: 'cat-cadir',
    images: [
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'
    ],
    pricePerDay: 220,
    available: true,
    brand: 'Coleman',
    color: 'Mavi',
    rating: 4.9,
    specifications: {
      'Kapasite': '4 Kişi',
      'Ağırlık': '5.2 kg',
      'Su Geçirmezlik': '5000mm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-cadir-3',
    name: 'Kamp Çadırı 6 Kişilik',
    description: 'Büyük gruplar için 6 kişilik süper geniş kamp çadırı.',
    category: 'cadir',
    categoryId: 'cat-cadir',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 280,
    available: true,
    specifications: {
      'Kapasite': '6 Kişi',
      'Ağırlık': '8.5 kg',
      'Su Geçirmezlik': '4000mm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Bıçakları
  {
    id: 'gear-bicak-1',
    name: 'Kamp Bıçağı Çok Amaçlı',
    description: 'Keskin paslanmaz çelik kamp bıçağı. Balta, testere ve çakı fonksiyonları.',
    category: 'bicak',
    categoryId: 'cat-bicak',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 45,
    available: true,
    specifications: {
      'Bıçak Uzunluğu': '12 cm',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '0.4 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-bicak-2',
    name: 'Katlanır Kamp Bıçağı',
    description: 'Kompakt katlanır kamp bıçağı. Güvenli kilit mekanizması.',
    category: 'bicak',
    categoryId: 'cat-bicak',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 35,
    available: true,
    specifications: {
      'Bıçak Uzunluğu': '9 cm',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '0.15 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Diğer Kamp Aksesuarları
  {
    id: 'gear-aksesuar-1',
    name: 'Kamp Çekiçi',
    description: 'Çadır kazıkları için dayanıklı kamp çekici. Kompakt tasarım.',
    category: 'aksesuar',
    categoryId: 'cat-aksesuar',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 20,
    available: true,
    specifications: {
      'Ağırlık': '0.6 kg',
      'Malzeme': 'Çelik',
      'Uzunluk': '30 cm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-aksesuar-2',
    name: 'Kamp Kazığı Seti 8\'li',
    description: 'Çadır kurulumu için 8\'li alüminyum kazık seti.',
    category: 'aksesuar',
    categoryId: 'cat-aksesuar',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 25,
    available: true,
    specifications: {
      'Adet': '8 Adet',
      'Malzeme': 'Alüminyum',
      'Uzunluk': '20 cm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Nargile Ocakları
  {
    id: 'gear-nargile-1',
    name: 'Portatif Nargile Ocağı',
    description: 'Kamp için portatif nargile ocağı. Kolay taşınabilir, kompakt tasarım.',
    category: 'nargile-ocak',
    categoryId: 'cat-nargile-ocak',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 60,
    available: true,
    specifications: {
      'Yakıt': 'Kömür',
      'Ağırlık': '1.2 kg',
      'Kapasite': 'Standart',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Doğa Şömineleri
  {
    id: 'gear-somine-1',
    name: 'Doğa Şöminyesi Portatif',
    description: 'Kamp alanında kullanım için portatif doğa şöminyesi. Güvenli ateş yakma.',
    category: 'somine',
    categoryId: 'cat-somine',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 80,
    available: true,
    specifications: {
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '3.5 kg',
      'Kapasite': 'Orta',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Ateş Kutuları
  {
    id: 'gear-ates-1',
    name: 'Ateş Kutusu Çelik',
    description: 'Güvenli ateş yakma için çelik ateş kutusu. Taşınabilir ve dayanıklı.',
    category: 'ates-kutusu',
    categoryId: 'cat-ates-kutusu',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 55,
    available: true,
    specifications: {
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '4.2 kg',
      'Boyut': '60x40x30 cm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Rüzgarlıklar
  {
    id: 'gear-ruzgarlik-1',
    name: 'Kamp Rüzgarlığı 3x3m',
    description: 'Rüzgar ve güneşten korunma için 3x3 metre kamp rüzgarlığı.',
    category: 'ruzgarlik',
    categoryId: 'cat-ruzgarlik',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 40,
    available: true,
    specifications: {
      'Boyut': '3x3m',
      'Malzeme': 'Su Geçirmez Kumaş',
      'Ağırlık': '2.1 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kazma Kürek Seti
  {
    id: 'gear-kazma-1',
    name: 'Kazma Kürek Seti Çelik',
    description: 'Kamp alanı düzenleme için çelik kazma kürek seti. Dayanıklı ve pratik.',
    category: 'kazma-kurek',
    categoryId: 'cat-kazma-kurek',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 50,
    available: true,
    specifications: {
      'Set İçeriği': 'Kazma + Kürek',
      'Malzeme': 'Çelik',
      'Ağırlık': '2.8 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Baltaları
  {
    id: 'gear-balta-1',
    name: 'Kamp Baltası Orta Boy',
    description: 'Odun kesme ve yarma için orta boy kamp baltası. Güvenli sap tasarımı.',
    category: 'balta',
    categoryId: 'cat-balta',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 60,
    available: true,
    specifications: {
      'Bıçak Uzunluğu': '15 cm',
      'Sap Uzunluğu': '60 cm',
      'Ağırlık': '1.2 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Hamaklar
  {
    id: 'gear-hamak-1',
    name: 'Kamp Hamakı 2 Kişilik',
    description: 'Rahatlamak için 2 kişilik kamp hamakı. Güçlü iplik yapısı, kolay kurulum.',
    category: 'hamak',
    categoryId: 'cat-hamak',
    images: [
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'
    ],
    pricePerDay: 45,
    available: true,
    specifications: {
      'Kapasite': '2 Kişi',
      'Ağırlık': '0.8 kg',
      'Yük': '200 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-hamak-2',
    name: 'Kamp Hamakı Tek Kişilik',
    description: 'Hafif ve kompakt tek kişilik kamp hamakı. Backpacking için ideal.',
    category: 'hamak',
    categoryId: 'cat-hamak',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 35,
    available: true,
    specifications: {
      'Kapasite': '1 Kişi',
      'Ağırlık': '0.5 kg',
      'Yük': '150 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Uyku Tulumları
  {
    id: 'gear-uyku-1',
    name: 'Uyku Tulumu -15°C',
    description: 'Soğuk hava koşullarına dayanıklı uyku tulumu. -15°C\'ye kadar koruma.',
    category: 'uyku-tulumu',
    categoryId: 'cat-uyku-tulumu',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'
    ],
    pricePerDay: 90,
    available: true,
    specifications: {
      'Sıcaklık': '-15°C',
      'Ağırlık': '2.1 kg',
      'Malzeme': 'Kaz Tüyü',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-uyku-2',
    name: 'Uyku Tulumu -5°C',
    description: 'İlkbahar/sonbahar için uyku tulumu. Hafif ve kompakt.',
    category: 'uyku-tulumu',
    categoryId: 'cat-uyku-tulumu',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 70,
    available: true,
    specifications: {
      'Sıcaklık': '-5°C',
      'Ağırlık': '1.5 kg',
      'Malzeme': 'Sentetik',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Matı
  {
    id: 'gear-mati-1',
    name: 'Kamp Matı İzolasyonlu',
    description: 'Soğuktan koruyan izolasyonlu kamp matı. Şişirilebilir, kompakt.',
    category: 'kamp-mati',
    categoryId: 'cat-kamp-mati',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 40,
    available: true,
    specifications: {
      'Kalınlık': '5 cm',
      'Ağırlık': '0.8 kg',
      'R Değeri': '4.2',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-mati-2',
    name: 'Kamp Matı Self-Inflating',
    description: 'Otomatik şişen kamp matı. Kolay kullanım, yüksek konfor.',
    category: 'kamp-mati',
    categoryId: 'cat-kamp-mati',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 50,
    available: true,
    specifications: {
      'Kalınlık': '7.5 cm',
      'Ağırlık': '1.1 kg',
      'R Değeri': '5.7',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Dedantörler
  {
    id: 'gear-dedantor-1',
    name: 'Dedantör LPG Regülatörü',
    description: 'LPG tüpler için güvenli dedantör regülatörü. Standart bağlantı.',
    category: 'dedantor',
    categoryId: 'cat-dedantor',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 30,
    available: true,
    specifications: {
      'Basınç': '30 mbar',
      'Bağlantı': 'Standart',
      'Malzeme': 'Pirınç',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-dedantor-2',
    name: 'Dedantör Çift Çıkışlı',
    description: 'İki cihazı bağlamak için çift çıkışlı dedantör. Pratik kullanım.',
    category: 'dedantor',
    categoryId: 'cat-dedantor',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 45,
    available: true,
    specifications: {
      'Basınç': '30 mbar',
      'Çıkış': '2 Adet',
      'Malzeme': 'Pirınç',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kaynak Takımları
  {
    id: 'gear-kaynak-1',
    name: 'Kaynak Takımı Portatif',
    description: 'Kamp için portatif kaynak takımı. Hızlı onarım çözümü.',
    category: 'kaynak',
    categoryId: 'cat-kaynak',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 85,
    available: true,
    specifications: {
      'Güç': 'Ampul',
      'Ağırlık': '2.5 kg',
      'Kullanım': 'Basit Kaynak',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // LPG Hortumları
  {
    id: 'gear-hortum-1',
    name: 'LPG Hortumu 1 Metre',
    description: 'LPG bağlantıları için 1 metre güvenli hortum. TSE onaylı.',
    category: 'lpg-hortum',
    categoryId: 'cat-lpg-hortum',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 20,
    available: true,
    specifications: {
      'Uzunluk': '1 metre',
      'Çap': '8mm',
      'Basınç': '30 bar',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-hortum-2',
    name: 'LPG Hortumu 2 Metre',
    description: 'Uzun mesafeli bağlantılar için 2 metre LPG hortumu.',
    category: 'lpg-hortum',
    categoryId: 'cat-lpg-hortum',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 30,
    available: true,
    specifications: {
      'Uzunluk': '2 metre',
      'Çap': '8mm',
      'Basınç': '30 bar',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Orgaz Ocakları
  {
    id: 'gear-orgaz-ocak-1',
    name: 'Orgaz Ocağı Tek Gözlü',
    description: 'Kamp için tek gözlü orgaz ocağı. Güçlü alev, hızlı pişirme.',
    category: 'orgaz-ocak',
    categoryId: 'cat-orgaz-ocak',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 75,
    available: true,
    specifications: {
      'Gözlü': '1 Adet',
      'Güç': '3 kW',
      'Yakıt': 'LPG',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-orgaz-ocak-2',
    name: 'Orgaz Ocağı Çift Gözlü',
    description: 'İki gözlü orgaz ocağı. Aynı anda iki tencere pişirme imkanı.',
    category: 'orgaz-ocak',
    categoryId: 'cat-orgaz-ocak',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 110,
    available: true,
    specifications: {
      'Gözlü': '2 Adet',
      'Güç': '6 kW',
      'Yakıt': 'LPG',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Orgaz Sobaları
  {
    id: 'gear-orgaz-soba-1',
    name: 'Orgaz Sobası Portatif',
    description: 'Kamp alanını ısıtmak için portatif orgaz sobası. Termostatlı.',
    category: 'orgaz-soba',
    categoryId: 'cat-orgaz-soba',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 95,
    available: true,
    specifications: {
      'Güç': '3 kW',
      'Yakıt': 'LPG',
      'Ağırlık': '5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-orgaz-soba-2',
    name: 'Orgaz Sobası Güçlü',
    description: 'Büyük alanlar için güçlü orgaz sobası. Hızlı ısıtma, verimli yanma.',
    category: 'orgaz-soba',
    categoryId: 'cat-orgaz-soba',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 130,
    available: true,
    specifications: {
      'Güç': '5 kW',
      'Yakıt': 'LPG',
      'Ağırlık': '7 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Tüp Muslukları
  {
    id: 'gear-musluk-1',
    name: 'Tüp Musluğu Standart',
    description: 'LPG tüpler için standart tüp musluğu. Güvenli kapatma mekanizması.',
    category: 'tup-musluk',
    categoryId: 'cat-tup-musluk',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 25,
    available: true,
    specifications: {
      'Bağlantı': 'Standart',
      'Malzeme': 'Pirınç',
      'Tip': 'Valf',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Tenceresi ve Tavalar
  {
    id: 'gear-tencere-1',
    name: 'Çelik Kamp Tenceresi Seti 3\'lü',
    description: 'Kamp yemekleri için 3 parçalı çelik tencere seti. Farklı boyutlarda, iç içe geçen tasarım, az yer kaplar.',
    category: 'tencere-tava',
    categoryId: 'cat-tencere-tava',
    images: [
      'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'
    ],
    pricePerDay: 55,
    available: true,
    specifications: {
      'Parça Sayısı': '3 Adet',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '1.8 kg',
      'Kapasite': '1L, 1.5L, 2L',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-tencere-2',
    name: 'Non-Stick Kamp Tavası 26cm',
    description: 'Yapışmaz kaplamalı kamp tavası. Kolay temizlenir, hafif ve dayanıklı. Omlet, yumurta ve diğer yemekler için ideal.',
    category: 'tencere-tava',
    categoryId: 'cat-tencere-tava',
    images: [
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'
    ],
    pricePerDay: 40,
    available: true,
    specifications: {
      'Çap': '26 cm',
      'Malzeme': 'Non-Stick Kaplama',
      'Ağırlık': '0.6 kg',
      'Kapasite': '2-3 Kişi',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-tencere-3',
    name: 'Titanyum Tencere Seti 2\'li',
    description: 'Ultra hafif titanyum tencere seti. Backpacking için mükemmel. Sadece 450 gram!',
    category: 'tencere-tava',
    categoryId: 'cat-tencere-tava',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 65,
    available: true,
    specifications: {
      'Parça Sayısı': '2 Adet',
      'Malzeme': 'Titanyum',
      'Ağırlık': '0.45 kg',
      'Kapasite': '750ml, 1L',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-tencere-4',
    name: 'Döküm Kamp Tavası 28cm',
    description: 'Kaliteli döküm kamp tavası. Mükemmel ısı dağılımı, doğal non-stick özellik. Tüm yemekler için ideal.',
    category: 'tencere-tava',
    categoryId: 'cat-tencere-tava',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 70,
    available: true,
    specifications: {
      'Çap': '28 cm',
      'Malzeme': 'Döküm Demir',
      'Ağırlık': '2.2 kg',
      'Kapasite': '4-5 Kişi',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-tencere-5',
    name: 'Kamp Tencere Seti 4\'lü Alüminyum',
    description: 'Hafif alüminyum kamp tencere seti. 4 farklı boyutta tencere, iç içe geçen tasarım. Aile kampları için ideal.',
    category: 'tencere-tava',
    categoryId: 'cat-tencere-tava',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 60,
    available: true,
    specifications: {
      'Parça Sayısı': '4 Adet',
      'Malzeme': 'Alüminyum',
      'Ağırlık': '2.5 kg',
      'Kapasite': '1L, 1.5L, 2L, 3L',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-tencere-6',
    name: 'Derin Kamp Tavası 30cm',
    description: 'Derin yapılı kamp tavası. Güveç, pilav ve daha fazlası için mükemmel. Kapaklı tasarım.',
    category: 'tencere-tava',
    categoryId: 'cat-tencere-tava',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 50,
    available: true,
    specifications: {
      'Çap': '30 cm',
      'Derinlik': '8 cm',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '1.1 kg',
      'Kapasite': '4-6 Kişi',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-tencere-7',
    name: 'Kamp Wok Tavası 32cm',
    description: 'Asya usulü yemekler için wok tavası. Hızlı pişirme, yüksek ısıya dayanıklı. Karışık sebze ve et yemekleri için ideal.',
    category: 'tencere-tava',
    categoryId: 'cat-tencere-tava',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    pricePerDay: 45,
    available: true,
    specifications: {
      'Çap': '32 cm',
      'Malzeme': 'Karbon Çelik',
      'Ağırlık': '0.9 kg',
      'Tip': 'Wok',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-tencere-8',
    name: 'Kamp Çift Tabanlı Tencere Seti',
    description: 'Çift tabanlı ısı dağılımı ile kamp tencere seti. Eşit pişirme, yanmayı önler. 2\'li set.',
    category: 'tencere-tava',
    categoryId: 'cat-tencere-tava',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 75,
    available: true,
    specifications: {
      'Parça Sayısı': '2 Adet',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '2.0 kg',
      'Özellik': 'Çift Tabanlı',
      'Kapasite': '2L, 3L',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Ocakları
  {
    id: 'gear-ocak-1',
    name: 'Gaz Kartuşlu Kamp Ocağı',
    description: 'Hafif ve taşınabilir gaz kartuşlu kamp ocağı. Hızlı ısınma, düzenli alev. Tek gözlü.',
    category: 'kamp-ocaklari',
    categoryId: 'cat-kamp-ocaklari',
    images: [
      'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'
    ],
    pricePerDay: 50,
    available: true,
    brand: 'MSR',
    color: 'Kırmızı',
    rating: 4.5,
    specifications: {
      'Gözlü': '1 Adet',
      'Yakıt': 'Gaz Kartuşu',
      'Güç': '3000W',
      'Ağırlık': '0.5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-ocak-2',
    name: 'Çift Alevli Kamp Ocağı',
    description: 'İki alevli profesyonel kamp ocağı. Aynı anda iki tencere pişirme imkanı. Güçlü alev çıkışı.',
    category: 'kamp-ocaklari',
    categoryId: 'cat-kamp-ocaklari',
    images: [
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'
    ],
    pricePerDay: 70,
    available: true,
    specifications: {
      'Gözlü': '2 Adet',
      'Yakıt': 'Gaz Kartuşu',
      'Güç': '6000W',
      'Ağırlık': '0.9 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-ocak-3',
    name: 'Benzinli Kamp Ocağı',
    description: 'Yüksek performanslı benzinli kamp ocağı. Dondurucu soğuklarda bile çalışır. Profesyonel kullanım.',
    category: 'kamp-ocaklari',
    categoryId: 'cat-kamp-ocaklari',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 85,
    available: true,
    specifications: {
      'Gözlü': '1 Adet',
      'Yakıt': 'Benzin',
      'Güç': '3500W',
      'Ağırlık': '1.2 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-ocak-4',
    name: 'Ultra Hafif Titan Ocağı',
    description: 'Sadece 85 gram! Ultra hafif titanyum kamp ocağı. Backpacking için ideal, minimal ağırlık.',
    category: 'kamp-ocaklari',
    categoryId: 'cat-kamp-ocaklari',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    pricePerDay: 40,
    available: true,
    specifications: {
      'Gözlü': '1 Adet',
      'Yakıt': 'Gaz Kartuşu',
      'Güç': '2500W',
      'Ağırlık': '0.085 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Termos ve Mug
  {
    id: 'gear-termos-1',
    name: 'Paslanmaz Çelik Termos 1L',
    description: '24 saat sıcaklık koruması. Paslanmaz çelik yapı, sızdırmaz kapak. Çay ve kahvenizi saatlerce sıcak tutar.',
    category: 'termos',
    categoryId: 'cat-termos',
    images: [
      'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'
    ],
    pricePerDay: 30,
    available: true,
    brand: 'Stanley',
    color: 'Gümüş',
    rating: 4.8,
    specifications: {
      'Kapasite': '1 Litre',
      'Malzeme': 'Paslanmaz Çelik',
      'Koruma Süresi': '24 saat',
      'Ağırlık': '0.6 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-termos-2',
    name: 'Kamp Mug Seti 2\'li',
    description: 'İzolasyonlu çift cidarlı kamp mugları. Sıcak içecekler için ideal. Kompakt tasarım.',
    category: 'termos',
    categoryId: 'cat-termos',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 20,
    available: true,
    specifications: {
      'Adet': '2 Adet',
      'Malzeme': 'Paslanmaz Çelik',
      'Kapasite': '350ml',
      'Ağırlık': '0.4 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-termos-3',
    name: 'Vakum İzolasyonlu Termos 750ml',
    description: 'Vakum izolasyon teknolojisi ile mükemmel sıcaklık koruması. Uzun süreli sıcaklık garantisi.',
    category: 'termos',
    categoryId: 'cat-termos',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 35,
    available: true,
    specifications: {
      'Kapasite': '750ml',
      'Malzeme': 'Vakum İzolasyonlu',
      'Koruma Süresi': '12 saat',
      'Ağırlık': '0.5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-termos-4',
    name: 'Termos 500ml Kompakt',
    description: 'Küçük ve hafif kompakt termos. Seyahat için ideal, az yer kaplar.',
    category: 'termos',
    categoryId: 'cat-termos',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 25,
    available: true,
    specifications: {
      'Kapasite': '500ml',
      'Malzeme': 'Paslanmaz Çelik',
      'Koruma Süresi': '8 saat',
      'Ağırlık': '0.3 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Çatal Kaşık Bıçak Setleri
  {
    id: 'gear-mutfak-set-1',
    name: 'Paslanmaz Çelik Kamp Seti',
    description: '4 kişilik paslanmaz çelik çatal-kaşık-bıçak seti. Dayanıklı ve kolay temizlenir. Kompakt taşıma çantası dahil.',
    category: 'mutfak-setleri',
    categoryId: 'cat-mutfak-setleri',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 25,
    available: true,
    specifications: {
      'Kişi': '4 Kişi',
      'Parça': '16 Adet',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '0.8 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-mutfak-set-2',
    name: 'Katlanır Çatal-Bıçak Seti',
    description: 'Kompakt katlanır tasarım. Seyahat için mükemmel, az yer kaplar. 2\'li set.',
    category: 'mutfak-setleri',
    categoryId: 'cat-mutfak-setleri',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 18,
    available: true,
    specifications: {
      'Kişi': '2 Kişi',
      'Parça': '6 Adet',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '0.3 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-mutfak-set-3',
    name: 'Titanyum Kamp Seti 2\'li',
    description: 'Ultra hafif titanyum malzeme. Backpacking için ideal, sadece 50 gram. Dayanıklı ve hafif.',
    category: 'mutfak-setleri',
    categoryId: 'cat-mutfak-setleri',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 30,
    available: true,
    specifications: {
      'Kişi': '2 Kişi',
      'Parça': '6 Adet',
      'Malzeme': 'Titanyum',
      'Ağırlık': '0.05 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-mutfak-set-4',
    name: 'Çok Amaçlı Kamp Çatalı',
    description: 'Çatal, kaşık, bıçak ve açacak fonksiyonları bir arada. Tek parça, pratik kullanım.',
    category: 'mutfak-setleri',
    categoryId: 'cat-mutfak-setleri',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 15,
    available: true,
    specifications: {
      'Fonksiyon': 'Çatal + Kaşık + Bıçak',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '0.1 kg',
      'Parça': '1 Adet',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Barbekü, Mangal ve Izgaralar
  {
    id: 'gear-barbeku-1',
    name: 'Katlanır Mangal 60cm',
    description: 'Kolay taşınabilir katlanır mangal. Kömür veya odun kullanımı için ideal. Ayarlanabilir ızgara yüksekliği.',
    category: 'barbeku',
    categoryId: 'cat-barbeku',
    images: [
      'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'
    ],
    pricePerDay: 60,
    available: true,
    specifications: {
      'Boyut': '60cm',
      'Malzeme': 'Paslanmaz Çelik',
      'Yakıt': 'Kömür/Odun',
      'Ağırlık': '3.5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-barbeku-2',
    name: 'Portatif Barbekü',
    description: 'Kompakt portatif barbekü. Izgara ve kapaklı tasarım, mükemmel ısı dağılımı. Aileler için ideal.',
    category: 'barbeku',
    categoryId: 'cat-barbeku',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 75,
    available: true,
    specifications: {
      'Boyut': '40x30cm',
      'Malzeme': 'Paslanmaz Çelik',
      'Kapasite': '4-6 Kişi',
      'Ağırlık': '5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-barbeku-3',
    name: 'Kamp Izgara Seti',
    description: 'Ayarlanabilir yükseklikte ızgara. Kömür tepsi ve toplayıcı dahil. Kompakt taşıma çantası.',
    category: 'barbeku',
    categoryId: 'cat-barbeku',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 50,
    available: true,
    specifications: {
      'Boyut': '50cm',
      'Malzeme': 'Çelik',
      'Özellik': 'Ayarlanabilir Yükseklik',
      'Ağırlık': '4 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-barbeku-4',
    name: 'Mini Kamp Mangalı',
    description: 'Küçük gruplar için mini kamp mangalı. Hafif ve kompakt, hızlı kurulum.',
    category: 'barbeku',
    categoryId: 'cat-barbeku',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 40,
    available: true,
    specifications: {
      'Boyut': '35cm',
      'Malzeme': 'Çelik',
      'Kapasite': '2-3 Kişi',
      'Ağırlık': '2 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Çaydanlıkları
  {
    id: 'gear-caydanlik-1',
    name: 'Paslanmaz Çelik Çaydanlık',
    description: '1.5L kapasiteli paslanmaz çelik çaydanlık. Hızlı kaynatma, dayanıklı yapı. Kolay temizlenir.',
    category: 'caydanlik',
    categoryId: 'cat-caydanlik',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 30,
    available: true,
    specifications: {
      'Kapasite': '1.5 Litre',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '0.8 kg',
      'Kullanım': 'Gaz Ocağı',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-caydanlik-2',
    name: 'Kamp Çaydanlığı Kompakt',
    description: 'Kompakt tasarım kamp çaydanlığı. Seyahat için ideal, az yer kaplar. 1L kapasite.',
    category: 'caydanlik',
    categoryId: 'cat-caydanlik',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 25,
    available: true,
    specifications: {
      'Kapasite': '1 Litre',
      'Malzeme': 'Alüminyum',
      'Ağırlık': '0.4 kg',
      'Kullanım': 'Gaz Ocağı',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-caydanlik-3',
    name: 'Elektrikli Kamp Çaydanlığı',
    description: 'Elektrikle çalışan kamp çaydanlığı. Otomatik kapanma özelliği, hızlı kaynatma.',
    category: 'caydanlik',
    categoryId: 'cat-caydanlik',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 35,
    available: true,
    specifications: {
      'Kapasite': '1.7 Litre',
      'Güç': '2000W',
      'Ağırlık': '1.1 kg',
      'Kullanım': 'Elektrik',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kupa Bardaklar
  {
    id: 'gear-kupa-1',
    name: 'İzolasyonlu Kupa Seti 4\'lü',
    description: 'Çift cidarlı izolasyonlu kupalar. Sıcak içecekler için mükemmel, soğuk içecekler de soğuk kalır.',
    category: 'kupa-bardak',
    categoryId: 'cat-kupa-bardak',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 22,
    available: true,
    specifications: {
      'Adet': '4 Adet',
      'Kapasite': '350ml',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '0.6 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-kupa-2',
    name: 'Kollapsible Kamp Kupa',
    description: 'Katlanabilir kamp kupası. Çok az yer kaplar, seyahat için ideal. 400ml kapasite.',
    category: 'kupa-bardak',
    categoryId: 'cat-kupa-bardak',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 15,
    available: true,
    specifications: {
      'Adet': '1 Adet',
      'Kapasite': '400ml',
      'Malzeme': 'Silikon',
      'Ağırlık': '0.1 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-kupa-3',
    name: 'Paslanmaz Çelik Kupa',
    description: 'Dayanıklı paslanmaz çelik kupa. Isıyı korur, darbeye dayanıklı. 500ml kapasite.',
    category: 'kupa-bardak',
    categoryId: 'cat-kupa-bardak',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    pricePerDay: 18,
    available: true,
    specifications: {
      'Adet': '1 Adet',
      'Kapasite': '500ml',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '0.3 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-kupa-4',
    name: 'Bambu Kamp Kupası Seti',
    description: 'Doğal bambu malzemeden kamp kupası seti. Çevre dostu, hafif ve şık tasarım.',
    category: 'kupa-bardak',
    categoryId: 'cat-kupa-bardak',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 20,
    available: true,
    specifications: {
      'Adet': '4 Adet',
      'Kapasite': '300ml',
      'Malzeme': 'Bambu',
      'Ağırlık': '0.5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Diğer Kamp Mutfak Ürünleri
  {
    id: 'gear-mutfak-diger-1',
    name: 'Kamp Kesme Tahtası',
    description: 'Hafif ve kompakt kesme tahtası. Kolay temizlenir, katlanabilir tasarım. Hijyenik kullanım.',
    category: 'mutfak-diger',
    categoryId: 'cat-mutfak-diger',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 18,
    available: true,
    specifications: {
      'Boyut': '30x20cm',
      'Malzeme': 'Plastik',
      'Ağırlık': '0.3 kg',
      'Özellik': 'Katlanabilir',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-mutfak-diger-2',
    name: 'Kamp Mutfak Seti',
    description: 'Açacak, süzgeç, kaşık ve diğer mutfak gereçleri içeren kompakt set. Pratik çözüm.',
    category: 'mutfak-diger',
    categoryId: 'cat-mutfak-diger',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 25,
    available: true,
    specifications: {
      'Parça': '12 Adet',
      'İçerik': 'Açacak, Süzgeç, Kaşık vb.',
      'Malzeme': 'Paslanmaz Çelik',
      'Ağırlık': '0.6 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-mutfak-diger-3',
    name: 'Su Filtresi ve Sürahi',
    description: 'Kamp için su filtreleme sistemi. Temiz içme suyu garantisi. Portatif tasarım.',
    category: 'mutfak-diger',
    categoryId: 'cat-mutfak-diger',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 35,
    available: true,
    specifications: {
      'Kapasite': '2 Litre',
      'Filtre Tipi': 'Aktif Karbon',
      'Ağırlık': '0.8 kg',
      'Kullanım': 'Portatif',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-mutfak-diger-4',
    name: 'Kamp Mutfak Önlüğü',
    description: 'Yemek yaparken koruma için kamp mutfak önlüğü. Su geçirmez kumaş, pratik kullanım.',
    category: 'mutfak-diger',
    categoryId: 'cat-mutfak-diger',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    pricePerDay: 12,
    available: true,
    specifications: {
      'Malzeme': 'Su Geçirmez Kumaş',
      'Boyut': 'Standart',
      'Ağırlık': '0.1 kg',
      'Renk': 'Çok Renkli',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Masası
  {
    id: 'gear-masa-1',
    name: 'Katlanır Kamp Masası Alüminyum',
    description: 'Hafif alüminyum kamp masası. 4 kişilik, katlanır tasarım, kolay taşınır. Hızlı kurulum.',
    category: 'kamp-masasi',
    categoryId: 'cat-kamp-masasi',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'
    ],
    pricePerDay: 45,
    available: true,
    specifications: {
      'Kapasite': '4 Kişi',
      'Boyut': '90x60cm',
      'Malzeme': 'Alüminyum',
      'Ağırlık': '2.5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-masa-2',
    name: 'Kompakt Kamp Masası Çelik',
    description: 'Dayanıklı çelik yapı, 6 kişilik geniş masa. Ayarlanabilir yükseklik. Aileler için ideal.',
    category: 'kamp-masasi',
    categoryId: 'cat-kamp-masasi',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 60,
    available: true,
    specifications: {
      'Kapasite': '6 Kişi',
      'Boyut': '120x70cm',
      'Malzeme': 'Çelik',
      'Ağırlık': '4.2 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-masa-3',
    name: 'Kamp Masası Portatif',
    description: 'Ultra hafif portatif kamp masası. Backpacking için ideal, sadece 2 kg. Kompakt tasarım.',
    category: 'kamp-masasi',
    categoryId: 'cat-kamp-masasi',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 40,
    available: true,
    specifications: {
      'Kapasite': '2-3 Kişi',
      'Boyut': '70x50cm',
      'Malzeme': 'Alüminyum',
      'Ağırlık': '2 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Sandalyesi
  {
    id: 'gear-sandalye-1',
    name: 'Katlanır Kamp Sandalyesi',
    description: 'Konforlu kamp sandalyesi. Ergonomik tasarım, 120kg taşıma kapasitesi. Kolay kurulum.',
    category: 'kamp-sandalyesi',
    categoryId: 'cat-kamp-sandalyesi',
    images: [
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'
    ],
    pricePerDay: 30,
    available: true,
    specifications: {
      'Yük Kapasitesi': '120 kg',
      'Malzeme': 'Çelik + Kumaş',
      'Ağırlık': '2.2 kg',
      'Özellik': 'Katlanır',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-sandalye-2',
    name: 'Sırt Desteği Kamp Sandalyesi',
    description: 'Yüksek sırt desteği olan kamp sandalyesi. Uzun süreli oturma için ideal. Rahat ve dayanıklı.',
    category: 'kamp-sandalyesi',
    categoryId: 'cat-kamp-sandalyesi',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 35,
    available: true,
    specifications: {
      'Yük Kapasitesi': '130 kg',
      'Malzeme': 'Çelik + Kumaş',
      'Ağırlık': '2.8 kg',
      'Özellik': 'Yüksek Sırt Desteği',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-sandalye-3',
    name: 'Kamp Sandalyesi Ultra Hafif',
    description: 'Sadece 850 gram! Ultra hafif kamp sandalyesi. Kompakt ve dayanıklı. Backpacking için mükemmel.',
    category: 'kamp-sandalyesi',
    categoryId: 'cat-kamp-sandalyesi',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 28,
    available: true,
    specifications: {
      'Yük Kapasitesi': '100 kg',
      'Malzeme': 'Alüminyum',
      'Ağırlık': '0.85 kg',
      'Özellik': 'Ultra Hafif',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Taburesi
  {
    id: 'gear-tabure-1',
    name: 'Kamp Taburesi Alüminyum',
    description: 'Hafif alüminyum kamp taburesi. Kompakt ve dayanıklı. Pratik kullanım.',
    category: 'kamp-taburesi',
    categoryId: 'cat-kamp-taburesi',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 20,
    available: true,
    specifications: {
      'Yük Kapasitesi': '100 kg',
      'Malzeme': 'Alüminyum',
      'Ağırlık': '0.6 kg',
      'Yükseklik': '45 cm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-tabure-2',
    name: 'Kamp Taburesi Çelik',
    description: 'Dayanıklı çelik yapı, 150kg taşıma kapasitesi. Süngerli oturma yüzeyi. Konforlu kullanım.',
    category: 'kamp-taburesi',
    categoryId: 'cat-kamp-taburesi',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    pricePerDay: 22,
    available: true,
    specifications: {
      'Yük Kapasitesi': '150 kg',
      'Malzeme': 'Çelik',
      'Ağırlık': '1.2 kg',
      'Yükseklik': '45 cm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kampet
  {
    id: 'gear-kampet-1',
    name: 'Kampet - Kamp Yatak',
    description: 'Rahat kamp yatağı. Şişirilebilir, kompakt taşıma çantası dahil. Yüksek konfor garantisi.',
    category: 'kampet',
    categoryId: 'cat-kampet',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    pricePerDay: 40,
    available: true,
    specifications: {
      'Kapasite': '1 Kişi',
      'Boyut': '193x76cm',
      'Malzeme': 'PVC',
      'Ağırlık': '1.8 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-kampet-2',
    name: 'Premium Kampet Seti',
    description: 'Çift kişilik kampet seti. Yüksek konfor, otomatik şişirme sistemi. Lüks kamp deneyimi.',
    category: 'kampet',
    categoryId: 'cat-kampet',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'
    ],
    pricePerDay: 70,
    available: true,
    specifications: {
      'Kapasite': '2 Kişi',
      'Boyut': '203x152cm',
      'Malzeme': 'PVC',
      'Ağırlık': '3.5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-kampet-3',
    name: 'Self-Inflating Kamp Matı',
    description: 'Otomatik şişen kamp matı. Isı izolasyonu, kompakt tasarım. Backpacking için ideal.',
    category: 'kampet',
    categoryId: 'cat-kampet',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 35,
    available: true,
    specifications: {
      'Boyut': '183x52cm',
      'Kalınlık': '5 cm',
      'Malzeme': 'Self-Inflating',
      'Ağırlık': '1.1 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Fenerleri
  {
    id: 'gear-fener-1',
    name: 'LED Kamp Feneri Güçlü',
    description: '2000 lümen güçlü LED kamp feneri. Su geçirmez, uzun batarya ömrü. Geniş alan aydınlatması.',
    category: 'kamp-fenerleri',
    categoryId: 'cat-kamp-fenerleri',
    images: [
      'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ],
    pricePerDay: 25,
    available: true,
    specifications: {
      'Işık Gücü': '2000 Lümen',
      'Pil Ömrü': '12 saat',
      'Su Geçirmez': 'IPX6',
      'Ağırlık': '0.5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-fener-2',
    name: 'Kafa Feneri LED',
    description: 'Eller serbest kullanım için kafa feneri. 3 mod ayarı, hafif ve ergonomik. Gece yürüyüşleri için ideal.',
    category: 'kamp-fenerleri',
    categoryId: 'cat-kamp-fenerleri',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 18,
    available: true,
    specifications: {
      'Işık Gücü': '500 Lümen',
      'Pil Ömrü': '20 saat',
      'Tip': 'Kafa Feneri',
      'Ağırlık': '0.15 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-fener-3',
    name: 'Portatif Güneş Enerjili Fener',
    description: 'Güneş enerjisi ile şarj olan kamp feneri. Çevre dostu, uzun kullanım. USB şarj seçeneği.',
    category: 'kamp-fenerleri',
    categoryId: 'cat-kamp-fenerleri',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 30,
    available: true,
    specifications: {
      'Işık Gücü': '800 Lümen',
      'Şarj': 'Güneş + USB',
      'Pil Ömrü': '15 saat',
      'Ağırlık': '0.4 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-fener-4',
    name: 'Kamp Feneri El Feneri',
    description: 'Kompakt el feneri. Yüksek parlaklık, uzun menzil, su geçirmez. Pratik taşıma çantası dahil.',
    category: 'kamp-fenerleri',
    categoryId: 'cat-kamp-fenerleri',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 20,
    available: true,
    specifications: {
      'Işık Gücü': '1000 Lümen',
      'Menzil': '200 metre',
      'Su Geçirmez': 'IPX5',
      'Ağırlık': '0.25 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Kamp Lambaları
  {
    id: 'gear-lamba-1',
    name: 'LED Kamp Lambası',
    description: 'Çadır içi kullanım için LED kamp lambası. Dimmer özelliği, uzun batarya ömrü. Yumuşak ışık.',
    category: 'kamp-lambalari',
    categoryId: 'cat-kamp-lambalari',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'
    ],
    pricePerDay: 22,
    available: true,
    specifications: {
      'Işık Gücü': '300 Lümen',
      'Pil Ömrü': '50 saat',
      'Özellik': 'Dimmer',
      'Ağırlık': '0.3 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-lamba-2',
    name: 'Asılı Kamp Lambası',
    description: 'Çadır tavanına asılabilir kamp lambası. Yumuşak ışık, USB şarj. 360° aydınlatma.',
    category: 'kamp-lambalari',
    categoryId: 'cat-kamp-lambalari',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 25,
    available: true,
    specifications: {
      'Işık Gücü': '400 Lümen',
      'Şarj': 'USB',
      'Pil Ömrü': '30 saat',
      'Ağırlık': '0.35 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-lamba-3',
    name: 'Gaz Lambası Klasik',
    description: 'Geleneksel gaz lambası. Romantik atmosfer, uzun yanma süresi. Nostaljik kamp deneyimi.',
    category: 'kamp-lambalari',
    categoryId: 'cat-kamp-lambalari',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    pricePerDay: 35,
    available: true,
    specifications: {
      'Yakıt': 'Gaz Yağı',
      'Yanma Süresi': '8 saat',
      'Işık Gücü': 'Klasik Alev',
      'Ağırlık': '0.8 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-lamba-4',
    name: 'Kamp Lambası Portatif',
    description: 'Taşınabilir kamp lambası. Çoklu modlar, uzun ömürlü batarya. Su geçirmez tasarım.',
    category: 'kamp-lambalari',
    categoryId: 'cat-kamp-lambalari',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 24,
    available: true,
    specifications: {
      'Işık Gücü': '350 Lümen',
      'Mod': '3 Mod',
      'Pil Ömrü': '40 saat',
      'Ağırlık': '0.4 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Çadır Sobaları
  {
    id: 'gear-cadir-soba-1',
    name: 'Çadır Sobası Döküm',
    description: 'Döküm çadır sobası. Uzun süreli ısıtma, güvenli kullanım, baca sistemi dahil. Kış kampları için ideal.',
    category: 'cadir-sobalari',
    categoryId: 'cat-cadir-sobalari',
    images: [
      'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'
    ],
    pricePerDay: 125,
    available: true,
    specifications: {
      'Güç': '4 kW',
      'Yakıt': 'Odun/Kömür',
      'Malzeme': 'Döküm Demir',
      'Ağırlık': '15 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-cadir-soba-2',
    name: 'Portatif Çadır Sobası',
    description: 'Hafif ve taşınabilir çadır sobası. Çelik yapı, kolay montaj. Kompakt tasarım.',
    category: 'cadir-sobalari',
    categoryId: 'cat-cadir-sobalari',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 95,
    available: true,
    specifications: {
      'Güç': '3 kW',
      'Yakıt': 'Odun/Kömür',
      'Malzeme': 'Çelik',
      'Ağırlık': '8 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-cadir-soba-3',
    name: 'Mini Çadır Sobası',
    description: 'Küçük çadırlar için kompakt soba. Verimli yanma, güvenlik özellikleri. Hızlı ısıtma.',
    category: 'cadir-sobalari',
    categoryId: 'cat-cadir-sobalari',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 80,
    available: true,
    specifications: {
      'Güç': '2.5 kW',
      'Yakıt': 'Odun/Kömür',
      'Malzeme': 'Çelik',
      'Ağırlık': '5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // LPG Tüp Sobaları
  {
    id: 'gear-lpg-soba-1',
    name: 'LPG Tüp Sobası 3KW',
    description: 'Güçlü LPG sobası. Termostatlı, güvenlik sensörü, hızlı ısıtma. Büyük çadırlar için ideal.',
    category: 'lpg-tup-sobalari',
    categoryId: 'cat-lpg-tup-sobalari',
    images: [
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'
    ],
    pricePerDay: 75,
    available: true,
    specifications: {
      'Güç': '3 kW',
      'Yakıt': 'LPG',
      'Özellik': 'Termostatlı',
      'Ağırlık': '4.5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-lpg-soba-2',
    name: 'Katalitik LPG Sobası',
    description: 'Oksijen sensörlü katalitik soba. Güvenli, verimli, düşük yakıt tüketimi. Sessiz çalışma.',
    category: 'lpg-tup-sobalari',
    categoryId: 'cat-lpg-tup-sobalari',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 85,
    available: true,
    specifications: {
      'Güç': '3.5 kW',
      'Yakıt': 'LPG',
      'Tip': 'Katalitik',
      'Ağırlık': '5 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-lpg-soba-3',
    name: 'LPG Sobası Portatif',
    description: 'Hafif portatif LPG sobası. Hızlı kurulum, termostat kontrolü. Küçük alanlar için ideal.',
    category: 'lpg-tup-sobalari',
    categoryId: 'cat-lpg-tup-sobalari',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 70,
    available: true,
    specifications: {
      'Güç': '2.5 kW',
      'Yakıt': 'LPG',
      'Ağırlık': '3.5 kg',
      'Özellik': 'Portatif',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Portatif Sobalar
  {
    id: 'gear-portatif-soba-1',
    name: 'Portatif Gaz Sobası',
    description: 'Küçük ve kompakt portatif soba. Kartuşlu, hızlı kurulum. Kişisel kullanım için ideal.',
    category: 'portatif-sobalar',
    categoryId: 'cat-portatif-sobalar',
    images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800'],
    pricePerDay: 55,
    available: true,
    specifications: {
      'Güç': '2 kW',
      'Yakıt': 'Gaz Kartuşu',
      'Ağırlık': '1.5 kg',
      'Özellik': 'Kompakt',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-portatif-soba-2',
    name: 'Elektrikli Portatif Isıtıcı',
    description: 'Elektrikli portatif ısıtıcı. Fanlı, termostatlı, güvenlik kilitli. Güvenli kullanım.',
    category: 'portatif-sobalar',
    categoryId: 'cat-portatif-sobalar',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    pricePerDay: 50,
    available: true,
    specifications: {
      'Güç': '1500W',
      'Yakıt': 'Elektrik',
      'Tip': 'Fanlı',
      'Ağırlık': '2 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-portatif-soba-3',
    name: 'Mini Portatif Soba',
    description: 'Ultra kompakt portatif soba. Küçük çadırlar için ideal, güvenli kullanım. Hızlı ısıtma.',
    category: 'portatif-sobalar',
    categoryId: 'cat-portatif-sobalar',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'],
    pricePerDay: 45,
    available: true,
    specifications: {
      'Güç': '1.5 kW',
      'Yakıt': 'Gaz Kartuşu',
      'Ağırlık': '1 kg',
      'Boyut': 'Mini',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Outdoor Ekipman
  {
    id: 'gear-outdoor-1',
    name: 'Outdoor GPS Navigasyon Cihazı',
    description: 'Doğa yürüyüşleri için GPS navigasyon cihazı. Harita desteği, dayanıklı tasarım. Güvenli keşif.',
    category: 'outdoor',
    categoryId: 'cat-outdoor',
    images: ['https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800'],
    pricePerDay: 90,
    available: true,
    specifications: {
      'Ekran': '2.7 inç',
      'Pil Ömrü': '20 saat',
      'Su Geçirmez': 'IPX7',
      'Ağırlık': '0.3 kg',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-outdoor-2',
    name: 'Outdoor Pusula',
    description: 'Klasik pusula. Güvenilir navigasyon, dayanıklı yapı. Doğa yürüyüşleri için temel ekipman.',
    category: 'outdoor',
    categoryId: 'cat-outdoor',
    images: ['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800'],
    pricePerDay: 15,
    available: true,
    specifications: {
      'Tip': 'Klasik Pusula',
      'Malzeme': 'Akrilik',
      'Ağırlık': '0.05 kg',
      'Dilim': '360°',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gear-outdoor-3',
    name: 'Outdoor Düdük',
    description: 'Acil durumlar için yüksek sesli düdük. Acil yardım çağrısı için ideal. Dayanıklı tasarım.',
    category: 'outdoor',
    categoryId: 'cat-outdoor',
    images: ['https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800'],
    pricePerDay: 10,
    available: true,
    specifications: {
      'Ses Seviyesi': '120 dB',
      'Malzeme': 'Plastik',
      'Ağırlık': '0.02 kg',
      'Kullanım': 'Acil Durum',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Load from localStorage or use initial data
const loadGearFromStorage = (): Gear[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedGear: Gear[] = JSON.parse(stored);
        // Merge stored gear with initial mock gear to ensure all new products are included
        const storedIds = new Set(storedGear.map(g => g.id));
        
        // Add any new products from initialMockGear that don't exist in stored
        const newProducts = initialMockGear.filter(g => !storedIds.has(g.id));
        const mergedGear = [...storedGear, ...newProducts];
        
        // If we added new products, save to localStorage
        if (newProducts.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedGear));
          console.log(`Added ${newProducts.length} new products to storage`);
        }
        
        return mergedGear;
      }
      // First time - save initial data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockGear));
      return initialMockGear;
    }
  } catch (error) {
    console.error('Failed to load gear from storage:', error);
  }
  return initialMockGear;
};

// Save to localStorage
const saveGearToStorage = (gear: Gear[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gear));
    }
  } catch (error) {
    console.error('Failed to save gear to storage:', error);
  }
};

// Mock gear data - loaded from localStorage or initial data
export let mockGear: Gear[] = loadGearFromStorage();

export const gearService = {
  async getGear(
    filters?: GearFilters,
    page: number = 1,
    limit: number = config.itemsPerPage
  ): Promise<PaginatedResponse<Gear>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters || {}).filter(([_, v]) => v !== undefined && v !== '')
        ),
      });

      const response = await api.get<PaginatedResponse<Gear>>(
        `/gear?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      // Always fallback to mock data (both dev and prod)
      console.warn('API call failed, using mock gear data:', error);
      // Reload from localStorage to get latest data
      mockGear = loadGearFromStorage();
      console.log('Mock gear loaded from storage, total items:', mockGear.length);
      let filtered = [...mockGear];

      // Apply filters if any
      if (filters?.category) {
        filtered = filtered.filter(g => 
          g.category === filters.category || 
          g.categoryId === filters.category
        );
      }
      if (filters?.available !== undefined) {
        filtered = filtered.filter(g => g.available === filters.available);
      }
      // Status filter - handle 'for-sale-or-sold' to show both for-sale and sold items
      if (filters?.status) {
        if (filters.status === 'for-sale-or-sold') {
          // Get status from gear item (fallback to available for backward compatibility)
          filtered = filtered.filter(g => {
            const itemStatus = g.status || (g.available ? 'for-sale' : 'sold');
            return itemStatus === 'for-sale' || itemStatus === 'sold';
          });
        } else {
          // Filter by specific status
          filtered = filtered.filter(g => {
            const itemStatus = g.status || (g.available ? 'for-sale' : 'sold');
            return itemStatus === filters.status;
          });
        }
      }
      if (filters?.minPrice) {
        filtered = filtered.filter(g => g.pricePerDay >= filters.minPrice!);
      }
      if (filters?.maxPrice) {
        filtered = filtered.filter(g => g.pricePerDay <= filters.maxPrice!);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(g => 
          g.name.toLowerCase().includes(searchLower) ||
          g.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Brand filter - check brand field first, then search in name, description, and specifications
      if (filters?.brand && filters.brand.trim() !== '') {
        const brandLower = filters.brand.toLowerCase().trim();
        filtered = filtered.filter(g => {
          // First check if gear has a brand field that matches
          if (g.brand && g.brand.toLowerCase().includes(brandLower)) {
            return true;
          }
          // Then search in name, description, and specifications
          const nameMatch = g.name.toLowerCase().includes(brandLower);
          const descMatch = g.description.toLowerCase().includes(brandLower);
          const specMatch = g.specifications 
            ? Object.values(g.specifications).some(val => 
                String(val).toLowerCase().includes(brandLower)
              )
            : false;
          return nameMatch || descMatch || specMatch;
        });
        console.log('Brand filter applied:', brandLower, 'Result count:', filtered.length);
      }
      
      // Color filter - check color field first, then search in name, description, and specifications
      if (filters?.color && filters.color.trim() !== '') {
        const colorLower = filters.color.toLowerCase().trim();
        filtered = filtered.filter(g => {
          // First check if gear has a color field that matches
          if (g.color && g.color.toLowerCase().includes(colorLower)) {
            return true;
          }
          // Then search in name, description, and specifications
          const nameMatch = g.name.toLowerCase().includes(colorLower);
          const descMatch = g.description.toLowerCase().includes(colorLower);
          const specMatch = g.specifications 
            ? Object.values(g.specifications).some(val => 
                String(val).toLowerCase().includes(colorLower)
              )
            : false;
          return nameMatch || descMatch || specMatch;
        });
        console.log('Color filter applied:', colorLower, 'Result count:', filtered.length);
      }

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = filtered.slice(start, end);

      console.log('Mock data pagination:', {
        total: filtered.length,
        page,
        limit,
        start,
        end,
        returned: paginatedData.length
      });

      return {
        data: paginatedData,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }
  },

  async getGearById(id: string): Promise<Gear> {
    try {
      const response = await api.get<Gear>(`/gear/${id}`);
      return response.data;
    } catch (error) {
      // Fallback to mock data in development
      if (import.meta.env.DEV) {
        console.warn('API call failed, using mock gear data:', error);
        // Reload from localStorage to get latest data
        mockGear = loadGearFromStorage();
        const mockItem = mockGear.find(g => g.id === id);
        if (mockItem) {
          return mockItem;
        }
      }
      throw error;
    }
  },

  async createGear(data: FormData): Promise<Gear> {
    try {
      const response = await api.post<Gear>('/gear', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      // Fallback to mock response in development
      if (import.meta.env.DEV) {
        console.warn('API call failed, using mock response:', error);
        
        // Reload from localStorage to get latest data
        mockGear = loadGearFromStorage();
        
        // Extract image URLs from FormData
        const images: string[] = [];
        let index = 0;
        while (data.has(`image_${index}`)) {
          const url = data.get(`image_${index}`)?.toString();
          if (url) images.push(url);
          index++;
        }
        
        // Extract optional fields
        const brand = data.get('brand')?.toString();
        const color = data.get('color')?.toString();
        const rating = data.get('rating')?.toString();
        const recommendedProductsStr = data.get('recommendedProducts')?.toString();
        
        let recommendedProducts: string[] | undefined;
        if (recommendedProductsStr) {
          try {
            recommendedProducts = JSON.parse(recommendedProductsStr);
          } catch (e) {
            console.warn('Failed to parse recommendedProducts:', e);
          }
        }

        const newGear: Gear = {
          id: `gear-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: data.get('name')?.toString() || 'Yeni Malzeme',
          description: data.get('description')?.toString() || '',
          category: data.get('category')?.toString() || 'other',
          categoryId: data.get('categoryId')?.toString(),
          images: images,
          pricePerDay: Number(data.get('pricePerDay')) || 100,
          deposit: data.get('deposit') ? Number(data.get('deposit')) : undefined,
          available: data.get('available')?.toString() === 'true' || data.get('available')?.toString() === '',
          brand: brand,
          color: color,
          rating: rating ? Number(rating) : undefined,
          recommendedProducts: recommendedProducts,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockGear.unshift(newGear);
        saveGearToStorage(mockGear);
        return newGear;
      }
      throw error;
    }
  },

  async updateGear(id: string, data: FormData | Partial<Gear>): Promise<Gear> {
    try {
      const headers = data instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      const response = await api.put<Gear>(`/gear/${id}`, data, { headers });
      return response.data;
    } catch (error) {
      // Fallback to mock response in development
      if (import.meta.env.DEV) {
        console.warn('API call failed, using mock response:', error);
        // Reload from localStorage to get latest data
        mockGear = loadGearFromStorage();
        const index = mockGear.findIndex(g => g.id === id);
        if (index !== -1) {
          let recommendedProducts: string[] | undefined;
          if (data instanceof FormData) {
            const recommendedProductsStr = data.get('recommendedProducts')?.toString();
            if (recommendedProductsStr) {
              try {
                recommendedProducts = JSON.parse(recommendedProductsStr);
              } catch (e) {
                console.warn('Failed to parse recommendedProducts:', e);
              }
            }
          } else {
            recommendedProducts = data.recommendedProducts;
          }

          const updated = {
            ...mockGear[index],
            ...(data instanceof FormData
              ? {
                  name: data.get('name')?.toString() || mockGear[index].name,
                  description: data.get('description')?.toString() || mockGear[index].description,
                  category: data.get('category')?.toString() || mockGear[index].category,
                  categoryId: data.get('categoryId')?.toString() || mockGear[index].categoryId,
                  pricePerDay: Number(data.get('pricePerDay')) || mockGear[index].pricePerDay,
                  deposit: data.get('deposit') ? Number(data.get('deposit')) : mockGear[index].deposit,
                  brand: data.get('brand')?.toString() || mockGear[index].brand,
                  color: data.get('color')?.toString() || mockGear[index].color,
                  rating: data.get('rating') ? Number(data.get('rating')) : mockGear[index].rating,
                  recommendedProducts: recommendedProducts !== undefined ? recommendedProducts : mockGear[index].recommendedProducts,
                }
              : data),
            updatedAt: new Date().toISOString(),
          };
          mockGear[index] = updated;
          saveGearToStorage(mockGear);
          return updated;
        }
      }
      throw error;
    }
  },

  async deleteGear(id: string): Promise<void> {
    try {
      await api.delete(`/gear/${id}`);
    } catch (error) {
      // Fallback to mock delete in development
      if (import.meta.env.DEV) {
        console.warn('API call failed, using mock delete:', error);
        // Reload from localStorage to get latest data
        mockGear = loadGearFromStorage();
        const index = mockGear.findIndex(g => g.id === id);
        if (index !== -1) {
          mockGear.splice(index, 1);
          saveGearToStorage(mockGear);
          return;
        }
      }
      throw error;
    }
  },
};

