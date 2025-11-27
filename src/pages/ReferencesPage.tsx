import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { SEO } from '@/components/SEO';
import { referenceService, Reference } from '@/services/referenceService';
import { brandService, Brand } from '@/services/brandService';
import { uploadService } from '@/services/uploadService';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const ReferencesPage = () => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [isLightAnimating, setIsLightAnimating] = useState(false);
  const modalLightOverlayRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    
    // Hero animation
    if (heroRef.current) {
      const title = heroRef.current.querySelector('.hero-title');
      const subtitle = heroRef.current.querySelector('.hero-subtitle');
      
      if (title && subtitle) {
        gsap.set([title, subtitle], { opacity: 0, y: 30 });
        
        gsap.to([title, subtitle], {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.3,
          ease: 'power3.out',
        });
      }
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [refsData, brandsData] = await Promise.all([
        referenceService.getAllReferences(),
        brandService.getAllBrands(),
      ]);
      setReferences(refsData);
      // Filter brands with logos and convert logo paths to full URLs
      const brandsWithLogos = brandsData
        .filter(b => b.logo)
        .map(b => ({
          ...b,
          logo: b.logo ? uploadService.getFileUrl(b.logo) : undefined
        }));
      setBrands(brandsWithLogos);
    } catch (error) {
      console.error('Failed to load references data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (referenceId: string) => {
    setSelectedReference(referenceId);
    setIsLightAnimating(true);

    // Small delay to ensure modal is rendered, then animate light effect
    setTimeout(() => {
      // Animate light effect - spreading inward from all four sides like stage light
      if (modalLightOverlayRef.current) {
        const overlay = modalLightOverlayRef.current;
        
        // Reset animation - start from edges (0% inset means fully visible from edges)
        gsap.set(overlay, { 
          opacity: 0,
          clipPath: 'inset(0% 0% 0% 0%)' // Start from all edges (fully visible)
        });

        // Animate light spreading inward from all four sides
        // This creates the effect of light converging from top, bottom, left, right
        gsap.to(overlay, {
          opacity: 0.85,
          clipPath: 'inset(25% 25% 25% 25%)', // Spread inward from all sides
          duration: 1.2,
          ease: 'power2.inOut',
          onComplete: () => {
            // Hold for a moment with gentle pulse
            gsap.to(overlay, {
              opacity: 0.75,
              clipPath: 'inset(22% 22% 22% 22%)',
              duration: 0.8,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: 1,
              onComplete: () => {
                // Fade out smoothly
                gsap.to(overlay, {
                  opacity: 0,
                  clipPath: 'inset(30% 30% 30% 30%)',
                  duration: 1,
                  ease: 'power2.in',
                  onComplete: () => {
                    setIsLightAnimating(false);
                  }
                });
              }
            });
          }
        });
      }
    }, 100);
  };

  const handleCloseOverlay = () => {
    setSelectedReference(null);
    setIsLightAnimating(false);
  };

  const selectedRef = references.find(r => r.id === selectedReference);

  return (
    <>
      <SEO 
        title="Referanslar - CampScape" 
        description="CampScape'in anlaşmalı markaları ve daha önce hizmet verdiğimiz yerler. Geçmiş projelerimizi keşfedin."
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative h-[400px] md:h-[500px] flex items-center justify-center text-center text-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600" />
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1920&h=1080&fit=crop&fm=webp&q=80&auto=format')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Referanslarımız
            </h1>
            <p className="hero-subtitle text-xl sm:text-2xl md:text-3xl text-gray-100 font-medium drop-shadow-md">
              Anlaşmalı Markalarımız ve Hizmet Verdiğimiz Yerler
            </p>
          </div>
        </section>

        {/* Hizmet Verdiğimiz Yerler Section - ÜSTTE */}
        <section className="py-16 sm:py-20 md:py-24 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Hizmet Verdiğimiz Yerler
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Geçmişten bugüne gerçekleştirdiğimiz projeler
              </p>
              <div className="w-24 h-1 bg-primary-600 dark:bg-primary-400 rounded-full mx-auto mt-4"></div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : references.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {references.map((reference, index) => (
                <motion.div
                  key={reference.id}
                  className="group relative cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleImageClick(reference.id)}
                >
                  {/* Elegant Image Frame */}
                  <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-white dark:border-gray-800 group-hover:border-primary-400 dark:group-hover:border-primary-600">
                    {/* Image */}
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={reference.image}
                        alt={reference.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                      

                      {/* Text Overlay - Elegant */}
                      <div className="absolute inset-0 flex items-end justify-center p-6 sm:p-8">
                        <motion.div
                          className="text-center"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.h3
                            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-2xl"
                            style={{
                              textShadow: '0 4px 12px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6)',
                            }}
                          >
                            {reference.title}
                          </motion.h3>
                          {reference.location && (
                            <p className="text-sm sm:text-base text-gray-200 drop-shadow-lg">
                              {reference.location}
                            </p>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    {/* Decorative Frame Border Glow */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary-400/0 group-hover:border-primary-400/50 transition-all duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Henüz referans eklenmemiş
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Brands Section - ALTA */}
        <section className="py-16 sm:py-20 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Anlaşmalı Markalarımız
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Kaliteli hizmet sunabilmek için güvenilir markalarla çalışıyoruz
              </p>
              <div className="w-24 h-1 bg-primary-600 dark:bg-primary-400 rounded-full mx-auto mt-4"></div>
            </div>

            {/* Infinite Scrolling Brands Carousel */}
            <div className="relative overflow-hidden">
              {/* Gradient Overlays for smooth fade effect */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : brands.length > 0 ? (
              <div className="brands-carousel-container">
                <div className="brands-carousel-track">
                  {/* Duplicate brands for seamless infinite loop */}
                  {[...brands, ...brands].map((brand, index) => (
                    <motion.div
                      key={`brand-${brand.id}-${index}`}
                      className="brand-carousel-item group relative flex-shrink-0 mx-2"
                      whileHover={{ y: -3, scale: 1.05 }}
                    >
                      {/* Yuvarlak Marka Logo */}
                      <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-4 border-white dark:border-gray-800 group-hover:border-primary-400 dark:group-hover:border-primary-500">
                        <img
                            src={brand.logo || ''}
                          alt={brand.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Henüz marka eklenmemiş
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Full Screen Light Effect Modal */}
        <AnimatePresence>
          {selectedReference !== null && selectedRef && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={handleCloseOverlay}
            >
              {/* Light Effect Overlay - Stage Light Effect */}
              {isLightAnimating && (
                <motion.div
                  ref={modalLightOverlayRef}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, transparent 25%),
                      linear-gradient(to top, rgba(255, 255, 255, 0.5) 0%, transparent 25%),
                      linear-gradient(to right, rgba(255, 255, 255, 0.5) 0%, transparent 25%),
                      linear-gradient(to left, rgba(255, 255, 255, 0.5) 0%, transparent 25%),
                      radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4) 0%, transparent 55%)
                    `,
                    mixBlendMode: 'overlay',
                  }}
                />
              )}

              {/* Content */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                  <div className="aspect-video relative">
                    <img
                      src={selectedRef.image}
                      alt={selectedRef.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Text Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <motion.h2
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl"
                        style={{
                          textShadow: '0 4px 20px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.8)',
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        {selectedRef.title}
                      </motion.h2>
                      {selectedRef.location && (
                        <motion.p
                          className="text-xl sm:text-2xl text-gray-200 drop-shadow-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                        >
                          {selectedRef.location}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleCloseOverlay}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center text-gray-900 dark:text-white hover:bg-primary-600 hover:text-white transition-all duration-200 group"
                  aria-label="Kapat"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

