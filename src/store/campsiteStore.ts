import { create } from 'zustand';
import { Campsite, CampsiteFilters } from '@/types';
import { campsiteService } from '@/services/campsiteService';

interface CampsiteState {
  campsites: Campsite[];
  currentCampsite: Campsite | null;
  filters: CampsiteFilters;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  
  fetchCampsites: (filters?: CampsiteFilters, page?: number) => Promise<void>;
  fetchCampsiteById: (id: string) => Promise<void>;
  setFilters: (filters: CampsiteFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

const initialFilters: CampsiteFilters = {};

export const useCampsiteStore = create<CampsiteState>((set, get) => ({
  campsites: [],
  currentCampsite: null,
  filters: initialFilters,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,

  fetchCampsites: async (filters, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      const response = await campsiteService.getCampsites(activeFilters, page);
      set({
        campsites: response.data,
        total: response.total,
        page: response.page,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Kamp alanları yüklenemedi',
      });
    }
  },

  fetchCampsiteById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const campsite = await campsiteService.getCampsiteById(id);
      set({
        currentCampsite: campsite,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Kamp alanı yüklenemedi',
      });
    }
  },

  setFilters: (filters: CampsiteFilters) => {
    set({ filters, page: 1 });
  },

  clearFilters: () => {
    set({ filters: initialFilters, page: 1 });
  },

  clearError: () => {
    set({ error: null });
  },
}));

