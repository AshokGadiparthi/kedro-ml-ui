/**
 * Workspace Context
 * Manages current workspace selection and workspace-specific data
 * Workspaces are containers for projects in the ML platform
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { workspaceService } from '../services';
import { toast } from 'sonner';
import { config } from '../config/environment';
import type { Workspace as ApiWorkspace } from '../services/api/types';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  isUsingMockData: boolean;
  selectWorkspace: (workspaceId: string) => void;
  createWorkspace: (workspace: { name: string; slug: string; description?: string }) => Promise<Workspace>;
  updateWorkspace: (workspaceId: string, updates: { name?: string; description?: string }) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  retryConnection: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Add display name for better debugging
WorkspaceContext.displayName = 'WorkspaceContext';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Load workspaces from backend (with fallback to mock data)
  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching workspaces from backend...');
      console.log('📍 Backend URL:', config.api.baseURL);
      
      const response = await workspaceService.getWorkspaces();
      
      console.log('✅ Workspaces loaded from backend:', response);
      
      if (!Array.isArray(response)) {
        console.error('❌ Unexpected response format (expected array):', response);
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setIsUsingMockData(false);
        setLoading(false);
        return;
      }
      
      console.log(`📈 Found ${response.length} workspaces:`, response);
      
      // If no workspaces, create a default one automatically
      if (response.length === 0) {
        console.log('📝 No workspaces found - creating default workspace...');
        try {
          const defaultWorkspace = await workspaceService.createWorkspace({
            name: 'My Workspace',
            slug: 'my-workspace',
            description: 'Default workspace'
          });
          console.log('✅ Default workspace created:', defaultWorkspace);
          setWorkspaces([defaultWorkspace]);
          setCurrentWorkspace(defaultWorkspace);
          localStorage.setItem('ml_platform_current_workspace', defaultWorkspace.id);
        } catch (err) {
          console.error('❌ Failed to create default workspace:', err);
        }
        setIsUsingMockData(false);
        setLoading(false);
        return;
      }
      
      setWorkspaces(response);
      setIsUsingMockData(false);
      
      // Load last selected workspace from localStorage
      const savedWorkspaceId = localStorage.getItem('ml_platform_current_workspace');
      console.log('💾 Saved workspace ID from localStorage:', savedWorkspaceId);
      
      let selectedWorkspace = null;
      
      if (savedWorkspaceId) {
        // Try to find saved workspace
        selectedWorkspace = response.find(w => w.id === savedWorkspaceId);
        if (selectedWorkspace) {
          console.log('✅ Found saved workspace:', selectedWorkspace.name);
        } else {
          console.warn('⚠️ Saved workspace not found, selecting first workspace');
          selectedWorkspace = response[0];
        }
      } else {
        // No saved workspace, select first
        console.log('📌 No saved workspace, selecting first workspace');
        selectedWorkspace = response[0];
      }
      
      if (selectedWorkspace) {
        console.log('🎯 Setting current workspace to:', selectedWorkspace.name, selectedWorkspace.id);
        setCurrentWorkspace(selectedWorkspace);
        localStorage.setItem('ml_platform_current_workspace', selectedWorkspace.id);
      } else {
        console.error('❌ No workspace to select!');
        setCurrentWorkspace(null);
      }
    } catch (err: any) {
      console.error('❌ Error loading workspaces from backend:', err);
      
      // Check if it's a network error
      const isNetworkError = err.code === 'NETWORK_ERROR' || err.status === 0;
      
      if (isNetworkError) {
        console.warn('⚠️ Backend unreachable - Using mock data as fallback');
        setError('Backend is unreachable. Using demo data.');
        
        // Create mock workspace
        const mockWorkspaces: Workspace[] = [
          {
            id: 'ws-mock-1',
            name: 'Demo Workspace',
            slug: 'demo-workspace',
            description: 'Demo workspace (offline mode)',
            owner_id: 'user-mock-1',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
        
        setWorkspaces(mockWorkspaces);
        setCurrentWorkspace(mockWorkspaces[0]);
        setIsUsingMockData(true);
        
        // Show a warning toast with retry option
        toast.error('Cannot connect to backend', {
          description: 'Using demo data. Check if backend is running.',
          action: {
            label: 'Retry',
            onClick: () => retryConnection(),
          },
        });
      } else {
        setError(err.message || 'Failed to load workspaces');
        toast.error('Failed to load workspaces');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  const selectWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('ml_platform_current_workspace', workspaceId);
      console.log('🎯 Switched to workspace:', workspace.name);
    }
  };

  const createWorkspace = async (data: { name: string; slug: string; description?: string }): Promise<Workspace> => {
    try {
      console.log('📤 Creating workspace on backend:', data);
      
      const newWorkspace = await workspaceService.createWorkspace(data);
      
      console.log('✅ Workspace created on backend:', newWorkspace);
      
      // Refresh workspaces list
      await loadWorkspaces();
      
      // Select the new workspace
      setCurrentWorkspace(newWorkspace);
      localStorage.setItem('ml_platform_current_workspace', newWorkspace.id);
      
      toast.success('Workspace created successfully!');
      
      return newWorkspace;
    } catch (err: any) {
      console.error('❌ Error creating workspace:', err);
      
      // If network error, fallback to local creation
      if (err.code === 'NETWORK_ERROR') {
        const mockWorkspace: Workspace = {
          id: `ws-${Date.now()}`,
          name: data.name,
          slug: data.slug,
          description: data.description,
          owner_id: 'user-mock-1',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setWorkspaces([...workspaces, mockWorkspace]);
        setCurrentWorkspace(mockWorkspace);
        setIsUsingMockData(true);
        toast.warning('Backend unreachable - Workspace created locally only');
        return mockWorkspace;
      } else {
        toast.error(err.message || 'Failed to create workspace');
        throw err;
      }
    }
  };

  const updateWorkspace = async (workspaceId: string, updates: { name?: string; description?: string }) => {
    try {
      console.log('📤 Updating workspace on backend:', workspaceId, updates);
      
      const updatedWorkspace = await workspaceService.updateWorkspace(workspaceId, updates);
      
      console.log('✅ Workspace updated on backend:', updatedWorkspace);
      
      // Update local state
      setWorkspaces(workspaces.map(w => 
        w.id === workspaceId ? updatedWorkspace : w
      ));
      
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(updatedWorkspace);
      }
      
      toast.success('Workspace updated successfully!');
    } catch (err: any) {
      console.error('❌ Error updating workspace:', err);
      toast.error(err.message || 'Failed to update workspace');
      throw err;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      console.log('📤 Deleting workspace on backend:', workspaceId);
      
      await workspaceService.deleteWorkspace(workspaceId);
      
      console.log('✅ Workspace deleted from backend');
      
      // Update local state
      setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
      
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(workspaces[0] || null);
      }
      
      toast.success('Workspace deleted successfully!');
    } catch (err: any) {
      console.error('❌ Error deleting workspace:', err);
      toast.error(err.message || 'Failed to delete workspace');
      throw err;
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  const retryConnection = async () => {
    toast.info('Retrying connection to backend...');
    await loadWorkspaces();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        loading,
        error,
        isUsingMockData,
        selectWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        refreshWorkspaces,
        retryConnection,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
