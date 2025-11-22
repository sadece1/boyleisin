import { create } from 'zustand';
import { Gear, GearFilters } from '@/types';
import { gearService } from '@/services/gearService';

interface GearState {
  gear: Gear[];
  currentGear: Gear | null;
  filters: GearFilters;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  
  fetchGear: (filters?: GearFilters, page?: number, limit?: number) => Promise<void>;
  fetchGearById: (id: string) => Promise<void>;
  addGear: (gear: Omit<Gear, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGearInStore: (id: string, gear: Partial<Gear>) => Promise<void>;
  deleteGear: (id: string) => Promise<void>;
  setFilters: (filters: GearFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

const initialFilters: GearFilters = {};

export const useGearStore = create<GearState>((set, get) => ({
  gear: [],
  currentGear: null,
  filters: initialFilters,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,

  fetchGear: async (filters, page = 1, limit?: number) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      const response = await gearService.getGear(activeFilters, page, limit);
      set({
        gear: response.data,
        total: response.total,
        page: response.page,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Malzemeler yüklenemedi',
      });
    }
  },

  fetchGearById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const item = await gearService.getGearById(id);
      set({
        currentGear: item,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Malzeme yüklenemedi',
      });
    }
  },

  addGear: async (gearData) => {
    set({ isLoading: true, error: null });
    try {
      // Validate description length
      if (!gearData.description || gearData.description.trim().length < 20) {
        throw new Error('Açıklama en az 20 karakter olmalıdır');
      }

      // Get backend category UUID from frontend category
      let backendCategoryId: string | null = null;
      if (gearData.categoryId) {
        try {
          // Fetch backend categories to find UUID
          const response = await fetch('/api/categories');
          const backendCategoriesResponse = await response.json();
          if (backendCategoriesResponse.success && backendCategoriesResponse.data) {
            const backendCategories = backendCategoriesResponse.data;
            // Get frontend category to find matching backend category
            const frontendCategory = categoryManagementService.getCategoryById(gearData.categoryId);
            if (frontendCategory) {
              // Try to match by slug or name
              const matchingBackendCategory = backendCategories.find((bc: any) => {
                const backendSlug = (bc.slug || '').toLowerCase().trim();
                const backendName = (bc.name || '').toLowerCase().trim();
                const frontendSlug = (frontendCategory.slug || '').toLowerCase().trim();
                const frontendName = (frontendCategory.name || '').toLowerCase().trim();
                return backendSlug === frontendSlug || backendName === frontendName ||
                       backendSlug.includes(frontendSlug) || frontendSlug.includes(backendSlug) ||
                       backendName.includes(frontendName) || frontendName.includes(backendName);
              });
              if (matchingBackendCategory) {
                backendCategoryId = matchingBackendCategory.id;
              }
            }
          }
        } catch (error) {
          console.warn('Failed to fetch backend categories:', error);
        }
      }

      if (!backendCategoryId) {
        throw new Error('Geçerli bir kategori seçin. Kategori backend\'de bulunamadı.');
      }

      // Create FormData for service compatibility
      const formData = new FormData();
      formData.append('name', gearData.name);
      formData.append('description', gearData.description.trim());
      formData.append('category', String(gearData.category));
      formData.append('category_id', backendCategoryId);
      formData.append('price_per_day', String(gearData.pricePerDay));
      if (gearData.deposit !== undefined) {
        formData.append('deposit', String(gearData.deposit));
      }
      formData.append('available', String(gearData.available ?? true));
      formData.append('status', gearData.status || 'for-sale');
      
      // Add images as URLs - ensure they are valid URIs
      if (gearData.images && gearData.images.length > 0) {
        gearData.images.forEach((url, index) => {
          if (url && url.trim() !== '') {
            // Convert relative URLs to absolute URLs
            let imageUrl = url.trim();
            if (imageUrl.startsWith('/')) {
              // Relative path - make it absolute
              imageUrl = `${window.location.origin}${imageUrl}`;
            } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
              // Assume it's a relative path from uploads
              imageUrl = `${window.location.origin}/api${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
            formData.append(`image_${index}`, imageUrl);
          }
        });
      }

      // Add optional fields - only append if they have values (not undefined)
      if (gearData.brand && gearData.brand.trim() !== '') {
        formData.append('brand', gearData.brand);
      }
      if (gearData.color && gearData.color.trim() !== '') {
        formData.append('color', gearData.color);
      }
      if (gearData.rating !== undefined && gearData.rating !== null) {
        formData.append('rating', String(gearData.rating));
      }
      if (gearData.specifications && Object.keys(gearData.specifications).length > 0) {
        formData.append('specifications', JSON.stringify(gearData.specifications));
      }
      if (gearData.recommendedProducts && gearData.recommendedProducts.length > 0) {
        formData.append('recommendedProducts', JSON.stringify(gearData.recommendedProducts));
      }

      await gearService.createGear(formData);
      // Refresh gear list
      await get().fetchGear(get().filters, get().page);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ürün eklenemedi',
      });
      throw error;
    }
  },

  updateGearInStore: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await gearService.updateGear(id, updates);
      await get().fetchGear(get().filters, get().page);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ürün güncellenemedi',
      });
      throw error;
    }
  },

  deleteGear: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await gearService.deleteGear(id);
      await get().fetchGear(get().filters, get().page);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ürün silinemedi',
      });
      throw error;
    }
  },

  setFilters: (filters: GearFilters) => {
    set({ filters, page: 1 });
  },

  clearFilters: () => {
    set({ filters: initialFilters, page: 1 });
  },

  clearError: () => {
    set({ error: null });
  },
}));

