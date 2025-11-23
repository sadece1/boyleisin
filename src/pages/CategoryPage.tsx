import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { GearCard } from '@/components/GearCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Gear, Category, GearFilters } from '@/types';
import { categoryManagementService } from '@/services/categoryManagementService';
import { useGearStore } from '@/store/gearStore';

export const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { gear, fetchGear, isLoading: gearLoading } = useGearStore();
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [categoryGear, setCategoryGear] = useState<Gear[]>([]);
  const [filters, setFilters] = useState<GearFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadCategoryData = async () => {
      if (categorySlug) {
        setIsLoading(true);
        try {
          // Get category info from categoryManagementService
          const category = await categoryManagementService.getCategoryBySlug(categorySlug);
          
          if (category) {
            setCategoryInfo(category);
            // Get subcategories
            const children = await categoryManagementService.getChildCategories(category.id);
            setSubCategories(children);
          } else {
            // Category not found
            setCategoryInfo(null);
            setIsLoading(false);
            return;
          }
          
          // Fetch all gear and filter by category
          // Use reasonable limit (backend max is 100 anyway)
          fetchGear({}, 1, 500);
        } catch (error) {
          console.error('Failed to load category data:', error);
          setCategoryInfo(null);
          setIsLoading(false);
        }
      }
    };

    loadCategoryData();

    // Listen for category updates
    const handleCategoryUpdate = () => {
      loadCategoryData();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'camp_categories_storage') {
        loadCategoryData();
      }
    };

    window.addEventListener('categoriesUpdated', handleCategoryUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [categorySlug, fetchGear]);

  useEffect(() => {
    if (categorySlug) {
      const filterGear = async () => {
        try {
          const category = await categoryManagementService.getCategoryBySlug(categorySlug);
          if (!category) {
            setIsLoading(false);
            return;
          }

          if (gear.length > 0) {
            // Get all categories to build a mapping of IDs (including parent categories)
            const allCategories = await categoryManagementService.getAllCategories();
        
        // Build a set of all category IDs that match (including parent and child categories)
        const matchingCategoryIds = new Set<string>();
        matchingCategoryIds.add(category.id);
        
        // Add parent categories (if this is a child category)
        let currentCategory: Category | null = category;
        while (currentCategory?.parentId) {
          const parent = allCategories.find(c => c.id === currentCategory!.parentId);
          if (parent) {
            matchingCategoryIds.add(parent.id);
            currentCategory = parent;
          } else {
            break;
          }
        }
        
        // Add child categories (if this category has children)
        const childCategories = allCategories.filter(c => c.parentId === category.id);
        childCategories.forEach(child => matchingCategoryIds.add(child.id));
        
        // Also add the category ID itself to matchingCategoryIds (for direct UUID matching)
        // This ensures gear with categoryId matching the backend UUID will be found
        
        // Filter gear by category slug or categoryId
        console.log('Filtering gear for category:', categorySlug, 'Category ID:', category.id);
        console.log('Matching category IDs:', Array.from(matchingCategoryIds));
        console.log('Total gear items:', gear.length);
        
        // Fetch backend categories to map UUID category_ids to frontend categories
        // Backend returns UUID category_ids, but we need to match them with frontend slug-based categories
        const filterGearWithBackendCategories = async () => {
          let backendCategories: any[] = [];
          try {
            const response = await fetch('/api/categories');
            const backendCategoriesResponse = await response.json();
            if (backendCategoriesResponse.success && backendCategoriesResponse.data) {
              backendCategories = backendCategoriesResponse.data;
              console.log('Backend categories fetched:', backendCategories.length);
              console.log('Backend categories:', backendCategories.map(c => ({ id: c.id, slug: c.slug, name: c.name })));
            }
          } catch (error) {
            console.warn('Failed to fetch backend categories, using frontend categories only:', error);
          }
          
          // Build a map of backend UUID category IDs to their slugs
          const backendCategorySlugMap = new Map<string, string>();
          const backendCategoryNameMap = new Map<string, string>();
          const backendCategoryIdSet = new Set<string>(); // Track all backend category IDs
          backendCategories.forEach(backendCat => {
            // Handle both snake_case and camelCase field names
            const catId = backendCat.id;
            const catSlug = backendCat.slug;
            const catName = backendCat.name;
            
            if (catId && catSlug) {
              const normalizedSlug = String(catSlug).toLowerCase().trim();
              backendCategorySlugMap.set(catId, normalizedSlug);
              backendCategoryIdSet.add(catId); // Add to set for direct matching
              if (catName) {
                backendCategoryNameMap.set(catId, String(catName).toLowerCase().trim());
              }
              console.log('Backend category:', catId, '-> slug:', normalizedSlug, 'name:', catName);
            } else {
              console.warn('Backend category missing id or slug:', backendCat);
            }
          });
          
          // Build a set of matching slugs and names (including parent and child) - MUST BE BEFORE using matchingSlugs
          const matchingSlugs = new Set<string>();
          const matchingNames = new Set<string>();
          
          const addCategoryToMatching = (cat: Category) => {
            if (cat.slug) {
              matchingSlugs.add(cat.slug.toLowerCase().trim());
            }
            if (cat.name) {
              matchingNames.add(cat.name.toLowerCase().trim());
              // Also add partial name matches for better matching
              // e.g., "Kamp Ocakları" -> "ocakları", "ocak", "kamp"
              const nameWords = cat.name.toLowerCase().trim().split(/\s+/);
              nameWords.forEach(word => {
                if (word.length > 2) {
                  matchingNames.add(word);
                }
              });
            }
          };
          
          addCategoryToMatching(category);
          if (categorySlug) {
            matchingSlugs.add(categorySlug.toLowerCase().trim());
          }
          
          // Add parent category slugs and names
          let currentCategory: Category | null = category;
          while (currentCategory?.parentId) {
            const parent = allCategories.find(c => c.id === currentCategory!.parentId);
            if (parent) {
              addCategoryToMatching(parent);
              currentCategory = parent;
            } else {
              break;
            }
          }
          
          // Add child category slugs and names
          const childCategories = allCategories.filter(c => c.parentId === category.id);
          childCategories.forEach(child => {
            addCategoryToMatching(child);
          });
          
          // Add backend category IDs that match the current category slug to matchingCategoryIds
          backendCategories.forEach(backendCat => {
            const catId = backendCat.id;
            const catSlug = backendCat.slug?.toLowerCase().trim();
            if (catId && catSlug && matchingSlugs.has(catSlug)) {
              matchingCategoryIds.add(catId);
              console.log('Added backend category ID to matching set:', catId, 'slug:', catSlug);
            }
          });
          
          // Build a mapping from backend category names to frontend categories
          // e.g., "Pişirme Ekipmanları" -> "Kamp Mutfağı" or "Kamp Ocakları"
          const backendToFrontendNameMap = new Map<string, string[]>();
          backendCategories.forEach(backendCat => {
            if (backendCat.name) {
              const backendName = String(backendCat.name).toLowerCase().trim();
              const backendNameWords = backendName.split(/\s+/);
              
              // Find frontend categories that might match
              const matchingFrontendCats = allCategories.filter(fc => {
                const frontendName = fc.name.toLowerCase().trim();
                const frontendNameWords = frontendName.split(/\s+/);
                
                // Check if any words match
                return backendNameWords.some(bw => 
                  frontendNameWords.some(fw => fw.includes(bw) || bw.includes(fw))
                ) || frontendName.includes(backendName) || backendName.includes(frontendName);
              });
              
              if (matchingFrontendCats.length > 0) {
                backendToFrontendNameMap.set(backendCat.id, matchingFrontendCats.map(fc => fc.id));
              }
            }
          });
          
          console.log('Matching slugs:', Array.from(matchingSlugs));
          console.log('Matching names:', Array.from(matchingNames));
          console.log('Backend category slug map size:', backendCategorySlugMap.size);
          console.log('Backend to frontend name map size:', backendToFrontendNameMap.size);
          console.log('Gear items to filter:', gear.length);
          
          // Filter gear with backend category mapping
          const filtered = gear.filter((item) => {
            // Get categoryId from item (could be categoryId or category_id from backend)
            const itemCategoryId = (item as any).categoryId || (item as any).category_id;
            
            // If gear has a backend UUID category_id, find the backend category and check its slug or name
            if (itemCategoryId) {
              // Try slug matching first
              if (backendCategorySlugMap.has(itemCategoryId)) {
                const backendCategorySlug = backendCategorySlugMap.get(itemCategoryId);
                if (backendCategorySlug && matchingSlugs.has(backendCategorySlug)) {
                  console.log('✓ Matched by backend UUID -> slug:', item.name, 'UUID:', itemCategoryId, 'slug:', backendCategorySlug);
                  return true;
                }
              }
              
              // Try name matching (exact or partial)
              const backendCategoryName = backendCategoryNameMap.get(itemCategoryId);
              if (backendCategoryName) {
                // Exact name match
                if (matchingNames.has(backendCategoryName)) {
                  console.log('✓ Matched by backend UUID -> exact name:', item.name, 'UUID:', itemCategoryId, 'name:', backendCategoryName);
                  return true;
                }
                
                // Partial name match (check if any word matches)
                const backendNameWords = backendCategoryName.split(/\s+/);
                for (const word of backendNameWords) {
                  if (word.length > 2 && matchingNames.has(word)) {
                    console.log('✓ Matched by backend UUID -> partial name:', item.name, 'UUID:', itemCategoryId, 'word:', word);
                    return true;
                  }
                }
              }
              
              // Try backend-to-frontend name mapping
              if (backendToFrontendNameMap.has(itemCategoryId)) {
                const matchingFrontendIds = backendToFrontendNameMap.get(itemCategoryId) || [];
                for (const frontendId of matchingFrontendIds) {
                  if (matchingCategoryIds.has(frontendId)) {
                    console.log('✓ Matched by backend-to-frontend name mapping:', item.name, 'UUID:', itemCategoryId, 'frontend ID:', frontendId);
                    return true;
                  }
                }
              }
            }
            
            // Check categoryId first (most reliable) - exact match with category or its parents/children
            if (itemCategoryId && matchingCategoryIds.has(itemCategoryId)) {
              console.log('✓ Matched by categoryId:', item.name, 'categoryId:', itemCategoryId);
              return true;
            }
            
            // Check if backend UUID matches any frontend category UUID
            // Backend returns UUID, frontend categories might have UUID too
            if (itemCategoryId) {
              const matchingCategory = allCategories.find(cat => cat.id === itemCategoryId);
              if (matchingCategory && matchingCategoryIds.has(matchingCategory.id)) {
                console.log('✓ Matched by backend UUID to frontend category:', item.name, 'UUID:', itemCategoryId);
                return true;
              }
            }
            
            // Check category slug match - normalize for comparison
            const itemCategory = item.category || (item as any).category_slug;
            if (itemCategory) {
              const normalizedItemCategory = String(itemCategory).toLowerCase().trim();
              if (matchingSlugs.has(normalizedItemCategory)) {
                console.log('✓ Matched by category slug:', item.name, 'slug:', normalizedItemCategory);
                return true;
              }
            }
            
            // Check if categoryId matches slug pattern (cat-{slug})
            if (itemCategoryId && itemCategoryId === `cat-${categorySlug}`) {
              console.log('✓ Matched by categoryId pattern:', item.name);
              return true;
            }
            
            // Check if categoryId ends with slug (for dynamic IDs)
            if (itemCategoryId && category.slug && itemCategoryId.endsWith(category.slug)) {
              console.log('✓ Matched by categoryId suffix:', item.name);
              return true;
            }
            
            // Check if category is string and includes slug
            if (itemCategory && typeof itemCategory === 'string') {
              const normalizedItemCategory = itemCategory.toLowerCase().trim();
              for (const matchingSlug of matchingSlugs) {
                if (normalizedItemCategory.includes(matchingSlug) || matchingSlug.includes(normalizedItemCategory)) {
                  console.log('✓ Matched by category string:', item.name, 'item:', normalizedItemCategory, 'match:', matchingSlug);
                  return true;
                }
              }
            }
            
            return false;
          });
          
          console.log('Filtered gear count:', filtered.length);
          console.log('Filtered items:', filtered.map(g => g.name));
          
          setCategoryGear(filtered);
          setIsLoading(false);
        };
        
            // Call async function
            await filterGearWithBackendCategories();
          } else if (!gearLoading) {
            // If gear is empty and not loading, try fetching again
            console.log('Gear is empty, fetching...');
            fetchGear({}, 1, 500);
          }
        } catch (error) {
          console.error('Failed to filter gear:', error);
          setIsLoading(false);
        }
      };
      
      filterGear();
    }
  }, [categorySlug, gear, gearLoading, fetchGear]);

  // Apply filters to category gear
  const filteredGear = useMemo(() => {
    let result = [...categoryGear];

    // Apply filters
    if (filters?.minPrice) {
      result = result.filter(g => g.pricePerDay >= filters.minPrice!);
    }
    if (filters?.maxPrice) {
      result = result.filter(g => g.pricePerDay <= filters.maxPrice!);
    }
    if (filters?.available !== undefined) {
      result = result.filter(g => g.available === filters.available);
    }
    // Status filter - handle 'for-sale-or-sold' to show both for-sale and sold items
    if (filters?.status) {
      if (filters.status === 'for-sale-or-sold') {
        // Get status from gear item (fallback to available for backward compatibility)
        result = result.filter(g => {
          const itemStatus = g.status || (g.available ? 'for-sale' : 'sold');
          return itemStatus === 'for-sale' || itemStatus === 'sold';
        });
      } else {
        // Filter by specific status
        result = result.filter(g => {
          const itemStatus = g.status || (g.available ? 'for-sale' : 'sold');
          return itemStatus === filters.status;
        });
      }
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(searchLower) ||
        g.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters?.brand && filters.brand.trim() !== '') {
      const brandLower = filters.brand.toLowerCase().trim();
      result = result.filter(g => {
        // First check if gear has a brand field that matches
        if (g.brand && g.brand.toLowerCase().includes(brandLower)) {
          return true;
        }
        // Then search in name, description, and specifications
        const nameMatch = g.name.toLowerCase().includes(brandLower);
        const descMatch = g.description.toLowerCase().includes(brandLower);
        const specMatch = g.specifications 
          ? Object.values(g.specifications).some(val => 
              String(val).toLowerCase().includes(brandLower)
            )
          : false;
        return nameMatch || descMatch || specMatch;
      });
      console.log('CategoryPage - Brand filter applied:', brandLower, 'Result count:', result.length);
    }
    if (filters?.color && filters.color.trim() !== '') {
      const colorLower = filters.color.toLowerCase().trim();
      result = result.filter(g => {
        // First check if gear has a color field that matches
        if (g.color && g.color.toLowerCase().includes(colorLower)) {
          return true;
        }
        // Then search in name, description, and specifications
        const nameMatch = g.name.toLowerCase().includes(colorLower);
        const descMatch = g.description.toLowerCase().includes(colorLower);
        const specMatch = g.specifications 
          ? Object.values(g.specifications).some(val => 
              String(val).toLowerCase().includes(colorLower)
            )
          : false;
        return nameMatch || descMatch || specMatch;
      });
      console.log('CategoryPage - Color filter applied:', colorLower, 'Result count:', result.length);
    }
    if (filters?.minRating !== undefined) {
      result = result.filter(g => (g.rating || 0) >= filters.minRating!);
    }

    // Apply sorting
    if (filters?.sortBy) {
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.pricePerDay - b.pricePerDay;
          case 'price-desc':
            return b.pricePerDay - a.pricePerDay;
          case 'name-asc':
            return a.name.localeCompare(b.name, 'tr');
          case 'name-desc':
            return b.name.localeCompare(a.name, 'tr');
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          default:
            return 0;
        }
      });
    }

    return result;
  }, [categoryGear, filters]);

  const isLoadingState = isLoading || gearLoading;

  if (isLoadingState) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!categoryInfo) {
    return (
      <>
        <SEO title="Kategori Bulunamadı" description="Aradığınız kategori bulunamadı" />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Kategori Bulunamadı
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Aradığınız kategori mevcut değil.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${categoryInfo.name} - WeCamp | Kamp Ekipmanları ve Malzemeleri`} 
        description={categoryInfo.description || `${categoryInfo.name} kategorisindeki ürünler. ${categoryInfo.name} kiralık kamp malzemeleri ve ekipmanları. Türkiye'nin en kapsamlı kamp pazar yeri.`} 
        keywords={`${categoryInfo.name}, kamp malzemeleri, kamp ekipmanları, kiralık kamp malzemeleri, ${categoryInfo.name} kiralama, outdoor ekipmanları`}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white flex-1 min-w-0">
                {categoryInfo.icon && <span className="mr-2 sm:mr-3 flex-shrink-0">{categoryInfo.icon}</span>}
                <span className="break-words">{categoryInfo.name}</span>
              </h1>
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap flex-shrink-0 self-start sm:self-auto"
              >
                {isFilterOpen ? 'Filtreleri Gizle' : 'Filtreler'}
              </button>
            </div>
            {categoryInfo.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                {categoryInfo.description}
              </p>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="hidden lg:block">
                <FilterSidebar
                  type="gear"
                  filters={filters}
                  onFilterChange={setFilters}
                />
              </div>
              {isFilterOpen && (
                <div className="lg:hidden">
                  <FilterSidebar
                    type="gear"
                    filters={filters}
                    onFilterChange={setFilters}
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sorting - Right Side */}
              <div className="flex justify-end mb-4">
                <div className="w-full sm:w-auto">
                  <select
                    value={filters.sortBy || ''}
                    onChange={(e) => {
                      setFilters({ ...filters, sortBy: e.target.value || undefined });
                    }}
                    className="w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Sıralama Seçin</option>
                    <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                    <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                    <option value="name-asc">İsim: A-Z</option>
                    <option value="name-desc">İsim: Z-A</option>
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                  </select>
                </div>
              </div>
              {/* Sub Categories */}
              {subCategories.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Alt Kategoriler
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subCategories.map((subCat) => (
                      <Link
                        key={subCat.id}
                        to={`/category/${subCat.slug}`}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          {subCat.icon && <span className="text-2xl">{subCat.icon}</span>}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {subCat.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {filteredGear.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Ürünler
                    </h2>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredGear.length} ürün bulundu
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGear.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <GearCard gear={item} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  {categoryGear.length === 0
                    ? 'Bu kategoride henüz ürün bulunmamaktadır.'
                    : 'Aradığınız kriterlere uygun ürün bulunamadı.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


