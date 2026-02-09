/**
 * useDatasets Hook
 * Fetches and manages datasets from the backend
 */

import { useState, useEffect, useCallback } from 'react';
import { datasetService } from '../services';
import type { Dataset } from '../services/api/types';

export function useDatasets(projectId: string | null | undefined) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching datasets for project:', projectId);

        const response = await datasetService.getDatasets(projectId || undefined);

        console.log('✅ Datasets loaded:', response);

        setDatasets(response);
        setIsUsingMockData(false);
      } catch (err: any) {
        // Check if it's a Phase 3 404 (expected) or other error
        const isPhase3NotImplemented = err.status === 404;
        const isNetworkError = err.code === 'NETWORK_ERROR' || err.status === 0;

        if (isPhase3NotImplemented) {
          // Phase 3 endpoint not yet implemented - return empty
          console.log('ℹ️ Datasets endpoint (Phase 3) not yet available');
          setDatasets([]);
        } else if (isNetworkError) {
          console.warn('⚠️ Backend unreachable');
          setError('Backend is unreachable');
          setDatasets([]);
        } else {
          console.error('❌ Error loading datasets:', err);
          setError(err.message || 'Failed to load datasets');
          setDatasets([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [projectId, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    datasets,
    loading,
    error,
    isUsingMockData,
    refetch,
  };
}