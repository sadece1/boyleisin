import { create } from 'zustand';
import { Appointment } from '@/types';
import { appointmentService } from '@/services/appointmentService';

interface AppointmentState {
  appointments: Appointment[];
  currentAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  statusFilter?: string;
  
  fetchAppointments: (page?: number, filters?: { status?: string }) => Promise<void>;
  fetchAppointmentById: (id: string) => Promise<void>;
  updateStatus: (id: string, status: Appointment['status']) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  setStatusFilter: (status?: string) => void;
  clearError: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  currentAppointment: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  statusFilter: undefined,

  fetchAppointments: async (page = 1, filters) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters || (get().statusFilter ? { status: get().statusFilter } : undefined);
      const response = await appointmentService.getAppointments(page, activeFilters);
      set({
        appointments: response.data,
        total: response.total,
        page: response.page,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Randevular yüklenemedi',
      });
    }
  },

  fetchAppointmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const appointment = await appointmentService.getAppointmentById(id);
      set({
        currentAppointment: appointment,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Randevu yüklenemedi',
      });
    }
  },

  updateStatus: async (id, status) => {
    try {
      await appointmentService.updateAppointmentStatus(id, status);
      await get().fetchAppointments(get().page, get().statusFilter ? { status: get().statusFilter } : undefined);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Randevu durumu güncellenemedi',
      });
      throw error;
    }
  },

  deleteAppointment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await appointmentService.deleteAppointment(id);
      await get().fetchAppointments(get().page, get().statusFilter ? { status: get().statusFilter } : undefined);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Randevu silinemedi',
      });
      throw error;
    }
  },

  setStatusFilter: (status?: string) => {
    set({ statusFilter: status, page: 1 });
  },

  clearError: () => {
    set({ error: null });
  },
}));

