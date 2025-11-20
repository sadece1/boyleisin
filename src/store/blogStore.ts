import { create } from 'zustand';
import { BlogPost, BlogFilters } from '@/types';
import { blogService } from '@/services/blogService';

interface BlogState {
  blogs: BlogPost[];
  currentBlog: BlogPost | null;
  filters: BlogFilters;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  
  fetchBlogs: (filters?: BlogFilters, page?: number) => Promise<void>;
  fetchBlogById: (id: string) => Promise<void>;
  addBlog: (blog: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBlog: (id: string, updates: Partial<BlogPost>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  setFilters: (filters: BlogFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

const initialFilters: BlogFilters = {};

export const useBlogStore = create<BlogState>((set, get) => ({
  blogs: [],
  currentBlog: null,
  filters: initialFilters,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,

  fetchBlogs: async (filters, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      // blogService.getBlogs will use mock data if API fails, so we don't need extra error handling
      const response = await blogService.getBlogs(activeFilters, page);
      console.log('BlogService response:', response);
      const blogsData = response?.data || [];
      console.log('Setting blogs in store:', blogsData.length);
      set({
        blogs: blogsData,
        total: response?.total || blogsData.length,
        page: response?.page || page,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      // Try to get mock data directly
      try {
        const { blogService } = await import('@/services/blogService');
        const mockResponse = await blogService.getBlogs(filters, page);
        const blogsData = mockResponse?.data || [];
        console.log('Got mock data after error:', blogsData.length);
        set({
          blogs: blogsData,
          total: mockResponse?.total || blogsData.length,
          page: mockResponse?.page || page,
          isLoading: false,
          error: null,
        });
      } catch (mockError) {
        console.error('Error getting mock data:', mockError);
        set({
          blogs: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Bloglar yüklenemedi',
        });
      }
    }
  },

  fetchBlogById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const blog = await blogService.getBlogById(id);
      set({
        currentBlog: blog,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Blog yüklenemedi',
      });
    }
  },

  addBlog: async (blog) => {
    set({ isLoading: true, error: null });
    try {
      await blogService.createBlog(blog);
      await get().fetchBlogs(get().filters, get().page);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Blog eklenemedi',
      });
      throw error;
    }
  },

  updateBlog: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await blogService.updateBlog(id, updates);
      await get().fetchBlogs(get().filters, get().page);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Blog güncellenemedi',
      });
      throw error;
    }
  },

  deleteBlog: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await blogService.deleteBlog(id);
      await get().fetchBlogs(get().filters, get().page);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Blog silinemedi',
      });
      throw error;
    }
  },

  setFilters: (filters: BlogFilters) => {
    set({ filters, page: 1 });
  },

  clearFilters: () => {
    set({ filters: initialFilters, page: 1 });
  },

  clearError: () => {
    set({ error: null });
  },
}));

