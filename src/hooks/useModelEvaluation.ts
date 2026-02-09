/**
 * useModelEvaluation Hook
 * React hook for model evaluation with loading states and error handling
 */

import { useState, useCallback } from 'react';
import { evaluationApi } from '@/services/evaluation';
import type {
  ThresholdEvaluationRequest,
  ThresholdEvaluationResponse,
  BusinessImpactRequest,
  BusinessImpactResponse,
  OptimalThresholdRequest,
  OptimalThresholdResponse,
  CompleteEvaluationRequest,
  CompleteEvaluationResponse,
} from '@/services/evaluation/types';

interface UseModelEvaluationState {
  loading: boolean;
  error: string | null;
  data: CompleteEvaluationResponse | null;
}

export const useModelEvaluation = () => {
  const [state, setState] = useState<UseModelEvaluationState>({
    loading: false,
    error: null,
    data: null,
  });

  /**
   * Complete Evaluation (Recommended)
   */
  const evaluateComplete = useCallback(
    async (modelId: string, request: CompleteEvaluationRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await evaluationApi.completeEvaluation(modelId, request);
        setState({ loading: false, error: null, data });
        return data;
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to evaluate model';
        setState({ loading: false, error: errorMessage, data: null });
        throw err;
      }
    },
    []
  );

  /**
   * Threshold Evaluation Only
   */
  const evaluateThreshold = useCallback(
    async (modelId: string, request: ThresholdEvaluationRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await evaluationApi.evaluateThreshold(modelId, request);
        setState((prev) => ({ ...prev, loading: false }));
        return data;
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to evaluate threshold';
        setState({ loading: false, error: errorMessage, data: null });
        throw err;
      }
    },
    []
  );

  /**
   * Business Impact Only
   */
  const calculateBusinessImpact = useCallback(
    async (modelId: string, request: BusinessImpactRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await evaluationApi.calculateBusinessImpact(modelId, request);
        setState((prev) => ({ ...prev, loading: false }));
        return data;
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to calculate business impact';
        setState({ loading: false, error: errorMessage, data: null });
        throw err;
      }
    },
    []
  );

  /**
   * Find Optimal Threshold
   */
  const findOptimalThreshold = useCallback(
    async (modelId: string, request: OptimalThresholdRequest) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await evaluationApi.findOptimalThreshold(modelId, request);
        setState((prev) => ({ ...prev, loading: false }));
        return data;
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to find optimal threshold';
        setState({ loading: false, error: errorMessage, data: null });
        throw err;
      }
    },
    []
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    evaluateComplete,
    evaluateThreshold,
    calculateBusinessImpact,
    findOptimalThreshold,
    reset,
  };
};

export default useModelEvaluation;
