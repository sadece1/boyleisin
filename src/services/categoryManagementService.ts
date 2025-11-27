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
const transformToBackend = (cat: Partial<Category>): any => {
  // order'ı sayıya dönüştür (form'dan string gelebilir)
  let orderValue = 0;
  if (cat.order !== undefined && cat.order !== null) {
    if (typeof cat.order === 'number') {
      orderValue = cat.order;
    } else {
      const parsed = parseInt(String(cat.order), 10);
      orderValue = isNaN(parsed) ? 0 : parsed;
    }
  }

  return {
    name: cat.name,
    slug: cat.slug,
    description: cat.description || null,
    parent_id: cat.parentId !== undefined ? (cat.parentId || null) : undefined,
    icon: cat.icon || null,
    order: orderValue,
  };
};

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
      // 409 Conflict = Kategori zaten var (duplicate slug/name)
      // Mevcut kategoriyi bulup döndür
      if (error.response?.status === 409) {
        const slug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (slug) {
          try {
            const existingCategory = await this.getCategoryBySlug(slug);
            if (existingCategory) {
              // Kategori zaten var, mevcut kategoriyi döndür
              return existingCategory;
            }
          } catch (lookupError) {
            // Slug lookup başarısız, hata mesajı göster
          }
        }
        const message = error.response?.data?.message || 'Bu kategori zaten mevcut (aynı slug veya isim)';
        throw new Error(message);
      }
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
      // 404 hatası = kategori zaten silinmiş, bu normal bir durum
      if (error.response?.status === 404) {
        // Kategori zaten silinmiş, sessizce başarılı say
        return;
      }
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

  async getRootCategories(): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      return allCategories.filter(cat => !cat.parentId);
    } catch (error) {
      console.error('Failed to fetch root categories:', error);
      return [];
    }
  },
};

