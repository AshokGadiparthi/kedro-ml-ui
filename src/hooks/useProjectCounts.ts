/**
 * Hook to fetch and update project counts
 */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { datasetService } from '../services';
import * as modelRegistryService from '../services/registry/modelRegistryService';

const API_BASE = 'http://192.168.1.147:8000/api/v1';

interface ProjectCounts {
  models: number;
  datasets: number;
  predictions: number;
}

export function useProjectCounts(projectId: string | null | undefined) {
  const [counts, setCounts] = useState<ProjectCounts>({ models: 0, datasets: 0, predictions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        console.log('📊 [useProjectCounts] Fetching counts for project:', projectId);

        // Fetch counts from multiple endpoints
        const [modelsRes, datasets, predictionsRes] = await Promise.all([
          modelRegistryService.listModels({ project_id: projectId }).catch(() => ({ models: [], total: 0, limit: 0, offset: 0 })),
          datasetService.getDatasets(projectId).catch(() => []),
          axios.get(`${API_BASE}/predictions/monitoring/stats`).catch(() => ({ data: { stats: { totalPredictions: 0 } } })),
        ]);

        const registeredModels = modelsRes.models || [];

        const newCounts = {
          models: registeredModels.length,
          datasets: Array.isArray(datasets) ? datasets.length : 0,
          predictions: predictionsRes.data.stats?.totalPredictions || 0,
        };

        console.log('📊 [useProjectCounts] Updated counts:', newCounts);
        setCounts(newCounts);
      } catch (err) {
        console.error('❌ [useProjectCounts] Failed to fetch counts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [projectId]);

  return { counts, loading };
}