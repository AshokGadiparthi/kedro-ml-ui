# React Integration Guide

This guide shows how to integrate your React UI with the Spring Boot + ML Engine backend.

## Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend                  │
│  - Dashboard                            │
│  - Data Management                      │
│  - Model Training                       │
│  - Model Evaluation                     │
│  - Deployment                           │
│  - Predictions                          │
│  - Monitoring                           │
└───────────┬─────────────────────────────┘
            │ HTTP REST (axios)
            ↓
┌─────────────────────────────────────────┐
│      Spring Boot Backend API            │
│  - /api/ml/train                        │
│  - /api/ml/predict                      │
│  - /api/ml/models                       │
│  - /api/ml/evaluate                     │
└───────────┬─────────────────────────────┘
            │ Python subprocess / REST
            ↓
┌─────────────────────────────────────────┐
│         ML Engine (Python)              │
└─────────────────────────────────────────┘
```

---

## React Service (API Client)

### src/services/mlEngineService.ts

```typescript
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/ml';

// Type Definitions
export interface TrainRequest {
  dataPath: string;
  target: string;
  problemType: 'classification' | 'regression';
  algorithm: string;
  testSize?: number;
  randomState?: number;
  featureEngineering?: boolean;
  scaling?: 'standard' | 'minmax' | 'robust' | 'none';
  polynomialDegree?: number;
  selectFeatures?: number;
  tuneHyperparameters?: boolean;
  tuningMethod?: 'grid' | 'random';
  tuningIterations?: number;
  evaluate?: boolean;
  cvFolds?: number;
  analyzeFeatures?: boolean;
}

export interface TrainResponse {
  status: 'success' | 'error';
  problemType?: string;
  algorithm?: string;
  modelPath?: string;
  featureNamesPath?: string;
  metrics?: {
    train_accuracy?: number;
    test_accuracy?: number;
    train_rmse?: number;
    test_rmse?: number;
    train_r2?: number;
    test_r2?: number;
    train_mae?: number;
    test_mae?: number;
    roc_auc?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
  };
  trainingInfo?: {
    n_samples: number;
    n_features: number;
    train_samples: number;
    test_samples: number;
  };
  featureImportance?: Array<{
    feature: string;
    importance: number;
  }>;
  bestParameters?: Record<string, any>;
  bestScore?: number;
  evaluationReports?: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  message?: string;
  type?: string;
}

export interface PredictRequest {
  modelPath: string;
  dataPath: string;
  outputPath?: string;
}

export interface PredictResponse {
  status: 'success' | 'error';
  predictionsPath?: string;
  nPredictions?: number;
  predictionsSample?: any[];
  columns?: string[];
  message?: string;
}

export interface Model {
  name: string;
  path: string;
  size_mb: number;
  created: number;
}

export interface ModelsResponse {
  status: 'success' | 'error';
  models?: Model[];
  message?: string;
}

// API Client
class MLEngineService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 300000, // 5 minutes for training
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Train a new machine learning model
   */
  async trainModel(request: TrainRequest): Promise<TrainResponse> {
    try {
      const response: AxiosResponse<TrainResponse> = await this.axiosInstance.post(
        '/train',
        request
      );
      return response.data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Training failed',
      };
    }
  }

  /**
   * Make predictions with a trained model
   */
  async predict(request: PredictRequest): Promise<PredictResponse> {
    try {
      const response: AxiosResponse<PredictResponse> = await this.axiosInstance.post(
        '/predict',
        request
      );
      return response.data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Prediction failed',
      };
    }
  }

  /**
   * Get list of all trained models
   */
  async listModels(): Promise<ModelsResponse> {
    try {
      const response: AxiosResponse<ModelsResponse> = await this.axiosInstance.get(
        '/models'
      );
      return response.data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to list models',
      };
    }
  }

  /**
   * Get information about a specific model
   */
  async getModelInfo(modelId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/models/${modelId}/info`);
      return response.data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to get model info',
      };
    }
  }

  /**
   * Delete a model
   */
  async deleteModel(modelId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.delete(`/models/${modelId}`);
      return response.data;
    } catch (error: any) {
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to delete model',
      };
    }
  }
}

// Export singleton instance
export const mlEngineService = new MLEngineService();
```

---

## React Hook (Custom Hook for ML Operations)

### src/hooks/useMLEngine.ts

```typescript
import { useState, useCallback } from 'react';
import { mlEngineService, TrainRequest, TrainResponse, PredictRequest, PredictResponse } from '../services/mlEngineService';

export const useMLEngine = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [trainResult, setTrainResult] = useState<TrainResponse | null>(null);
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trainModel = useCallback(async (request: TrainRequest) => {
    setIsTraining(true);
    setError(null);
    setTrainResult(null);

    try {
      const result = await mlEngineService.trainModel(request);
      
      if (result.status === 'success') {
        setTrainResult(result);
        return result;
      } else {
        setError(result.message || 'Training failed');
        return result;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during training');
      throw err;
    } finally {
      setIsTraining(false);
    }
  }, []);

  const predict = useCallback(async (request: PredictRequest) => {
    setIsPredicting(true);
    setError(null);
    setPredictResult(null);

    try {
      const result = await mlEngineService.predict(request);
      
      if (result.status === 'success') {
        setPredictResult(result);
        return result;
      } else {
        setError(result.message || 'Prediction failed');
        return result;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction');
      throw err;
    } finally {
      setIsPredicting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setTrainResult(null);
    setPredictResult(null);
    setError(null);
  }, []);

  return {
    // States
    isTraining,
    isPredicting,
    trainResult,
    predictResult,
    error,
    
    // Actions
    trainModel,
    predict,
    clearError,
    clearResults,
  };
};
```

---

## Component Example: Model Training

### src/components/ModelTraining.tsx

```typescript
import { useState } from 'react';
import { useMLEngine } from '../hooks/useMLEngine';
import { TrainRequest } from '../services/mlEngineService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function ModelTraining() {
  const { isTraining, trainResult, error, trainModel, clearResults } = useMLEngine();
  
  const [config, setConfig] = useState<TrainRequest>({
    dataPath: '',
    target: '',
    problemType: 'classification',
    algorithm: 'xgboost',
    testSize: 0.2,
    randomState: 42,
    featureEngineering: true,
    scaling: 'standard',
    polynomialDegree: 2,
    tuneHyperparameters: false,
    tuningMethod: 'grid',
    evaluate: true,
    cvFolds: 5,
    analyzeFeatures: true,
  });

  const algorithms = {
    classification: [
      { value: 'logistic', label: 'Logistic Regression' },
      { value: 'svm', label: 'Support Vector Machine' },
      { value: 'random_forest', label: 'Random Forest' },
      { value: 'gradient_boosting', label: 'Gradient Boosting' },
      { value: 'xgboost', label: 'XGBoost (Recommended)' },
    ],
    regression: [
      { value: 'linear', label: 'Linear Regression' },
      { value: 'ridge', label: 'Ridge Regression' },
      { value: 'lasso', label: 'Lasso Regression' },
      { value: 'elasticnet', label: 'ElasticNet' },
      { value: 'random_forest_reg', label: 'Random Forest Regressor' },
      { value: 'xgboost_reg', label: 'XGBoost Regressor (Recommended)' },
      { value: 'gradient_boosting_reg', label: 'Gradient Boosting Regressor' },
      { value: 'svr', label: 'Support Vector Regressor' },
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await trainModel(config);
  };

  const handleProblemTypeChange = (value: 'classification' | 'regression') => {
    setConfig({
      ...config,
      problemType: value,
      algorithm: value === 'classification' ? 'xgboost' : 'xgboost_reg',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Model Training</h1>
        <p className="text-muted-foreground mt-2">
          Configure and train your machine learning model
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Training Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataPath">Data File Path</Label>
                <Input
                  id="dataPath"
                  value={config.dataPath}
                  onChange={(e) => setConfig({ ...config, dataPath: e.target.value })}
                  placeholder="/data/customers.csv"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Column</Label>
                <Input
                  id="target"
                  value={config.target}
                  onChange={(e) => setConfig({ ...config, target: e.target.value })}
                  placeholder="e.g., churn"
                  required
                />
              </div>
            </div>

            {/* Problem Type & Algorithm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="problemType">Problem Type</Label>
                <Select
                  value={config.problemType}
                  onValueChange={handleProblemTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select
                  value={config.algorithm}
                  onValueChange={(value) => setConfig({ ...config, algorithm: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {algorithms[config.problemType].map((algo) => (
                      <SelectItem key={algo.value} value={algo.value}>
                        {algo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Advanced Options</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featureEngineering"
                  checked={config.featureEngineering}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, featureEngineering: checked as boolean })
                  }
                />
                <Label htmlFor="featureEngineering" className="cursor-pointer">
                  Enable Feature Engineering
                </Label>
              </div>

              {config.featureEngineering && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="scaling">Feature Scaling</Label>
                    <Select
                      value={config.scaling}
                      onValueChange={(value: any) => setConfig({ ...config, scaling: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Scaler</SelectItem>
                        <SelectItem value="minmax">MinMax Scaler</SelectItem>
                        <SelectItem value="robust">Robust Scaler</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="polynomialDegree">Polynomial Degree</Label>
                    <Input
                      id="polynomialDegree"
                      type="number"
                      min="1"
                      max="3"
                      value={config.polynomialDegree || ''}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          polynomialDegree: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tuneHyperparameters"
                  checked={config.tuneHyperparameters}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, tuneHyperparameters: checked as boolean })
                  }
                />
                <Label htmlFor="tuneHyperparameters" className="cursor-pointer">
                  Tune Hyperparameters (may take longer)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="evaluate"
                  checked={config.evaluate}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, evaluate: checked as boolean })
                  }
                />
                <Label htmlFor="evaluate" className="cursor-pointer">
                  Run Comprehensive Evaluation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analyzeFeatures"
                  checked={config.analyzeFeatures}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, analyzeFeatures: checked as boolean })
                  }
                />
                <Label htmlFor="analyzeFeatures" className="cursor-pointer">
                  Analyze Feature Importance
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isTraining || !config.dataPath || !config.target}
            >
              {isTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Training Model...
                </>
              ) : (
                'Train Model'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {trainResult && trainResult.status === 'success' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Training Completed Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Model Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Algorithm</dt>
                      <dd className="font-semibold">{trainResult.algorithm}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Model Path</dt>
                      <dd className="font-mono text-xs break-all">{trainResult.modelPath}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {config.problemType === 'classification' && trainResult.metrics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Classification Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Train Accuracy</dt>
                        <dd className="font-semibold">
                          {((trainResult.metrics.train_accuracy || 0) * 100).toFixed(2)}%
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Test Accuracy</dt>
                        <dd className="font-semibold text-green-600">
                          {((trainResult.metrics.test_accuracy || 0) * 100).toFixed(2)}%
                        </dd>
                      </div>
                      {trainResult.metrics.roc_auc && (
                        <div>
                          <dt className="text-muted-foreground">ROC AUC</dt>
                          <dd className="font-semibold">
                            {((trainResult.metrics.roc_auc || 0) * 100).toFixed(2)}%
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              )}

              {config.problemType === 'regression' && trainResult.metrics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Regression Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Test RMSE</dt>
                        <dd className="font-semibold">
                          {trainResult.metrics.test_rmse?.toFixed(2)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Test R²</dt>
                        <dd className="font-semibold text-green-600">
                          {trainResult.metrics.test_r2?.toFixed(4)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Test MAE</dt>
                        <dd className="font-semibold">
                          {trainResult.metrics.test_mae?.toFixed(2)}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              )}

              {trainResult.trainingInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Training Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Total Samples</dt>
                        <dd className="font-semibold">{trainResult.trainingInfo.n_samples}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Features</dt>
                        <dd className="font-semibold">{trainResult.trainingInfo.n_features}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Train/Test Split</dt>
                        <dd className="font-semibold">
                          {trainResult.trainingInfo.train_samples}/{trainResult.trainingInfo.test_samples}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Feature Importance */}
            {trainResult.featureImportance && trainResult.featureImportance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trainResult.featureImportance.map((feat, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{feat.feature}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${feat.importance * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {(feat.importance * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Evaluation Reports */}
            {trainResult.evaluationReports && trainResult.evaluationReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Evaluation Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trainResult.evaluationReports.map((report, idx) => (
                      <Button key={idx} variant="outline" size="sm" asChild>
                        <a href={report.path} target="_blank" rel="noopener noreferrer">
                          {report.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Integration with Existing React UI

Your existing React UI already has the structure! Just add the service:

1. **Add axios** (if not already installed):
```bash
npm install axios
```

2. **Create the service file**: `src/services/mlEngineService.ts`

3. **Create the custom hook**: `src/hooks/useMLEngine.ts`

4. **Update your ModelTraining component** to use the hook

5. **Test the integration!**

---

## Next Steps

1. Test the service with your Spring Boot backend
2. Update all 7 components to use `mlEngineService`
3. Add error boundaries
4. Add loading states
5. Add real-time progress updates (WebSocket)

Your React UI is already set up perfectly - just need to connect it to the backend! 🚀
