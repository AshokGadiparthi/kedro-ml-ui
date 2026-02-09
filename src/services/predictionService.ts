/**
 * PREDICTION SERVICE - 100% REAL API INTEGRATION
 * Base URL: http://192.168.1.147:8000/api/v1/predictions
 */

import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.147:8000/api/v1/predictions';

// ============================================================================
// TYPE DEFINITIONS (matching real API responses)
// ============================================================================

export interface InputFeature {
  name: string;
  displayName: string;
  type: 'numeric' | 'categorical';
  inputType: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  defaultValue?: any;
  required: boolean;
  typicalRange?: string;
  options?: string[];
}

export interface DeployedModel {
  id: string;
  name: string;
  algorithm: string;
  version: string;
  deployedAt: string;
  accuracy: number;
  status: string;
  endpoint: string;
  inputFeatures: InputFeature[];
  outputSchema: {
    prediction: string;
    classes: string[];
    includesProbability: boolean;
    includesExplanation: boolean;
  };
}

export interface PredictionResponse {
  predictionId: string;
  modelId: string;
  modelName: string;
  timestamp: string;
  input: Record<string, any>;
  output: {
    prediction: string;
    predictionLabel: string;
    predictionValue: number;
    probability: number;
    probabilities: Record<string, number>;
    confidence: string;
    threshold: number;
  };
  explanation: {
    topFeatures: Array<{
      feature: string;
      contribution: number;
      impact: number;
      direction: string;
      value: any;
    }>;
    baselineScore: number;
    explanation: string;
  };
  metadata: {
    processingTimeMs: number;
    modelVersion: string;
  };
  // Top-level aliases
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface BatchJobResponse {
  jobId: string;
  modelId: string;
  modelName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  inputFile: {
    name: string;
    size: number;
    records: number;
  };
  outputFile?: {
    url: string;
    name: string;
  };
  summary?: {
    predictions: Record<string, number>;
    averageConfidence: number;
    highConfidencePredictions: number;
    lowConfidencePredictions: number;
    approved: number;
    rejected: number;
    total: number;
    avgConfidence: number;
    processingTime: string;
  };
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export interface HistoryItem {
  id: string;
  type: 'single' | 'batch';
  modelName: string;
  model: string;
  timestamp: string;
  timestampLabel: string;
  prediction: string | null;
  confidence: number | null;
  status: string;
  predictedLabel: string;
  predictedClass: string;
  recordsProcessed?: number;
  inputs?: Record<string, any>;
  details?: any;
}

export interface MonitoringStats {
  modelId: string | null;
  modelName: string | null;
  timeRange: string;
  stats: {
    totalPredictions: number;
    averageLatencyMs: number;
    errorRate: number;
    throughput: number;
  };
  predictionDistribution: Record<string, number>;
  confidenceDistribution: Array<{
    range: string;
    count: number;
  }>;
  hourlyTrend: Array<{
    hour: number;
    predictions: number;
    avgConfidence: number;
  }>;
  alerts: Array<{
    id: string;
    severity: string;
    message: string;
    timestamp: string;
  }>;
}

// ============================================================================
// API SERVICE
// ============================================================================

class PredictionService {
  /**
   * Endpoint 1: Get Deployed Models
   * GET /api/v1/predictions/deployed-models
   */
  async getDeployedModels(): Promise<{
    models: DeployedModel[];
    totalModels: number;
    activeModel: DeployedModel | null;
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/deployed-models`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch deployed models:', error);
      throw new Error('Failed to load deployed models. Please check your connection.');
    }
  }

  /**
   * Endpoint 2: Make Single Prediction
   * POST /api/v1/predictions/predict
   */
  async predict(
    modelId: string,
    features: Record<string, any>,
    threshold: number = 0.5
  ): Promise<PredictionResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, {
        modelId,
        threshold,
        features,
      });
      return response.data;
    } catch (error) {
      console.error('Prediction failed:', error);
      throw new Error('Prediction failed. Please check your input values.');
    }
  }

  /**
   * Endpoint 3: Start Batch Prediction Job
   * POST /api/v1/predictions/batch
   */
  async startBatchJob(file: File, modelId?: string): Promise<BatchJobResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const url = modelId
        ? `${API_BASE_URL}/batch?model_id=${modelId}`
        : `${API_BASE_URL}/batch`;

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Batch job failed:', error);
      throw new Error('Failed to upload batch file. Please check file format.');
    }
  }

  /**
   * Endpoint 4: Get Batch Job Status
   * GET /api/v1/predictions/batch/{jobId}
   */
  async getBatchJobStatus(jobId: string): Promise<BatchJobResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/batch/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get batch status:', error);
      throw new Error('Failed to get batch job status.');
    }
  }

  /**
   * Endpoint 5: Download Batch Results
   * GET /api/v1/predictions/batch/{jobId}/download
   */
  async downloadBatchResults(jobId: string): Promise<void> {
    try {
      const response = await axios.get(`${API_BASE_URL}/batch/${jobId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `predictions_${jobId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download results:', error);
      throw new Error('Failed to download batch results.');
    }
  }

  /**
   * Endpoint 6: Get Prediction History
   * GET /api/v1/predictions/history
   */
  async getHistory(
    page: number = 1,
    limit: number = 20,
    type?: 'single' | 'batch' | 'all',
    modelId?: string
  ): Promise<{
    predictions: HistoryItem[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    try {
      const params: any = { page, limit };
      if (type && type !== 'all') params.type = type;
      if (modelId && modelId !== 'all') params.model_id = modelId;

      const response = await axios.get(`${API_BASE_URL}/history`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw new Error('Failed to load prediction history.');
    }
  }

  /**
   * Endpoint 7: Get Monitoring Statistics
   * GET /api/v1/predictions/monitoring/stats
   */
  async getMonitoringStats(modelId?: string): Promise<MonitoringStats> {
    try {
      const params = modelId ? { modelId } : {};
      const response = await axios.get(`${API_BASE_URL}/monitoring/stats`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch monitoring stats:', error);
      throw new Error('Failed to load monitoring statistics.');
    }
  }

  /**
   * Endpoint 8: Download CSV Template
   * GET /api/v1/predictions/csv-template
   */
  async downloadCSVTemplate(): Promise<void> {
    try {
      const response = await axios.get(`${API_BASE_URL}/csv-template`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'prediction_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template:', error);
      throw new Error('Failed to download CSV template.');
    }
  }
}

export const predictionService = new PredictionService();
export default predictionService;
