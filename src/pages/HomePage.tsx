import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/Button';
import { OptimizedImage } from '@/components/OptimizedImage';
import { routes, config } from '@/config';
import { useBlogStore } from '@/store/blogStore';
import { useGearStore } from '@/store/gearStore';
import { formatDate, formatPrice } from '@/utils/validation';

export const HomePage = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const { blogs, fetchBlogs, isLoading: blogsLoading } = useBlogStore();
  const { gear, fetchGear, isLoading: gearLoading } = useGearStore();

  // Fetch featured content on mount
  useEffect(() => {
    fetchBlogs({}, 1);
    fetchGear({ available: true }, 1, 6); // Get 6 featured gear items
  }, [fetchBlogs, fetchGear]);

  // Get featured blogs
  const featuredBlogs = [...blogs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3);

  // Get featured gear
  const featuredGear = gear.slice(0, 6);

  // Stats data
  const stats = [
    { label: 'Kamp Alanı', value: '200+', icon: '🏕️', color: 'text-blue-600' },
    { label: 'Kamp Malzemesi', value: `${gear.length}+`, icon: '🎒', color: 'text-green-600' },
    { label: 'Blog Yazısı', value: `${blogs.length}+`, icon: '📝', color: 'text-purple-600' },
    { label: 'Mutlu Müşteri', value: '5000+', icon: '😊', color: 'text-orange-600' },
  ];

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": config.appName,
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`,
          "width": 512,
          "height": 512
        },
        "description": "Doğada unutulmaz kamp deneyimleri için kamp alanları ve kamp malzemeleri pazaryeri",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "info@wecamp.com",
          "availableLanguage": "Turkish"
        }
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": config.appName,
        "description": "Kamp alanları ve kamp malzemeleri pazaryeri - Doğada unutulmaz deneyimler için",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "inLanguage": "tr-TR",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        "url": baseUrl,
        "name": `${config.appName} - Ana Sayfa`,
        "description": "Doğada unutulmaz kamp deneyimleri için kamp alanları ve kamp malzemeleri. Türkiye'nin en kapsamlı kamp pazaryeri.",
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "about": {
          "@id": `${baseUrl}/#organization`
        },
        "primaryImageOfPage": {
          "@type": "ImageObject",
          "url": `${baseUrl}/tent-4534210_1280.jpg`
        },
        "datePublished": "2024-01-01T00:00:00+03:00",
        "dateModified": new Date().toISOString(),
        "inLanguage": "tr-TR"
      }
    ]
  };

  return (
    <>
      <SEO
        title="WeCamp - Kamp Alanı Pazar Yeri | Doğada Unutulmaz Deneyimler"
        description="Doğada unutulmaz kamp deneyimleri için kamp alanları ve kamp malzemeleri. Türkiye'nin en kapsamlı kamp pazaryeri. 200+ kamp alanı, 500+ kamp malzemesi ile doğada unutulmaz anılar biriktirin."
        keywords="kamp, kamp alanı, kamp malzemeleri, doğa, outdoor, kamp çadırı, kamp ekipmanları, kamp rehberi, Türkiye kamp alanları, kiralık kamp malzemeleri, kamp pazarı, doğa aktiviteleri, kamp deneyimi, kamp tüyoları, WeCamp"
        image="/tent-4534210_1280.jpg"
        url={baseUrl}
        canonicalUrl={baseUrl}
        structuredData={structuredData}
        author={config.appName}
        locale="tr_TR"
      />

      {/* Hero Section - LCP Optimized */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-center text-white overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600" />
        
        {/* LCP Image - Optimized with WebP/AVIF and responsive sizes */}
        <picture>
          {/* AVIF format (best compression) */}
          <source
            srcSet="/tent-4534210_1280.jpg?fm=avif&w=400&q=80 400w, /tent-4534210_1280.jpg?fm=avif&w=800&q=80 800w, /tent-4534210_1280.jpg?fm=avif&w=1280&q=80 1280w"
            type="image/avif"
            sizes="100vw"
          />
          {/* WebP format (good compression, wider support) */}
          <source
            srcSet="/tent-4534210_1280.jpg?fm=webp&w=400&q=80 400w, /tent-4534210_1280.jpg?fm=webp&w=800&q=80 800w, /tent-4534210_1280.jpg?fm=webp&w=1280&q=80 1280w"
            type="image/webp"
            sizes="100vw"
          />
          {/* Fallback to optimized JPEG */}
          <img
            src="/tent-4534210_1280.jpg?w=1280&q=80"
            alt="Kamp alanı ve doğa manzarası"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            style={{ transform: 'scale(1.1)' }}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            width="1280"
            height="853"
            srcSet="/tent-4534210_1280.jpg?w=400&q=80 400w, /tent-4534210_1280.jpg?w=800&q=80 800w, /tent-4534210_1280.jpg?w=1280&q=80 1280w"
            sizes="100vw"
          />
        </picture>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl">
              Doğada Unutulmaz
              <span className="block text-primary-200 mt-2">Deneyimler Yaşayın</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto leading-relaxed"
          >
            Kamp alanları ve kamp malzemeleriyle doğanın büyüsünü keşfedin. 
            Türkiye'nin en kapsamlı kamp pazaryerinde maceranıza başlayın.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to={routes.blog}>
              <Button 
                variant="secondary" 
                size="lg"
                className="shadow-2xl hover:shadow-primary-500/50 transition-all duration-300"
              >
                📖 Blog Yazılarını Keşfet
              </Button>
            </Link>
            <Link to={routes.gear}>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 transition-all duration-300 shadow-xl"
              >
                🎒 Malzemeleri İncele
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-3 bg-white/70 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Rakamlarla WeCamp
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Binlerce kullanıcının tercihi
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className={`text-4xl lg:text-5xl font-bold ${stat.color} dark:text-primary-400 mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium text-sm lg:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Blog Posts */}
      {featuredBlogs.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  📚 Öne Çıkan Blog Yazıları
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  En popüler ve güncel kamp rehberleri, ipuçları ve deneyimler
                </p>
              </div>
              <Link to={routes.blog} className="mt-4 sm:mt-0">
                <Button variant="outline" size="lg">
                  Tümünü Gör →
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <Link to={`/blog/${post.id}`}>
                    <div className="relative h-56 overflow-hidden">
                      <OptimizedImage
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        priority={index < 2} // First 2 blog images above-the-fold: eager loading
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-primary-600 text-white text-sm font-semibold rounded-full shadow-lg">
                          {post.category}
                        </span>
                      </div>
                      {post.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                            ⭐ Öne Çıkan
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="flex items-center">
                          <span className="mr-1.5">📅</span>
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1.5">📖</span>
                          {post.readTime} dk
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Gear Section */}
      {featuredGear.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  🎒 Öne Çıkan Kamp Malzemeleri
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  En popüler ve kaliteli kamp ekipmanları
                </p>
              </div>
              <Link to={routes.gear} className="mt-4 sm:mt-0">
                <Button variant="outline" size="lg">
                  Tümünü Gör →
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGear.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <Link to={`/gear/${item.id}`}>
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {item.images && item.images.length > 0 ? (
                        <OptimizedImage
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          priority={index < 2} // First 2 gear images above-the-fold: eager loading
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🎒
                        </div>
                      )}
                      {!item.available && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                            Kiralanamaz
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="mb-2">
                        <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <h3 
                        className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          overflowX: 'hidden',
                          maxWidth: '100%',
                        }}
                      >
                        {item.name}
                      </h3>
                      <p 
                        className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          overflowX: 'hidden',
                          maxWidth: '100%',
                        }}
                      >
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {formatPrice(item.pricePerDay ?? item.price ?? 0)}
                          </span>
                        </div>
                        {item.rating && (
                          <div className="flex items-center text-yellow-500">
                            <span className="mr-1">⭐</span>
                            <span className="font-semibold">{typeof item.rating === 'number' ? item.rating.toFixed(1) : parseFloat(String(item.rating)).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Neden WeCamp?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Doğada unutulmaz deneyimler yaşamanız için ihtiyacınız olan her şey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '✅',
                title: 'Güvenli Ödeme',
                description: 'Güvenli ve hızlı ödeme sistemleri ile rahatça alışveriş yapın'
              },
              {
                icon: '🚚',
                title: 'Hızlı Teslimat',
                description: 'Seçtiğiniz malzemeleri hızlı ve güvenli bir şekilde kapınıza getiriyoruz'
              },
              {
                icon: '⭐',
                title: 'Kaliteli Ürünler',
                description: 'Sadece test edilmiş ve kaliteli kamp malzemeleri sunuyoruz'
              },
              {
                icon: '📱',
                title: 'Kolay Kullanım',
                description: 'Kullanıcı dostu arayüz ile kolayca rezervasyon yapabilirsiniz'
              },
              {
                icon: '🔄',
                title: 'Esnek İptal',
                description: 'Planlarınız değiştiyse esnek iptal politikamızdan yararlanın'
              },
              {
                icon: '💬',
                title: '7/24 Destek',
                description: 'Her zaman yanınızdayız. Sorularınız için 7/24 destek alabilirsiniz'
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-primary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Maceranıza Bugün Başlayın
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Doğada unutulmaz anılar biriktirin ve kamp deneyiminizi en üst seviyeye çıkarın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={routes.blog}>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="shadow-2xl hover:shadow-white/20 transition-all duration-300"
                >
                  📖 Blog Yazılarını Keşfet
                </Button>
              </Link>
              <Link to={routes.gear}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 transition-all duration-300 shadow-xl"
                >
                  🎒 Kamp Malzemelerini İncele
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
