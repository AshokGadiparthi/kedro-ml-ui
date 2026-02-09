/**
 * Mock ML API Service
 * Works without backend - perfect for UI development!
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  dataSource: any;
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

class MockMLApiService {
  private projects: Project[] = [
    {
      id: 'proj-1',
      name: 'Customer Churn Prediction',
      description: 'Predict which customers are likely to churn based on usage patterns and demographics',
      dataSource: { type: 'bigquery', connectionParams: {}, queryOrPath: 'SELECT * FROM customers' },
      status: 'completed',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-2',
      name: 'Sales Forecasting',
      description: 'Forecast monthly sales using historical data and seasonal patterns',
      dataSource: { type: 'mysql', connectionParams: {}, queryOrPath: 'SELECT * FROM sales' },
      status: 'training',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-3',
      name: 'Credit Risk Assessment',
      description: 'Assess credit risk for loan applicants using ML models',
      dataSource: { type: 's3', connectionParams: {}, queryOrPath: 's3://bucket/credit-data.csv' },
      status: 'data_loaded',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  private delay(ms: number = 800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId() {
    return `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Project Management
  async createProject(name: string, description: string): Promise<Project> {
    await this.delay();
    
    const project: Project = {
      id: this.generateId(),
      name,
      description,
      dataSource: null,
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.projects.unshift(project);
    return project;
  }

  async getProjects(): Promise<Project[]> {
    await this.delay(300);
    return [...this.projects];
  }

  async getProject(id: string): Promise<Project> {
    await this.delay(200);
    const project = this.projects.find(p => p.id === id);
    if (!project) throw new Error('Project not found');
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await this.delay(400);
    this.projects = this.projects.filter(p => p.id !== id);
  }

  // Data Source Management
  async getSupportedDataSources(): Promise<any> {
    await this.delay(200);
    return {
      files: ['csv', 'parquet', 'json'],
      databases: ['mysql', 'postgresql', 'mssql', 'oracle'],
      cloud: ['s3', 'gcs', 'azure_blob'],
      warehouses: ['bigquery', 'snowflake', 'redshift', 'databricks'],
    };
  }

  async testConnection(config: DataSourceConfig): Promise<{ status: string; message: string }> {
    await this.delay(1500); // Simulate connection test
    
    // Simulate occasional failures for demo
    if (Math.random() < 0.1) {
      return {
        status: 'failed',
        message: 'Connection timeout - please check your credentials',
      };
    }
    
    return {
      status: 'success',
      message: 'Connection successful! Data source is accessible.',
    };
  }

  async previewData(config: DataSourceConfig, rows: number = 10): Promise<any> {
    await this.delay(1000);
    
    // Mock data preview based on source type
    const mockData = {
      columns: ['id', 'customer_name', 'age', 'income', 'churn', 'tenure', 'usage_minutes', 'support_calls'],
      data: Array.from({ length: Math.min(rows, 5) }, (_, i) => ({
        id: 1000 + i,
        customer_name: `Customer ${i + 1}`,
        age: 25 + Math.floor(Math.random() * 40),
        income: 30000 + Math.floor(Math.random() * 100000),
        churn: Math.random() > 0.7 ? 1 : 0,
        tenure: Math.floor(Math.random() * 60),
        usage_minutes: Math.floor(Math.random() * 1000),
        support_calls: Math.floor(Math.random() * 10),
      })),
      totalRows: 12450,
      totalColumns: 8,
    };
    
    return mockData;
  }

  async setProjectDataSource(projectId: string, config: DataSourceConfig): Promise<Project> {
    await this.delay(600);
    
    const project = this.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    project.dataSource = config;
    project.status = 'data_loaded';
    project.updatedAt = new Date().toISOString();
    
    return project;
  }

  async loadData(projectId: string): Promise<{ rows: number; columns: number; preview: any[] }> {
    await this.delay(1200);
    
    return {
      rows: 12450,
      columns: 8,
      preview: Array.from({ length: 5 }, (_, i) => ({
        id: 1000 + i,
        name: `Sample ${i + 1}`,
        value: Math.random() * 100,
      })),
    };
  }

  async getDataStatistics(projectId: string): Promise<any> {
    await this.delay(800);
    
    return {
      rows: 12450,
      columns: 8,
      missingValues: 234,
      duplicates: 12,
      numericColumns: 5,
      categoricalColumns: 3,
    };
  }

  // Model Training
  async trainModel(config: TrainingConfig): Promise<TrainingResult> {
    await this.delay(2000);
    
    return {
      modelId: `model-${Date.now()}`,
      algorithm: config.algorithm || 'xgboost',
      metrics: {
        accuracy: 0.935,
        precision: 0.921,
        recall: 0.908,
        f1Score: 0.914,
        rocAuc: 0.967,
      },
      trainingTime: 45.2,
      status: 'success',
    };
  }

  async autoML(projectId: string, targetColumn: string, problemType: 'classification' | 'regression'): Promise<any> {
    await this.delay(3000);
    
    return {
      bestAlgorithm: 'xgboost',
      bestScore: 0.935,
      allResults: [
        { algorithm: 'xgboost', score: 0.935, time: 45.2 },
        { algorithm: 'random_forest', score: 0.912, time: 38.5 },
        { algorithm: 'logistic', score: 0.852, time: 12.3 },
      ],
      modelId: `model-${Date.now()}`,
    };
  }

  async getModels(projectId?: string): Promise<any[]> {
    await this.delay(400);
    
    return [
      {
        id: 'model-1',
        projectId: 'proj-1',
        algorithm: 'xgboost',
        accuracy: 0.935,
        status: 'deployed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'model-2',
        projectId: 'proj-2',
        algorithm: 'random_forest',
        r2Score: 0.876,
        status: 'training',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  async getModel(modelId: string): Promise<any> {
    await this.delay(300);
    
    return {
      id: modelId,
      algorithm: 'xgboost',
      accuracy: 0.935,
      status: 'deployed',
      parameters: {
        n_estimators: 100,
        max_depth: 6,
        learning_rate: 0.1,
      },
    };
  }

  // Model Evaluation
  async evaluateModel(modelId: string): Promise<any> {
    await this.delay(1500);
    
    return {
      metrics: {
        accuracy: 0.935,
        precision: 0.921,
        recall: 0.908,
        f1Score: 0.914,
        rocAuc: 0.967,
      },
      confusionMatrix: [
        [850, 50],
        [65, 935],
      ],
    };
  }

  async getModelMetrics(modelId: string): Promise<any> {
    await this.delay(400);
    
    return {
      accuracy: 0.935,
      precision: 0.921,
      recall: 0.908,
      f1Score: 0.914,
      rocAuc: 0.967,
    };
  }

  async compareModels(modelIds: string[]): Promise<any> {
    await this.delay(1000);
    
    return {
      models: modelIds.map((id, i) => ({
        id,
        algorithm: ['xgboost', 'random_forest', 'logistic'][i % 3],
        accuracy: 0.9 + Math.random() * 0.05,
      })),
    };
  }

  async explainPrediction(modelId: string, data: Record<string, any>): Promise<any> {
    await this.delay(1200);
    
    return {
      prediction: 1,
      probability: 0.85,
      shapValues: {
        age: 0.15,
        income: 0.28,
        tenure: -0.12,
        usage_minutes: 0.22,
        support_calls: -0.18,
      },
      topFeatures: [
        { feature: 'income', value: data.income, contribution: 0.28 },
        { feature: 'usage_minutes', value: data.usage_minutes, contribution: 0.22 },
        { feature: 'support_calls', value: data.support_calls, contribution: -0.18 },
      ],
    };
  }

  // Predictions
  async predict(request: PredictionRequest): Promise<PredictionResult> {
    await this.delay(600);
    
    return {
      predictions: request.data.map(() => Math.random() > 0.5 ? 1 : 0),
      probabilities: request.data.map(() => {
        const prob = Math.random();
        return [1 - prob, prob];
      }),
    };
  }

  async batchPredict(modelId: string, fileUrl: string): Promise<any> {
    await this.delay(2000);
    
    return {
      jobId: `job-${Date.now()}`,
      status: 'processing',
      totalRecords: 1000,
    };
  }

  // Deployment
  async deployModel(modelId: string, environment: 'staging' | 'production'): Promise<any> {
    await this.delay(1500);
    
    return {
      deploymentId: `deploy-${Date.now()}`,
      modelId,
      environment,
      status: 'active',
      endpoint: `https://api.mlplatform.com/v1/models/${modelId}/predict`,
    };
  }

  async getDeployments(): Promise<any[]> {
    await this.delay(500);
    
    return [
      {
        id: 'deploy-1',
        modelId: 'model-1',
        environment: 'production',
        status: 'active',
        requestCount: 45632,
      },
      {
        id: 'deploy-2',
        modelId: 'model-2',
        environment: 'staging',
        status: 'active',
        requestCount: 1234,
      },
    ];
  }

  async getDeployment(deploymentId: string): Promise<any> {
    await this.delay(300);
    
    return {
      id: deploymentId,
      modelId: 'model-1',
      environment: 'production',
      status: 'active',
      requestCount: 45632,
      avgLatency: 45,
    };
  }

  // Monitoring
  async getModelPerformance(modelId: string, period: string = '7d'): Promise<any> {
    await this.delay(700);
    
    const days = parseInt(period) || 7;
    const data = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      accuracy: 0.92 + Math.random() * 0.03,
      predictions: 5000 + Math.floor(Math.random() * 2000),
    }));
    
    return { data };
  }

  async getSystemMetrics(): Promise<any> {
    await this.delay(400);
    
    return {
      cpu: 45 + Math.random() * 20,
      memory: 60 + Math.random() * 15,
      disk: 72,
      activeModels: 5,
      requestsPerMinute: 150 + Math.floor(Math.random() * 50),
    };
  }

  async getAuditLogs(limit: number = 50): Promise<any[]> {
    await this.delay(500);
    
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: `log-${i}`,
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      action: ['model_trained', 'prediction_made', 'model_deployed', 'data_loaded'][i % 4],
      user: 'admin@ml.io',
      details: `Action ${i + 1} completed successfully`,
    }));
  }
}

export const mockMLApiService = new MockMLApiService();
