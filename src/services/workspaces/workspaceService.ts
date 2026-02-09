/**
 * Workspace Service
 * API calls for workspace management with FastAPI backend
 */

import apiClient from '../api/client';
import { useMockData } from '@/config/environment';
import {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from '../api/types';

/**
 * Mock workspaces for fallback
 */
const mockWorkspaces: Workspace[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'My ML Workspace',
    slug: 'my-ml-workspace',
    description: 'For development and testing',
    owner_id: '550e8400-e29b-41d4-a716-446655440000',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Production Workspace',
    slug: 'production-workspace',
    description: 'Production models',
    owner_id: '550e8400-e29b-41d4-a716-446655440000',
    is_active: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Fraud Detection Workspace',
    slug: 'fraud-detection-workspace',
    description: 'Banking fraud detection models and experiments',
    owner_id: '550e8400-e29b-41d4-a716-446655440000',
    is_active: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Track backend availability
let backendAvailable: boolean | null = null;
let lastCheckTime = 0;
const CHECK_INTERVAL = 60000; // Check every minute

/**
 * Check if backend is available (with caching)
 */
const isBackendAvailable = async (): Promise<boolean> => {
  // If forced to use mock data, return false
  if (useMockData()) {
    return false;
  }

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
    console.log('⚠️ Backend unreachable - Using mock data as fallback');
    return false;
  }
};

/**
 * Wrapper to call API with automatic fallback to mock data
 */
const callWithFallback = async <T,>(
  apiCall: () => Promise<T>,
  mockData: T,
  errorContext: string = 'operation'
): Promise<T> => {
  // Check if backend is available
  const available = await isBackendAvailable();
  
  if (!available) {
    // Use mock data silently
    return mockData;
  }

  // Try API call
  try {
    return await apiCall();
  } catch (error: any) {
    // If network error, switch to mock data
    if (error.code === 'NETWORK_ERROR' || error.status === 0) {
      backendAvailable = false; // Mark backend as unavailable
      console.log(`⚠️ Backend unreachable during ${errorContext} - Using mock data`);
      return mockData;
    }
    // For other errors, throw them
    throw error;
  }
};

/**
 * Get all workspaces for the current user
 * 
 * @returns Promise<Workspace[]>
 * 
 * @example
 * const workspaces = await getWorkspaces();
 * workspaces.forEach(ws => console.log(ws.name));
 */
export const getWorkspaces = async (): Promise<Workspace[]> => {
  return callWithFallback(
    async () => {
      const response = await apiClient.get<Workspace[]>('/api/workspaces');
      return response.data;
    },
    mockWorkspaces,
    'workspace listing'
  );
};

/**
 * Get a specific workspace by ID
 * 
 * @param workspaceId - The UUID of the workspace
 * @returns Promise<Workspace>
 * 
 * @example
 * const workspace = await getWorkspace('550e8400-e29b-41d4-a716-446655440001');
 * console.log(workspace.name);
 */
export const getWorkspace = async (workspaceId: string): Promise<Workspace> => {
  return callWithFallback(
    async () => {
      const response = await apiClient.get<Workspace>(`/api/workspaces/${workspaceId}`);
      return response.data;
    },
    mockWorkspaces.find(ws => ws.id === workspaceId) || mockWorkspaces[0],
    'workspace fetch'
  );
};

/**
 * Create a new workspace
 * 
 * @param data - Workspace creation data (name, slug, description)
 * @returns Promise<Workspace>
 * 
 * @example
 * const newWorkspace = await createWorkspace({
 *   name: 'My New Workspace',
 *   slug: 'my-new-workspace',
 *   description: 'For testing new features'
 * });
 */
export const createWorkspace = async (data: CreateWorkspaceRequest): Promise<Workspace> => {
  return callWithFallback(
    async () => {
      const response = await apiClient.post<Workspace>('/api/workspaces', data);
      return response.data;
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440' + Math.floor(Math.random() * 1000),
      name: data.name,
      slug: data.slug,
      description: data.description,
      owner_id: '550e8400-e29b-41d4-a716-446655440000',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'workspace creation'
  );
};

/**
 * Update a workspace
 * 
 * @param workspaceId - The UUID of the workspace
 * @param data - Update data (name, description)
 * @returns Promise<Workspace>
 * 
 * @example
 * const updated = await updateWorkspace('550e8400-e29b-41d4-a716-446655440001', {
 *   name: 'Updated Workspace Name',
 *   description: 'Updated description'
 * });
 */
export const updateWorkspace = async (
  workspaceId: string,
  data: UpdateWorkspaceRequest
): Promise<Workspace> => {
  return callWithFallback(
    async () => {
      const response = await apiClient.put<Workspace>(
        `/api/workspaces/${workspaceId}`,
        data
      );
      return response.data;
    },
    {
      ...(mockWorkspaces.find(ws => ws.id === workspaceId) || mockWorkspaces[0]),
      name: data.name || mockWorkspaces[0].name,
      description: data.description || mockWorkspaces[0].description,
      updated_at: new Date().toISOString(),
    },
    'workspace update'
  );
};

/**
 * Delete a workspace
 * 
 * @param workspaceId - The UUID of the workspace
 * @returns Promise<boolean> - Returns true if successful
 * 
 * @example
 * const success = await deleteWorkspace('550e8400-e29b-41d4-a716-446655440001');
 * if (success) {
 *   console.log('Workspace deleted');
 * }
 */
export const deleteWorkspace = async (workspaceId: string): Promise<boolean> => {
  return callWithFallback(
    async () => {
      await apiClient.delete(`/api/workspaces/${workspaceId}`);
      return true;
    },
    true,
    'workspace deletion'
  );
};

/**
 * Helper: Generate a slug from a workspace name
 * Converts to lowercase and replaces spaces with hyphens
 * 
 * @param name - Workspace name
 * @returns string - Generated slug
 * 
 * @example
 * const slug = generateSlug('My New Workspace'); // 'my-new-workspace'
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

/**
 * Helper: Validate slug format
 * Slug must be lowercase letters, numbers, and hyphens only
 * 
 * @param slug - Slug to validate
 * @returns boolean
 * 
 * @example
 * validateSlug('my-workspace'); // true
 * validateSlug('My Workspace'); // false
 */
export const validateSlug = (slug: string): boolean => {
  const slugPattern = /^[a-z0-9-]+$/;
  return slugPattern.test(slug);
};

// Export all workspace functions
export default {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  generateSlug,
  validateSlug,
};