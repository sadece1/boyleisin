import api from './api';
import { Gear, GearFilters, PaginatedResponse } from '@/types';
import { config } from '@/config';

// REMOVED: All mock data and localStorage code - now using backend API only

export const gearService = {
  async getGear(
    filters?: GearFilters,
    page: number = 1,
    limit: number = config.itemsPerPage
  ): Promise<PaginatedResponse<Gear>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters || {}).filter(([_, v]) => v !== undefined && v !== '')
        ),
      });

      const response = await api.get<{ success: boolean; data: Gear[]; pagination: any } | PaginatedResponse<Gear>>(
        `/gear?${params.toString()}`
      );
      
      // Backend returns { success: true, data: gear[], pagination: {...} }
      let gearList: Gear[] = [];
      if ((response.data as any).success && (response.data as any).data) {
        gearList = (response.data as any).data;
      } else if (Array.isArray((response.data as any).data)) {
        gearList = (response.data as any).data;
      } else if (Array.isArray(response.data)) {
        gearList = response.data as Gear[];
      }
      
      // Transform snake_case to camelCase for all gear items
      const transformedGearList = gearList.map((gearItem: any) => {
        // Parse price_per_day
        let pricePerDay = 0;
        if (gearItem.price_per_day !== undefined && gearItem.price_per_day !== null) {
          if (typeof gearItem.price_per_day === 'string') {
            pricePerDay = parseFloat(gearItem.price_per_day) || 0;
          } else if (typeof gearItem.price_per_day === 'number') {
            pricePerDay = gearItem.price_per_day;
          }
        } else if (gearItem.pricePerDay !== undefined && gearItem.pricePerDay !== null) {
          if (typeof gearItem.pricePerDay === 'string') {
            pricePerDay = parseFloat(gearItem.pricePerDay) || 0;
          } else if (typeof gearItem.pricePerDay === 'number') {
            pricePerDay = gearItem.pricePerDay;
          }
        }
        
        return {
          ...gearItem,
          pricePerDay: pricePerDay,
          categoryId: gearItem.category_id ?? gearItem.categoryId,
          recommendedProducts: gearItem.recommended_products ?? gearItem.recommendedProducts ?? [],
          updatedAt: gearItem.updated_at ?? gearItem.updatedAt,
          createdAt: gearItem.created_at ?? gearItem.createdAt,
        } as Gear;
      });
      
      if ((response.data as any).success && (response.data as any).data) {
        return {
          data: transformedGearList,
          total: (response.data as any).pagination?.total || transformedGearList.length,
          page: (response.data as any).pagination?.page || page,
          limit: (response.data as any).pagination?.limit || limit,
          totalPages: (response.data as any).pagination?.totalPages || Math.ceil(((response.data as any).pagination?.total || transformedGearList.length) / limit),
        };
      }
      
      // Direct paginated response
      return {
        ...(response.data as PaginatedResponse<Gear>),
        data: transformedGearList,
      };
    } catch (error) {
      // Always throw error - no mock fallback
      throw error;
    }
  },

  async getGearById(id: string): Promise<Gear> {
    try {
      const response = await api.get<{ success: boolean; data: any } | any>(`/gear/${id}`);
      
      // Backend returns { success: true, data: gear } with snake_case fields
      let gearData: any;
      if ((response.data as any).success && (response.data as any).data) {
        gearData = (response.data as any).data;
      } else {
        gearData = response.data;
      }
      
      // CRITICAL DEBUG: Log raw rating from backend
      console.log('🔍 [getGearById] Raw rating from backend:', {
        rating: gearData.rating,
        type: typeof gearData.rating,
        isNull: gearData.rating === null,
        isUndefined: gearData.rating === undefined,
        stringValue: String(gearData.rating),
        fullGearData: gearData
      });
      
      // Transform snake_case to camelCase and ensure proper types
      let parsedRating: number | null = null;
      
      if (gearData.rating !== null && gearData.rating !== undefined) {
        if (typeof gearData.rating === 'string') {
          const trimmed = gearData.rating.trim();
          if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
            parsedRating = null;
          } else {
            const parsed = parseFloat(trimmed);
            parsedRating = isNaN(parsed) ? null : parsed;
          }
        } else if (typeof gearData.rating === 'number') {
          parsedRating = isNaN(gearData.rating) ? null : gearData.rating;
        } else {
          parsedRating = null;
        }
      } else {
        parsedRating = null;
      }
      
      console.log('🔍 [getGearById] Parsed rating:', parsedRating, typeof parsedRating);
      
      const transformed: Gear = {
        ...gearData,
        pricePerDay: typeof gearData.price_per_day === 'string' 
          ? parseFloat(gearData.price_per_day) || 0
          : (gearData.pricePerDay ?? gearData.price_per_day ?? 0),
        deposit: gearData.deposit !== null && gearData.deposit !== undefined
          ? (typeof gearData.deposit === 'string' ? parseFloat(gearData.deposit) || null : gearData.deposit)
          : null,
        rating: parsedRating, // Use the parsed rating
        categoryId: gearData.category_id ?? gearData.categoryId,
        recommendedProducts: gearData.recommended_products ?? gearData.recommendedProducts ?? [],
        updatedAt: gearData.updated_at ?? gearData.updatedAt, // Transform updated_at to updatedAt
        createdAt: gearData.created_at ?? gearData.createdAt, // Transform created_at to createdAt
      };
      
      console.log('🔍 [getGearById] Final transformed rating:', transformed.rating, typeof transformed.rating);
      
      return transformed as Gear;
    } catch (error: any) {
      // Always throw error - no mock fallback
      throw error;
    }
  },

  async createGear(data: FormData): Promise<Gear> {
    try {
      const response = await api.post<{ success: boolean; data: Gear } | Gear>('/gear', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Backend returns { success: true, data: gear }
      if ((response.data as any).success && (response.data as any).data) {
        return (response.data as any).data;
      }
      
      // Direct gear object
      return response.data as Gear;
    } catch (error) {
      // Always throw error - no mock fallback
      throw error;
    }
  },

  async updateGear(id: string, data: FormData | Partial<Gear>): Promise<Gear> {
    try {
      // Transform camelCase to snake_case for backend compatibility
      let transformedData: any = data;
      if (!(data instanceof FormData)) {
        transformedData = { ...data };
        
        // Convert pricePerDay to price_per_day
        if (transformedData.pricePerDay !== undefined) {
          transformedData.price_per_day = transformedData.pricePerDay;
          delete transformedData.pricePerDay;
          console.log('Transformed pricePerDay to price_per_day:', transformedData.price_per_day);
        }
        
        // Convert recommendedProducts to recommended_products
        if (transformedData.recommendedProducts !== undefined) {
          transformedData.recommended_products = transformedData.recommendedProducts;
          delete transformedData.recommendedProducts;
        }
        
        // Convert categoryId to category_id
        if (transformedData.categoryId !== undefined) {
          transformedData.category_id = transformedData.categoryId;
          delete transformedData.categoryId;
        }
        // Ensure specifications is properly formatted
        if (transformedData.specifications && typeof transformedData.specifications === 'object') {
          // Already an object, keep as is
        }
        // CRITICAL: Always ensure rating, specifications and category_id are set (never undefined)
        // Backend checks for !== undefined, so we must always provide these values
        
        // Rating: Always set, even if null
        if ('rating' in transformedData) {
          if (transformedData.rating === null || transformedData.rating === '' || transformedData.rating === 'null' || transformedData.rating === undefined) {
            transformedData.rating = null;
          } else {
            const parsed = typeof transformedData.rating === 'number' 
              ? transformedData.rating 
              : parseFloat(String(transformedData.rating));
            // Allow 0 as valid rating value
            transformedData.rating = isNaN(parsed) ? null : parsed;
          }
          console.log('Transformed rating value:', transformedData.rating);
        } else {
          // If rating key is missing, set it to null explicitly
          console.warn('⚠️ Rating key missing in data! Setting to null explicitly.');
          transformedData.rating = null;
        }
        
        // Specifications: Always set, even if empty object
        if ('specifications' in transformedData) {
          if (!transformedData.specifications || typeof transformedData.specifications !== 'object') {
            transformedData.specifications = {};
          }
          console.log('Transformed specifications:', transformedData.specifications);
        } else {
          // If specifications key is missing, set it to empty object explicitly
          console.warn('⚠️ Specifications key missing in data! Setting to empty object explicitly.');
          transformedData.specifications = {};
        }
        
        // Category_id: Always set
        if ('categoryId' in transformedData && !transformedData.category_id) {
          transformedData.category_id = transformedData.categoryId;
          delete transformedData.categoryId;
        }
        if ('category_id' in transformedData) {
          console.log('Transformed category_id:', transformedData.category_id);
        } else {
          // If category_id key is missing, try to get it from categoryId
          if ('categoryId' in transformedData) {
            transformedData.category_id = transformedData.categoryId;
            delete transformedData.categoryId;
            console.log('Converted categoryId to category_id:', transformedData.category_id);
          } else {
            console.warn('⚠️ Category_id key missing in data!');
          }
        }
      }

      const headers = data instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      console.log('=== SENDING TO BACKEND ===');
      console.log('URL:', `/gear/${id}`);
      console.log('Data being sent:', transformedData);
      console.log('Data.rating:', transformedData.rating, typeof transformedData.rating);
      console.log('Data.specifications:', transformedData.specifications);
      console.log('Data.category_id:', transformedData.category_id);
      console.log('Headers:', headers);
      
      const response = await api.put<{ success: boolean; data: Gear } | Gear>(`/gear/${id}`, transformedData, { headers });
      
      console.log('=== BACKEND RESPONSE ===');
      console.log('Response:', response.data);
      
      // Backend returns { success: true, data: gear }
      if ((response.data as any).success && (response.data as any).data) {
        return (response.data as any).data;
      }
      
      // Direct gear object
      return response.data as Gear;
    } catch (error) {
      // Always throw error - no mock fallback
      throw error;
    }
  },

  async deleteGear(id: string): Promise<void> {
    try {
      await api.delete(`/gear/${id}`);
    } catch (error) {
      // Always throw error - no mock fallback
      throw error;
    }
  },
};
