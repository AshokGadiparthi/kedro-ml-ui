/**
 * Authentication Context
 * Global authentication state management
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Brain } from 'lucide-react';
import { authService } from '@/services';
import type { User as ApiUser, LoginRequest, RegisterRequest } from '@/services/api/types';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'data_scientist' | 'ml_engineer' | 'analyst' | 'viewer';
  avatar?: string;
  organization?: string;
  createdAt: string;
  lastLogin?: string;
  // Backend fields
  username?: string;
  full_name?: string;
  is_active?: boolean;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute')[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add display name for better debugging
AuthContext.displayName = 'AuthContext';

// Role-based permissions
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    { resource: '*', actions: ['create', 'read', 'update', 'delete', 'execute'] },
  ],
  data_scientist: [
    { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'data', actions: ['create', 'read', 'update'] },
    { resource: 'models', actions: ['create', 'read', 'update', 'execute'] },
    { resource: 'predictions', actions: ['read', 'execute'] },
  ],
  ml_engineer: [
    { resource: 'projects', actions: ['read'] },
    { resource: 'models', actions: ['read', 'update', 'execute'] },
    { resource: 'deployments', actions: ['create', 'read', 'update', 'delete', 'execute'] },
    { resource: 'monitoring', actions: ['read'] },
  ],
  analyst: [
    { resource: 'projects', actions: ['read'] },
    { resource: 'data', actions: ['read'] },
    { resource: 'models', actions: ['read'] },
    { resource: 'predictions', actions: ['read', 'execute'] },
  ],
  viewer: [
    { resource: '*', actions: ['read'] },
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initial auth check - validate token with backend
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('ml_platform_user');
        const storedToken = localStorage.getItem('ml_platform_auth_token');
        
        if (storedUser && storedToken) {
          // Validate token by fetching current user from backend
          try {
            const currentUser = await authService.getCurrentUser();
            
            // Map backend user to frontend user format
            const validatedUser: User = {
              id: currentUser.id,
              email: currentUser.email,
              name: currentUser.full_name || currentUser.username,
              role: 'data_scientist', // Default role
              avatar: `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`,
              organization: 'ML Platform',
              createdAt: currentUser.created_at,
              lastLogin: new Date().toISOString(),
              username: currentUser.username,
              full_name: currentUser.full_name || undefined,
              is_active: currentUser.is_active,
            };
            
            setUser(validatedUser);
            localStorage.setItem('ml_platform_user', JSON.stringify(validatedUser));
            console.log('✅ Auth validated - User session restored');
          } catch (error) {
            // Token is invalid or backend is down - clear auth state
            console.log('⚠️ Auth validation failed - Clearing session');
            localStorage.removeItem('ml_platform_user');
            localStorage.removeItem('ml_platform_auth_token');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Logging in user:', email);
      
      // Call real backend API
      const loginRequest: LoginRequest = { email, password };
      const response = await authService.login(loginRequest);
      
      console.log('✅ Login successful:', response);
      
      // Map backend user to frontend user format
      const loggedInUser: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.full_name || response.user.username,
        role: 'data_scientist', // Default role - backend doesn't return role yet
        avatar: `https://ui-avatars.com/api/?name=${response.user.username}&background=random`,
        organization: 'ML Platform',
        createdAt: response.user.created_at,
        lastLogin: new Date().toISOString(),
        username: response.user.username,
        full_name: response.user.full_name || undefined,
        is_active: response.user.is_active,
      };

      setUser(loggedInUser);
      localStorage.setItem('ml_platform_user', JSON.stringify(loggedInUser));
      console.log('✅ User logged in and stored:', loggedInUser);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error; // Re-throw so LoginPage can show error
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    setIsLoading(true);
    try {
      console.log('📝 Registering new user:', { email, name, role });
      
      // Generate username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Call real backend API
      const registerRequest: RegisterRequest = {
        email,
        username,
        password,
        full_name: name,
      };
      
      const registeredUser = await authService.register(registerRequest);
      
      console.log('✅ Registration successful:', registeredUser);
      
      // After registration, automatically log the user in
      console.log('🔐 Auto-login after registration...');
      await login(email, password);
      
      console.log('✅ User registered and logged in successfully');
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      throw error; // Re-throw so SignupPage can show error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ml_platform_user');
    localStorage.removeItem('ml_platform_auth_token');
    // Force page reload to reset all state and show login page
    window.location.reload();
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    
    // Check wildcard permission
    const wildcardPerm = permissions.find(p => p.resource === '*');
    if (wildcardPerm && wildcardPerm.actions.includes(action as any)) {
      return true;
    }

    // Check specific resource permission
    const resourcePerm = permissions.find(p => p.resource === resource);
    return resourcePerm ? resourcePerm.actions.includes(action as any) : false;
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During hot module reload, context might be temporarily undefined
    // Return a safe default state instead of throwing
    // Only log in development and not during hot reload
    if (import.meta.env.DEV && !import.meta.hot) {
      console.warn('⚠️ useAuth called outside AuthProvider - returning safe defaults');
    }
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => {},
      signup: async () => {},
      logout: () => {},
      hasPermission: () => false,
      hasRole: () => false,
    };
  }
  return context;
}