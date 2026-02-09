/**
 * Model Service
 * API service layer for model management endpoints
 */

import apiClient from '../api/client';
import type { 
  Model, 
  ModelCreateRequest, 
  ModelUpdateRequest 
} from './types';
import * as modelRegistryService from '../registry/modelRegistryService';

/**
 * Get all trained models for a project
 * Uses Model Registry auto-detect API to get available trained models
 */
export async function getModels(projectId: string): Promise<Model[]> {
  try {
    console.log('🔍 Fetching models using Registry auto-detect API...');
    
    // Call the Model Registry auto-detect endpoint
    const autoDetectResponse = await modelRegistryService.autoDetectTrainingResults();
    
    console.log('✅ Auto-detect response:', autoDetectResponse);
    
    // Transform the auto-detect response to Model[] format
    // Backend returns status: "ok" (not "success")
    if ((autoDetectResponse.status === 'success' || autoDetectResponse.status === 'ok') && autoDetectResponse.detected) {
      const detected = autoDetectResponse.detected;
      
      console.log('🎯 Detected data:', {
        best_algorithm: detected.best_algorithm,
        best_accuracy: detected.best_accuracy,
        problem_type: detected.problem_type,
        all_algorithms_count: detected.all_algorithms?.length || 0
      });
      
      // Create a model object from the detected results
      const model: Model = {
        id: `auto-detected-${Date.now()}`,
        name: `${detected.best_algorithm} Model`,
        project_id: projectId,
        algorithm: detected.best_algorithm,
        algorithmDisplayName: detected.best_algorithm,
        problem_type: detected.problem_type,
        status: 'completed',
        statusLabel: 'Completed',
        accuracy: detected.best_accuracy,
        created_at: new Date(),
        trained_by: 'System',
        version: '1.0',
        is_deployed: false,
        isDeployed: false,
        source: 'TRAINING',
        metrics: {
          accuracy: detected.evaluation_metrics.accuracy,
          precision: detected.evaluation_metrics.precision,
          recall: detected.evaluation_metrics.recall,
          f1_score: detected.evaluation_metrics.f1,
          auc_roc: detected.evaluation_metrics.roc_auc,
          train_score: detected.best_train_score,
          test_score: detected.best_test_score,
        },
      };
      
      console.log('✅ Transformed model for evaluation:', model);
      
      return [model];
    }
    
    console.warn('⚠️ No models detected in auto-detect response');
    return [];
  } catch (error: any) {
    console.error('❌ Failed to fetch models from auto-detect:', error);
    console.warn('📦 Using mock data for models');
    return getMockModels(projectId);
  }
}

/**
 * Get a specific model by ID
 */
export async function getModel(modelId: string): Promise<Model> {
  try {
    const response = await apiClient.get(`/api/models/${modelId}`);
    return response.data;
  } catch (error) {
    console.warn('Using mock data for model');
    return getMockModel(modelId);
  }
}

/**
 * Create a new model
 * NOTE: projectId is required in the URL path
 */
export async function createModel(projectId: string, request: ModelCreateRequest): Promise<Model> {
  try {
    // ✅ CORRECT: POST /api/models/{projectId}
    const response = await apiClient.post(`/api/models/${projectId}`, request);
    return response.data;
  } catch (error) {
    console.warn('Mock model creation');
    return getMockModel(request.name);
  }
}

/**
 * Update an existing model
 */
export async function updateModel(modelId: string, request: ModelUpdateRequest): Promise<Model> {
  try {
    const response = await apiClient.put(`/api/models/${modelId}`, request);
    return response.data;
  } catch (error) {
    console.warn('Mock model update');
    return getMockModel(modelId);
  }
}

/**
 * Delete a model
 */
export async function deleteModel(modelId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/models/${modelId}`);
  } catch (error) {
    console.warn('Mock model deletion');
  }
}

/**
 * Deploy a model
 */
export async function deployModel(modelId: string, config?: any): Promise<void> {
  try {
    await apiClient.post(`/api/models/${modelId}/deploy`, config);
  } catch (error) {
    console.warn('Mock deployment');
  }
}

// ============================================================================
// MOCK DATA FUNCTIONS
// ============================================================================

function getMockModels(projectId: string): Model[] {
  return [
    {
      id: 'model-1',
      name: 'Customer Churn XGBoost v1.2',
      project_id: projectId,
      algorithm: 'xgboost',
      problem_type: 'classification',
      status: 'deployed',
      accuracy: 0.958,
      created_at: new Date('2026-01-08T10:00:00'),
      trained_by: 'John Doe',
      dataset_id: 'dataset-1',
      dataset_name: 'Customer Churn Data',
      version: '1.2',
      is_deployed: true,
      metrics: {
        accuracy: 0.958,
        precision: 0.942,
        recall: 0.961,
        f1_score: 0.951,
        auc_roc: 0.982,
      },
    },
    {
      id: 'model-2',
      name: 'Fraud Detection Neural Network v2.0',
      project_id: projectId,
      algorithm: 'neural_network',
      problem_type: 'classification',
      status: 'completed',
      accuracy: 0.935,
      created_at: new Date('2026-01-07T14:30:00'),
      trained_by: 'Jane Smith',
      dataset_id: 'dataset-2',
      dataset_name: 'Transaction History',
      version: '2.0',
      is_deployed: false,
      metrics: {
        accuracy: 0.935,
        precision: 0.915,
        recall: 0.942,
        f1_score: 0.928,
        auc_roc: 0.968,
      },
    },
    {
      id: 'model-3',
      name: 'Revenue Prediction Random Forest v1.5',
      project_id: projectId,
      algorithm: 'random_forest',
      problem_type: 'regression',
      status: 'training',
      accuracy: 0.0,
      created_at: new Date('2026-01-08T15:00:00'),
      trained_by: 'John Doe',
      dataset_id: 'dataset-3',
      dataset_name: 'Sales Data',
      version: '1.5',
      is_deployed: false,
      metrics: {
        rmse: 0,
        mae: 0,
        r2_score: 0,
      },
    },
  ];
}

function getMockModel(modelId: string): Model {
  return {
    id: modelId,
    name: 'Customer Churn XGBoost v1.2',
    project_id: 'project-1',
    algorithm: 'xgboost',
    problem_type: 'classification',
    status: 'deployed',
    accuracy: 0.958,
    created_at: new Date('2026-01-08T10:00:00'),
    trained_by: 'John Doe',
    dataset_id: 'dataset-1',
    dataset_name: 'Customer Churn Data',
    version: '1.2',
    is_deployed: true,
    metrics: {
      accuracy: 0.958,
      precision: 0.942,
      recall: 0.961,
      f1_score: 0.951,
      auc_roc: 0.982,
    },
    hyperparameters: {
      max_depth: 6,
      learning_rate: 0.1,
      n_estimators: 100,
      min_child_weight: 1,
      subsample: 0.8,
      colsample_bytree: 0.8,
    },
    training_time_seconds: 1380,
    features_count: 45,
    training_samples: 1200000,
    test_samples: 300000,
  };
}