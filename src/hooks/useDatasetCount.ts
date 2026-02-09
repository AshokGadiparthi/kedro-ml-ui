/**
 * useDatasetCount Hook
 * Fetches dataset count for a project
 */

import { useState, useEffect } from 'react';
import { datasetService } from '../services';

export function useDatasetCount(projectId: string | null | undefined) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setCount(0);
      setLoading(false);
      return;
    }

    const fetchDatasetCount = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching datasets for project:', projectId);
        
        const datasets = await datasetService.getDatasets(projectId);
        
        console.log('✅ Datasets loaded, count:', datasets.length);
        setCount(datasets.length);
      } catch (err: any) {
        console.error('❌ Error loading dataset count:', err);
        setError(err.message || 'Failed to load dataset count');
        setCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDatasetCount();
  }, [projectId]);

  return {
    count,
    loading,
    error,
  };
}
