import { useEffect, useState } from 'react';
import { useCampsiteStore } from '@/store/campsiteStore';
import { useDebounce } from '@/hooks/useDebounce';
import { SEO } from '@/components/SEO';
import { CampsiteCard } from '@/components/CampsiteCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Input } from '@/components/Input';
import { CampsiteFilters } from '@/types';

export const CampsitesPage = () => {
  const {
    campsites,
    filters,
    isLoading,
    fetchCampsites,
    setFilters,
    total,
    page,
  } = useCampsiteStore();

  const [search, setSearch] = useState(filters.search || '');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchCampsites({ ...filters, search: debouncedSearch }, page);
  }, [debouncedSearch, page, fetchCampsites]);

  const handleFilterChange = (newFilters: CampsiteFilters) => {
    setFilters({ ...newFilters, search: debouncedSearch });
    fetchCampsites({ ...newFilters, search: debouncedSearch }, 1);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <>
      <SEO title="Kamp Alanları" description="Tüm kamp alanlarını keşfedin ve filtreleyin" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Kamp Alanları
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {total} kamp alanı bulundu
            </p>
          </div>

          {/* Search and Filter Toggle */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96">
              <Input
                type="text"
                placeholder="Kamp alanı ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
            >
              {isFilterOpen ? 'Filtreleri Gizle' : 'Filtreleri Göster'}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filter Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="hidden lg:block">
                <FilterSidebar
                  type="campsites"
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
              {isFilterOpen && (
                <div className="lg:hidden">
                  <FilterSidebar
                    type="campsites"
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Campsites Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : campsites.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {campsites.map((campsite) => (
                      <CampsiteCard key={campsite.id} campsite={campsite} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <button
                        onClick={() => fetchCampsites(filters, page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      <span className="px-4 py-2">
                        Sayfa {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => fetchCampsites(filters, page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sonraki
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  Aradığınız kriterlere uygun kamp alanı bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

