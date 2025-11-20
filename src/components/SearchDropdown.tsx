import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { routes } from '@/config';
import { OptimizedImage } from './OptimizedImage';
import { Gear } from '@/types';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
}

interface SearchDropdownProps {
  blogs: BlogPost[];
  gear: Gear[];
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export const SearchDropdown = ({ blogs, gear, searchQuery, isOpen, onClose, isMobile = false }: SearchDropdownProps) => {
  const hasResults = blogs.length > 0 || gear.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - only for desktop */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            />
          )}

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`${isMobile ? 'absolute top-full left-0 right-0 mt-2 z-[60]' : 'absolute top-full right-0 mt-2 z-50'} bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 ${isMobile ? 'max-h-[calc(60vh-120px)]' : 'max-h-[600px]'} overflow-y-auto ${isMobile ? 'w-full' : 'w-max min-w-[192px] max-w-[calc(100vw-2rem)]'}`}
            style={!isMobile ? { width: 'max-content', maxWidth: 'calc(100vw - 2rem)' } : {}}
          >
            {!hasResults ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-600 dark:text-gray-400">
                  &quot;{searchQuery}&quot; için sonuç bulunamadı
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Farklı bir arama terimi deneyin
                </p>
              </div>
            ) : (
              <div className="p-4">
                {/* Gear Results - ÜSTTE */}
                {gear.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center">
                        <span className="mr-2 text-lg">🎒</span>
                        Ürünler ({gear.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {gear.map((item) => (
                        <Link
                          key={item.id}
                          to={`${routes.gear}/${item.id}`}
                          onClick={onClose}
                          className="group relative flex items-center gap-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 overflow-hidden"
                        >
                          <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                            <OptimizedImage
                              src={item.images[0] || ''}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex-1 min-w-0 pr-2.5">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {item.name}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                                {item.pricePerDay} ₺
                              </span>
                              {!item.available && (
                                <span className="text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                                  Yok
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blog Results - ALTTA */}
                {blogs.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center">
                        <span className="mr-2 text-lg">📝</span>
                        Blog Yazıları ({blogs.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {blogs.map((blog) => (
                        <Link
                          key={blog.id}
                          to={`${routes.blog}/${blog.id}`}
                          onClick={onClose}
                          className="group relative flex items-center gap-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 overflow-hidden"
                        >
                          <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                            <OptimizedImage
                              src={blog.image}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute bottom-1 left-1 right-1">
                              <span className="inline-block px-2 py-0.5 bg-primary-600 text-white text-[10px] font-semibold rounded-full backdrop-blur-sm">
                                {blog.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pr-2.5">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {blog.title}
                            </h4>
                            {blog.excerpt && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                                {blog.excerpt}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* View All Link */}
                {(blogs.length > 0 || gear.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to={`${routes.search}?q=${encodeURIComponent(searchQuery)}`}
                      onClick={onClose}
                      className="block text-center py-3 px-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors bg-primary-50/50 dark:bg-primary-900/10"
                    >
                      🔍 Tüm Sonuçları Gör ({blogs.length + gear.length} sonuç) →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

