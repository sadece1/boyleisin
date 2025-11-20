import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageSlider } from './ImageSlider';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export const ImageLightbox = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}: ImageLightboxProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-60 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-full shadow-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Kapat"
          >
            <span className="text-2xl">×</span>
          </button>

          {/* Image Container - Clicking inside should not close */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="relative w-full h-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageSlider
                images={images}
                className="w-full h-full"
                autoPlay={false}
              />
            </div>
          </motion.div>

          {/* Click outside hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm opacity-70">
            Dışarı tıklayın veya ESC tuşuna basın
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

