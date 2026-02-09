/**
 * PREDICTIONS CONTAINER - 100% REAL API INTEGRATION
 * NO MOCK DATA - All data fetched from FastAPI backend
 */

import { useState, useEffect } from 'react';
import { PredictionsDashboard } from './PredictionsDashboard';
import { Loader2, AlertCircle, WifiOff } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { predictionService, DeployedModel } from '@/services/predictionService';
import { toast } from 'sonner';

export function PredictionsContainer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployedModels, setDeployedModels] = useState<DeployedModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  /**
   * Load deployed models on mount
   */
  useEffect(() => {
    loadDeployedModels();
  }, []);

  const loadDeployedModels = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await predictionService.getDeployedModels();

      if (!data.models || data.models.length === 0) {
        setError('No deployed models available. Please deploy a model first.');
        setLoading(false);
        return;
      }

      setDeployedModels(data.models);

      // Select active model or first model
      const defaultModel = data.activeModel || data.models[0];
      setSelectedModelId(defaultModel.id);

      setLoading(false);

      toast.success(`Loaded ${data.models.length} deployed models`);
    } catch (err: any) {
      console.error('Failed to load deployed models:', err);
      setError(err.message || 'Failed to connect to prediction service');
      setLoading(false);
      toast.error('Failed to load deployed models');
    }
  };

  /**
   * Handle model change
   */
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    const model = deployedModels.find(m => m.id === modelId);
    if (model) {
      toast.info(`Switched to ${model.name}`);
    }
  };

  /**
   * Loading State
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Predictions</h3>
          <p className="text-sm text-muted-foreground">
            Fetching deployed models from backend...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-md border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Connection Error</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Backend URL: http://192.168.1.147:8000
                </p>
              </div>
              <Button onClick={loadDeployedModels} className="gap-2">
                <Loader2 className="h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * No Models State
   */
  if (deployedModels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-muted p-3">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">No Models Deployed</h3>
                <p className="text-sm text-muted-foreground">
                  Deploy a model from Model Registry to start making predictions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentModel = deployedModels.find(m => m.id === selectedModelId);

  if (!currentModel) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Model not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <PredictionsDashboard
        deployedModels={deployedModels}
        selectedModelId={selectedModelId}
        onModelChange={handleModelChange}
      />
    </div>
  );
}

export default PredictionsContainer;
