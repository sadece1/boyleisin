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
      if ((response.data as any).success && (response.data as any).data) {
      return {
          data: (response.data as any).data,
          total: (response.data as any).pagination?.total || (response.data as any).data.length,
          page: (response.data as any).pagination?.page || page,
          limit: (response.data as any).pagination?.limit || limit,
          totalPages: (response.data as any).pagination?.totalPages || Math.ceil(((response.data as any).pagination?.total || (response.data as any).data.length) / limit),
        };
      }
      
      // Direct paginated response
      return response.data as PaginatedResponse<Gear>;
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
      
      // Transform snake_case to camelCase and ensure proper types
      const transformed: Gear = {
        ...gearData,
        pricePerDay: typeof gearData.price_per_day === 'string' 
          ? parseFloat(gearData.price_per_day) || 0
          : (gearData.pricePerDay ?? gearData.price_per_day ?? 0),
        deposit: gearData.deposit !== null && gearData.deposit !== undefined
          ? (typeof gearData.deposit === 'string' ? parseFloat(gearData.deposit) || null : gearData.deposit)
          : null,
        rating: gearData.rating !== null && gearData.rating !== undefined
          ? (typeof gearData.rating === 'string' ? parseFloat(gearData.rating) || undefined : gearData.rating)
          : undefined,
        categoryId: gearData.category_id ?? gearData.categoryId,
        recommendedProducts: gearData.recommended_products ?? gearData.recommendedProducts ?? [],
      };
      
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
        // Convert categoryId to category_id
        if (transformedData.categoryId !== undefined) {
          transformedData.category_id = transformedData.categoryId;
          delete transformedData.categoryId;
        }
        // Ensure specifications is properly formatted
        if (transformedData.specifications && typeof transformedData.specifications === 'object') {
          // Already an object, keep as is
        }
        // Ensure rating is a number or null
        // Rating can be 0-5, or null/undefined
        console.log('Transforming rating in updateGear:', transformedData.rating, typeof transformedData.rating);
        if (transformedData.rating !== undefined) {
          if (transformedData.rating === null || transformedData.rating === '' || transformedData.rating === 'null') {
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
          // If rating is not provided in update, don't include it (undefined)
          // This allows partial updates without overwriting existing rating
          console.log('Rating is undefined, not including in update');
        }
      }

      const headers = data instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      const response = await api.put<{ success: boolean; data: Gear } | Gear>(`/gear/${id}`, transformedData, { headers });
      
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
