import { create } from 'zustand';
import { NewsletterSubscription } from '@/types';
import { newsletterService } from '@/services/newsletterService';

interface NewsletterState {
  subscriptions: NewsletterSubscription[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  
  fetchSubscriptions: (page?: number) => Promise<void>;
  unsubscribe: (id: string) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useNewsletterStore = create<NewsletterState>((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,

  fetchSubscriptions: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await newsletterService.getSubscriptions(page);
      set({
        subscriptions: response.data,
        total: response.total,
        page: response.page,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Abonelikler yüklenemedi',
      });
    }
  },

  unsubscribe: async (id: string) => {
    try {
      await newsletterService.unsubscribe(id);
      await get().fetchSubscriptions(get().page);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Abonelik iptal edilemedi',
      });
    }
  },

  deleteSubscription: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await newsletterService.deleteSubscription(id);
      await get().fetchSubscriptions(get().page);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Abonelik silinemedi',
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

