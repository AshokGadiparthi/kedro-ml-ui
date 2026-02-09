/**
 * useDataSources Hook
 * Fetches and manages data sources from the backend
 */

import { useState, useEffect, useCallback } from 'react';
import { datasourceService } from '../services';
import type { DataSource } from '../services/api/types';

export function useDataSources(projectId: string | null | undefined) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchDataSources = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching data sources for project:', projectId);

        const response = await datasourceService.getDataSources(projectId || undefined);

        console.log('✅ Data sources loaded:', response);

        setDataSources(response);
        setIsUsingMockData(false);
      } catch (err: any) {
        // Check if it's a Phase 3 404 (expected) or other error
        const isPhase3NotImplemented = err.status === 404;
        const isNetworkError = err.code === 'NETWORK_ERROR' || err.status === 0;

        if (isPhase3NotImplemented) {
          // Phase 3 endpoint not yet implemented - return empty
          console.log('ℹ️ Data sources endpoint (Phase 3) not yet available');
          setDataSources([]);
        } else if (isNetworkError) {
          console.warn('⚠️ Backend unreachable');
          setError('Backend is unreachable');
          setDataSources([]);
        } else {
          console.error('❌ Error loading data sources:', err);
          setError(err.message || 'Failed to load data sources');
          setDataSources([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDataSources();
  }, [projectId, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    dataSources,
    loading,
    error,
    isUsingMockData,
    refetch,
  };
}