import api from './api';
import { Appointment, PaginatedResponse } from '@/types';

const STORAGE_KEY = 'camp_appointments_storage';

// Load from localStorage or use empty array
const loadAppointmentsFromStorage = (): Appointment[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error('Failed to load appointments from storage:', error);
  }
  return [];
};

// Save to localStorage
const saveAppointmentsToStorage = (appointments: Appointment[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }
  } catch (error) {
    console.error('Failed to save appointments to storage:', error);
  }
};

// Mock appointments data - loaded from localStorage
export let mockAppointments: Appointment[] = loadAppointmentsFromStorage();

export const appointmentService = {
  async getAppointments(page = 1, filters?: { status?: string }): Promise<PaginatedResponse<Appointment>> {
    try {
      const response = await api.get<PaginatedResponse<Appointment>>('/appointments', {
        params: { page, ...filters },
      });
      return response.data;
    } catch (error) {
      // Fallback to mock data
      mockAppointments = loadAppointmentsFromStorage();
      let filtered = [...mockAppointments];
      
      if (filters?.status) {
        filtered = filtered.filter((a) => a.status === filters.status);
      }

      return {
        data: filtered,
        total: filtered.length,
        page,
        limit: 20,
        totalPages: Math.ceil(filtered.length / 20),
      };
    }
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    try {
      const response = await api.get<Appointment>(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      const appointment = mockAppointments.find((a) => a.id === id);
      if (!appointment) throw new Error('Randevu bulunamadı');
      return appointment;
    }
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    try {
      const response = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
      const updated = response.data;
      mockAppointments = loadAppointmentsFromStorage();
      const index = mockAppointments.findIndex((a) => a.id === id);
      if (index !== -1) {
        mockAppointments[index] = updated;
        saveAppointmentsToStorage(mockAppointments);
      }
      return updated;
    } catch (error) {
      mockAppointments = loadAppointmentsFromStorage();
      const index = mockAppointments.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Randevu bulunamadı');
      
      mockAppointments[index] = {
        ...mockAppointments[index],
        status,
        updatedAt: new Date().toISOString(),
      };
      saveAppointmentsToStorage(mockAppointments);
      return mockAppointments[index];
    }
  },

  async deleteAppointment(id: string): Promise<void> {
    try {
      await api.delete(`/appointments/${id}`);
    } catch (error) {
      // Continue with mock deletion
    }
    mockAppointments = loadAppointmentsFromStorage();
    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      mockAppointments.splice(index, 1);
      saveAppointmentsToStorage(mockAppointments);
    }
  },
};

