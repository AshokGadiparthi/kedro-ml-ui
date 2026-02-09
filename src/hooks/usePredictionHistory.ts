/**
 * Prediction History Hook - State management for prediction history
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { predictionService, type PredictionHistoryFilter, type PredictionHistoryResponse, type PredictionDetailResponse } from '../services/predictionService';
import { toast } from 'sonner';

export function usePredictionHistory(projectId?: string) {
  const [history, setHistory] = useState<PredictionHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<PredictionHistoryFilter>({
    projectId,
    page: 0,
    pageSize: 20,
  });
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionDetailResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const hasInitialFetch = useRef(false);

  // Fetch history
  const fetchHistory = useCallback(async (newFilters?: Partial<PredictionHistoryFilter>) => {
    // Don't fetch if no project ID
    if (!projectId && !newFilters?.projectId) {
      console.warn('Skipping history fetch: no project ID');
      return;
    }

    const mergedFilters = { ...filters, ...newFilters };
    setFilters(mergedFilters);
    setIsLoading(true);

    try {
      const result = await predictionService.getHistory(mergedFilters);
      setHistory(result);
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      // Don't show error toast if it's a 404 or initial load
      if (!err.message?.includes('404') && hasInitialFetch.current) {
        toast.error('Failed to load prediction history');
      }
      // Set empty state on error
      setHistory({
        predictions: [],
        total: 0,
        page: 0,
        pageSize: 20,
        totalPages: 0,
        stats: {
          totalPredictions: 0,
          totalLabel: '0',
          resultCounts: {},
          resultPercentages: {},
          singleCount: 0,
          batchCount: 0,
          apiCount: 0,
          todayCount: 0,
          thisWeekCount: 0,
          avgConfidence: 0,
          avgConfidenceLabel: '0%',
        },
      });
    } finally {
      setIsLoading(false);
      hasInitialFetch.current = true;
    }
  }, [projectId]);

  // Fetch prediction detail
  const fetchPredictionDetail = useCallback(async (predictionId: string) => {
    setIsLoadingDetail(true);
    setSelectedPrediction(null);

    try {
      const detail = await predictionService.getPredictionDetail(predictionId);
      setSelectedPrediction(detail);
    } catch (err: any) {
      console.error('Failed to fetch prediction detail:', err);
      toast.error(err.message || 'Failed to load prediction details');
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // Export history
  const exportHistory = useCallback(async () => {
    try {
      await predictionService.exportHistory(filters);
      toast.success('History exported successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to export history');
    }
  }, [filters]);

  // Update filters - just update the filters, don't auto-fetch
  const updateFilters = useCallback((newFilters: Partial<PredictionHistoryFilter>) => {
    const mergedFilters = { ...filters, ...newFilters };
    setFilters(mergedFilters);
    
    // Only fetch if we have a project ID
    if (mergedFilters.projectId) {
      fetchHistory(newFilters);
    }
  }, [filters, fetchHistory]);

  // Initial fetch only when project ID is available
  useEffect(() => {
    if (projectId && !hasInitialFetch.current) {
      fetchHistory({ projectId });
    }
  }, [projectId]); // Don't include fetchHistory in deps

  return {
    history,
    isLoading,
    filters,
    selectedPrediction,
    isLoadingDetail,
    fetchHistory,
    fetchPredictionDetail,
    exportHistory,
    updateFilters,
    setSelectedPrediction,
  };
}
