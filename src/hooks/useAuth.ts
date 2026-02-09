/**
 * useAuth Hook
 * React hook for authentication operations
 */

import { useState, useCallback } from 'react';
import {
  register as registerService,
  login as loginService,
  getCurrentUser as getCurrentUserService,
  logout as logoutService,
  isAuthenticated as isAuthenticatedService,
  getStoredUser,
} from '@/services/auth/authService';
import {
  RegisterRequest,
  LoginRequest,
  User,
} from '@/services/api/types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: getStoredUser(),
    isAuthenticated: isAuthenticatedService(),
    isLoading: false,
    error: null,
  });

  /**
   * Register a new user
   */
  const register = useCallback(async (data: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await registerService(data);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (data: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await loginService(data);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return response;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    logoutService();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Refresh current user data
   */
  const refreshUser = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await getCurrentUserService();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch user',
      }));
      throw error;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    register,
    login,
    logout,
    refreshUser,
    clearError,
  };
};

export default useAuth;
