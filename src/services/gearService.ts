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
      const response = await api.get<{ success: boolean; data: Gear } | Gear>(`/gear/${id}`);
      
      // Backend returns { success: true, data: gear }
      if ((response.data as any).success && (response.data as any).data) {
        return (response.data as any).data;
      }
      
      // Direct gear object
      return response.data as Gear;
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
      const headers = data instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

      const response = await api.put<{ success: boolean; data: Gear } | Gear>(`/gear/${id}`, data, { headers });
      
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
