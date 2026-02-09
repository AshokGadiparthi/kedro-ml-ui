/**
 * API Integration Hook - Manage API keys and integration info
 */

import { useState, useEffect, useCallback } from 'react';
import { predictionService, type APIIntegrationResponse, type PredictionInput } from '../services/predictionService';
import { toast } from 'sonner';

export function useAPIIntegration(modelId: string | null, projectId?: string) {
  const [apiInfo, setApiInfo] = useState<APIIntegrationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Fetch API integration info
  useEffect(() => {
    if (!modelId) {
      setApiInfo(null);
      return;
    }

    const fetchApiInfo = async () => {
      setIsLoading(true);

      try {
        const result = await predictionService.getApiIntegrationInfo(modelId, projectId);
        setApiInfo(result);
      } catch (err: any) {
        console.error('Failed to fetch API integration info:', err);
        toast.error(err.message || 'Failed to load API integration information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiInfo();
  }, [modelId, projectId]);

  // Regenerate API key
  const regenerateApiKey = useCallback(async () => {
    if (!apiInfo?.apiKeyId) {
      toast.error('No API key to regenerate');
      return;
    }

    setIsRegenerating(true);

    try {
      const newKey = await predictionService.regenerateApiKey(apiInfo.apiKeyId);
      
      // Update API info with new key prefix
      setApiInfo(prev => prev ? {
        ...prev,
        apiKeyPrefix: newKey.keyPrefix,
        apiKeyCreatedAt: newKey.createdAt,
      } : null);

      toast.success('API key regenerated successfully');
      
      // Show the full key once
      toast.info(`New API Key: ${newKey.keyFull}`, {
        duration: 10000,
        description: 'Save this key now - you won\'t be able to see it again!',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to regenerate API key');
    } finally {
      setIsRegenerating(false);
    }
  }, [apiInfo]);

  // Test API
  const testApi = useCallback(async (features: PredictionInput) => {
    if (!modelId || !apiInfo) {
      toast.error('API information not available');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // For testing, we'll use a mock API key or the prefix
      // In production, user would need to provide their actual key
      const mockApiKey = `${apiInfo.apiKeyPrefix}test_key`;
      const result = await predictionService.testPredictionApi(modelId, features, mockApiKey);
      setTestResult(result);
      toast.success('API test successful!');
    } catch (err: any) {
      toast.error(err.message || 'API test failed');
      setTestResult({ error: err.message });
    } finally {
      setIsTesting(false);
    }
  }, [modelId, apiInfo]);

  return {
    apiInfo,
    isLoading,
    isRegenerating,
    isTesting,
    testResult,
    regenerateApiKey,
    testApi,
  };
}
