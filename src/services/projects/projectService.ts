/**
 * Project Service
 * API calls for project management (Phase 1)
 */

import apiClient, { apiCall } from '../api/client';
import { useMockData } from '../../config/environment';
import {
  Project,
  ProjectStats,
  RecentModel,
  RecentActivity,
  ActivityStats,
  PaginatedActivities,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginatedResponse,
  PaginationParams,
} from '../api/types';
import { mockProjects, mockProjectStats } from '../api/mockData';

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
 * Get all projects (directly under user - NO workspace)
 * NO MOCK FALLBACK - Backend only
 */
export const getProjects = async (): Promise<Project[]> => {
  return apiCall(apiClient.get('/api/projects'));
};

/**
 * Get projects for a specific workspace
 * NOTE: DEPRECATED - Backend no longer has workspaces
 * This now just calls getProjects() for backward compatibility
 */
export const getWorkspaceProjects = async (workspaceId: string): Promise<Project[]> => {
  console.warn('⚠️ getWorkspaceProjects is deprecated - backend has no workspaces. Using getProjects() instead.');
  return getProjects();
};

/**
 * Get project by ID
 */
export const getProjectById = async (id: string): Promise<Project> => {
  if (useMockData()) {
    const project = mockProjects.find((p) => p.id === id);
    if (!project) {
      throw {
        status: 404,
        message: 'Project not found',
        code: 'PROJECT_NOT_FOUND',
      };
    }
    return project;
  }

  return callWithFallback(
    () => apiCall(apiClient.get(`/api/projects/${id}`)),
    mockProjects.find((p) => p.id === id) || {
      id: 'proj_000',
      name: 'Mock Project',
      description: 'This is a mock project for testing purposes.',
      status: 'active',
      teamMembers: 1,
      modelsCount: 0,
      datasetsCount: 0,
      predictionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'getProjectById'
  );
};

/**
 * Get project statistics
 */
export const getProjectStats = async (id: string): Promise<ProjectStats> => {
  // Phase 3 endpoint - no fallback to mock data
  return apiCall(apiClient.get(`/api/projects/stats/${id}`));
};

/**
 * Get recent models for a project
 */
export const getRecentModels = async (
  projectId: string,
  limit: number = 5
): Promise<RecentModel[]> => {
  // Phase 3 endpoint - no fallback to mock data
  return apiCall(apiClient.get(`/api/models/${projectId}`));
};

/**
 * Get recent activities for a project
 */
export const getRecentActivities = async (
  projectId: string,
  limit: number = 10
): Promise<RecentActivity[]> => {
  // Phase 3 endpoint - no fallback to mock data
  return apiCall(apiClient.get(`/api/activities/recent/${projectId}`));
};

/**
 * Create new project (directly under user - NO workspace required)
 * NOTE: Backend NO LONGER has workspaces - projects are owned by user directly
 */
export const createProject = async (
  workspaceId: string, // Keep parameter for backward compatibility but ignore it
  data: CreateProjectRequest
): Promise<Project> => {
  console.log('⚠️ workspaceId parameter ignored - backend has no workspaces');
  return callWithFallback(
    async () => {
      const response = await apiClient.post<Project>(`/api/projects`, data);
      return response.data;
    },
    {
      id: `proj_${Date.now()}`,
      name: data.name,
      description: data.description,
      status: 'active',
      teamMembers: 1,
      modelsCount: 0,
      datasetsCount: 0,
      predictionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'createProject'
  );
};

/**
 * Update project
 */
export const updateProject = async (
  id: string,
  data: UpdateProjectRequest
): Promise<Project> => {
  return callWithFallback(
    async () => {
      const response = await apiClient.put<Project>(`/api/projects/${id}`, data);
      return response.data;
    },
    {
      ...(mockProjects.find((p) => p.id === id) || mockProjects[0]),
      ...data,
      updatedAt: new Date().toISOString(),
    },
    'updateProject'
  );
};

/**
 * Delete project
 */
export const deleteProject = async (id: string): Promise<void> => {
  return callWithFallback(
    async () => {
      await apiClient.delete(`/api/projects/${id}`);
    },
    undefined,
    'deleteProject'
  );
};

/**
 * Export all project service methods
 */
export const projectService = {
  getProjects,
  getWorkspaceProjects,
  getProjectById,
  getProjectStats,
  getRecentModels,
  getRecentActivities,
  createProject,
  updateProject,
  deleteProject,
};

export default projectService;