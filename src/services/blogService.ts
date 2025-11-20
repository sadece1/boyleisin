import api from './api';
import { BlogPost, BlogFilters, PaginatedResponse } from '@/types';

const STORAGE_KEY = 'camp_blogs_storage';

// Initial mock blog data
const initialMockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Kamp Yaparken Dikkat Edilmesi Gerekenler: Güvenlik Rehberi',
    excerpt: 'Doğada güvenli ve keyifli bir kamp deneyimi için bilmeniz gereken her şey.',
    content: 'Kamp yaparken güvenlik en önemli konudur...',
    author: 'Ahmet Yılmaz',
    publishedAt: '2024-01-15',
    category: 'İpuçları',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200',
    readTime: 8,
    tags: ['Güvenlik', 'Yeni Başlayanlar'],
    featured: true,
    views: 1250,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

// Load from localStorage or use initial data
const loadBlogsFromStorage = (): BlogPost[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedBlogs: BlogPost[] = JSON.parse(stored);
        
        // If stored data is empty array, use initial data
        if (Array.isArray(storedBlogs) && storedBlogs.length === 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockBlogPosts));
          return initialMockBlogPosts;
        }
        
        // Fix any blogs with missing publishedAt field
        const fixedBlogs = storedBlogs.map(blog => {
          if (!blog.publishedAt || isNaN(new Date(blog.publishedAt).getTime())) {
            const fallbackDate = blog.createdAt 
              ? new Date(blog.createdAt).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0];
            return {
              ...blog,
              publishedAt: fallbackDate,
            };
          }
          return blog;
        });
        
        // Merge stored blogs with initial mock blogs to ensure initial data is included
        const storedIds = new Set(fixedBlogs.map(b => b.id));
        const newBlogs = initialMockBlogPosts.filter(b => !storedIds.has(b.id));
        const mergedBlogs = [...fixedBlogs, ...newBlogs];
        
        // If we fixed or added new blogs, save to localStorage
        if (newBlogs.length > 0 || fixedBlogs.length !== storedBlogs.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedBlogs));
        }
        
        return mergedBlogs;
      }
      // First time - save initial data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockBlogPosts));
      return initialMockBlogPosts;
    }
  } catch (error) {
    console.error('Failed to load blogs from storage:', error);
    // On error, ensure we have initial data
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockBlogPosts));
      }
    } catch (saveError) {
      console.error('Failed to save initial blogs to storage:', saveError);
    }
  }
  return initialMockBlogPosts;
};

// Save to localStorage
const saveBlogsToStorage = (blogs: BlogPost[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
    }
  } catch (error) {
    console.error('Failed to save blogs to storage:', error);
  }
};

// Mock blog data - loaded from localStorage
// Initialize on module load to ensure data is available
let initialLoad = loadBlogsFromStorage();
if (!initialLoad || initialLoad.length === 0) {
  console.log('Initial blog load was empty, resetting...');
  initialLoad = [...initialMockBlogPosts];
  saveBlogsToStorage(initialLoad);
}
export let mockBlogPosts: BlogPost[] = initialLoad;

export const blogService = {
  async getBlogs(filters?: BlogFilters, page = 1): Promise<PaginatedResponse<BlogPost>> {
    try {
      const response = await api.get<PaginatedResponse<BlogPost>>('/blogs', {
        params: { ...filters, page },
      });
      return response.data;
    } catch (error) {
      // Fallback to mock data when API fails
      console.log('API failed, using mock data:', error);
      
      // Always reload from storage to get latest data
      mockBlogPosts = loadBlogsFromStorage();
      
      // CRITICAL: Ensure we always have at least the initial blog
      if (!mockBlogPosts || mockBlogPosts.length === 0) {
        console.log('No blogs in storage, initializing with default blog');
        mockBlogPosts = [...initialMockBlogPosts];
        saveBlogsToStorage(mockBlogPosts);
      }
      
      console.log('Loaded blogs from storage:', mockBlogPosts.length);
      
      let filtered = [...mockBlogPosts];
      
      if (filters?.search) {
        filtered = filtered.filter(
          (post) =>
            post.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.category) {
        filtered = filtered.filter((post) => post.category === filters.category);
      }
      
      if (filters?.featured !== undefined) {
        filtered = filtered.filter((post) => post.featured === filters.featured);
      }

      // Pagination
      const limit = 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filtered.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };
    }
  },

  async getBlogById(id: string): Promise<BlogPost> {
    try {
      const response = await api.get<BlogPost>(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      mockBlogPosts = loadBlogsFromStorage();
      const post = mockBlogPosts.find((p) => p.id === id);
      if (!post) throw new Error('Blog bulunamadı');
      return post;
    }
  },

  async createBlog(blog: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
    try {
      const response = await api.post<BlogPost>('/blogs', blog);
      const newBlog = response.data;
      mockBlogPosts = loadBlogsFromStorage();
      mockBlogPosts.unshift(newBlog);
      saveBlogsToStorage(mockBlogPosts);
      return newBlog;
    } catch (error) {
      mockBlogPosts = loadBlogsFromStorage();
      const now = new Date();
      const newBlog: BlogPost = {
        ...blog,
        id: `blog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        publishedAt: blog.publishedAt || now.toISOString().split('T')[0], // Ensure valid date format
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        views: 0,
      };
      mockBlogPosts.unshift(newBlog);
      saveBlogsToStorage(mockBlogPosts);
      return newBlog;
    }
  },

  async updateBlog(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const response = await api.put<BlogPost>(`/blogs/${id}`, updates);
      const updated = response.data;
      mockBlogPosts = loadBlogsFromStorage();
      const index = mockBlogPosts.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockBlogPosts[index] = updated;
        saveBlogsToStorage(mockBlogPosts);
      }
      return updated;
    } catch (error) {
      mockBlogPosts = loadBlogsFromStorage();
      const index = mockBlogPosts.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Blog bulunamadı');
      
      mockBlogPosts[index] = {
        ...mockBlogPosts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveBlogsToStorage(mockBlogPosts);
      return mockBlogPosts[index];
    }
  },

  async deleteBlog(id: string): Promise<void> {
    try {
      await api.delete(`/blogs/${id}`);
    } catch (error) {
      // Continue with mock deletion
    }
    mockBlogPosts = loadBlogsFromStorage();
    const index = mockBlogPosts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockBlogPosts.splice(index, 1);
      saveBlogsToStorage(mockBlogPosts);
    }
  },
};

