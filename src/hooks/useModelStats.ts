/**
 * Model Stats Hook - Fetch model statistics for predictions
 */

import { useState, useEffect } from 'react';
import { predictionService, type ModelStatsResponse } from '../services/predictionService';

export function useModelStats(modelId: string | null) {
  const [stats, setStats] = useState<ModelStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await predictionService.getModelStats(modelId);
        setStats(result);
      } catch (err: any) {
        console.error('Failed to fetch model stats:', err);
        setError(err.message || 'Failed to load model statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [modelId]);

  return { stats, isLoading, error };
}
