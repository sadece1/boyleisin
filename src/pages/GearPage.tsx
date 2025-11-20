import { useEffect, useState } from 'react';
import { useGearStore } from '@/store/gearStore';
import { SEO } from '@/components/SEO';
import { GearCard } from '@/components/GearCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { GearFilters } from '@/types';

export const GearPage = () => {
  const {
    gear,
    filters,
    isLoading,
    fetchGear,
    setFilters,
    total,
    page,
  } = useGearStore();

  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // İlk yüklemede gear'ı getir
  useEffect(() => {
    fetchGear(filters, page);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (newFilters: GearFilters) => {
    setFilters(newFilters);
    fetchGear(newFilters, 1);
  };

  return (
    <>
      <SEO 
        title="Kamp Malzemeleri - WeCamp | Kiralık Kamp Ekipmanları ve Malzemeleri" 
        description="Geniş ürün yelpazesi ile kiralık kamp malzemeleri ve ekipmanları. Çadır, uyku tulumu, kamp mutfağı ve daha fazlası. Türkiye'nin en kapsamlı kamp malzemeleri kataloğu."
        keywords="kamp malzemeleri, kiralık kamp ekipmanları, kamp çadırı, uyku tulumu, kamp mutfağı, outdoor ekipmanları, kamp malzemeleri kiralama, Türkiye kamp ekipmanları"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="hidden lg:block">
                <FilterSidebar
                  type="gear"
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
              {isFilterOpen && (
                <div className="lg:hidden">
                  <FilterSidebar
                    type="gear"
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Gear Grid */}
            <div className="flex-1">
              {/* Sorting - Right Side */}
              <div className="flex justify-end mb-4">
                <div className="w-full sm:w-auto">
                  <select
                    value={filters.sortBy || ''}
                    onChange={(e) => {
                      const newFilters = { ...filters, sortBy: e.target.value || undefined };
                      handleFilterChange(newFilters);
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
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (() => {
                // Apply sorting if needed
                let sortedGear = [...gear];
                if (filters.sortBy) {
                  sortedGear.sort((a, b) => {
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
                return sortedGear.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedGear.map((item) => (
                      <GearCard key={item.id} gear={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    Aradığınız kriterlere uygun malzeme bulunamadı.
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
