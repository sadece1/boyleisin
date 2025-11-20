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
      // Create FormData for service compatibility
      const formData = new FormData();
      formData.append('name', gearData.name);
      formData.append('description', gearData.description || '');
      formData.append('category', String(gearData.category));
      if (gearData.categoryId) {
        formData.append('categoryId', gearData.categoryId);
      }
      formData.append('pricePerDay', String(gearData.pricePerDay));
      if (gearData.deposit !== undefined) {
        formData.append('deposit', String(gearData.deposit));
      }
      formData.append('available', String(gearData.available ?? true));
      
      // Add images as URLs (service will handle them)
      if (gearData.images && gearData.images.length > 0) {
        gearData.images.forEach((url, index) => {
          if (url && url.trim() !== '') {
            formData.append(`image_${index}`, url);
          }
        });
      }

      // Add optional fields
      if (gearData.brand) {
        formData.append('brand', gearData.brand);
      }
      if (gearData.color) {
        formData.append('color', gearData.color);
      }
      if (gearData.rating !== undefined) {
        formData.append('rating', String(gearData.rating));
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

