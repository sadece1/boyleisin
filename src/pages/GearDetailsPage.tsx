import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGearStore } from '@/store/gearStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';
import { SEO } from '@/components/SEO';
import { ImageSlider } from '@/components/ImageSlider';
import { ImageLightbox } from '@/components/ImageLightbox';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { GearCard } from '@/components/GearCard';
import { formatPrice } from '@/utils/validation';
import { categoryService } from '@/services/categoryService';
import { colorService } from '@/services/colorService';
import { gearService } from '@/services/gearService';
import { userOrderService } from '@/services/userOrderService';
import { routes } from '@/config';
import { Gear } from '@/types';

// Mock gear data for details page - expanded with all 10 items
const mockGearData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Kar Çadırı 4 Kişilik',
    description: 'Kış kampları için dayanıklı ve geniş kar çadırı. Su geçirmez ve rüzgar dirençli. Tüm hava koşullarında güvenle kullanabileceğiniz profesyonel bir çadır.',
    category: 'tent',
    images: [
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800',
      'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
    ],
    pricePerDay: 250,
    deposit: 500,
    available: true,
    specifications: {
      'Kapasite': '4 kişi',
      'Ağırlık': '4.5 kg',
      'Malzeme': 'Polyester',
      'Su Geçirmezlik': '5000mm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  '2': {
    id: '2',
    name: 'Uyku Tulumu -15°C',
    description: 'Kış kampları için mükemmel, -15 dereceye kadar dayanıklı uyku tulumu. Yüksek kalite tüy dolgu ile maksimum ısı yalıtımı.',
    category: 'sleeping-bag',
    images: [
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=800',
    ],
    pricePerDay: 100,
    deposit: 300,
    available: true,
    specifications: {
      'Sıcaklık': '-15°C',
      'Ağırlık': '1.2 kg',
      'Dolgu': 'Kaz tüyü',
      'Boyut': '185cm',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const categoryLabels: Record<string, string> = {
  tent: 'Çadır',
  'sleeping-bag': 'Uyku Tulumu',
  cooking: 'Pişirme',
  lighting: 'Aydınlatma',
  backpack: 'Sırt Çantası',
  furniture: 'Mobilya',
  other: 'Diğer',
};

export const GearDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGear, fetchGearById, isLoading } = useGearStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { user } = useAuthStore();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [mainSliderIndex, setMainSliderIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState<Gear[]>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [enrichedGear, setEnrichedGear] = useState<Gear | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);

  // Helper function to enrich gear with specifications from gearService mock data
  const enrichGearWithSpecifications = (gearItem: Gear | null, gearId?: string): Gear | null => {
    if (!gearItem) return gearItem;
    const itemId = gearId || gearItem.id || id;
    if (!itemId) return gearItem;
    
    // If gear already has specifications, return as is
    if (gearItem.specifications && Object.keys(gearItem.specifications).length > 0) {
      return gearItem;
    }
    
    // Try to find the same gear in gearService mock data to get specifications
    try {
      // Removed mockGear usage - now using backend API only
      // const enrichedGearItem = gearServiceMockGear.find((g: Gear) => g.id === itemId);
      if (enrichedGearItem && enrichedGearItem.specifications) {
        return {
          ...gearItem,
          specifications: enrichedGearItem.specifications,
        };
      }
    } catch (error) {
      // Ignore errors
    }
    
    return gearItem;
  };

  // Try to get gear from multiple sources, prioritizing gearService (which has specifications)
  const baseGear = enrichedGear || currentGear || 
                   (id ? categoryService.getGearById(id) : null);
  
  // Enrich gear with specifications if missing
  const gear = enrichGearWithSpecifications(baseGear, id);

  useEffect(() => {
    if (id) {
      // Always try to fetch from gearService first to get complete data including specifications
      fetchGearById(id).catch(() => {
        // Silently fail - we'll use mock data or categoryService data
        // Try to enrich categoryService data with gearService mock data
        const categoryGear = categoryService.getGearById(id);
        if (categoryGear) {
          const enriched = enrichGearWithSpecifications(categoryGear, id);
          if (enriched && enriched.specifications) {
            setEnrichedGear(enriched);
          }
        }
      });
    }
  }, [id, fetchGearById]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadRecommendedProducts = async () => {
      if (!gear?.recommendedProducts || gear.recommendedProducts.length === 0) {
        return;
      }

      setIsLoadingRecommended(true);
      try {
        const recommendedIds = gear.recommendedProducts;
        const products: Gear[] = [];
        
        for (const productId of recommendedIds) {
          try {
            const product = await gearService.getGearById(productId);
            if (product && product.id !== gear.id) {
              products.push(product);
            }
          } catch (error) {
            console.warn(`Failed to load recommended product ${productId}:`, error);
          }
        }
        
        setRecommendedProducts(products);
      } catch (error) {
        console.error('Failed to load recommended products:', error);
      } finally {
        setIsLoadingRecommended(false);
      }
    };

    loadRecommendedProducts();
  }, [gear?.recommendedProducts, gear?.id]);

  const handleOpenLightbox = () => {
    if (!isDragging) {
      setIsLightboxOpen(true);
      setLightboxIndex(mainSliderIndex);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      const touch = e.touches[0];
      if (touch) {
        setTouchStartTime(Date.now());
        (e.currentTarget as HTMLElement).dataset.touchX = touch.clientX.toString();
        (e.currentTarget as HTMLElement).dataset.touchY = touch.clientY.toString();
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMobile && !isDragging) {
      const touchDuration = Date.now() - touchStartTime;
      const target = e.currentTarget as HTMLElement;
      const startX = parseFloat(target.dataset.touchX || '0');
      const startY = parseFloat(target.dataset.touchY || '0');
      const touch = e.changedTouches[0];
      
      if (touch) {
        const deltaX = Math.abs(touch.clientX - startX);
        const deltaY = Math.abs(touch.clientY - startY);
        const isDrag = deltaX > 10 || deltaY > 10;
        
        if (!isDrag && touchDuration < 300) {
          const clickTarget = e.target as HTMLElement;
          const isControl = clickTarget.closest('button') || 
                           clickTarget.closest('[aria-label]') ||
                           clickTarget.tagName === 'BUTTON';
          
          if (!isControl) {
            setTimeout(() => {
              if (!isDragging) {
                handleOpenLightbox();
              }
            }, 100);
          }
        }
      }
    }
  };

  if (isLoading && !gear) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!gear) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Malzeme bulunamadı
          </h2>
          <Link to="/gear" className="text-primary-600 hover:text-primary-700">
            Malzemelere dön
          </Link>
        </div>
      </div>
    );
  }

  const colorInfo = gear.color ? colorService.getColorByName(gear.color) : null;

  const renderStars = (rating?: number | string) => {
    if (!rating) return null;
    // Convert to number if string
    const ratingNum = typeof rating === 'number' ? rating : parseFloat(String(rating || 0));
    if (isNaN(ratingNum) || ratingNum <= 0) return null;
    
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <span key={i} className="text-yellow-500 text-sm">★</span>;
          } else if (i === fullStars && hasHalfStar) {
            return <span key={i} className="text-yellow-400 text-sm">☆</span>;
          } else {
            return <span key={i} className="text-gray-300 dark:text-gray-600 text-sm">★</span>;
          }
        })}
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1.5">
          {ratingNum.toFixed(1)} / 5.0
        </span>
      </div>
    );
  };

  return (
    <>
      <SEO
        title={`${gear.name} - WeCamp | Kiralık Kamp Ekipmanı`}
        description={`${gear.description} ${gear.name} kiralık kamp ekipmanı. Günlük fiyat: ₺${gear.pricePerDay}. Güvenli kiralama ve hızlı teslimat. Türkiye'nin en güvenilir kamp malzemeleri platformu.`}
        keywords={`${gear.name}, kamp malzemesi, kiralık kamp ekipmanı, ${categoryLabels[gear.category] || gear.category}, outdoor ekipman, kamp ${gear.name.toLowerCase()}, kamp malzemesi kiralama`}
        image={gear.images && gear.images.length > 0 ? gear.images[0] : undefined}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link to="/gear" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Malzemeler
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white truncate max-w-xs">
              {gear.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="mb-5">
                <div 
                  className="relative h-[350px] lg:h-[450px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  onDoubleClick={(e) => {
                    if (!isMobile) {
                      const target = e.target as HTMLElement;
                      const isControl = target.closest('button') || 
                                       target.closest('[aria-label]') ||
                                       target.tagName === 'BUTTON';
                      if (!isControl) {
                        handleOpenLightbox();
                      }
                    }
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <ImageSlider
                    images={gear.images || ['/placeholder-image.jpg']}
                    className="h-full"
                    autoPlay={false}
                    initialIndex={mainSliderIndex}
                    onIndexChange={setMainSliderIndex}
                    onDragChange={setIsDragging}
                  />
                  
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: showHint ? 1 : 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center pb-8"
                    >
                      <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {isMobile ? 'Büyütmek için dokunun' : 'Büyütmek için çift tıklayın'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Thumbnail Grid */}
                {gear.images && gear.images.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                    {gear.images.slice(0, 6).map((image: string, index: number) => (
                      <div
                        key={index}
                        onClick={() => {
                          setMainSliderIndex(index);
                          if (isMobile) {
                            setTimeout(() => {
                              setLightboxIndex(index);
                              setIsLightboxOpen(true);
                            }, 150);
                          }
                        }}
                        onDoubleClick={() => {
                          if (!isMobile) {
                            setLightboxIndex(index);
                            setIsLightboxOpen(true);
                          }
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all border ${
                          mainSliderIndex === index
                            ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lightbox Modal */}
              <ImageLightbox
                images={gear.images || ['/placeholder-image.jpg']}
                currentIndex={lightboxIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                onIndexChange={setLightboxIndex}
              />

              {/* Product Title & Category */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm font-medium">
                    {categoryLabels[gear.category] || gear.category}
                  </span>
                  {gear.brand && (
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium">
                      {gear.brand}
                    </span>
                  )}
                  {gear.color && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium">
                      {colorInfo?.hexCode && (
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: colorInfo.hexCode }}
                        />
                      )}
                      {gear.color}
                    </span>
                  )}
                </div>
                <h1 
                  className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4 leading-tight"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    overflowX: 'hidden',
                    maxWidth: '100%',
                  }}
                >
                  {gear.name}
                </h1>
                
                {/* Rating Section */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                        Değerlendirme
                      </div>
                      {renderStars(gear.rating) || (
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-gray-300 dark:text-gray-600 text-sm">★</span>
                          ))}
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1.5">
                            0.0 / 5.0
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {gear.rating !== undefined && gear.rating !== null 
                          ? (typeof gear.rating === 'number' ? gear.rating.toFixed(1) : parseFloat(String(gear.rating || 0)).toFixed(1))
                          : '0.0'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        / 5.0
                      </div>
                    </div>
                  </div>
                </div>

                {(() => {
                  const itemStatus = gear.status || (gear.available ? 'for-sale' : 'sold');
                  let statusText = '';
                  let statusClass = '';
                  
                  if (itemStatus === 'for-sale') {
                    statusText = '🛒 Satılık';
                    statusClass = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
                  } else if (itemStatus === 'sold') {
                    statusText = '✅ Satıldı';
                    statusClass = 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300';
                  } else if (itemStatus === 'orderable') {
                    statusText = '📦 Sipariş Edilebilir';
                    statusClass = 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
                  } else {
                    statusText = gear.available ? '✓ Stokta Var' : '✗ Stokta Yok';
                    statusClass = gear.available 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                  }
                  
                  return (
                    <div className={`inline-flex items-center px-3.5 py-1.5 rounded text-sm font-medium ${statusClass}`}>
                      {statusText}
                    </div>
                  );
                })()}
              </div>

              {/* Price Info */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-5 border border-primary-200 dark:border-primary-800 mb-4">
                <div className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1.5 uppercase tracking-wide">
                  Fiyat
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {formatPrice(gear.pricePerDay)}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Ürün Açıklaması
                </h2>
                <p 
                  className="text-gray-700 dark:text-gray-300 leading-relaxed text-base"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    overflowX: 'hidden',
                    maxWidth: '100%',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {gear.description}
                </p>
              </div>

              {/* Specifications */}
              {gear.specifications && Object.keys(gear.specifications).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Teknik Özellikler
                  </h2>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(gear.specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
                      >
                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                          {key}
                        </dt>
                        <dd className="text-base font-medium text-gray-900 dark:text-white">{value as string}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Satın Alma Bilgileri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                    <div className="font-medium text-gray-900 dark:text-white mb-1.5 text-base">Teslimat</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Ürünler kargoyla adresinize teslim edilir veya şubemizden alabilirsiniz. Detaylı bilgi için iletişime geçin.
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                    <div className="font-medium text-gray-900 dark:text-white mb-1.5 text-base">İade ve Değişim</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Ürünler hasar görmeden ve kutusunda 14 gün içinde iade edilebilir. Değişim ve iade için iletişime geçin.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Sidebar - Sticky */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 sticky top-4 border border-gray-200 dark:border-gray-700">
                {/* Price Summary */}
                <div className="mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-center bg-primary-50 dark:bg-primary-900/20 rounded-lg p-5 border border-primary-200 dark:border-primary-800">
                    <div className="text-xs font-medium text-primary-700 dark:text-primary-300 mb-1.5 uppercase tracking-wide">
                      Fiyat
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                      {formatPrice(gear.pricePerDay)}
                    </div>
                  </div>
                </div>

                {/* Brand, Color & Rating Info */}
                {(gear.brand || gear.color || gear.rating) && (
                  <div className="mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      {gear.brand && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Marka</div>
                          <div className="font-medium text-base text-gray-900 dark:text-white">{gear.brand}</div>
                        </div>
                      )}
                      {gear.color && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Renk</div>
                          <div className="flex items-center gap-1.5">
                            {colorInfo?.hexCode && (
                              <span 
                                className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: colorInfo.hexCode }}
                              />
                            )}
                            <span className="font-medium text-base text-gray-900 dark:text-white">{gear.color}</span>
                          </div>
                        </div>
                      )}
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Değerlendirme</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-semibold text-gray-900 dark:text-white">
                            {gear.rating !== undefined && gear.rating !== null 
                              ? (typeof gear.rating === 'number' ? gear.rating.toFixed(1) : parseFloat(String(gear.rating || 0)).toFixed(1))
                              : '0.0'}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => {
                              const ratingNum = gear.rating !== undefined && gear.rating !== null
                                ? (typeof gear.rating === 'number' ? gear.rating : parseFloat(String(gear.rating || 0)))
                                : 0;
                              const fullStars = Math.floor(ratingNum);
                              const hasHalfStar = ratingNum % 1 >= 0.5;
                              if (i < fullStars) {
                                return <span key={i} className="text-yellow-500">★</span>;
                              } else if (i === fullStars && hasHalfStar) {
                                return <span key={i} className="text-yellow-400">☆</span>;
                              } else {
                                return <span key={i} className="text-gray-300 dark:text-gray-600">★</span>;
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Availability Status */}
                {(() => {
                  const itemStatus = gear.status || (gear.available ? 'for-sale' : 'sold');
                  
                  if (itemStatus === 'sold') {
                    return (
                      <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded text-center">
                        <div className="font-medium text-base mb-1">✅ Satıldı</div>
                        <div className="text-sm">Bu ürün satılmıştır.</div>
                      </div>
                    );
                  } else if (itemStatus === 'orderable') {
                    return (
                      <div className="mb-5 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 rounded text-center">
                        <div className="font-medium text-base mb-1">📦 Sipariş Edilebilir</div>
                        <div className="text-sm">Bu ürünü sipariş verebilirsiniz.</div>
                      </div>
                    );
                  } else if (itemStatus !== 'for-sale' && !gear.available) {
                    return (
                      <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded text-center">
                        <div className="font-medium text-base mb-1">Stokta Yok</div>
                        <div className="text-sm">Bu ürün şu anda satışta değil.</div>
                      </div>
                    );
                  }
                  
                  return null;
                })()}

                {(() => {
                  const itemStatus = gear.status || (gear.available ? 'for-sale' : 'sold');
                  const favorite = isFavorite(gear.id);
                  const canOrder = itemStatus === 'for-sale' || itemStatus === 'orderable' || (itemStatus !== 'sold' && gear.available);
                  
                  const handleBuy = async () => {
                    if (!user) {
                      navigate(routes.login);
                      return;
                    }

                    if (!gear.id) {
                      alert('Ürün bilgisi bulunamadı');
                      return;
                    }

                    try {
                      setIsOrdering(true);
                      await userOrderService.createOrder({
                        userId: user.id,
                        gearId: gear.id,
                        status: 'waiting',
                        price: gear.pricePerDay || 0,
                      });
                      alert('Siparişiniz başarıyla oluşturuldu!');
                      navigate(routes.profile);
                    } catch (error) {
                      console.error('Failed to create order:', error);
                      alert(error instanceof Error ? error.message : 'Sipariş oluşturulamadı');
                    } finally {
                      setIsOrdering(false);
                    }
                  };
                  
                  if (canOrder) {
                    return (
                      <>
                        <button
                          onClick={handleBuy}
                          disabled={isOrdering}
                          className="w-full px-4 py-3 rounded-lg text-base font-semibold transition-colors bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 hover:border-primary-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isOrdering ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span>Sipariş Oluşturuluyor...</span>
                            </>
                          ) : (
                            <>
                              <span>🛒</span>
                              <span>Satın Al</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleFavorite(gear.id)}
                          className={`w-full px-4 py-2.5 rounded text-base font-medium transition-colors border flex items-center justify-center gap-2 mt-2 ${
                            favorite
                              ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
                              : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 border-primary-200 dark:border-primary-800'
                          }`}
                        >
                          <span className="text-lg">{favorite ? '❤️' : '🤍'}</span>
                          {favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                        </button>
                      </>
                    );
                  }
                  return null;
                })()}

                {/* Contact Info */}
                <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1.5">Sorularınız mı var?</div>
                  <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium underline transition-colors">
                    Bize Ulaşın
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Products Section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Tavsiye Edilen Ürünler
              </h2>
              {isLoadingRecommended ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recommendedProducts.map((product) => (
                    <GearCard key={product.id} gear={product} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
