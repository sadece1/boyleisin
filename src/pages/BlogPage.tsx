import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SEO } from '@/components/SEO';
import { OptimizedImage } from '@/components/OptimizedImage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Input } from '@/components/Input';
import { formatDate } from '@/utils/validation';
import { useBlogStore } from '@/store/blogStore';
import { BlogPost } from '@/types';

gsap.registerPlugin(ScrollTrigger);

export const BlogPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { blogs, fetchBlogs, isLoading } = useBlogStore();
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Fetch blogs on mount
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        await fetchBlogs({}, 1);
      } catch (error) {
        console.error('Failed to load blogs:', error);
        // fetchBlogs will handle the error and use mock data
      }
    };
    loadBlogs();
  }, [fetchBlogs]);

  const categories = ['Tümü', ...Array.from(new Set(blogs.map(p => p.category)))];
  const popularPosts = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  const totalPosts = blogs.length;
  const totalViews = blogs.reduce((sum, p) => sum + (p.views || 0), 0);
  const avgReadTime = blogs.length > 0 ? Math.round(blogs.reduce((sum, p) => sum + p.readTime, 0) / blogs.length) : 0;

  // Update URL when search changes (but only if different from URL param to avoid infinite loop)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (search !== urlSearch) {
      if (search) {
        setSearchParams({ search }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }
  }, [search]); // Removed setSearchParams and searchParams from dependencies

  useEffect(() => {
    let filtered = blogs || [];
    
    if (search) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(filtered);
  }, [search, selectedCategory, blogs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Hero animation
      if (heroRef.current) {
        const title = heroRef.current.querySelector('.hero-title');
        const subtitle = heroRef.current.querySelector('.hero-subtitle');
        
        if (title && subtitle) {
          gsap.set([title, subtitle], { opacity: 0, y: 30 });
          const timeline = gsap.timeline();
          
          timeline
            .to(title, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
            .to(subtitle, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
        }
      }

      // Stats animation
      if (statsRef.current) {
        const items = statsRef.current.querySelectorAll('.stat-item');
        if (items.length > 0) {
          gsap.set(items, { opacity: 0, scale: 0.8 });
          
          gsap.to(items, {
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.4)',
          });
        }
      }

      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      try {
        const { newsletterService } = await import('@/services/newsletterService');
        await newsletterService.subscribe(newsletterEmail);
        alert('Newsletter\'a başarıyla kaydoldunuz!');
        setNewsletterEmail('');
      } catch (error) {
        console.error('Failed to subscribe to newsletter:', error);
        alert('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  return (
    <>
      <SEO 
        title="Blog - WeCamp | Kamp Rehberi, İpuçları ve Deneyim Paylaşımları" 
        description="Kamp ve doğa hakkında güncel yazılar, ipuçları, rehberler ve deneyim paylaşımları. WeCamp blog ile kamp bilginizi artırın. Türkiye'nin en kapsamlı kamp ve outdoor blog içeriği."
        keywords="kamp blog, doğa yazıları, kamp rehberi, kamp ipuçları, kamp deneyimleri, outdoor blog, kamp yazıları, doğa aktiviteleri, kamp önerileri, kamp rehberi Türkiye"
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
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              WeCamp Blog
            </h1>
            <p className="hero-subtitle text-lg sm:text-xl md:text-2xl text-gray-100 font-medium drop-shadow-md">
              Kamp ve doğa hakkında güncel yazılar, ipuçları ve rehberler
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section
          ref={statsRef}
          className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: totalPosts.toString(), label: 'Blog Yazısı', icon: '📝' },
                { value: totalViews.toLocaleString('tr-TR'), label: 'Toplam Görüntülenme', icon: '👁️' },
                { value: `${avgReadTime} dk`, label: 'Ortalama Okuma', icon: '⏱️' },
                { value: categories.length - 1 + '+', label: 'Kategori', icon: '🏷️' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="stat-item text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Yazılarda ara... (başlık, içerik, etiket)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-4 py-3 text-lg"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl">
                    🔍
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Blog Posts Grid */}
              <div className="lg:col-span-2">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {filteredPosts.length > 0 
                          ? `${filteredPosts.length} Yazı Bulundu` 
                          : 'Yazı Bulunamadı'}
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700"
                      onClick={() => navigate(`/blog/${post.id}`)}
                      whileHover={{ y: -5 }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <OptimizedImage
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                            {post.category}
                          </span>
                        </div>
                        {post.featured && (
                          <div className="absolute top-4 right-4">
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                              ⭐
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm">
                          {post.excerpt}
                        </p>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <span className="mr-1">👤</span>
                              {post.author}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <span className="mr-1">📅</span>
                              {formatDate(post.publishedAt)}
                            </span>
                            <span className="flex items-center">
                              <span className="mr-1">📖</span>
                              {post.readTime} dk
                            </span>
                            {post.views && (
                              <span className="flex items-center">
                                <span className="mr-1">👁️</span>
                                {post.views}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                      ))}
                    </div>

                    {filteredPosts.length === 0 && (
                  <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Sonuç Bulunamadı
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Aradığınız kriterlere uygun blog yazısı bulunamadı.
                    </p>
                    <button
                      onClick={() => {
                        setSearch('');
                        setSelectedCategory('Tümü');
                      }}
                      className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                      Filtreleri Temizle
                    </button>
                  </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-8">
                {/* Popular Posts */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="mr-2">🔥</span>
                    Popüler Yazılar
                  </h3>
                  <div className="space-y-4">
                    {popularPosts.map((post, index) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.id}`}
                        className="flex gap-3 group hover:bg-gray-50 dark:hover:bg-gray-900 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                          <OptimizedImage
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {post.title}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="mr-2">👁️ {post.views}</span>
                            <span>📖 {post.readTime} dk</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-2xl font-bold text-gray-300 dark:text-gray-600">
                          {index + 1}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="mr-2">🏷️</span>
                    Kategoriler
                  </h3>
                  <div className="space-y-2">
                    {categories.filter(c => c !== 'Tümü').map((category) => {
                      const count = blogs.filter(p => p.category === category).length;
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left group"
                        >
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium">
                            {category}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 flex items-center">
                    <span className="mr-2">📧</span>
                    Newsletter
                  </h3>
                  <p className="text-primary-100 text-sm mb-4">
                    Yeni yazılarımızdan ve kamp ipuçlarından haberdar olmak için abone olun!
                  </p>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="E-posta adresiniz"
                      className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Abone Ol
                    </button>
                  </form>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
