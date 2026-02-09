/**
 * useRecentModels Hook - REAL DATA INTEGRATION
 * Fetches recent trained models from Model Registry API
 */

import { useState, useEffect } from 'react';
import * as modelRegistryService from '../services/registry/modelRegistryService';

interface RecentModel {
  id: string;
  name: string;
  algorithmDisplayName: string;
  accuracyLabel: string;
  createdAtLabel: string;
  statusLabel: string;
  status: string;
}

export function useRecentModels(projectId: string | null | undefined, limit: number = 5) {
  const [models, setModels] = useState<RecentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      if (!projectId) {
        console.log('ℹ️ [useRecentModels] No projectId, skipping fetch');
        setModels([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🤖 [useRecentModels] Fetching recent models from Model Registry...');

        const response = await modelRegistryService.listModels({
          project_id: projectId,
          limit: limit,
        });

        const registeredModels = response.models || [];
        console.log('✅ [useRecentModels] Fetched models:', registeredModels.length);

        // Transform to match expected format
        const recentModels: RecentModel[] = registeredModels.map((model: any) => {
          // Get the latest version for accuracy
          const latestVersion = model.versions?.[0];
          const accuracy = latestVersion?.accuracy || latestVersion?.test_score || 0;

          return {
            id: model.id,
            name: model.name,
            algorithmDisplayName: latestVersion?.algorithm || 'Unknown',
            accuracyLabel: `${(accuracy * 100).toFixed(1)}% accuracy`,
            createdAtLabel: formatRelativeTime(model.created_at),
            statusLabel: latestVersion?.status === 'production' ? 'Production' : latestVersion?.status === 'staging' ? 'Staging' : 'Draft',
            status: latestVersion?.status || 'draft',
          };
        });

        console.log('✅ [useRecentModels] Recent models:', recentModels);
        setModels(recentModels);
      } catch (err: any) {
        console.error('❌ [useRecentModels] Failed to fetch recent models:', err);
        setError('Failed to load models');
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [projectId, limit]);

  return {
    models,
    loading,
    error,
    isUsingMockData: false,
  };
}

// Helper function to format relative time
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}