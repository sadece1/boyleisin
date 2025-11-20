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

export const authService = {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    // Check if API call fails, use mock data
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
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
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', data);
    return response.data;
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
      const response = await api.get<User[]>('/admin/users');
      return response.data;
    } catch (error) {
      // Fallback: return mock users without passwords
      return mockUsers.map(({ password, ...user }) => user as User);
    }
  },
};

