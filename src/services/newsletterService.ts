import api from './api';
import { NewsletterSubscription, PaginatedResponse } from '@/types';

const STORAGE_KEY = 'camp_newsletters_storage';

// Load from localStorage or use empty array
const loadNewslettersFromStorage = (): NewsletterSubscription[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error('Failed to load newsletters from storage:', error);
  }
  return [];
};

// Save to localStorage
const saveNewslettersToStorage = (newsletters: NewsletterSubscription[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newsletters));
    }
  } catch (error) {
    console.error('Failed to save newsletters to storage:', error);
  }
};

// Mock newsletter subscriptions - loaded from localStorage
export let mockNewsletters: NewsletterSubscription[] = loadNewslettersFromStorage();

export const newsletterService = {
  async subscribe(email: string): Promise<NewsletterSubscription> {
    try {
      const response = await api.post<NewsletterSubscription>('/newsletters', { email });
      return response.data;
    } catch (error) {
      // Fallback: save to mock data and localStorage
      mockNewsletters = loadNewslettersFromStorage();
      
      // Check if email already exists
      const existing = mockNewsletters.find(n => n.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        // Update existing subscription to active
        existing.subscribed = true;
        existing.subscribedAt = new Date().toISOString();
        existing.unsubscribedAt = undefined;
        saveNewslettersToStorage(mockNewsletters);
        return existing;
      }
      
      // Create new subscription
      const newSubscription: NewsletterSubscription = {
        id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        subscribed: true,
        subscribedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      mockNewsletters.unshift(newSubscription);
      saveNewslettersToStorage(mockNewsletters);
      return newSubscription;
    }
  },

  async getSubscriptions(page = 1): Promise<PaginatedResponse<NewsletterSubscription>> {
    try {
      const response = await api.get<PaginatedResponse<NewsletterSubscription>>('/newsletters', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      // Fallback to mock data
      mockNewsletters = loadNewslettersFromStorage();
      return {
        data: mockNewsletters,
        total: mockNewsletters.length,
        page,
        limit: 20,
        totalPages: Math.ceil(mockNewsletters.length / 20),
      };
    }
  },

  async unsubscribe(id: string): Promise<void> {
    try {
      await api.patch(`/newsletters/${id}/unsubscribe`);
      mockNewsletters = loadNewslettersFromStorage();
      const index = mockNewsletters.findIndex((n) => n.id === id);
      if (index !== -1) {
        mockNewsletters[index] = {
          ...mockNewsletters[index],
          subscribed: false,
          unsubscribedAt: new Date().toISOString(),
        };
        saveNewslettersToStorage(mockNewsletters);
      }
    } catch (error) {
      mockNewsletters = loadNewslettersFromStorage();
      const index = mockNewsletters.findIndex((n) => n.id === id);
      if (index !== -1) {
        mockNewsletters[index] = {
          ...mockNewsletters[index],
          subscribed: false,
          unsubscribedAt: new Date().toISOString(),
        };
        saveNewslettersToStorage(mockNewsletters);
      }
    }
  },

  async deleteSubscription(id: string): Promise<void> {
    try {
      await api.delete(`/newsletters/${id}`);
    } catch (error) {
      // Continue with mock deletion
    }
    mockNewsletters = loadNewslettersFromStorage();
    const index = mockNewsletters.findIndex((n) => n.id === id);
    if (index !== -1) {
      mockNewsletters.splice(index, 1);
      saveNewslettersToStorage(mockNewsletters);
    }
  },
};

