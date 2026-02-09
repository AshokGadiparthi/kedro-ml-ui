/**
 * Project Context
 * Manages current project selection and project-specific data
 * Updated: 2026-02-01 - Removed workspace dependency (backend has no workspaces!)
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectService } from '../services';
import { toast } from 'sonner';
import { config } from '../config/environment';
import type { Project as ApiProject, ProjectStats as ApiProjectStats } from '../services/api/types';
// ⚠️ NO MORE useWorkspace - Backend removed workspaces!

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  team: string[];
  status: 'active' | 'archived';
  createdAt: string;
  lastModified: string;
  models: number;
  datasets: number;
  deployments: number;
  icon?: string;
  color?: string;
}

/**
 * Transform backend API Project to frontend Project format
 */
const transformApiProject = (apiProject: ApiProject): Project => {
  // Map backend status (uppercase "ACTIVE") to frontend (lowercase "active")
  const status = apiProject.status?.toLowerCase() === 'active' ? 'active' : 'archived';
  
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: apiProject.description || '',
    owner: apiProject.owner?.email || 'You',
    team: apiProject.teamMembers 
      ? Array.from({ length: apiProject.teamMembers }, (_, i) => `member${i + 1}@example.com`)
      : ['You'],
    status,
    createdAt: apiProject.createdAt || apiProject.updatedAt, // Fallback to updatedAt if createdAt missing
    lastModified: apiProject.updatedAt,
    models: apiProject.modelsCount || 0,
    datasets: apiProject.datasetsCount || 0,
    deployments: 0, // Not provided by backend
    icon: apiProject.iconUrl || '📁', // Use iconUrl from backend or default
    color: apiProject.color || 'blue', // Use color from backend or default
  };
};

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  loading: boolean;
  error: string | null;
  selectProject: (projectId: string) => void;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'lastModified'>) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  retryConnection: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Add display name for better debugging
ProjectContext.displayName = 'ProjectContext';

export function ProjectProvider({ children }: { children: ReactNode}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load projects from backend (with fallback to mock data)
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching projects from backend...');
      console.log('📍 Backend URL:', config.api.baseURL);
      
      const response = await projectService.getProjects();
      
      console.log('✅ Projects loaded from backend:', response);
      console.log('📊 Response type:', Array.isArray(response) ? 'Array' : 'Object');
      
      // Backend returns array directly, not wrapped in {data: [...]}
      // The apiCall function already extracts response.data.data || response.data
      // So 'response' here is either the array or the paginated response
      let projectsData: any[];
      
      if (Array.isArray(response)) {
        // Backend returned array directly: [{...}, {...}]
        console.log('📦 Backend returned direct array');
        projectsData = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Backend returned paginated response: {data: [...], meta: {...}}
        console.log('📦 Backend returned paginated response');
        projectsData = (response as any).data || [];
      } else {
        console.error('❌ Unexpected response format:', response);
        projectsData = [];
      }
      
      console.log(`📈 Found ${projectsData.length} projects:`, projectsData);
      
      if (projectsData.length === 0) {
        console.warn('⚠️ No projects found in backend response');
        setProjects([]);
        setCurrentProject(null);
        setLoading(false);
        return;
      }
      
      // Transform all projects
      const transformedProjects = projectsData.map(transformApiProject);
      console.log('✨ Transformed projects:', transformedProjects);
      
      setProjects(transformedProjects);
      
      // Load last selected project from localStorage
      const savedProjectId = localStorage.getItem('ml_platform_current_project');
      console.log('💾 Saved project ID from localStorage:', savedProjectId);
      
      let selectedProject = null;
      
      if (savedProjectId) {
        // Try to find saved project
        selectedProject = transformedProjects.find(p => p.id === savedProjectId);
        if (selectedProject) {
          console.log('✅ Found saved project:', selectedProject.name);
        } else {
          console.warn('⚠️ Saved project not found, selecting first project');
          selectedProject = transformedProjects[0];
        }
      } else {
        // No saved project, select first
        console.log('📌 No saved project, selecting first project');
        selectedProject = transformedProjects[0];
      }
      
      if (selectedProject) {
        console.log('🎯 Setting current project to:', selectedProject.name, selectedProject.id);
        setCurrentProject(selectedProject);
        localStorage.setItem('ml_platform_current_project', selectedProject.id);
      } else {
        console.error('❌ No project to select!');
        setCurrentProject(null);
      }
    } catch (err: any) {
      console.error('❌ Error loading projects from backend:', err);
      
      // Check if it's a network error
      const isNetworkError = err.code === 'NETWORK_ERROR' || err.status === 0;
      
      if (isNetworkError) {
        console.warn('⚠️ Backend unreachable');
        setError('Backend is unreachable');
        setProjects([]);
        setCurrentProject(null);
        
        // Show a warning toast with retry option
        toast.error('Cannot connect to backend', {
          description: 'Please check if backend is running.',
          action: {
            label: 'Retry',
            onClick: () => loadProjects(),
          },
        });
      } else {
        setError(err.message || 'Failed to load projects');
        toast.error('Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      localStorage.setItem('ml_platform_current_project', projectId);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'lastModified'>) => {
    // NO workspace check needed - backend has no workspaces!
    // Projects are now directly owned by the user

    // Create on backend only - no local fallback
    try {
      console.log('📤 Creating project on backend:', projectData);
      console.log('⚠️ No workspace needed - projects are directly under user');
      
      // Call backend WITHOUT workspace ID (pass empty string for backward compatibility)
      const newApiProject = await projectService.createProject(
        '', // workspaceId ignored by backend
        {
          name: projectData.name,
          description: projectData.description,
          iconUrl: projectData.icon,
          color: projectData.color,
        }
      );
      
      console.log('✅ Project created on backend:', newApiProject);
      
      // Transform the new project
      const newProject = transformApiProject(newApiProject);
      
      // Refresh projects list
      await loadProjects();
      
      // Select the new project
      setCurrentProject(newProject);
      localStorage.setItem('ml_platform_current_project', newProject.id);
      
      toast.success('Project created successfully!');
    } catch (err: any) {
      console.error('❌ Error creating project:', err);
      toast.error(err.message || 'Failed to create project');
      throw err;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    // Update on backend only - no local fallback
    try {
      console.log('📤 Updating project on backend:', projectId, updates);
      
      const updatedApiProject = await projectService.updateProject(projectId, {
        name: updates.name,
        description: updates.description,
        iconUrl: updates.icon,
        color: updates.color,
      });
      
      console.log('✅ Project updated on backend:', updatedApiProject);
      
      // Transform the updated project
      const updatedProject = transformApiProject(updatedApiProject);
      
      // Update local state
      setProjects(projects.map(p => 
        p.id === projectId ? updatedProject : p
      ));
      
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      toast.success('Project updated successfully!');
    } catch (err: any) {
      console.error('❌ Error updating project:', err);
      toast.error(err.message || 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    // Delete on backend only - no local fallback
    try {
      console.log('📤 Deleting project on backend:', projectId);
      
      await projectService.deleteProject(projectId);
      
      console.log('✅ Project deleted from backend');
      
      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));
      
      if (currentProject?.id === projectId) {
        setCurrentProject(projects[0] || null);
      }
      
      toast.success('Project deleted successfully!');
    } catch (err: any) {
      console.error('❌ Error deleting project:', err);
      toast.error(err.message || 'Failed to delete project');
      throw err;
    }
  };

  const retryConnection = async () => {
    toast.info('Retrying connection to backend...');
    await loadProjects();
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        loading,
        error,
        selectProject,
        createProject,
        updateProject,
        deleteProject,
        retryConnection,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}