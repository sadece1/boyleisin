import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gear } from '@/types';
import { ImageSlider } from './ImageSlider';
import { formatPrice } from '@/utils/validation';
import { routes } from '@/config';
import { useFavoritesStore } from '@/store/favoritesStore';
import { colorService } from '@/services/colorService';

interface GearCardProps {
  gear: Gear;
}

const categoryLabels: Record<Gear['category'], string> = {
  tent: 'Çadır',
  'sleeping-bag': 'Uyku Tulumu',
  cooking: 'Pişirme',
  lighting: 'Aydınlatma',
  backpack: 'Sırt Çantası',
  furniture: 'Mobilya',
  other: 'Diğer',
};

export const GearCard = ({ gear }: GearCardProps) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(gear.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(gear.id);
  };

  const colorInfo = gear.color ? colorService.getColorByName(gear.color) : null;
  const itemStatus = gear.status || (gear.available ? 'for-sale' : 'sold');

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <span key={i} className="text-yellow-500 text-sm">★</span>;
          } else if (i === fullStars && hasHalfStar) {
            return <span key={i} className="text-yellow-400 text-sm">☆</span>;
          } else {
            return <span key={i} className="text-gray-300 dark:text-gray-600 text-sm">★</span>;
          }
        })}
        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getStatusInfo = () => {
    if (itemStatus === 'sold') {
      return { text: 'Satıldı', class: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' };
    } else if (itemStatus === 'orderable') {
      return { text: 'Sipariş Edilebilir', class: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' };
    } else if (itemStatus === 'for-sale') {
      return { text: 'Satılık', class: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' };
    }
    return { 
      text: gear.available ? 'Mevcut' : 'Stokta Yok', 
      class: gear.available 
        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-900">
        <ImageSlider
          images={gear.images.length > 0 ? gear.images : ['/placeholder-image.jpg']}
          className="h-full"
          autoPlay={false}
        />
        
        {/* Image Count */}
        {gear.images.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs z-20">
            {gear.images.length} fotoğraf
          </div>
        )}

        {/* Category Badge */}
        {gear.category && categoryLabels[gear.category as Gear['category']] && (
          <div className={`absolute ${gear.images.length > 1 ? 'top-11' : 'top-3'} left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white px-3 py-1 rounded-md text-xs font-semibold z-20`}>
            {categoryLabels[gear.category as Gear['category']]}
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
          aria-label={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <svg 
            className={`w-5 h-5 ${favorite ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}
            fill={favorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <Link to={`${routes.gear}/${gear.id}`} className="block">
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem]">
            {gear.name}
          </h3>

          {/* Brand, Color, Rating */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {gear.brand && (
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {gear.brand}
              </span>
            )}
            {gear.brand && gear.color && (
              <span className="text-gray-300 dark:text-gray-600">•</span>
            )}
            {gear.color && (
              <div className="flex items-center gap-1.5">
                {colorInfo?.hexCode && (
                  <span 
                    className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: colorInfo.hexCode }}
                  />
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {gear.color}
                </span>
              </div>
            )}
            {gear.rating && (
              <div className="ml-auto">
                {renderStars(gear.rating)}
              </div>
            )}
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
            {gear.description}
          </p>

          {/* Price and Status */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Günlük Fiyat</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(gear.pricePerDay)}
              </div>
            </div>
            
            <div className={`px-3 py-1.5 rounded-md text-xs font-semibold ${statusInfo.class}`}>
              {statusInfo.text}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
