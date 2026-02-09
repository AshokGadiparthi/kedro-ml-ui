/**
 * Activity Service
 * Handles all activity-related API calls
 */

import apiClient, { apiCall } from '../api/client';

/**
 * Backend Activity Response (snake_case from FastAPI)
 */
interface BackendActivity {
  id: string;
  user_id: string;
  project_id: string;
  action: string; // e.g., "created", "updated", "deleted"
  entity_type: string; // e.g., "project", "dataset", "model", "datasource"
  entity_id: string;
  entity_name?: string;
  metadata?: any;
  created_at: string;
}

/**
 * Frontend Activity (camelCase for UI)
 */
export interface Activity {
  id: string;
  userId: string;
  projectId: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  metadata?: any;
  createdAt: string;
  // Computed fields
  displayText: string; // e.g., "created dataset"
  timeAgo: string; // e.g., "2 hours ago"
}

/**
 * Transform backend activity to frontend format
 */
function transformActivity(backend: BackendActivity): Activity {
  return {
    id: backend.id,
    userId: backend.user_id,
    projectId: backend.project_id,
    action: backend.action,
    entityType: backend.entity_type,
    entityId: backend.entity_id,
    entityName: backend.entity_name,
    metadata: backend.metadata,
    createdAt: backend.created_at,
    displayText: `${backend.action} ${backend.entity_type}${backend.entity_name ? ': ' + backend.entity_name : ''}`,
    timeAgo: formatTimeAgo(backend.created_at),
  };
}

/**
 * Format time ago
 */
function formatTimeAgo(isoString: string): string {
  const now = new Date();
  const created = new Date(isoString);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

/**
 * Get all activities (optionally filtered by project)
 */
export const getActivities = async (projectId?: string): Promise<Activity[]> => {
  const params = projectId ? { project_id: projectId } : {};
  const response = await apiCall(apiClient.get('/api/activities', { params }));
  
  // Transform backend response to frontend format
  if (Array.isArray(response)) {
    return response.map(transformActivity);
  }
  
  return [];
};

/**
 * Get recent activities (limit to N most recent)
 */
export const getRecentActivities = async (projectId?: string, limit: number = 10): Promise<Activity[]> => {
  const activities = await getActivities(projectId);
  
  // Sort by created_at descending and limit
  return activities
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

/**
 * Export all activity service methods
 */
export const activityService = {
  getActivities,
  getRecentActivities,
};

export default activityService;
