import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginForm, RegisterForm } from '@/types';
import { authService } from '@/services/authService';
import api from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            token: null, // Token is in HttpOnly cookie, not stored in state
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Giriş başarısız',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterForm) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            token: null, // Token is in HttpOnly cookie, not stored in state
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Kayıt başarısız',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint to clear HttpOnly cookies on server
          await api.post('/auth/logout');
        } catch (error) {
          // Even if logout fails, clear local state
          console.error('Logout error:', error);
        } finally {
          // Clear local state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
          // Clear localStorage (for backward compatibility)
          localStorage.removeItem('auth-storage');
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user and isAuthenticated, not token (token is in HttpOnly cookie)
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // token is NOT persisted - it's in HttpOnly cookie
      }),
    }
  )
);

