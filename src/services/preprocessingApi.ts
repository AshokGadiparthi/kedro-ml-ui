/**
 * PREPROCESSING API SERVICE
 * Handles data preprocessing job submission and polling
 */

import { config, getAuthToken } from '@/config/environment';

const BASE_URL = config.api.baseURL;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PreprocessingConfig {
  missingValues: {
    strategy: string;
    threshold: number;
  };
  outliers: {
    method: string;
    severity: string;
    action: string;
  };
  dataTypes: {
    autoDetect: boolean;
    manualOverrides: Record<string, string>;
  };
  scaling: {
    method: string;
  };
  sampling: {
    sampleSize: number | null;
    filterCondition: string;
  };
}

export interface PreprocessingJobResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  dataset_id: string;
  created_at: string;
  updated_at?: string;
  progress: number;
  current_phase: string;
  error?: string;
  results?: {
    rows_before: number;
    rows_after: number;
    cols_before: number;
    cols_after: number;
    missing_before: number;
    missing_after: number;
    duplicates_removed: number;
    outliers_handled: number;
    execution_time: number;
  };
}

// ============================================================================
// API CLIENT
// ============================================================================

class PreprocessingApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generic API call handler
   */
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Preprocessing API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Start preprocessing job
   */
  async startPreprocessing(
    datasetId: string,
    config: PreprocessingConfig
  ): Promise<PreprocessingJobResponse> {
    // Map frontend config to backend format
    const backendParams = {
      data_loading: {
        filepath: `/data/01_raw/${datasetId}/sample_data.csv`,
        target_column: 'loan_approved', // TODO: Make this configurable
      },
      preprocessing: {
        missing_values_strategy: config.missingValues.strategy,
        missing_values_threshold: config.missingValues.threshold,
        outlier_method: config.outliers.method,
        outlier_action: config.outliers.action,
        scaling_method: config.scaling.method,
        sample_size: config.sampling.sampleSize,
      },
    };

    // TODO: Replace with actual API endpoint
    // For now, return mock response
    return {
      job_id: this.generateJobId(),
      status: 'queued',
      dataset_id: datasetId,
      created_at: new Date().toISOString(),
      progress: 0,
      current_phase: 'Queued',
    };
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<PreprocessingJobResponse> {
    // TODO: Replace with actual API endpoint
    // For now, simulate processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          job_id: jobId,
          status: 'completed',
          dataset_id: 'mock-dataset-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          progress: 100,
          current_phase: 'Completed',
          results: {
            rows_before: 1000,
            rows_after: 800,
            cols_before: 6,
            cols_after: 5,
            missing_before: 145,
            missing_after: 0,
            duplicates_removed: 34,
            outliers_handled: 23,
            execution_time: 4.59,
          },
        });
      }, 2000);
    });
  }

  /**
   * Get preprocessing history
   */
  async getHistory(datasetId: string): Promise<PreprocessingJobResponse[]> {
    // TODO: Replace with actual API endpoint
    return [];
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const preprocessingApi = new PreprocessingApiClient();
