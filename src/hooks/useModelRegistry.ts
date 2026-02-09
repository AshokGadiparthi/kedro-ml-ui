/**
 * useModelRegistry Hook
 * React hook for Model Registry operations
 */

import { useState, useEffect, useCallback } from 'react';
import * as modelRegistryService from '../services/registry/modelRegistryService';
import type {
  RegisteredModel,
  ModelRegistryStats,
  ListModelsParams,
} from '../services/registry/modelRegistryService';

export function useModelRegistry(projectId?: string) {
  const [models, setModels] = useState<RegisteredModel[]>([]);
  const [stats, setStats] = useState<ModelRegistryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch models
  const fetchModels = useCallback(
    async (params?: Omit<ListModelsParams, 'project_id'>) => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await modelRegistryService.listModels({
          project_id: projectId,
          ...params,
        });
        console.log('📦 Models API response:', response);
        console.log('📋 Models array:', response.models);
        console.log('📊 Total models found:', response.models?.length || 0);
        setModels(response.models);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch models');
        console.error('Failed to fetch models:', err);
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!projectId) return;

    try {
      const statsData = await modelRegistryService.getRegistryStats(projectId);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, [projectId]);

  // Initial fetch
  useEffect(() => {
    if (projectId) {
      fetchModels();
      fetchStats();
    }
  }, [projectId, fetchModels, fetchStats]);

  // Refresh both models and stats
  const refresh = useCallback(() => {
    fetchModels();
    fetchStats();
  }, [fetchModels, fetchStats]);

  return {
    models,
    stats,
    loading,
    error,
    fetchModels,
    fetchStats,
    refresh,
  };
}

/**
 * Hook for a single model
 */
export function useModel(modelId?: string) {
  const [model, setModel] = useState<RegisteredModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModel = useCallback(async () => {
    if (!modelId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await modelRegistryService.getModelById(modelId);
      setModel(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch model');
      console.error('Failed to fetch model:', err);
    } finally {
      setLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  return {
    model,
    loading,
    error,
    refresh: fetchModel,
  };
}