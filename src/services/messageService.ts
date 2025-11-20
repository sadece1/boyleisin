import api from './api';
import { Message, PaginatedResponse } from '@/types';

const STORAGE_KEY = 'camp_messages_storage';

// Load from localStorage or use empty array
const loadMessagesFromStorage = (): Message[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error('Failed to load messages from storage:', error);
  }
  return [];
};

// Save to localStorage
const saveMessagesToStorage = (messages: Message[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  } catch (error) {
    console.error('Failed to save messages to storage:', error);
  }
};

// Mock messages data - loaded from localStorage
export let mockMessages: Message[] = loadMessagesFromStorage();

export const messageService = {
  async getMessages(page = 1): Promise<PaginatedResponse<Message>> {
    try {
      const response = await api.get<PaginatedResponse<Message>>('/messages', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      // Fallback to mock data
      mockMessages = loadMessagesFromStorage();
      return {
        data: mockMessages,
        total: mockMessages.length,
        page,
        limit: 20,
        totalPages: Math.ceil(mockMessages.length / 20),
      };
    }
  },

  async getMessageById(id: string): Promise<Message> {
    try {
      const response = await api.get<Message>(`/messages/${id}`);
      return response.data;
    } catch (error) {
      const message = mockMessages.find((m) => m.id === id);
      if (!message) throw new Error('Mesaj bulunamadı');
      return message;
    }
  },

  async markAsRead(id: string): Promise<Message> {
    try {
      const response = await api.patch<Message>(`/messages/${id}/read`);
      const updated = response.data;
      mockMessages = loadMessagesFromStorage();
      const index = mockMessages.findIndex((m) => m.id === id);
      if (index !== -1) {
        mockMessages[index] = updated;
        saveMessagesToStorage(mockMessages);
      }
      return updated;
    } catch (error) {
      mockMessages = loadMessagesFromStorage();
      const index = mockMessages.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Mesaj bulunamadı');
      
      mockMessages[index] = {
        ...mockMessages[index],
        read: true,
        updatedAt: new Date().toISOString(),
      };
      saveMessagesToStorage(mockMessages);
      return mockMessages[index];
    }
  },

  async deleteMessage(id: string): Promise<void> {
    try {
      await api.delete(`/messages/${id}`);
    } catch (error) {
      // Continue with mock deletion
    }
    mockMessages = loadMessagesFromStorage();
    const index = mockMessages.findIndex((m) => m.id === id);
    if (index !== -1) {
      mockMessages.splice(index, 1);
      saveMessagesToStorage(mockMessages);
    }
  },
};

