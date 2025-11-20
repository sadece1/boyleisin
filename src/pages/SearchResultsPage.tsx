import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Input } from '@/components/Input';
import { GearCard } from '@/components/GearCard';
import { searchService } from '@/services/searchService';
import { routes } from '@/config';
import { Gear } from '@/types';
import { formatDate } from '@/utils/validation';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  category: string;
  image: string;
  readTime: number;
  tags?: string[];
  views?: number;
}

type FilterType = 'all' | 'blogs' | 'gear';

export const SearchResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const filterType = (searchParams.get('type') || 'all') as FilterType;

  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [allGear, setAllGear] = useState<Gear[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [filteredGear, setFilteredGear] = useState<Gear[]>([]);
  const [searchInput, setSearchInput] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Get all categories from blogs
  const blogCategories = Array.from(
    new Set(allBlogs.map(blog => blog.category))
  );

  // Search when query changes
  useEffect(() => {
    if (query && query.length >= 2) {
      setIsLoading(true);
      const results = searchService.search(query);
      // Cast to BlogPost[] since searchService returns compatible structure
      setAllBlogs(results.blogs as unknown as BlogPost[]);
      setAllGear(results.gear);
      setIsLoading(false);
    } else {
      setAllBlogs([]);
      setAllGear([]);
    }
  }, [query]);

  // Filter results
  useEffect(() => {
    let blogs = [...allBlogs];
    let gear = [...allGear];

    // Apply category filter for blogs
    if (selectedCategory !== 'all' && filterType !== 'gear') {
      blogs = blogs.filter(blog => blog.category === selectedCategory);
    }

    setFilteredBlogs(blogs);
    setFilteredGear(gear);
  }, [allBlogs, allGear, selectedCategory, filterType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.length >= 2) {
      setSearchParams({ q: searchInput, type: filterType });
    }
  };

  const handleFilterChange = (type: FilterType) => {
    setSearchParams({ q: query, type });
  };

  const totalResults = filteredBlogs.length + filteredGear.length;
  const showBlogs = filterType === 'all' || filterType === 'blogs';
  const showGear = filterType === 'all' || filterType === 'gear';

  return (
    <>
      <SEO 
        title={`Arama Sonuçları: ${query}`} 
        description={`"${query}" için ${totalResults} sonuç bulundu`} 
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🔍 Arama Sonuçları
            </h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="max-w-2xl flex gap-2">
                <Input
                  type="text"
                  placeholder="Ara..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  Ara
                </button>
              </div>
            </form>

            {query && (
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    &quot;{query}&quot;
                  </span> için <span className="font-semibold">{totalResults}</span> sonuç bulundu
                </p>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          {query && (
            <div className="mb-6 flex gap-3 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  filterType === 'all'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Tümü ({allBlogs.length + allGear.length})
              </button>
              <button
                onClick={() => handleFilterChange('blogs')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  filterType === 'blogs'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                📝 Blog Yazıları ({allBlogs.length})
              </button>
              <button
                onClick={() => handleFilterChange('gear')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  filterType === 'gear'
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                🎒 Ürünler ({allGear.length})
              </button>
            </div>
          )}

          {/* Category Filter for Blogs */}
          {showBlogs && blogCategories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                Tüm Kategoriler
              </button>
              {blogCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Aranıyor...</p>
            </div>
          )}

          {/* No Query State */}
          {!query && !isLoading && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Arama Yapın
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Blog yazıları ve ürünlerde arama yapmak için yukarıdaki arama kutusunu kullanın
              </p>
            </div>
          )}

          {/* No Results State */}
          {query && !isLoading && totalResults === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Sonuç Bulunamadı
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                &quot;{query}&quot; için aradığınız kriterlere uygun sonuç bulunamadı.
              </p>
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchParams({});
                }}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
              >
                Aramayı Temizle
              </button>
            </div>
          )}

          {/* Results */}
          {query && !isLoading && totalResults > 0 && (
            <div className="space-y-12">
              {/* Gear Results - ÜSTTE */}
              {showGear && filteredGear.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-2">🎒</span>
                    Ürünler ({filteredGear.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredGear.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 group"
                        onClick={() => navigate(`${routes.gear}/${item.id}`)}
                      >
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                          <OptimizedImage
                            src={item.images[0] || ''}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {!item.available && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Stokta Yok
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                              {item.pricePerDay} ₺
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Blog Results - ALTTA */}
              {showBlogs && filteredBlogs.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="mr-2">📝</span>
                    Blog Yazıları ({filteredBlogs.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredBlogs.map((blog, index) => (
                      <motion.article
                        key={blog.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl overflow-hidden transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 group"
                        onClick={() => navigate(`${routes.blog}/${blog.id}`)}
                      >
                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                          <OptimizedImage
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          <div className="absolute top-4 left-4 right-4">
                            <span className="inline-block px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                              {blog.category}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-lg font-bold mb-1 line-clamp-2 drop-shadow-lg group-hover:text-primary-200 transition-colors">
                              {blog.title}
                            </h3>
                          </div>
                        </div>
                        <div className="p-5">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                            {blog.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center">
                                <span className="mr-1">👤</span>
                                {blog.author}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>📖 {blog.readTime} dk</span>
                              {blog.views && <span>👁️ {blog.views}</span>}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-primary-600 dark:text-primary-400 font-medium group-hover:underline flex items-center">
                              Devamını Oku
                              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

