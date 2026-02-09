/**
 * Pipeline Service
 * Handles ML pipeline execution API calls
 */

import { apiClient, apiCall } from '../api/client';

/**
 * Data Loading Pipeline Request
 */
export interface DataLoadingRequest {
  project_id: string;
  parameters: {
    data_loading: {
      dataset_id: string;
      target_column: string;
      filepath?: string;
    };
  };
}

/**
 * Pipeline Job Response
 */
export interface PipelineJobResponse {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  message?: string;
  result?: any;
}

/**
 * Run Data Loading Pipeline
 */
export const runDataLoadingPipeline = async (
  request: DataLoadingRequest
): Promise<PipelineJobResponse> => {
  return apiCall(
    apiClient.post('/api/v1/jobs/run-pipeline/data_loading', request)
  );
};

/**
 * Feature Engineering Pipeline Request
 */
export interface FeatureEngineeringRequest {
  project_id: string;
  parameters: {
    feature_engineering: {
      dataset_id: string;
      scaling_method?: 'standard' | 'minmax' | 'robust' | 'none';
      handle_missing_values?: boolean;
      handle_outliers?: boolean;
      encode_categories?: boolean;
      create_polynomial_features?: boolean;
      create_interactions?: boolean;
    };
  };
}

/**
 * Run Feature Engineering Pipeline
 */
export const runFeatureEngineeringPipeline = async (
  request: FeatureEngineeringRequest
): Promise<PipelineJobResponse> => {
  return apiCall(
    apiClient.post('/api/v1/jobs/run-pipeline/feature_engineering', request)
  );
};

/**
 * Model Selection Pipeline Request
 */
export interface ModelSelectionRequest {
  project_id: string;
  parameters: {
    model_selection: {
      dataset_id: string;
      target_column: string;
      problem_type: 'classification' | 'regression' | 'time_series';
      max_training_time_minutes?: number;
      accuracy_vs_speed?: 'low' | 'medium' | 'high';
      interpretability?: 'low' | 'medium' | 'high';
      cv_folds?: number;
      enable_hyperparameter_tuning?: boolean;
    };
  };
}

/**
 * Run Model Selection Pipeline
 */
export const runModelSelectionPipeline = async (
  request: ModelSelectionRequest
): Promise<PipelineJobResponse> => {
  return apiCall(
    apiClient.post('/api/v1/jobs/run-pipeline/model_selection', request)
  );
};

/**
 * Complete Pipeline Request
 */
export interface CompletePipelineRequest {
  project_id: string;
  parameters: {
    data_loading: {
      dataset_id: string;
      target_column: string;
      filepath?: string;
    };
    feature_engineering: {
      dataset_id: string;
      [key: string]: any;
    };
    model_selection: {
      dataset_id: string;
      target_column: string;
      problem_type: 'classification' | 'regression' | 'time_series';
      max_training_time_minutes?: number;
      accuracy_vs_speed?: 'low' | 'medium' | 'high';
      interpretability?: 'low' | 'medium' | 'high';
      cv_folds?: number;
      enable_hyperparameter_tuning?: boolean;
    };
  };
}

/**
 * Run Complete Pipeline (All 3 Steps)
 */
export const runCompletePipeline = async (
  request: CompletePipelineRequest
): Promise<PipelineJobResponse> => {
  return apiCall(
    apiClient.post('/api/v1/jobs/run-pipeline/phase3_4', request)
  );
};

/**
 * Run Phase 3 Pipeline (Baseline - Step 1)
 * Executes only the baseline algorithms (2 simple algorithms)
 */
export const runPhase3Pipeline = async (
  request: CompletePipelineRequest
): Promise<PipelineJobResponse> => {
  return apiCall(
    apiClient.post('/api/v1/jobs/run-pipeline/phase3', request)
  );
};

/**
 * Run Phase 4 Pipeline (Comprehensive - Step 2)
 * Executes comprehensive search with 50+ algorithms
 * Should be called after phase3 completes
 */
export const runPhase4Pipeline = async (
  request: CompletePipelineRequest
): Promise<PipelineJobResponse> => {
  return apiCall(
    apiClient.post('/api/v1/jobs/run-pipeline/phase4', request)
  );
};