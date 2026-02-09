/**
 * useProjects Hook
 * React hook for project management
 */

import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services';
import type {
  Project,
  ProjectStats,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginationParams,
} from '../services/api/types';
import type { ApiError } from '../services/api/client';

export interface UseProjectsResult {
  // State
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectStats | null;
  loading: boolean;
  error: ApiError | null;
  
  // Actions
  fetchProjects: (params?: PaginationParams) => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  fetchProjectStats: (id: string) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Fetch all projects
   */
  const fetchProjects = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await projectService.getProjects(params);
      setProjects(response.data);
    } catch (err: any) {
      // Only log non-network errors
      if (err.code !== 'NETWORK_ERROR') {
        setError(err as ApiError);
        console.error('Error loading projects from backend:', err);
      }
      // Network errors are handled silently by fallback system
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch project by ID
   */
  const fetchProjectById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const project = await projectService.getProjectById(id);
      setCurrentProject(project);
    } catch (err) {
      setError(err as ApiError);
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch project statistics
   */
  const fetchProjectStats = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await projectService.getProjectStats(id);
      setProjectStats(stats);
    } catch (err) {
      setError(err as ApiError);
      console.error('Failed to fetch project stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new project
   */
  const createProject = useCallback(async (data: CreateProjectRequest): Promise<Project> => {
    setLoading(true);
    setError(null);
    
    try {
      const newProject = await projectService.createProject(data);
      
      // Add to list
      setProjects((prev) => [newProject, ...prev]);
      
      return newProject;
    } catch (err) {
      setError(err as ApiError);
      console.error('Failed to create project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update project
   */
  const updateProject = useCallback(async (
    id: string,
    data: UpdateProjectRequest
  ): Promise<Project> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await projectService.updateProject(id, data);
      
      // Update in list
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
      
      // Update current project if it's the same
      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }
      
      return updatedProject;
    } catch (err) {
      setError(err as ApiError);
      console.error('Failed to update project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  /**
   * Delete project
   */
  const deleteProject = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await projectService.deleteProject(id);
      
      // Remove from list
      setProjects((prev) => prev.filter((p) => p.id !== id));
      
      // Clear current project if it's the same
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (err) {
      setError(err as ApiError);
      console.error('Failed to delete project:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    projects,
    currentProject,
    projectStats,
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    fetchProjectStats,
    createProject,
    updateProject,
    deleteProject,
    clearError,
  };
};

export default useProjects;