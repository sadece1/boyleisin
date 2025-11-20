import { useState, useEffect, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { OptimizedImage } from './OptimizedImage';

interface ImageSliderProps {
  images: string[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  onDragChange?: (isDragging: boolean) => void;
}

const SWIPE_THRESHOLD = 30; // Minimum drag distance to change slide (daha hassas)

export const ImageSlider = ({
  images,
  className = '',
  autoPlay = false,
  interval = 5000,
  initialIndex = 0,
  onIndexChange,
  onDragChange,
}: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with initialIndex prop changes
  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < images.length) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, images.length]);

  // Notify parent of index changes
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange]);

  // Auto-play is disabled by default for catalog sites
  useEffect(() => {
    if (!autoPlay || images.length <= 1 || isDragging) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length, isDragging]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    if (onDragChange) {
      onDragChange(true);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    setIsDragging(false);
    if (onDragChange) {
      onDragChange(false);
    }

    // Get container width for better calculation
    const containerWidth = containerRef.current?.clientWidth || 0;
    const slideWidth = containerWidth > 0 ? containerWidth / images.length : 0;
    
    // Calculate relative movement (percentage of slide width)
    const relativeMovement = slideWidth > 0 ? Math.abs(offset) / slideWidth : 0;

    // More sensitive detection: either absolute threshold OR relative movement OR velocity
    const shouldChange = 
      Math.abs(offset) > SWIPE_THRESHOLD ||  // Absolute minimum distance
      relativeMovement > 0.15 ||              // 15% of slide width
      Math.abs(velocity) > 300;               // Lowered velocity threshold

    if (shouldChange) {
      // Determine direction based on offset (more reliable than velocity for small movements)
      if (offset > 0) {
        // Dragged right - go to previous
        goToPrevious();
      } else if (offset < 0) {
        // Dragged left - go to next
        goToNext();
      }
    }
    // If not enough drag, it will snap back via animate prop
  };

  if (images.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <OptimizedImage
          src="/placeholder-image.jpg"
          alt="Placeholder"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const slideWidth = 100 / images.length;

  return (
    <div 
      className={`relative ${className} overflow-hidden`} 
      ref={containerRef}
      onMouseDown={(e) => {
        // Always prevent parent events when interacting with slider
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        // Prevent touch events from bubbling to parent
        e.stopPropagation();
      }}
      onClick={(e) => {
        // Only allow clicks on buttons, prevent navigation
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {/* Slide Container - Horizontal Scroll Style (Flat) */}
      <motion.div
        className="flex w-full h-full"
        style={{
          width: `${images.length * 100}%`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        animate={{
          x: `-${currentIndex * slideWidth}%`,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 35,
          mass: 0.5,
        }}
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={(e) => {
          e.stopPropagation();
          handleDragStart();
        }}
        onDrag={(e) => {
          e.stopPropagation();
        }}
        onDragEnd={(e, info) => {
          e.stopPropagation();
          handleDragEnd(e, info);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="relative flex-shrink-0"
            style={{
              width: `${slideWidth}%`,
              minWidth: `${slideWidth}%`,
            }}
          >
            <OptimizedImage
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
        ))}
      </motion.div>

      {/* Navigation Arrows - Always visible for catalog */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrevious();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-xl text-gray-900 dark:text-white p-3 rounded-full transition-all opacity-100 z-30 hover:scale-110 hover:bg-primary-50 dark:hover:bg-primary-900/30 active:scale-95"
            aria-label="Önceki fotoğraf"
          >
            <span className="text-xl">←</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-xl text-gray-900 dark:text-white p-3 rounded-full transition-all opacity-100 z-30 hover:scale-110 hover:bg-primary-50 dark:hover:bg-primary-900/30 active:scale-95"
            aria-label="Sonraki fotoğraf"
          >
            <span className="text-xl">→</span>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div 
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(index);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8 h-2 shadow-lg'
                  : 'bg-white bg-opacity-60 hover:bg-opacity-80 w-2 h-2'
              }`}
              aria-label={`Fotoğraf ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {images.length > 1 && (
        <div 
          className="absolute top-3 right-3 bg-black bg-opacity-70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold z-30 shadow-lg pointer-events-none"
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};
