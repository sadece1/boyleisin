import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Campsite } from '@/types';
import { OptimizedImage } from './OptimizedImage';
import { formatPrice } from '@/utils/validation';
import { routes } from '@/config';

interface CampsiteCardProps {
  campsite: Campsite;
}

export const CampsiteCard = ({ campsite }: CampsiteCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <Link to={`${routes.campsites}/${campsite.id}`}>
        <div className="relative h-48">
          <OptimizedImage
            src={campsite.images[0] || '/placeholder-image.jpg'}
            alt={campsite.name}
            className="w-full h-full"
          />
          {!campsite.available && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              Dolu
            </div>
          )}
          {campsite.rating && (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded flex items-center gap-1">
              <span>⭐</span>
              <span>{campsite.rating.toFixed(1)}</span>
              {campsite.reviewCount && <span>({campsite.reviewCount})</span>}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {campsite.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            📍 {campsite.location.city}, {campsite.location.region}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-3">
            {campsite.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(campsite.pricePerNight)}
              <span className="text-sm font-normal text-gray-500">/gece</span>
            </span>
            <span className="text-sm text-gray-500">Kapasite: {campsite.capacity}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

