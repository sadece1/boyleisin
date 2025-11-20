import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CampsiteFilters, GearFilters } from '@/types';
import { brandService } from '@/services/brandService';
import { colorService } from '@/services/colorService';

interface FilterSidebarProps {
  type: 'campsites' | 'gear';
  filters: CampsiteFilters | GearFilters;
  onFilterChange: (filters: CampsiteFilters | GearFilters) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export const FilterSidebar = ({
  type,
  filters,
  onFilterChange,
  onClose,
  isOpen = true,
}: FilterSidebarProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [brands, setBrands] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  // Sync localFilters when filters prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: string, value: any) => {
    // Remove empty strings and undefined values from filters
    const newFilters: any = { ...localFilters };
    if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
      delete newFilters[key];
    } else {
      // Trim string values
      newFilters[key] = typeof value === 'string' ? value.trim() : value;
    }
    console.log('FilterSidebar - Filter changed:', key, '=', value, 'New filters:', newFilters);
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = type === 'campsites' 
      ? {} as CampsiteFilters
      : {} as GearFilters;
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Load brands and colors for gear filters
  useEffect(() => {
    if (type === 'gear') {
      const loadBrandsAndColors = () => {
        const allBrands = brandService.getAllBrands();
        setBrands(allBrands.map(b => b.name));
        
        const allColors = colorService.getAllColors();
        setColors(allColors.map(c => c.name));
      };

      loadBrandsAndColors();

      // Listen for updates
      const handleBrandsUpdate = () => {
        const updatedBrands = brandService.getAllBrands();
        setBrands(updatedBrands.map(b => b.name));
      };
      
      const handleColorsUpdate = () => {
        const updatedColors = colorService.getAllColors();
        setColors(updatedColors.map(c => c.name));
      };
      
      window.addEventListener('brandsUpdated', handleBrandsUpdate);
      window.addEventListener('colorsUpdated', handleColorsUpdate);
      
      return () => {
        window.removeEventListener('brandsUpdated', handleBrandsUpdate);
        window.removeEventListener('colorsUpdated', handleColorsUpdate);
      };
    }
  }, [type]);

  if (type === 'campsites') {
    const campsiteFilters = localFilters as CampsiteFilters;
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-fit sticky top-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtreler
              </h3>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Şehir
                </label>
                <input
                  type="text"
                  value={campsiteFilters.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Şehir ara..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Fiyat
                </label>
                <input
                  type="number"
                  value={campsiteFilters.minPrice || ''}
                  onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="₺"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maksimum Fiyat
                </label>
                <input
                  type="number"
                  value={campsiteFilters.maxPrice || ''}
                  onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="₺"
                />
              </div>

            </div>

            <button
              onClick={clearFilters}
              className="mt-4 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            >
              Filtreleri Temizle
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Gear filters
  const gearFilters = localFilters as GearFilters;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className="w-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-fit sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          {/* Clear Filters Button - Top */}
          <button
            onClick={clearFilters}
            className="mb-4 w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
          >
            Tüm Filtreleri Temizle
          </button>

          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm pb-2 border-b border-gray-200 dark:border-gray-700 z-10">
            <h3 className="text-lg font-semibold text-gray-900/80 dark:text-white/80">
              Filtreler
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>

          <div className="space-y-6">

            {/* Search Filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Arama</h4>
              <input
                type="text"
                value={gearFilters.search || ''}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ürün ara..."
              />
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Fiyat Aralığı</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Minimum Fiyat (₺/gün)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={gearFilters.minPrice || ''}
                    onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Maksimum Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={gearFilters.maxPrice || ''}
                    onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="∞"
                  />
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Değerlendirme</h4>
              {[5, 4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={gearFilters.minRating === rating}
                    onChange={() => handleChange('minRating', gearFilters.minRating === rating ? undefined : rating)}
                    className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                      ve üzeri
                    </span>
                  </div>
                </label>
              ))}
              {gearFilters.minRating && (
                <button
                  onClick={() => handleChange('minRating', undefined)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Filtreyi Kaldır
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Marka</h4>
              <input
                type="text"
                value={gearFilters.brand || ''}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Marka ara..."
                list="brands-list"
              />
              <datalist id="brands-list">
                {brands.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
              
              {/* Popular Brands Quick Select */}
              <div className="flex flex-wrap gap-2 mt-2">
                {brands.slice(0, 10).map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleChange('brand', gearFilters.brand === brand ? undefined : brand)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      gearFilters.brand === brand
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Renk</h4>
              <input
                type="text"
                value={gearFilters.color || ''}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Renk ara..."
                list="colors-list"
              />
              <datalist id="colors-list">
                {colors.map((color) => (
                  <option key={color} value={color} />
                ))}
              </datalist>
              
              {/* Popular Colors Quick Select */}
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.slice(0, 10).map((color) => {
                  const colorObj = colorService.getColorByName(color);
                  return (
                    <button
                      key={color}
                      onClick={() => handleChange('color', gearFilters.color === color ? undefined : color)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                        gearFilters.color === color
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      style={colorObj?.hexCode && gearFilters.color !== color ? {
                        backgroundColor: colorObj.hexCode + '20',
                        border: `1px solid ${colorObj.hexCode}`,
                      } : {}}
                    >
                      {colorObj?.hexCode && (
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: colorObj.hexCode }}
                        />
                      )}
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Filter - Satılık, Satıldı, Sipariş Edilebilir */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Durum</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="status"
                    checked={gearFilters.status === undefined}
                    onChange={() => handleChange('status', undefined)}
                    className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Hepsi</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="status"
                    checked={gearFilters.status === 'for-sale'}
                    onChange={() => handleChange('status', gearFilters.status === 'for-sale' ? undefined : 'for-sale')}
                    className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🛒 Satılık</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="status"
                    checked={gearFilters.status === 'sold'}
                    onChange={() => handleChange('status', gearFilters.status === 'sold' ? undefined : 'sold')}
                    className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">✅ Satıldı</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="status"
                    checked={gearFilters.status === 'orderable'}
                    onChange={() => handleChange('status', gearFilters.status === 'orderable' ? undefined : 'orderable')}
                    className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">📦 Sipariş Edilebilir</span>
                </label>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

