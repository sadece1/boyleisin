import api from './api';
import { Category } from '@/types';

// Helper function to transform backend category to frontend format
const transformCategory = (cat: any): Category => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug,
  description: cat.description || undefined,
  parentId: cat.parent_id || null,
  icon: cat.icon || undefined,
  order: cat.order || 0,
  createdAt: cat.created_at || new Date().toISOString(),
  updatedAt: cat.updated_at || new Date().toISOString(),
});

// Helper function to transform frontend category to backend format
const transformToBackend = (cat: Partial<Category>): any => ({
  name: cat.name,
  slug: cat.slug,
  description: cat.description || null,
  parent_id: cat.parentId !== undefined ? (cat.parentId || null) : undefined,
  icon: cat.icon || null,
  order: cat.order ?? 0,
});

export const categoryManagementService = {
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>('/categories');
      
      if (response.data.success && response.data.data) {
        return response.data.data.map(transformCategory);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const response = await api.get<{ success: boolean; data: any }>(`/categories/${id}`);
      
      if (response.data.success && response.data.data) {
        return transformCategory(response.data.data);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch category:', error);
      return null;
    }
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    try {
      const backendData = transformToBackend(data);
      const response = await api.post<{ success: boolean; data: any }>('/categories', backendData);
      
      if (response.data.success && response.data.data) {
        return transformCategory(response.data.data);
      }
      
      throw new Error('Failed to create category');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Kategori oluşturulamadı';
      throw new Error(message);
    }
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    try {
      const backendData = transformToBackend(data);
      const response = await api.put<{ success: boolean; data: any }>(`/categories/${id}`, backendData);
      
      if (response.data.success && response.data.data) {
        return transformCategory(response.data.data);
      }
      
      throw new Error('Failed to update category');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Kategori güncellenemedi';
      throw new Error(message);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Kategori silinemedi';
      throw new Error(message);
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const allCategories = await this.getAllCategories();
      const category = allCategories.find(cat => cat.slug === slug);
      return category || null;
    } catch (error) {
      console.error('Failed to fetch category by slug:', error);
      return null;
    }
  },

  async getChildCategories(parentId: string): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      return allCategories.filter(cat => cat.parentId === parentId);
    } catch (error) {
      console.error('Failed to fetch child categories:', error);
      return [];
    }
  },
};

