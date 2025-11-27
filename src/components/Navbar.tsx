import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useDebounce } from '@/hooks/useDebounce';
import { routes } from '@/config';
import { searchService, SearchResult } from '@/services/searchService';
import { categoryManagementService } from '@/services/categoryManagementService';
import { Category } from '@/types';
import { Button } from './Button';
import { SearchDropdown } from './SearchDropdown';

interface CategoryItem {
  name: string;
  path?: string;
  icon?: string;
  children?: CategoryItem[];
}

// Convert Category to CategoryItem recursively
// Hiyerarşi: Ana Başlık (parentId: null) -> Sütun Kategorisi (parentId: ana başlık ID) -> Alt Kategori (parentId: sütun ID, tıklanabilir)
// ÖNEMLİ: Sütun kategorileri HİÇBİR ZAMAN path'e sahip olmamalı (children olsun veya olmasın)
// Sadece en alt seviye kategoriler (leaf nodes) path'e sahip olmalı
const convertCategoryToItem = (category: Category, allCategories: Category[]): CategoryItem => {
  const children = allCategories.filter(c => c.parentId === category.id);
  const childrenItems = children
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(child => convertCategoryToItem(child, allCategories));

  const hasChildren = childrenItems.length > 0;
  
  // Eğer bu bir root kategori (parentId: null) ise
  if (category.parentId === null) {
    // Root kategoriler path'e sahip olmamalı (navbar'da gösterilir ama tıklanamaz değil, hover dropdown için)
    return {
      name: category.name,
      path: undefined,
      icon: category.icon,
      children: hasChildren ? childrenItems : undefined,
    };
  }
  
  // Eğer bu bir sütun kategorisi ise (parentId var, ama parentId'sinin parentId'si null - yani ana başlık altında)
  const parentCategory = allCategories.find(c => c.id === category.parentId);
  const isColumnCategory = parentCategory?.parentId === null;
  
  if (isColumnCategory) {
    // Sütun kategorileri HİÇBİR ZAMAN path'e sahip olmamalı (children olsun veya olmasın)
    return {
      name: category.name,
      path: undefined, // Sütun kategorileri path'e sahip olmamalı
      icon: category.icon,
      children: hasChildren ? childrenItems : undefined, // Henüz alt kategori eklenmemiş olsa bile children undefined
    };
  }
  
  // En alt seviye kategori (alt kategori - sütun kategorisinin altında)
  // Bu kategoriler path'e sahip olmalı - tıklanabilir
  return {
    name: category.name,
    path: `/category/${category.slug}`,
    icon: category.icon,
    children: undefined,
  };
};

// Legacy hardcoded categories (kept as fallback)
const legacyCategories: CategoryItem[] = [
  {
    name: 'Kamp Malzemeleri',
    icon: '🏕️',
    children: [
      {
        name: 'Kamp Mutfağı',
        icon: '🔸',
        children: [
          { name: 'Kamp Ocakları', path: '/category/kamp-ocaklari' },
          { name: 'Termos ve Mug', path: '/category/termos' },
          { name: 'Kamp Çatal Kaşık Bıçak Setleri', path: '/category/mutfak-setleri' },
          { name: 'Barbekü, Mangal ve Izgaralar', path: '/category/barbeku' },
          { name: 'Kamp Tenceresi ve Tava', path: '/category/tencere-tava' },
          { name: 'Kamp Çaydanlıkları', path: '/category/caydanlik' },
          { name: 'Kupa Bardaklar', path: '/category/kupa-bardak' },
          { name: 'Diğer Kamp Mutfak Ürünleri', path: '/category/mutfak-diger' },
        ],
      },
      {
        name: 'Kamp Mobilyaları',
        icon: '🔸',
        // Sütun kategorisi - path yok, tıklanabilir değil
        children: [
          { name: 'Kamp Masası', path: '/category/kamp-masasi' },
          { name: 'Kamp Sandalyesi', path: '/category/kamp-sandalyesi' },
          { name: 'Kamp Taburesi', path: '/category/kamp-taburesi' },
          { name: 'Kampet', path: '/category/kampet' },
        ],
      },
      {
        name: 'Aydınlatma ve Fenerler',
        icon: '🔸',
        // Sütun kategorisi - path yok, tıklanabilir değil
        children: [
          { name: 'Kamp Fenerleri', path: '/category/kamp-fenerleri' },
          { name: 'Kamp Lambaları', path: '/category/kamp-lambalari' },
        ],
      },
      {
        name: 'Isıtıcı ve Sobalar',
        icon: '🔸',
        // Sütun kategorisi - path yok, tıklanabilir değil
        children: [
          { name: 'Çadır Sobaları', path: '/category/cadir-sobalari' },
          { name: 'LPG Tüp Sobaları', path: '/category/lpg-tup-sobalari' },
          { name: 'Portatif Sobalar', path: '/category/portatif-sobalar' },
        ],
      },
    ],
  },
  {
    name: 'Outdoor Ekipmanları',
    icon: '⛺',
    children: [
      {
        name: 'Kamp Temel Ekipmanları',
        icon: '🔸',
        children: [
          { name: 'Kamp Çadırları', path: '/category/cadir' },
          { name: 'Uyku Tulumları', path: '/category/uyku-tulumu' },
          { name: 'Kamp Matı', path: '/category/kamp-mati' },
          { name: 'Hamaklar', path: '/category/hamak' },
          { name: 'Rüzgarlıklar', path: '/category/ruzgarlik' },
          { name: 'Outdoor Ekipman', path: '/category/outdoor' },
        ],
      },
      {
        name: 'Kamp Araç ve Aksesuarları',
        icon: '🔸',
        children: [
          { name: 'Kartuş Tüpler', path: '/category/kartus-tup' },
          { name: 'Pürmüzler', path: '/category/purmuz' },
          { name: 'Kamp Bıçakları', path: '/category/bicak' },
          { name: 'Kamp Baltaları', path: '/category/balta' },
          { name: 'Kazma Kürek Seti', path: '/category/kazma-kurek' },
          { name: 'Doğa Şömineleri', path: '/category/somine' },
          { name: 'Ateş Kutuları', path: '/category/ates-kutusu' },
          { name: 'Nargile Ocakları', path: '/category/nargile-ocak' },
          { name: 'Diğer Kamp Aksesuarları', path: '/category/aksesuar' },
        ],
      },
    ],
  },
  {
    name: 'Orgaz Ürünleri',
    icon: '🔧',
    children: [
      {
        name: 'Orgaz Ürünleri',
        icon: '🔸',
        children: [
          { name: 'Dedantörler', path: '/category/dedantor' },
          { name: 'Kaynak Takımları', path: '/category/kaynak' },
          { name: 'LPG Hortumları', path: '/category/lpg-hortum' },
          { name: 'Ocaklar', path: '/category/orgaz-ocak' },
          { name: 'Sobalar', path: '/category/orgaz-soba' },
          { name: 'Tüp Muslukları', path: '/category/tup-musluk' },
        ],
      },
    ],
  },
];

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ blogs: [], gear: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>(legacyCategories);
  const [dropdownPositions, setDropdownPositions] = useState<Map<string, { left?: number | string; top?: number | string }>>(new Map());
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { favorites } = useFavoritesStore();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load categories from categoryManagementService
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allCategories = await categoryManagementService.getAllCategories();
        const rootCategories = allCategories
          .filter(cat => !cat.parentId)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const categoryItems = rootCategories.map(rootCat => 
          convertCategoryToItem(rootCat, allCategories)
        );

        if (categoryItems.length > 0) {
          setCategories(categoryItems);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback to legacy categories
        setCategories(legacyCategories);
      }
    };

    loadCategories();

    // Listen for custom event when categories are updated (for same-tab updates)
    const handleCategoryUpdate = () => {
      loadCategories();
    };

    window.addEventListener('categoriesUpdated', handleCategoryUpdate);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdate);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate(routes.home);
    setIsMobileMenuOpen(false);
  };

  // Search functionality
  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchService.search(debouncedSearch).then(results => {
      setSearchResults(results);
      setIsSearchOpen(true);
      }).catch(error => {
        console.error('Search failed:', error);
        setSearchResults({ blogs: [], gear: [] });
      });
    } else {
      setSearchResults({ blogs: [], gear: [] });
      setIsSearchOpen(false);
    }
  }, [debouncedSearch]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInsideDesktop = desktopSearchRef.current?.contains(target);
      const isClickInsideMobile = mobileSearchRef.current?.contains(target);
      
      let isClickInsideCategory = false;
      categoryRefs.current.forEach((ref) => {
        if (ref?.contains(target)) {
          isClickInsideCategory = true;
        }
      });
      
      if (!isClickInsideDesktop && !isClickInsideMobile) {
        setIsSearchOpen(false);
      }
      
      if (!isClickInsideCategory && isCategoriesOpen) {
        setIsCategoriesOpen(false);
        setExpandedCategories(new Set());
      }
    };

    if (isSearchOpen || isCategoriesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, isCategoriesOpen]);

  // Update dropdown position on scroll/resize (for fixed positioning)
  useEffect(() => {
    if (isCategoriesOpen && expandedCategories.size > 0) {
      const updatePositions = () => {
        expandedCategories.forEach((categoryName) => {
          const buttonRef = categoryRefs.current.get(categoryName);
          const category = categories.find(c => c.name === categoryName);
          
          if (buttonRef && category) {
            requestAnimationFrame(() => {
              const buttonRect = buttonRef.getBoundingClientRect();
              const viewportWidth = window.innerWidth;
              const columnCount = category.children?.length || 1;
              const estimatedWidth = Math.min(columnCount > 5 ? viewportWidth - 32 : columnCount * 220 + 32, viewportWidth - 32);
              
              let left = buttonRect.left;
              let right = buttonRect.left + estimatedWidth;
              
              if (right > viewportWidth - 16) {
                left = viewportWidth - estimatedWidth - 16;
              }
              if (left < 16) {
                left = 16;
              }
              
              setDropdownPositions(prev => {
                const updated = new Map(prev);
                updated.set(categoryName, { 
                  left: `${left}px`,
                  top: `${buttonRect.bottom + 8}px`
                });
                return updated;
              });
            });
          }
        });
      };
      
      // Initial update
      updatePositions();
      
      // Update on scroll and resize
      window.addEventListener('scroll', updatePositions, true);
      window.addEventListener('resize', updatePositions);
      
      return () => {
        window.removeEventListener('scroll', updatePositions, true);
        window.removeEventListener('resize', updatePositions);
      };
    }
  }, [isCategoriesOpen, expandedCategories, categories]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const navLinks = [
    { path: routes.blog, label: 'Blog' },
    { path: routes.about, label: 'Hakkımızda' },
    { path: routes.references, label: 'Referanslar' },
    { path: routes.contact, label: 'İletişim' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm min-h-fit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-visible bg-white dark:bg-gray-900">
        {/* Üst Satır: Logo, Arama, Navigasyon Linkleri, Aksiyonlar */}
        <div className="flex items-center justify-between h-16 py-2 bg-white dark:bg-gray-900">
          {/* Logo */}
          <Link 
            to={routes.home} 
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🌲</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              WeCamp
            </span>
          </Link>

          {/* Search Bar - Merkez */}
          <div className="hidden lg:flex items-center w-96 relative mx-8" ref={desktopSearchRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Blog ve ürün ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    setIsSearchOpen(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                    e.preventDefault();
                    navigate(`${routes.search}?q=${encodeURIComponent(searchQuery.trim())}`);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) {
                    setIsSearchOpen(true);
                  }
                }}
                className="w-full px-4 py-2.5 pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-medium"
                >
                  ✕
                </button>
              )}
            </div>
            <SearchDropdown
              blogs={searchResults.blogs}
              gear={searchResults.gear}
              searchQuery={debouncedSearch}
              isOpen={isSearchOpen && debouncedSearch.length >= 2}
              onClose={() => setIsSearchOpen(false)}
              isMobile={false}
            />
          </div>

          {/* Sağ Taraf: Navigasyon Linkleri + Aksiyonlar */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg whitespace-nowrap transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

            {/* Favorites */}
            <Link
              to={routes.favorites}
              className="relative flex items-center justify-center p-2.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
              title="Favorilerim"
            >
              <span className="text-xl">❤️</span>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm">
                  {favorites.length > 99 ? '99+' : favorites.length}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              aria-label="Toggle theme"
            >
              <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            
            {/* User Actions */}
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to={routes.admin}>
                    <Button variant="outline" size="sm" className="text-sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {user?.name}
                  </span>
                  <Link to={routes.profile}>
                    <Button variant="outline" size="sm" className="text-sm">
                      Profil
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-sm"
                  >
                    Çıkış
                  </Button>
                </div>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden relative p-2.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 group"
            aria-label="Toggle menu"
          >
            <motion.div
              className="flex flex-col gap-1.5 w-6 h-5 justify-center items-center"
              animate={isMobileMenuOpen ? { rotate: 180 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                className="block w-6 h-0.5 bg-current rounded-full"
                animate={
                  isMobileMenuOpen
                    ? { rotate: 45, y: 8, backgroundColor: 'currentColor' }
                    : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-current rounded-full"
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block w-6 h-0.5 bg-current rounded-full"
                animate={
                  isMobileMenuOpen
                    ? { rotate: -45, y: -8 }
                    : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </button>
        </div>

        {/* Alt Satır: Kategoriler */}
        <div className="hidden lg:flex items-center justify-center gap-4 min-h-14 border-t border-gray-200 dark:border-gray-700 flex-wrap overflow-visible bg-white dark:bg-gray-900 py-2">
          {/* Categories Dropdown */}
          {categories.map((category) => (
            <div 
              key={category.name} 
              className="relative overflow-visible"
              ref={(el) => {
                if (el) {
                  categoryRefs.current.set(category.name, el);
                } else {
                  categoryRefs.current.delete(category.name);
                }
              }}
            >
              <button
                onMouseEnter={() => {
                  // Calculate position before opening (for fixed positioning)
                  const buttonRef = categoryRefs.current.get(category.name);
                  if (buttonRef) {
                    const buttonRect = buttonRef.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const columnCount = category.children?.length || 1;
                    const estimatedWidth = Math.min(columnCount > 5 ? viewportWidth - 32 : columnCount * 220 + 32, viewportWidth - 32);
                    
                    let left = buttonRect.left;
                    let right = buttonRect.left + estimatedWidth;
                    
                    if (right > viewportWidth - 16) {
                      left = viewportWidth - estimatedWidth - 16;
                    }
                    if (left < 16) {
                      left = 16;
                    }
                    
                    setDropdownPositions(prev => {
                      const updated = new Map(prev);
                      updated.set(category.name, { 
                        left: `${left}px`,
                        top: `${buttonRect.bottom + 8}px`
                      });
                      return updated;
                    });
                  }
                  
                  setIsCategoriesOpen(true);
                  setExpandedCategories(new Set([category.name]));
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.name}</span>
                <span className={`text-xs text-gray-600 dark:text-gray-400 transition-transform duration-200 ${expandedCategories.has(category.name) && isCategoriesOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              <AnimatePresence>
                {isCategoriesOpen && expandedCategories.has(category.name) && (
                  <motion.div
                    ref={(el) => {
                      if (el) {
                        dropdownRefs.current.set(category.name, el);
                      } else {
                        dropdownRefs.current.delete(category.name);
                      }
                    }}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => {
                      setIsCategoriesOpen(true);
                      setExpandedCategories(new Set([category.name]));
                    }}
                    onMouseLeave={() => {
                      setIsCategoriesOpen(false);
                      setExpandedCategories(new Set());
                    }}
                    className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 z-50"
                    style={{ 
                      width: 'max-content',
                      maxWidth: 'calc(100vw - 2rem)',
                      ...(dropdownPositions.get(category.name) || { left: '0px', top: '0px' })
                    }}
                  >
                    <div 
                      className="grid gap-6" 
                      style={{ 
                        gridTemplateColumns: category.children && category.children.length > 5 
                          ? `repeat(5, minmax(180px, 1fr))`
                          : `repeat(${category.children?.length || 1}, minmax(180px, auto))`,
                        maxWidth: category.children && category.children.length > 5 
                          ? 'calc(100vw - 2rem)'
                          : 'max-content'
                      }}
                    >
                      {(() => {
                        // Eğer direkt alt kategoriler varsa (sütun kategorisi yok), bunları tek sütunda göster
                        const hasDirectSubCategories = category.children?.some(sub => sub.path && !sub.children);
                        const hasColumnCategories = category.children?.some(sub => sub.children);
                        
                        if (hasDirectSubCategories && !hasColumnCategories) {
                          // Sütun kategorisi yok, direkt alt kategoriler var - tek sütunda göster
                          const directCategories = category.children?.filter(sub => sub.path && !sub.children) || [];
                          return (
                            <div className="space-y-2" style={{ minWidth: 'max-content' }}>
                              <div className="space-y-1">
                                {directCategories.map((item) => (
                                  <Link
                                    key={item.name}
                                    to={item.path || '#'}
                                    onClick={() => {
                                      setIsCategoriesOpen(false);
                                      setExpandedCategories(new Set());
                                    }}
                                    className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-200 py-1.5 px-3 rounded-lg font-medium whitespace-nowrap"
                                  >
                                    {item.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        
                        // Normal durum: Sütun kategorileri ve alt kategorileri
                        return category.children?.map((subCategory) => (
                          <div key={subCategory.name} className="space-y-2" style={{ minWidth: 'max-content' }}>
                            {subCategory.children ? (
                              <div>
                                {/* Sütun adı - tıklanabilir değil, bold */}
                                <div className="font-bold text-base text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap cursor-default">
                                  {subCategory.name}
                                </div>
                                <div className="space-y-1">
                                  {subCategory.children.map((item) => (
                                    <Link
                                      key={item.name}
                                      to={item.path || '#'}
                                      onClick={() => {
                                        setIsCategoriesOpen(false);
                                        setExpandedCategories(new Set());
                                      }}
                                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-200 py-1.5 px-3 rounded-lg font-medium whitespace-nowrap"
                                    >
                                      {item.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              // Alt kategori - path varsa tıklanabilir
                              subCategory.path ? (
                                <Link
                                  to={subCategory.path}
                                  onClick={() => {
                                    setIsCategoriesOpen(false);
                                    setExpandedCategories(new Set());
                                  }}
                                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-200 py-1.5 px-3 rounded-lg font-medium whitespace-nowrap"
                                >
                                  {subCategory.name}
                                </Link>
                              ) : (
                                // Path yok - tıklanabilir değil, bold yazı (sütun kategorisi gibi)
                                <div className="font-bold text-base text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap cursor-default">
                                  {subCategory.name}
                                </div>
                              )
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu - Side Drawer with Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85vw] max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden overflow-y-auto overflow-x-hidden"
              style={{ boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)' }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95">
                <div className="flex items-center justify-between px-6 py-4">
                  <Link
                    to={routes.home}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🌲</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      WeCamp
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                    aria-label="Close menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6 relative">
                {/* Mobile Search */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative z-50" 
                  ref={mobileSearchRef}
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Blog ve ürün ara..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length >= 2) {
                          setIsSearchOpen(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
                          e.preventDefault();
                          navigate(`${routes.search}?q=${encodeURIComponent(searchQuery.trim())}`);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      onFocus={() => {
                        if (searchQuery.length >= 2) {
                          setIsSearchOpen(true);
                        }
                      }}
                      className="w-full px-4 py-3.5 pl-12 pr-11 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-sm"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg">
                      🔍
                    </span>
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchOpen(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <SearchDropdown
                    blogs={searchResults.blogs}
                    gear={searchResults.gear}
                    searchQuery={debouncedSearch}
                    isOpen={isSearchOpen && debouncedSearch.length >= 2}
                    onClose={() => setIsSearchOpen(false)}
                    isMobile={true}
                  />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <Link
                    to={routes.favorites}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl hover:shadow-lg transition-all duration-200 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">❤️</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Favorilerim</span>
                    {favorites.length > 0 && (
                      <span className="absolute top-2 right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-md">
                        {favorites.length > 99 ? '99+' : favorites.length}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-200 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {theme === 'dark' ? '☀️' : '🌙'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
                    </span>
                  </button>
                </motion.div>

                {/* Mobile Categories */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Kategoriler
                  </h3>
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="flex items-center justify-between w-full text-left font-semibold text-base text-gray-900 dark:text-white py-3.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                            {category.icon}
                          </span>
                          <span>{category.name}</span>
                        </div>
                        <motion.span
                          animate={{ rotate: expandedCategories.has(category.name) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-400 dark:text-gray-500 text-sm"
                        >
                          ▼
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {expandedCategories.has(category.name) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                          >
                            <div className="px-4 py-3 space-y-3">
                              {(() => {
                                // Eğer direkt alt kategoriler varsa (sütun kategorisi yok), bunları göster
                                const hasDirectSubCategories = category.children?.some(sub => sub.path && !sub.children);
                                const hasColumnCategories = category.children?.some(sub => sub.children);
                                
                                if (hasDirectSubCategories && !hasColumnCategories) {
                                  // Sütun kategorisi yok, direkt alt kategoriler var
                                  const directCategories = category.children?.filter(sub => sub.path && !sub.children) || [];
                                  return directCategories.map((item, subIndex) => (
                                    <motion.div
                                      key={item.name}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: subIndex * 0.03 }}
                                    >
                                      <Link
                                        to={item.path || '#'}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 font-medium"
                                      >
                                        {item.name}
                                      </Link>
                                    </motion.div>
                                  ));
                                }
                                
                                // Normal durum: Sütun kategorileri ve alt kategorileri
                                return category.children?.map((subCategory, subIndex) => (
                                  <motion.div
                                    key={subCategory.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: subIndex * 0.03 }}
                                  >
                                    {subCategory.children ? (
                                      <div className="space-y-2">
                                        {/* Sütun adı - tıklanabilir değil, bold */}
                                        <div className="font-bold text-sm text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 cursor-default">
                                          {subCategory.name}
                                        </div>
                                        <div className="space-y-1 pl-2">
                                          {subCategory.children.map((item) => (
                                            <Link
                                              key={item.name}
                                              to={item.path || '#'}
                                              onClick={() => setIsMobileMenuOpen(false)}
                                              className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 font-medium"
                                            >
                                              {item.name}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      // Alt kategori - path varsa tıklanabilir
                                      subCategory.path ? (
                                        <Link
                                          to={subCategory.path}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 font-medium"
                                        >
                                          {subCategory.name}
                                        </Link>
                                      ) : (
                                        // Path yok - tıklanabilir değil, bold yazı (sütun kategorisi gibi)
                                        <div className="font-bold text-sm text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 cursor-default">
                                          {subCategory.name}
                                        </div>
                                      )
                                    )}
                                  </motion.div>
                                ));
                              })()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Mobile Navigation Links */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 pt-2"
                >
                  <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Navigasyon
                  </h3>
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                      >
                        <span className="w-2 h-2 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* User Section */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl border border-primary-200 dark:border-primary-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-lg">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {user?.role === 'admin' && (
                      <Link
                        to={routes.admin}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                      >
                        <span>⚙️</span>
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    
                    <Link
                      to={routes.profile}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                    >
                      <span>👤</span>
                      <span>Profilim</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                    >
                      <span>🚪</span>
                      <span>Çıkış Yap</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

