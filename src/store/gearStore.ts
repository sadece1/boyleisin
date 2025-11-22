import { create } from 'zustand';
import { Gear, GearFilters } from '@/types';
import { gearService } from '@/services/gearService';
import { categoryManagementService } from '@/services/categoryManagementService';

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
      // Validate description length
      if (!gearData.description || gearData.description.trim().length < 20) {
        alert('⚠️ Açıklama en az 20 karakter olmalıdır');
        set({ isLoading: false });
        return;
      }

      // Get backend category UUID from frontend category
      let backendCategoryId: string | null = null;
      if (gearData.categoryId) {
        try {
          // Fetch backend categories to find UUID
          const response = await fetch('/api/categories');
          const backendCategoriesResponse = await response.json();
          if (backendCategoriesResponse.success && backendCategoriesResponse.data) {
            const backendCategories = backendCategoriesResponse.data;
            // Get frontend category to find matching backend category
            const frontendCategory = categoryManagementService.getCategoryById(gearData.categoryId);
            if (frontendCategory) {
              // Try multiple matching strategies
              const matchingBackendCategory = backendCategories.find((bc: any) => {
                const backendSlug = (bc.slug || '').toLowerCase().trim();
                const backendName = (bc.name || '').toLowerCase().trim();
                const frontendSlug = (frontendCategory.slug || '').toLowerCase().trim();
                const frontendName = (frontendCategory.name || '').toLowerCase().trim();
                
                // Exact match
                if (backendSlug === frontendSlug || backendName === frontendName) {
                  return true;
                }
                
                // Partial match - check if any word matches
                const backendWords = backendName.split(/\s+/);
                const frontendWords = frontendName.split(/\s+/);
                const hasMatchingWord = backendWords.some(bw => 
                  frontendWords.some(fw => fw.includes(bw) || bw.includes(fw))
                );
                if (hasMatchingWord) {
                  return true;
                }
                
                // Slug contains match
                if (backendSlug.includes(frontendSlug) || frontendSlug.includes(backendSlug)) {
                  return true;
                }
                
                return false;
              });
              
              if (matchingBackendCategory) {
                backendCategoryId = matchingBackendCategory.id;
                console.log('✅ Category matched:', {
                  frontend: { id: frontendCategory.id, slug: frontendCategory.slug, name: frontendCategory.name },
                  backend: { id: matchingBackendCategory.id, slug: matchingBackendCategory.slug, name: matchingBackendCategory.name }
                });
              } else {
                // Log detailed information for debugging
                console.warn('⚠️ Category not matched:', {
                  frontend: { id: frontendCategory.id, slug: frontendCategory.slug, name: frontendCategory.name },
                  availableBackendCategories: backendCategories.map((bc: any) => ({ id: bc.id, slug: bc.slug, name: bc.name }))
                });
                
                // Try to create the category in backend automatically
                console.log('🔄 Attempting to create category in backend:', frontendCategory.name);
                try {
                  const { categoryManagementService } = await import('@/services/categoryManagementService');
                  
                  // Find parent category in backend if frontend category has a parent
                  let backendParentId: string | null = null;
                  if (frontendCategory.parentId) {
                    const parentFrontendCategory = categoryManagementService.getCategoryById(frontendCategory.parentId);
                    if (parentFrontendCategory) {
                      // Try to find parent in backend
                      const parentBackendCategory = backendCategories.find((bc: any) => {
                        const backendSlug = (bc.slug || '').toLowerCase().trim();
                        const backendName = (bc.name || '').toLowerCase().trim();
                        const frontendSlug = (parentFrontendCategory.slug || '').toLowerCase().trim();
                        const frontendName = (parentFrontendCategory.name || '').toLowerCase().trim();
                        return backendSlug === frontendSlug || backendName === frontendName;
                      });
                      if (parentBackendCategory) {
                        backendParentId = parentBackendCategory.id;
                      }
                    }
                  }
                  
                  // Create category in backend
                  const newBackendCategory = await categoryManagementService.createCategory({
                    name: frontendCategory.name,
                    slug: frontendCategory.slug,
                    description: frontendCategory.description || null,
                    parentId: backendParentId,
                    icon: frontendCategory.icon || null,
                    order: frontendCategory.order || 0,
                  });
                  
                  if (newBackendCategory) {
                    // Try to get the UUID from backend response
                    // The createCategory might return a local category, so we need to fetch from backend
                    const refreshResponse = await fetch('/api/categories');
                    const refreshData = await refreshResponse.json();
                    if (refreshData.success && refreshData.data) {
                      const refreshedBackendCategories = refreshData.data;
                      const createdCategory = refreshedBackendCategories.find((bc: any) => 
                        bc.slug === frontendCategory.slug || bc.name === frontendCategory.name
                      );
                      if (createdCategory) {
                        backendCategoryId = createdCategory.id;
                        console.log('✅ Category created in backend:', {
                          id: backendCategoryId,
                          name: createdCategory.name,
                          slug: createdCategory.slug
                        });
                      }
                    }
                  }
                } catch (createError) {
                  console.error('❌ Failed to create category in backend:', createError);
                  const availableCategoryNames = backendCategories.map((bc: any) => bc.name).join(', ');
                  const errorMsg = `⚠️ Kategori Backend'de Bulunamadı ve Oluşturulamadı!\n\n` +
                    `Seçilen kategori: "${frontendCategory.name}" (${frontendCategory.slug})\n\n` +
                    `Backend'de mevcut kategoriler:\n${availableCategoryNames}\n\n` +
                    `Lütfen:\n` +
                    `1. Backend'de "${frontendCategory.name}" kategorisini manuel olarak oluşturun, VEYA\n` +
                    `2. Frontend'de mevcut backend kategorilerinden birini seçin.\n\n` +
                    `Not: Backend'de kategori oluşturmak için admin panelinden kategori yönetimi bölümünü kullanın.`;
                  
                  alert(errorMsg);
                  set({ isLoading: false });
                  return;
                }
                
                // If still no backendCategoryId after creation attempt, show error
                if (!backendCategoryId) {
                  const availableCategoryNames = backendCategories.map((bc: any) => bc.name).join(', ');
                  const errorMsg = `⚠️ Kategori Backend'de Bulunamadı!\n\n` +
                    `Seçilen kategori: "${frontendCategory.name}" (${frontendCategory.slug})\n\n` +
                    `Backend'de mevcut kategoriler:\n${availableCategoryNames}\n\n` +
                    `Lütfen:\n` +
                    `1. Backend'de "${frontendCategory.name}" kategorisini oluşturun, VEYA\n` +
                    `2. Frontend'de mevcut backend kategorilerinden birini seçin.\n\n` +
                    `Not: Backend'de kategori oluşturmak için admin panelinden kategori yönetimi bölümünü kullanın.`;
                  
                  alert(errorMsg);
                  set({ isLoading: false });
                  return;
                }
              }
            } else {
              console.warn('⚠️ Frontend category not found for ID:', gearData.categoryId);
            }
          } else {
            console.warn('⚠️ Backend categories response is invalid:', backendCategoriesResponse);
          }
        } catch (error) {
          console.error('❌ Failed to fetch backend categories:', error);
          alert('⚠️ Kategoriler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
          set({ isLoading: false });
          return;
        }
      } else {
        console.warn('⚠️ No categoryId provided in gearData:', gearData);
      }

      if (!backendCategoryId) {
        const errorMsg = gearData.categoryId 
          ? `⚠️ Geçerli bir kategori seçin. Kategori backend'de bulunamadı.\n\nSeçilen kategori: ${categoryManagementService.getCategoryById(gearData.categoryId)?.name || gearData.categoryId}\n\nLütfen farklı bir kategori seçin veya backend'de bu kategoriyi oluşturun.`
          : '⚠️ Lütfen bir kategori seçin!';
        alert(errorMsg);
        set({ isLoading: false });
        return;
      }

      // Create FormData for service compatibility
      const formData = new FormData();
      formData.append('name', gearData.name);
      formData.append('description', gearData.description.trim());
      formData.append('category', String(gearData.category));
      formData.append('category_id', backendCategoryId);
      formData.append('price_per_day', String(gearData.pricePerDay));
      if (gearData.deposit !== undefined) {
        formData.append('deposit', String(gearData.deposit));
      }
      formData.append('available', String(gearData.available ?? true));
      formData.append('status', gearData.status || 'for-sale');
      
      // Add images as URLs - ensure they are valid URIs
      if (gearData.images && gearData.images.length > 0) {
        gearData.images.forEach((url, index) => {
          if (url && url.trim() !== '') {
            // Convert relative URLs to absolute URLs
            let imageUrl = url.trim();
            if (imageUrl.startsWith('/')) {
              // Relative path - make it absolute
              imageUrl = `${window.location.origin}${imageUrl}`;
            } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
              // Assume it's a relative path from uploads
              imageUrl = `${window.location.origin}/api${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
            formData.append(`image_${index}`, imageUrl);
          }
        });
      }

      // Add optional fields - only append if they have values (not undefined)
      if (gearData.brand && gearData.brand.trim() !== '') {
        formData.append('brand', gearData.brand);
      }
      if (gearData.color && gearData.color.trim() !== '') {
        formData.append('color', gearData.color);
      }
      // Always append rating, even if null (to explicitly set it)
      if (gearData.rating !== undefined) {
        formData.append('rating', gearData.rating !== null ? String(gearData.rating) : '');
        console.log('Appending rating to FormData:', gearData.rating);
      } else {
        console.log('Rating is undefined, not appending to FormData');
      }
      if (gearData.specifications && Object.keys(gearData.specifications).length > 0) {
        formData.append('specifications', JSON.stringify(gearData.specifications));
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

