/**
 * useProjectStats Hook - REAL DATA INTEGRATION
 * Fetches statistics from existing APIs (Model Registry, Predictions, Data Management)
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import * as modelRegistryService from '../services/registry/modelRegistryService';

const API_BASE = 'http://192.168.1.147:8000/api/v1';

interface ProjectStats {
  modelsCount: number;
  deployedModelsCount: number;
  avgAccuracy: number;
  accuracyTrend: number;
  accuracyTrendLabel: string;
  predictionsLabel: string;
  predictionsThisMonth: number;
  totalDataSize: string;
}

interface UseProjectStatsReturn {
  stats: ProjectStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProjectStats(projectId?: string | null): UseProjectStatsReturn {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!projectId) {
      console.log('ℹ️ [useProjectStats] No projectId, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 [useProjectStats] Fetching project stats from real APIs...');

      // Fetch data from multiple endpoints
      const [modelsRes, deploymentsRes, predictionsRes] = await Promise.all([
        modelRegistryService.listModels({ project_id: projectId }).catch((e) => {
          console.error('❌ [useProjectStats] Failed to fetch models from registry:', e.message);
          return { models: [], total: 0, limit: 0, offset: 0 };
        }),
        axios.get(`${API_BASE}/predictions/deployed-models`).catch((e) => {
          console.error('❌ [useProjectStats] Failed to fetch deployed models:', e.message);
          return { data: { models: [] } };
        }),
        axios.get(`${API_BASE}/predictions/monitoring/stats`).catch((e) => {
          console.error('❌ [useProjectStats] Failed to fetch monitoring stats:', e.message);
          return { data: { stats: { totalPredictions: 0 } } };
        }),
      ]);

      const registeredModels = modelsRes.models || [];
      const deployedModels = deploymentsRes.data.models || [];
      const predictionStats = predictionsRes.data.stats || { totalPredictions: 0 };

      console.log('✅ [useProjectStats] Fetched:', {
        registeredModels: registeredModels.length,
        deployedModels: deployedModels.length,
        predictions: predictionStats.totalPredictions,
      });

      // Calculate average accuracy from registered models' latest versions
      const modelsWithAccuracy = registeredModels
        .map((model: any) => {
          const latestVersion = model.versions?.[0];
          return latestVersion?.accuracy || latestVersion?.test_score || 0;
        })
        .filter((accuracy: number) => accuracy > 0);

      const avgAccuracy = modelsWithAccuracy.length > 0
        ? modelsWithAccuracy.reduce((sum: number, acc: number) => sum + acc, 0) / modelsWithAccuracy.length
        : 0;

      // Count production models as deployed
      const productionModels = registeredModels.filter((model: any) => {
        const latestVersion = model.versions?.[0];
        return latestVersion?.status === 'production';
      });

      // Get prediction count
      const totalPredictions = predictionStats.totalPredictions || 0;

      const statsData: ProjectStats = {
        modelsCount: registeredModels.length,
        deployedModelsCount: productionModels.length,
        avgAccuracy: avgAccuracy,
        accuracyTrend: 0,
        accuracyTrendLabel: 'N/A',
        predictionsLabel: totalPredictions.toLocaleString(),
        predictionsThisMonth: totalPredictions,
        totalDataSize: '0 GB', // Will be updated when data management API is integrated
      };

      console.log('✅ [useProjectStats] Project stats calculated:', statsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('❌ [useProjectStats] Failed to fetch project stats:', err);
      setError('Failed to load statistics');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [projectId]); // Refetch when projectId changes

  const refetch = async () => {
    await fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refetch,
  };
}