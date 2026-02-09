/**
 * useWorkspaces Hook
 * React hook for workspace operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getWorkspaces as getWorkspacesService,
  getWorkspace as getWorkspaceService,
  createWorkspace as createWorkspaceService,
  updateWorkspace as updateWorkspaceService,
  deleteWorkspace as deleteWorkspaceService,
  generateSlug as generateSlugService,
  validateSlug as validateSlugService,
} from '@/services/workspaces/workspaceService';
import {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from '@/services/api/types';

export interface WorkspacesState {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
}

export const useWorkspaces = (autoLoad: boolean = true) => {
  const [state, setState] = useState<WorkspacesState>({
    workspaces: [],
    selectedWorkspace: null,
    isLoading: false,
    error: null,
  });

  /**
   * Load all workspaces
   */
  const loadWorkspaces = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const workspaces = await getWorkspacesService();
      setState(prev => ({
        ...prev,
        workspaces,
        isLoading: false,
        error: null,
      }));
      return workspaces;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load workspaces',
      }));
      throw error;
    }
  }, []);

  /**
   * Load a specific workspace
   */
  const loadWorkspace = useCallback(async (workspaceId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const workspace = await getWorkspaceService(workspaceId);
      setState(prev => ({
        ...prev,
        selectedWorkspace: workspace,
        isLoading: false,
        error: null,
      }));
      return workspace;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load workspace',
      }));
      throw error;
    }
  }, []);

  /**
   * Create a new workspace
   */
  const createWorkspace = useCallback(async (data: CreateWorkspaceRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newWorkspace = await createWorkspaceService(data);
      setState(prev => ({
        ...prev,
        workspaces: [...prev.workspaces, newWorkspace],
        isLoading: false,
        error: null,
      }));
      return newWorkspace;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create workspace',
      }));
      throw error;
    }
  }, []);

  /**
   * Update a workspace
   */
  const updateWorkspace = useCallback(async (
    workspaceId: string,
    data: UpdateWorkspaceRequest
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedWorkspace = await updateWorkspaceService(workspaceId, data);
      setState(prev => ({
        ...prev,
        workspaces: prev.workspaces.map(ws =>
          ws.id === workspaceId ? updatedWorkspace : ws
        ),
        selectedWorkspace: prev.selectedWorkspace?.id === workspaceId
          ? updatedWorkspace
          : prev.selectedWorkspace,
        isLoading: false,
        error: null,
      }));
      return updatedWorkspace;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to update workspace',
      }));
      throw error;
    }
  }, []);

  /**
   * Delete a workspace
   */
  const deleteWorkspace = useCallback(async (workspaceId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const success = await deleteWorkspaceService(workspaceId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          workspaces: prev.workspaces.filter(ws => ws.id !== workspaceId),
          selectedWorkspace: prev.selectedWorkspace?.id === workspaceId
            ? null
            : prev.selectedWorkspace,
          isLoading: false,
          error: null,
        }));
      }
      
      return success;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to delete workspace',
      }));
      throw error;
    }
  }, []);

  /**
   * Select a workspace
   */
  const selectWorkspace = useCallback((workspace: Workspace | null) => {
    setState(prev => ({
      ...prev,
      selectedWorkspace: workspace,
    }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Helper: Generate slug from name
   */
  const generateSlug = useCallback((name: string): string => {
    return generateSlugService(name);
  }, []);

  /**
   * Helper: Validate slug format
   */
  const validateSlug = useCallback((slug: string): boolean => {
    return validateSlugService(slug);
  }, []);

  // Auto-load workspaces on mount
  useEffect(() => {
    if (autoLoad) {
      loadWorkspaces();
    }
  }, [autoLoad, loadWorkspaces]);

  return {
    // State
    workspaces: state.workspaces,
    selectedWorkspace: state.selectedWorkspace,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    loadWorkspaces,
    loadWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    selectWorkspace,
    clearError,
    
    // Helpers
    generateSlug,
    validateSlug,
  };
};

export default useWorkspaces;
