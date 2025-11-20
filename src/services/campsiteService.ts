import api from './api';
import { Campsite, CampsiteFilters, PaginatedResponse } from '@/types';
import { config } from '@/config';

export const campsiteService = {
  async getCampsites(
    filters?: CampsiteFilters,
    page: number = 1,
    limit: number = config.itemsPerPage
  ): Promise<PaginatedResponse<Campsite>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters || {}).filter(([_, v]) => v !== undefined && v !== '')
      ),
    });

    // Handle array filters
    if (filters?.amenities?.length) {
      params.delete('amenities');
      filters.amenities.forEach((amenity) => {
        params.append('amenities', amenity);
      });
    }

    const response = await api.get<PaginatedResponse<Campsite>>(
      `/campsites?${params.toString()}`
    );
    return response.data;
  },

  async getCampsiteById(id: string): Promise<Campsite> {
    const response = await api.get<Campsite>(`/campsites/${id}`);
    return response.data;
  },

  async createCampsite(data: FormData): Promise<Campsite> {
    const response = await api.post<Campsite>('/campsites', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateCampsite(id: string, data: FormData | Partial<Campsite>): Promise<Campsite> {
    const headers = data instanceof FormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };

    const response = await api.put<Campsite>(`/campsites/${id}`, data, { headers });
    return response.data;
  },

  async deleteCampsite(id: string): Promise<void> {
    await api.delete(`/campsites/${id}`);
  },
};

