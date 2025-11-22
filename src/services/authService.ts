import api from './api';
import { AuthResponse, LoginForm, RegisterForm, User } from '@/types';

// Mock users for testing (matches backend seed data)
const mockUsers = [
  {
    id: '1',
    email: 'admin@campscape.com',
    name: 'Admin User',
    role: 'admin' as const,
    password: 'Admin123!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'user1@campscape.com',
    name: 'John Doe',
    role: 'user' as const,
    password: 'User123!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'user2@campscape.com',
    name: 'Jane Smith',
    role: 'user' as const,
    password: 'User123!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to transform backend user format to frontend format
const transformUser = (backendUser: any): User => {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role: backendUser.role,
    avatar: backendUser.avatar,
    createdAt: backendUser.created_at || backendUser.createdAt || new Date().toISOString(),
    updatedAt: backendUser.updated_at || backendUser.updatedAt || new Date().toISOString(),
  };
};

export const authService = {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    // Check if API call fails, use mock data
    try {
      const response = await api.post<{ success: boolean; data: { user: any; token: string } }>('/auth/login', credentials);
      
      // Backend returns { success: true, data: { user, token } }
      if (response.data.success && response.data.data) {
        return {
          user: transformUser(response.data.data.user),
          token: response.data.data.token,
        };
      }
      
      // Fallback if format is different
      return {
        user: transformUser(response.data.data?.user || response.data),
        token: response.data.data?.token || (response.data as any).token,
      };
    } catch (error) {
      // Mock login for development
      const user = mockUsers.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );
      
      if (!user) {
        throw new Error('E-posta veya şifre hatalı');
      }

      // Return mock response
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword as User,
        token: `mock-token-${user.id}`,
      };
    }
  },

  async register(data: RegisterForm): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: { user: any; token: string } }>('/auth/register', data);
    
    if (response.data.success && response.data.data) {
      return {
        user: transformUser(response.data.data.user),
        token: response.data.data.token,
      };
    }
    
    return {
      user: transformUser(response.data.data?.user || response.data),
      token: response.data.data?.token || (response.data as any).token,
    };
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ success: boolean; data: any } | User>('/auth/me');
    
    // Check if it's wrapped in success/data format
    if ((response.data as any).success && (response.data as any).data) {
      return transformUser((response.data as any).data);
    }
    
    // Direct user object
    return transformUser(response.data as any);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<{ success: boolean; data: any } | User>('/auth/profile', data);
    
    if ((response.data as any).success && (response.data as any).data) {
      return transformUser((response.data as any).data);
    }
    
    return transformUser(response.data as any);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get<{ success: boolean; data: any[]; pagination?: any }>('/admin/users');
      if (response.data.success && response.data.data) {
        return response.data.data.map((u: any) => transformUser(u));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Fallback: return mock users without passwords
      return mockUsers.map(({ password, ...user }) => user as User);
    }
  },
};

