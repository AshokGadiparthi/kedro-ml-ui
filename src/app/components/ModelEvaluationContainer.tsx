/**
 * Model Evaluation Container
 * Real-time API integration wrapper for Model Evaluation Dashboard
 * Connects to FastAPI backend @ http://192.168.1.147:8000/api/v1/evaluation
 */

import { useEffect, useState } from 'react';
import { ModelEvaluationDashboard } from './ModelEvaluationDashboard';
import { evaluationApi } from '@/services/evaluation';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Loader2, AlertCircle, RefreshCw, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import type { CompleteEvaluationResponse, TrainedModelInfo } from '@/services/evaluation/types';

/**
 * Default business parameters for evaluation
 */
const DEFAULT_BUSINESS_PARAMS = {
  threshold: 0.5,
  cost_fp: 500,     // Cost of False Positive (e.g., $500 per incorrect approval)
  cost_fn: 2000,    // Cost of False Negative (e.g., $2000 per missed fraud)
  revenue_tp: 1000, // Revenue from True Positive (e.g., $1000 per correct approval)
};

interface ModelEvaluationContainerProps {
  modelId?: string;
}

export function ModelEvaluationContainer({ modelId: propModelId }: ModelEvaluationContainerProps) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(propModelId || null);
  const [availableModels, setAvailableModels] = useState<TrainedModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [evaluationData, setEvaluationData] = useState<CompleteEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(DEFAULT_BUSINESS_PARAMS.threshold);

  /**
   * Load available trained models from backend
   */
  const loadAvailableModels = async () => {
    try {
      setModelsLoading(true);
      console.log('📋 Loading trained models from backend...');
      
      const response = await evaluationApi.getTrainedModels();
      
      setAvailableModels(response.models);
      console.log('✅ Loaded', response.totalModels, 'trained models');
      console.log('🏆 Best model:', response.bestModelId);
      
      // Auto-select best model if no model selected
      if (!selectedModelId && response.bestModelId) {
        setSelectedModelId(response.bestModelId);
      }
    } catch (error: any) {
      console.error('❌ Failed to load trained models:', error);
      toast.error('Failed to load trained models', {
        description: error.message || 'Check console for details',
      });
    } finally {
      setModelsLoading(false);
    }
  };

  /**
   * Load complete evaluation data for selected model
   */
  const loadEvaluation = async (modelId: string, newThreshold?: number) => {
    const thresholdToUse = newThreshold !== undefined ? newThreshold : threshold;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 Loading evaluation for model:', modelId);
      console.log('📊 Threshold:', thresholdToUse);
      console.log('💰 Business params:', DEFAULT_BUSINESS_PARAMS);
      
      const response = await evaluationApi.getCompleteEvaluation(modelId, {
        threshold: thresholdToUse,
        cost_fp: DEFAULT_BUSINESS_PARAMS.cost_fp,
        cost_fn: DEFAULT_BUSINESS_PARAMS.cost_fn,
        revenue_tp: DEFAULT_BUSINESS_PARAMS.revenue_tp,
      });
      
      console.log('✅ Evaluation data loaded:', response);
      console.log('📈 Overall Score:', response.overallScore);
      console.log('🎯 Model Info:', response.modelInfo);
      
      setEvaluationData(response);
      toast.success('Evaluation loaded successfully', {
        description: `Model: ${response.modelInfo?.resolvedName || modelId}`,
      });
    } catch (error: any) {
      console.error('❌ Failed to load evaluation:', error);
      setError(error.message || 'Failed to load evaluation data');
      toast.error('Failed to load evaluation', {
        description: error.message || 'Check console for details',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load models on mount
   */
  useEffect(() => {
    loadAvailableModels();
  }, []);

  /**
   * Load evaluation when model is selected
   */
  useEffect(() => {
    if (selectedModelId) {
      console.log('🎯 Model selected:', selectedModelId);
      loadEvaluation(selectedModelId);
    }
  }, [selectedModelId]);

  /**
   * Handle threshold change
   */
  const handleThresholdChange = async (newThreshold: number) => {
    if (!selectedModelId) return;
    setThreshold(newThreshold);
    await loadEvaluation(selectedModelId, newThreshold);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    if (!selectedModelId) return;
    
    try {
      console.log('🔄 Refreshing evaluation cache...');
      await evaluationApi.refreshCache();
      toast.success('Cache refreshed');
      
      // Reload evaluation
      await loadEvaluation(selectedModelId);
    } catch (error: any) {
      console.error('❌ Failed to refresh cache:', error);
      toast.error('Failed to refresh cache', {
        description: error.message,
      });
    }
  };

  /**
   * Model Selection State
   */
  if (!selectedModelId) {
    return (
      <div className="flex items-center justify-center min-h-[600px] p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              Select Model for Evaluation
            </CardTitle>
            <CardDescription>
              Choose a trained model to analyze its performance metrics and business impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modelsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Loading trained models...</span>
              </div>
            ) : availableModels.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No trained models available. Please run ML Flow or AutoML to train models first.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Select onValueChange={setSelectedModelId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a trained model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {model.algorithm}
                            {model.testScore && ` • ${(model.testScore * 100).toFixed(1)}%`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Available Models ({availableModels.length})</h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {availableModels.slice(0, 10).map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => setSelectedModelId(model.id)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {model.algorithm}
                            {model.testScore && ` • Test Score: ${(model.testScore * 100).toFixed(1)}%`}
                            {model.problemType && ` • ${model.problemType}`}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Evaluate
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Error State
   */
  if (error && !loading && !evaluationData) {
    return (
      <div className="flex items-center justify-center min-h-[600px] p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              Evaluation Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => setSelectedModelId(null)} variant="outline">
                Select Different Model
              </Button>
              <Button onClick={() => loadEvaluation(selectedModelId!)} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Loading State
   */
  if (loading && !evaluationData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Evaluation Data</h3>
          <p className="text-sm text-muted-foreground">
            Analyzing model performance and computing metrics...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render Dashboard
   */
  return (
    <div className="w-full h-full">
      {evaluationData && (
        <ModelEvaluationDashboard
          modelId={selectedModelId}
          modelName={evaluationData.modelInfo?.resolvedName || selectedModelId}
          data={evaluationData}
          threshold={threshold}
          onThresholdChange={handleThresholdChange}
          onRefresh={handleRefresh}
          onChangeModel={() => setSelectedModelId(null)}
        />
      )}
    </div>
  );
}
