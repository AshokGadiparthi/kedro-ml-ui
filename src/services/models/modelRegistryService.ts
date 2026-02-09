/**
 * Model Registry Service
 * Handles all model registry operations - listing, versioning, deployment, rollback
 */

import { apiClient, apiCall } from '../api/client';

/**
 * Model Version Status
 */
export type ModelStatus = 'draft' | 'staging' | 'production' | 'archived' | 'deprecated';

/**
 * Model Version
 */
export interface ModelVersion {
  version: string;
  version_number: number;
  status: ModelStatus;
  algorithm: string;
  accuracy: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  created_at: string;
  created_by: string;
  job_id: string;
  is_current: boolean;
  tags: string[];
  description?: string;
  model_size_mb?: number;
  training_time_seconds?: number;
}

/**
 * Model in Registry
 */
export interface RegisteredModel {
  id: string;
  name: string;
  description: string;
  problem_type: 'classification' | 'regression' | 'clustering' | 'other';
  current_version: string;
  latest_version: string;
  total_versions: number;
  status: ModelStatus;
  
  // Current version metrics
  best_accuracy: number;
  best_algorithm: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // Deployment info
  is_deployed: boolean;
  deployment_url?: string;
  deployed_version?: string;
  deployed_at?: string;
  
  // Source info
  source_dataset_id?: string;
  source_dataset_name?: string;
  training_job_id: string;
  
  // Tags and labels
  tags: string[];
  labels: Record<string, string>;
  
  // Versions
  versions: ModelVersion[];
}

/**
 * Model Details (full information)
 */
export interface ModelDetails extends RegisteredModel {
  // Features
  features: string[];
  feature_importance?: Record<string, number>;
  
  // Hyperparameters
  hyperparameters: Record<string, any>;
  
  // Training info
  training_config: {
    dataset_id: string;
    dataset_name: string;
    target_column: string;
    train_test_split: number;
    cross_validation_folds?: number;
    random_seed?: number;
  };
  
  // Performance metrics
  metrics: {
    train_score: number;
    test_score: number;
    validation_score?: number;
    confusion_matrix?: number[][];
    roc_auc?: number;
    feature_count: number;
    sample_count: number;
  };
  
  // Artifacts
  artifacts: {
    model_file: string;
    scaler_file?: string;
    feature_selector_file?: string;
    training_report?: string;
    confusion_matrix_plot?: string;
    roc_curve_plot?: string;
    feature_importance_plot?: string;
  };
  
  // Deployment history
  deployment_history: Array<{
    version: string;
    action: 'deployed' | 'rolled_back' | 'promoted' | 'archived';
    environment: 'production' | 'staging' | 'development';
    timestamp: string;
    deployed_by: string;
    notes?: string;
  }>;
  
  // Lineage
  lineage: {
    source_data: string;
    preprocessing_pipeline: string;
    training_job: string;
    parent_model_id?: string;
  };
}

/**
 * Deployment Request
 */
export interface DeployModelRequest {
  model_id: string;
  version: string;
  environment: 'production' | 'staging' | 'development';
  notes?: string;
}

/**
 * Get all registered models
 * GET /api/v1/models/registry
 */
export const getRegisteredModels = async (): Promise<RegisteredModel[]> => {
  return apiCall(
    apiClient.get('/api/v1/models/registry')
  );
};

/**
 * Get model details by ID
 * GET /api/v1/models/registry/{model_id}
 */
export const getModelDetails = async (modelId: string): Promise<ModelDetails> => {
  return apiCall(
    apiClient.get(`/api/v1/models/registry/${modelId}`)
  );
};

/**
 * Get model versions
 * GET /api/v1/models/registry/{model_id}/versions
 */
export const getModelVersions = async (modelId: string): Promise<ModelVersion[]> => {
  return apiCall(
    apiClient.get(`/api/v1/models/registry/${modelId}/versions`)
  );
};

/**
 * Deploy a model version
 * POST /api/v1/models/registry/{model_id}/deploy
 */
export const deployModel = async (request: DeployModelRequest): Promise<any> => {
  return apiCall(
    apiClient.post(`/api/v1/models/registry/${request.model_id}/deploy`, {
      version: request.version,
      environment: request.environment,
      notes: request.notes,
    })
  );
};

/**
 * Rollback to a previous version
 * POST /api/v1/models/registry/{model_id}/rollback
 */
export const rollbackModel = async (modelId: string, version: string): Promise<any> => {
  return apiCall(
    apiClient.post(`/api/v1/models/registry/${modelId}/rollback`, {
      version,
    })
  );
};

/**
 * Archive a model
 * POST /api/v1/models/registry/{model_id}/archive
 */
export const archiveModel = async (modelId: string): Promise<any> => {
  return apiCall(
    apiClient.post(`/api/v1/models/registry/${modelId}/archive`)
  );
};

/**
 * Delete a model
 * DELETE /api/v1/models/registry/{model_id}
 */
export const deleteModel = async (modelId: string): Promise<any> => {
  return apiCall(
    apiClient.delete(`/api/v1/models/registry/${modelId}`)
  );
};

/**
 * Update model metadata
 * PATCH /api/v1/models/registry/{model_id}
 */
export const updateModelMetadata = async (
  modelId: string,
  data: Partial<Pick<RegisteredModel, 'name' | 'description' | 'tags' | 'labels'>>
): Promise<RegisteredModel> => {
  return apiCall(
    apiClient.patch(`/api/v1/models/registry/${modelId}`, data)
  );
};

/**
 * Promote model version to production
 * POST /api/v1/models/registry/{model_id}/promote
 */
export const promoteModelVersion = async (modelId: string, version: string): Promise<any> => {
  return apiCall(
    apiClient.post(`/api/v1/models/registry/${modelId}/promote`, {
      version,
      environment: 'production',
    })
  );
};
