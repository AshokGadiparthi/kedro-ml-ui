/**
 * useRecentActivities Hook
 * Fetches and manages recent activities from the backend
 */

import { useState, useEffect } from 'react';
import { activityService } from '../services';
import type { Activity } from '../services/activities/activityService';

export function useRecentActivities(projectId: string | null | undefined, limit: number = 10) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching recent activities', projectId ? `for project: ${projectId}` : '(all)');
        
        const response = await activityService.getRecentActivities(projectId || undefined, limit);
        
        console.log('✅ Recent activities loaded:', response);
        setActivities(response);
      } catch (err: any) {
        console.error('❌ Error loading recent activities:', err);
        setError(err.message || 'Failed to load recent activities');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [projectId, limit]);

  return {
    activities,
    loading,
    error,
  };
}