/**
 * Model Registry Service
 * Handles all Model Registry API calls
 */

import { apiClient } from '../api/client';

const BASE_PATH = '/api/v1/models/registry';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RegisterModelRequest {
  project_id: string;
  name: string;
  description?: string;
  tags?: string[];
  created_by?: string;
  // Optional fields for manual registration
  problem_type?: string;
  algorithm?: string;
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    train_score?: number;
    test_score?: number;
    roc_auc?: number;
  };
  // Dataset metadata for Kedro source code generation
  collection_id?: string; // Collection UUID for multi-table datasets (optional)
  dataset_path?: string; // File path for single or multi-table datasets (optional)
}

export interface ModelVersion {
  id: string;
  version: string;
  version_number: number;
  status: 'draft' | 'staging' | 'production' | 'archived';
  algorithm: string;
  accuracy: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  train_score?: number;
  test_score?: number;
  roc_auc?: number;
  is_current: boolean;
  job_id?: string;
  model_size_mb?: number;
  training_time_seconds?: number;
  created_by: string;
  created_at: string;
  tags?: string[];
  hyperparameters?: Record<string, any>;
  feature_names?: string[];
  feature_importances?: Record<string, number>;
  confusion_matrix?: number[][];
  training_config?: Record<string, any>;
  artifacts?: ModelArtifact[];
}

export interface ModelArtifact {
  id: string;
  artifact_name: string;
  artifact_type: 'model' | 'scaler' | 'plot' | 'report';
  file_path: string;
  file_size_bytes: number;
  created_at: string;
}

export interface RegisteredModel {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  problem_type?: string;
  current_version: string;
  latest_version: string;
  total_versions: number;
  status: 'draft' | 'staging' | 'production' | 'archived';
  best_accuracy?: number;
  best_algorithm?: string;
  is_deployed: boolean;
  deployment_url?: string;
  deployed_version?: string;
  deployed_at?: string;
  source_dataset_id?: string;
  source_dataset_name?: string;
  training_job_id?: string;
  // Dataset metadata for Kedro source code generation
  collection_id?: string | null; // Collection UUID for multi-table datasets (optional)
  dataset_path?: string | null; // File path for single or multi-table datasets (optional)
  tags?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  versions?: ModelVersion[];
}

export interface ModelRegistryStats {
  total_models: number;
  deployed: number;
  production: number;
  staging: number;
  draft: number;
  archived: number;
}

export interface ListModelsParams {
  project_id: string;
  status?: 'draft' | 'staging' | 'production' | 'archived';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  tags?: string[];
  labels?: Record<string, string>;
}

export interface PromoteModelRequest {
  target_status: 'staging' | 'production';
}

export interface DeployModelRequest {
  environment: 'production' | 'staging' | 'development';
  notes?: string;
}

export interface AutoDetectResponse {
  status: string;
  detected: {
    problem_type: string;
    best_algorithm: string;
    best_accuracy: number;
    best_train_score: number;
    best_test_score: number;
    all_algorithms: Array<{
      Algorithm: string;
      Train_Score: string;
      Test_Score: string;
      Diff: string;
    }>;
    evaluation_metrics: {
      train_score: number;
      test_score: number;
      problem_type: string;
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      roc_auc: number;
    };
    model_file_path: string;
    model_file_size: number;
    scaler_file_path: string;
    artifacts: Array<{
      name: string;
      type: string;
      path: string;
      size: number;
    }>;
  };
  message: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Auto-detect training results from Kedro output files
 */
export async function autoDetectTrainingResults(): Promise<AutoDetectResponse> {
  const response = await apiClient.get(`${BASE_PATH}/auto-detect`);
  return response.data;
}

/**
 * Get Model Registry statistics
 */
export async function getRegistryStats(projectId: string): Promise<ModelRegistryStats> {
  const response = await apiClient.get(`${BASE_PATH}/stats`, {
    params: { project_id: projectId },
  });
  return response.data;
}

/**
 * Register a new model
 */
export async function registerModel(request: RegisterModelRequest): Promise<{
  status: string;
  message: string;
  model: RegisteredModel;
}> {
  const response = await apiClient.post(BASE_PATH, request);
  return response.data;
}

/**
 * List all models
 */
export async function listModels(params: ListModelsParams): Promise<{
  models: RegisteredModel[];
  total: number;
  limit: number;
  offset: number;
}> {
  const response = await apiClient.get(BASE_PATH, { params });
  console.log('🔍 listModels raw response.data:', response.data);
  console.log('🔍 listModels params sent:', params);
  return response.data;
}

/**
 * Get model details by ID
 */
export async function getModelById(modelId: string): Promise<RegisteredModel> {
  const response = await apiClient.get(`${BASE_PATH}/${modelId}`);
  return response.data;
}

/**
 * Get all versions of a model
 */
export async function getModelVersions(modelId: string): Promise<{
  model_id: string;
  versions: ModelVersion[];
  total: number;
}> {
  const response = await apiClient.get(`${BASE_PATH}/${modelId}/versions`);
  return response.data;
}

/**
 * Get artifacts for a model
 */
export async function getModelArtifacts(modelId: string, version?: string): Promise<{
  model_id: string;
  version: string;
  artifacts: ModelArtifact[];
  total: number;
}> {
  const params = version ? { version } : {};
  const response = await apiClient.get(`${BASE_PATH}/${modelId}/artifacts`, { params });
  return response.data;
}

/**
 * Update model metadata
 */
export async function updateModel(
  modelId: string,
  request: UpdateModelRequest
): Promise<{
  status: string;
  model: RegisteredModel;
}> {
  const response = await apiClient.patch(`${BASE_PATH}/${modelId}`, request);
  return response.data;
}

/**
 * Promote model to different status
 */
export async function promoteModel(
  modelId: string,
  request: PromoteModelRequest
): Promise<{
  status: string;
  model: RegisteredModel;
  message: string;
}> {
  const response = await apiClient.post(`${BASE_PATH}/${modelId}/promote`, request);
  return response.data;
}

/**
 * Deploy model
 */
export async function deployModel(
  modelId: string,
  request: DeployModelRequest
): Promise<{
  status: string;
  model_id: string;
  version: string;
  environment: string;
  deployed_at: string;
  message: string;
}> {
  const response = await apiClient.post(`${BASE_PATH}/${modelId}/deploy`, request);
  return response.data;
}

/**
 * Archive model
 */
export async function archiveModel(modelId: string): Promise<{
  status: string;
  model: RegisteredModel;
  message: string;
}> {
  const response = await apiClient.post(`${BASE_PATH}/${modelId}/archive`);
  return response.data;
}

/**
 * Delete model
 */
export async function deleteModel(modelId: string): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.delete(`${BASE_PATH}/${modelId}`);
  return response.data;
}

/**
 * Download artifact
 */
export async function downloadArtifact(artifactId: string): Promise<Blob> {
  const response = await apiClient.get(`${BASE_PATH}/artifacts/${artifactId}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Auto-register model after ML Flow training completes
 */
export async function autoRegisterFromMLFlow(
  projectId: string,
  jobName: string,
  createdBy: string,
  collectionId?: string, // Collection UUID for multi-table datasets (optional)
  datasetPath?: string // File path for single or multi-table datasets (optional)
): Promise<RegisteredModel> {
  try {
    // 1. Auto-detect training results
    const detected = await autoDetectTrainingResults();

    // 2. Register model with detected data
    const response = await registerModel({
      project_id: projectId,
      name: jobName || 'ML Flow Model',
      description: `${detected.detected.problem_type} model trained via ML Flow`,
      tags: [detected.detected.problem_type, 'ml-flow'],
      created_by: createdBy,
      collection_id: collectionId, // Pass collection ID if available
      dataset_path: datasetPath, // Pass dataset path if available
    });

    return response.model;
  } catch (error: any) {
    console.error('Failed to auto-register model:', error);
    throw new Error(error.response?.data?.detail || 'Failed to auto-register model');
  }
}