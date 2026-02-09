/**
 * ML API Service
 * Connects React UI to Spring Boot backend
 * Falls back to mock data when backend is unavailable
 */

import { mockMLApiService } from './mockMLApiService';
import { config } from '@/config/environment';

const API_BASE_URL = config.api.baseURL;
const USE_MOCK = config.features.useMockData || true; // Default to mock mode

export interface Project {
  id: string;
  name: string;
  description: string;
  dataSource: DataSourceConfig;
  status: 'created' | 'data_loaded' | 'training' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface DataSourceConfig {
  type: 'csv' | 'mysql' | 'postgresql' | 'bigquery' | 's3' | 'snowflake' | 'redshift' | 'databricks';
  connectionParams: Record<string, any>;
  queryOrPath: string;
}

export interface TrainingConfig {
  projectId: string;
  targetColumn: string;
  problemType: 'classification' | 'regression';
  algorithm?: 'auto' | 'logistic' | 'random_forest' | 'xgboost' | 'svm' | 'linear' | 'ridge';
  featureEngineering?: {
    scaling?: 'standard' | 'minmax' | 'robust';
    polynomialDegree?: number;
    featureSelection?: number;
  };
  hyperparameterTuning?: boolean;
  crossValidation?: number;
}

export interface TrainingResult {
  modelId: string;
  algorithm: string;
  metrics: Record<string, number>;
  trainingTime: number;
  status: 'success' | 'failed';
}

export interface PredictionRequest {
  modelId: string;
  data: Record<string, any>[];
}

export interface PredictionResult {
  predictions: any[];
  probabilities?: number[][];
}

class MLApiService {
  private useMock = USE_MOCK;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Use mock service if enabled
    if (this.useMock) {
      return this.getMockResponse(endpoint, options);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      // Fallback to mock if backend is unavailable
      console.warn('Backend unavailable, using mock data:', error.message);
      this.useMock = true;
      return this.getMockResponse(endpoint, options);
    }
  }

  private async getMockResponse<T>(endpoint: string, options: RequestInit): Promise<T> {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : undefined;

    // Route to appropriate mock method
    if (endpoint === '/projects' && method === 'POST') {
      return mockMLApiService.createProject(body.name, body.description) as Promise<T>;
    }
    if (endpoint === '/projects' && method === 'GET') {
      return mockMLApiService.getProjects() as Promise<T>;
    }
    if (endpoint.startsWith('/projects/') && endpoint.endsWith('/datasource') && method === 'PUT') {
      const id = endpoint.split('/')[2];
      return mockMLApiService.setProjectDataSource(id, body) as Promise<T>;
    }
    if (endpoint.startsWith('/projects/') && method === 'DELETE') {
      const id = endpoint.split('/')[2];
      return mockMLApiService.deleteProject(id) as Promise<T>;
    }
    if (endpoint === '/datasources/test' && method === 'POST') {
      return mockMLApiService.testConnection(body) as Promise<T>;
    }
    if (endpoint === '/datasources/preview' && method === 'POST') {
      return mockMLApiService.previewData(body, body.rows) as Promise<T>;
    }
    if (endpoint === '/models/train' && method === 'POST') {
      return mockMLApiService.trainModel(body) as Promise<T>;
    }
    if (endpoint === '/models/automl' && method === 'POST') {
      return mockMLApiService.autoML(body.projectId, body.targetColumn, body.problemType) as Promise<T>;
    }

    // Default mock response
    return Promise.resolve({} as T);
  }

  // Project Management
  async createProject(name: string, description: string): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}`, { method: 'DELETE' });
  }

  // Data Source Management
  async getSupportedDataSources(): Promise<any> {
    return this.request<any>('/datasources/supported');
  }

  async testConnection(config: DataSourceConfig): Promise<{ status: string; message: string }> {
    return this.request('/datasources/test', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async previewData(config: DataSourceConfig, rows: number = 10): Promise<any> {
    return this.request('/datasources/preview', {
      method: 'POST',
      body: JSON.stringify({ ...config, rows }),
    });
  }

  async setProjectDataSource(projectId: string, config: DataSourceConfig): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}/datasource`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async loadData(projectId: string): Promise<{ rows: number; columns: number; preview: any[] }> {
    return this.request(`/projects/${projectId}/data/load`, {
      method: 'POST',
    });
  }

  async getDataStatistics(projectId: string): Promise<any> {
    return this.request(`/projects/${projectId}/data/statistics`);
  }

  // Model Training
  async trainModel(config: TrainingConfig): Promise<TrainingResult> {
    return this.request<TrainingResult>('/models/train', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async autoML(projectId: string, targetColumn: string, problemType: 'classification' | 'regression'): Promise<any> {
    return this.request('/models/automl', {
      method: 'POST',
      body: JSON.stringify({ projectId, targetColumn, problemType }),
    });
  }

  async getModels(projectId?: string): Promise<any[]> {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.request<any[]>(`/models${query}`);
  }

  async getModel(modelId: string): Promise<any> {
    return this.request<any>(`/models/${modelId}`);
  }

  // Model Evaluation
  async evaluateModel(modelId: string): Promise<any> {
    return this.request(`/models/${modelId}/evaluate`);
  }

  async getModelMetrics(modelId: string): Promise<any> {
    return this.request(`/models/${modelId}/metrics`);
  }

  async compareModels(modelIds: string[]): Promise<any> {
    return this.request('/models/compare', {
      method: 'POST',
      body: JSON.stringify({ modelIds }),
    });
  }

  async explainPrediction(modelId: string, data: Record<string, any>): Promise<any> {
    return this.request(`/models/${modelId}/explain`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Predictions
  async predict(request: PredictionRequest): Promise<PredictionResult> {
    return this.request<PredictionResult>('/predictions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async batchPredict(modelId: string, fileUrl: string): Promise<any> {
    return this.request('/predictions/batch', {
      method: 'POST',
      body: JSON.stringify({ modelId, fileUrl }),
    });
  }

  // Deployment
  async deployModel(modelId: string, environment: 'staging' | 'production'): Promise<any> {
    return this.request(`/models/${modelId}/deploy`, {
      method: 'POST',
      body: JSON.stringify({ environment }),
    });
  }

  async getDeployments(): Promise<any[]> {
    return this.request<any[]>('/deployments');
  }

  async getDeployment(deploymentId: string): Promise<any> {
    return this.request<any>(`/deployments/${deploymentId}`);
  }

  // Monitoring
  async getModelPerformance(modelId: string, period: string = '7d'): Promise<any> {
    return this.request(`/monitoring/performance/${modelId}?period=${period}`);
  }

  async getSystemMetrics(): Promise<any> {
    return this.request('/monitoring/system');
  }

  async getAuditLogs(limit: number = 50): Promise<any[]> {
    return this.request<any[]>(`/monitoring/logs?limit=${limit}`);
  }
}

export const mlApiService = new MLApiService();