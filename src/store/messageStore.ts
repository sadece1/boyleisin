import { create } from 'zustand';
import { Message } from '@/types';
import { messageService } from '@/services/messageService';

interface MessageState {
  messages: Message[];
  currentMessage: Message | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  
  fetchMessages: (page?: number) => Promise<void>;
  fetchMessageById: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  currentMessage: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,

  fetchMessages: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await messageService.getMessages(page);
      set({
        messages: response.data,
        total: response.total,
        page: response.page,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Mesajlar yüklenemedi',
      });
    }
  },

  fetchMessageById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const message = await messageService.getMessageById(id);
      set({
        currentMessage: message,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Mesaj yüklenemedi',
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await messageService.markAsRead(id);
      await get().fetchMessages(get().page);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Mesaj okunmadı olarak işaretlenemedi',
      });
    }
  },

  deleteMessage: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await messageService.deleteMessage(id);
      await get().fetchMessages(get().page);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Mesaj silinemedi',
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

