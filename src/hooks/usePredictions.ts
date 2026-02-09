/**
 * Predictions Hook - State management for predictions
 */

import { useState, useCallback } from 'react';
import { predictionService, type PredictionInput, type SinglePredictionResponse } from '../services/predictionService';
import { toast } from 'sonner';

export function usePredictions(modelId: string | null, projectId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<SinglePredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const makePrediction = useCallback(async (features: PredictionInput) => {
    if (!modelId) {
      toast.error('Please select a model first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await predictionService.makePrediction(modelId, features, projectId);
      setPredictionResult(result);
      toast.success('Prediction completed successfully!');
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to make prediction';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [modelId, projectId]);

  const resetPrediction = useCallback(() => {
    setPredictionResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    predictionResult,
    error,
    makePrediction,
    resetPrediction,
  };
}
