/**
 * Authentication Service
 * API calls for user authentication with FastAPI backend
 */

import apiClient from '../api/client';
import { setAuthToken, setCurrentUser, clearStorage } from '@/config/environment';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
  AuthError,
} from '../api/types';

/**
 * Mock user for fallback
 */
const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'demo@mlplatform.com',
  username: 'demo_user',
  full_name: 'Demo User',
  is_active: true,
  created_at: new Date().toISOString(),
  name: 'Demo User',
  role: 'admin',
};

// Track backend availability
let backendAvailable: boolean | null = null;
let lastCheckTime = 0;
const CHECK_INTERVAL = 60000; // Check every minute

/**
 * Check if backend is available (with caching)
 */
const isBackendAvailable = async (): Promise<boolean> => {
  // Use cached result if recent
  const now = Date.now();
  if (backendAvailable !== null && (now - lastCheckTime) < CHECK_INTERVAL) {
    return backendAvailable;
  }

  // Try to ping backend
  try {
    await apiClient.get('/health', { timeout: 3000 });
    backendAvailable = true;
    lastCheckTime = now;
    return true;
  } catch (error) {
    backendAvailable = false;
    lastCheckTime = now;
    return false;
  }
};

/**
 * Register a new user
 * 
 * @param data - Registration data (email, username, password, full_name)
 * @returns Promise<RegisterResponse>
 * 
 * @example
 * const user = await register({
 *   email: 'john@example.com',
 *   username: 'john_doe',
 *   password: 'password123',
 *   full_name: 'John Doe'
 * });
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const available = await isBackendAvailable();
  
  if (!available) {
    console.log('⚠️ Backend unavailable - Using mock registration');
    // Simulate successful registration
    return {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: data.email,
      username: data.username,
      full_name: data.full_name,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  try {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', data);
    return response.data;
  } catch (error: any) {
    // Handle network errors with fallback
    if (error.code === 'NETWORK_ERROR' || error.status === 0) {
      backendAvailable = false;
      console.log('⚠️ Backend unreachable during registration - Using mock data');
      return {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: data.email,
        username: data.username,
        full_name: data.full_name,
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }
    
    // For validation errors (400, 422), throw them
    if (error.status === 400 || error.status === 422) {
      throw new Error(error.message || 'Email or username already registered');
    }
    
    throw error;
  }
};

/**
 * Login user and get access token
 * 
 * @param data - Login credentials (email, password)
 * @returns Promise<LoginResponse>
 * 
 * @example
 * const loginData = await login({
 *   email: 'john@example.com',
 *   password: 'password123'
 * });
 * // Token and user info are automatically stored in localStorage
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const available = await isBackendAvailable();
  
  if (!available) {
    console.log('⚠️ Backend unavailable - Using mock login');
    // Mock successful login
    const mockResponse: LoginResponse = {
      access_token: 'mock_jwt_token_' + Date.now(),
      token_type: 'bearer',
      user: mockUser,
    };
    
    // Store token and user
    setAuthToken(mockResponse.access_token);
    setCurrentUser(mockResponse.user);
    
    return mockResponse;
  }

  try {
    // Backend expects 'username', but frontend uses 'email' for better UX
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      username: data.email,  // Transform email -> username for backend
      password: data.password,
    });
    
    // Store token and user in localStorage
    setAuthToken(response.data.access_token);
    setCurrentUser(response.data.user);
    
    return response.data;
  } catch (error: any) {
    // Handle network errors with fallback
    if (error.code === 'NETWORK_ERROR' || error.status === 0) {
      backendAvailable = false;
      console.log('⚠️ Backend unreachable during login - Using mock data');
      
      const mockResponse: LoginResponse = {
        access_token: 'mock_jwt_token_' + Date.now(),
        token_type: 'bearer',
        user: mockUser,
      };
      
      setAuthToken(mockResponse.access_token);
      setCurrentUser(mockResponse.user);
      
      return mockResponse;
    }
    
    // For auth errors (401), throw them
    if (error.status === 401) {
      throw new Error(error.message || 'Invalid email or password');
    }
    
    throw error;
  }
};

/**
 * Get current authenticated user
 * 
 * @returns Promise<User>
 * 
 * @example
 * const user = await getCurrentUser();
 * console.log(user.email);
 */
export const getCurrentUser = async (): Promise<User> => {
  const available = await isBackendAvailable();
  
  if (!available) {
    console.log('⚠️ Backend unavailable - Using mock user');
    return mockUser;
  }

  try {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  } catch (error: any) {
    // Handle network errors with fallback
    if (error.code === 'NETWORK_ERROR' || error.status === 0) {
      backendAvailable = false;
      console.log('⚠️ Backend unreachable when fetching user - Using mock data');
      return mockUser;
    }
    
    // For 401 errors, clear storage and redirect
    if (error.status === 401) {
      clearStorage();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    throw error;
  }
};

/**
 * Logout user
 * Clears auth token and user data from localStorage
 * 
 * @example
 * logout();
 * // Redirects to login page
 */
export const logout = (): void => {
  clearStorage();
  // Note: Navigation should be handled by the calling component
  console.log('✓ User logged out successfully');
};

/**
 * Check if user is authenticated
 * 
 * @returns boolean
 * 
 * @example
 * if (isAuthenticated()) {
 *   // User is logged in
 * }
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('ml_platform_auth_token');
  const user = localStorage.getItem('ml_platform_user');
  return !!(token && user);
};

/**
 * Get stored auth token
 * 
 * @returns string | null
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('ml_platform_auth_token');
};

/**
 * Get stored user
 * 
 * @returns User | null
 */
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('ml_platform_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    return null;
  }
};

// Export all auth functions
export default {
  register,
  login,
  getCurrentUser,
  logout,
  isAuthenticated,
  getStoredToken,
  getStoredUser,
};