/**
 * Training Service
 * API calls for model training
 */

import apiClient, { apiCall } from '../api/client';
import { useMockData } from '../../config/environment';
import {
  TrainingJob,
  TrainingJobListItem,
  TrainingProgress,
  CreateTrainingJobRequest,
  TrainingMetrics,
  Algorithm,
  AlgorithmList,
  AlgorithmParams,
  RecommendedSettings,
} from '../api/types';
import { mockTrainingJobs, mockAlgorithms, mockAlgorithmsList } from '../api/mockData';

/**
 * List all training jobs for a project
 */
export const getTrainingJobs = async (projectId?: string): Promise<TrainingJobListItem[]> => {
  if (useMockData()) {
    return mockTrainingJobs.map(job => ({
      id: job.id,
      jobName: job.jobName || job.name,
      algorithm: job.algorithm,
      algorithmDisplayName: job.algorithmDisplayName || job.algorithm,
      datasetName: job.datasetName || 'Unknown Dataset',
      status: job.status,
      statusLabel: job.statusLabel || job.status,
      progress: job.progress,
      progressLabel: job.progressLabel || `${job.progress}%`,
      currentAccuracy: job.currentAccuracy,
      currentAccuracyLabel: job.currentAccuracyLabel,
      startedAt: job.startedAt,
      startedAtLabel: job.startedAtLabel,
      etaLabel: job.etaLabel,
    }));
  }

  const url = projectId ? `/training/jobs?projectId=${projectId}` : '/training/jobs';
  return apiCall(apiClient.get<TrainingJobListItem[]>(url));
};

/**
 * Get training job by ID
 */
export const getTrainingJobById = async (id: string): Promise<TrainingJob> => {
  if (useMockData()) {
    const job = mockTrainingJobs.find((j) => j.id === id);
    if (!job) {
      throw {
        status: 404,
        message: 'Training job not found',
        code: 'JOB_NOT_FOUND',
      };
    }
    return job;
  }

  return apiCall(apiClient.get<TrainingJob>(`/training/jobs/${id}`));
};

/**
 * Get training job progress (poll this during training)
 */
export const getTrainingProgress = async (id: string): Promise<TrainingProgress> => {
  if (useMockData()) {
    const job = mockTrainingJobs.find((j) => j.id === id);
    if (!job) {
      throw {
        status: 404,
        message: 'Training job not found',
        code: 'JOB_NOT_FOUND',
      };
    }
    
    return {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      currentEpoch: job.currentEpoch,
      totalEpochs: job.totalEpochs,
      currentAccuracy: job.currentAccuracy,
      currentLoss: job.currentLoss,
      etaSeconds: job.etaSeconds,
      etaLabel: job.etaLabel,
      message: job.statusMessage || `Training epoch ${job.currentEpoch}/${job.totalEpochs}`,
    };
  }

  return apiCall(apiClient.get<TrainingProgress>(`/training/jobs/${id}/progress`));
};

/**
 * Start training job
 */
export const startTrainingJob = async (
  data: CreateTrainingJobRequest
): Promise<TrainingJob> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newJob: TrainingJob = {
      id: `job_${Date.now()}`,
      jobName: data.experimentName || 'Training Job',
      experimentName: data.experimentName || 'Training Job',
      status: 'queued',
      statusLabel: 'Queued',
      statusMessage: null,
      progress: 0,
      progressLabel: '0/100',
      currentEpoch: 0,
      totalEpochs: 100,
      currentAccuracy: null,
      currentAccuracyLabel: null,
      bestAccuracy: null,
      currentLoss: null,
      datasetId: data.datasetId,
      datasetName: 'Dataset Name',
      algorithm: data.algorithm,
      algorithmDisplayName: data.algorithm.toUpperCase(),
      targetVariable: data.targetVariable,
      problemType: data.problemType,
      trainTestSplit: data.trainTestSplit || 0.8,
      crossValidationFolds: data.crossValidationFolds || 5,
      hyperparameters: data.hyperparameters || {},
      gpuAcceleration: data.gpuAcceleration || false,
      autoHyperparameterTuning: data.autoHyperparameterTuning || false,
      earlyStopping: data.earlyStopping || true,
      earlyStoppingPatience: data.earlyStoppingPatience || 10,
      batchSize: data.batchSize || 32,
      evaluationMetric: data.evaluationMetric || 'accuracy',
      startedAt: null,
      startedAtLabel: null,
      completedAt: null,
      etaSeconds: null,
      etaLabel: null,
      durationSeconds: null,
      durationLabel: null,
      modelId: null,
      metrics: null,
      computeResources: 'CPU',
      costEstimate: 0.05,
      costLabel: '$0.05',
      errorMessage: null,
      projectId: data.projectId || '',
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    
    return newJob;
  }

  return apiCall(apiClient.post<TrainingJob>('/training/jobs', data));
};

/**
 * Pause training job
 */
export const pauseTrainingJob = async (id: string): Promise<TrainingJob> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const job = mockTrainingJobs.find((j) => j.id === id);
    if (!job) {
      throw {
        status: 404,
        message: 'Training job not found',
        code: 'JOB_NOT_FOUND',
      };
    }
    
    return {
      ...job,
      status: 'paused',
      statusLabel: 'Paused',
    };
  }

  return apiCall(apiClient.post<TrainingJob>(`/training/jobs/${id}/pause`));
};

/**
 * Resume training job
 */
export const resumeTrainingJob = async (id: string): Promise<TrainingJob> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const job = mockTrainingJobs.find((j) => j.id === id);
    if (!job) {
      throw {
        status: 404,
        message: 'Training job not found',
        code: 'JOB_NOT_FOUND',
      };
    }
    
    return {
      ...job,
      status: 'running',
      statusLabel: 'Training',
    };
  }

  return apiCall(apiClient.post<TrainingJob>(`/training/jobs/${id}/resume`));
};

/**
 * Stop training job
 */
export const stopTrainingJob = async (id: string): Promise<TrainingJob> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const job = mockTrainingJobs.find((j) => j.id === id);
    if (!job) {
      throw {
        status: 404,
        message: 'Training job not found',
        code: 'JOB_NOT_FOUND',
      };
    }
    
    return {
      ...job,
      status: 'cancelled',
      statusLabel: 'Stopped',
    };
  }

  return apiCall(apiClient.post<TrainingJob>(`/training/jobs/${id}/stop`));
};

/**
 * Delete training job
 */
export const deleteTrainingJob = async (id: string): Promise<void> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return;
  }

  return apiCall(apiClient.delete(`/training/jobs/${id}`));
};

/**
 * Get all available algorithms
 */
export const getAlgorithms = async (): Promise<AlgorithmList> => {
  if (useMockData()) {
    return mockAlgorithmsList;
  }

  return apiCall(apiClient.get<AlgorithmList>('/algorithms'));
};

/**
 * Get algorithm hyperparameters
 */
export const getAlgorithmParams = async (algorithmId: string): Promise<AlgorithmParams> => {
  if (useMockData()) {
    // Mock XGBoost params
    return {
      algorithmId,
      algorithmName: algorithmId.toUpperCase(),
      parameters: [
        {
          name: 'n_estimators',
          displayName: 'Number of Estimators',
          type: 'integer',
          defaultValue: 100,
          min: 10,
          max: 1000,
          step: 10,
          description: 'Number of boosting rounds',
        },
        {
          name: 'max_depth',
          displayName: 'Max Depth',
          type: 'integer',
          defaultValue: 6,
          min: 1,
          max: 20,
          step: 1,
          description: 'Maximum tree depth',
        },
        {
          name: 'learning_rate',
          displayName: 'Learning Rate',
          type: 'float',
          defaultValue: 0.1,
          min: 0.01,
          max: 1.0,
          step: 0.01,
          description: 'Step size shrinkage',
        },
      ],
    };
  }

  return apiCall(apiClient.get<AlgorithmParams>(`/algorithms/${algorithmId}/params`));
};

/**
 * Get training job logs
 */
export const getTrainingLogs = async (id: string): Promise<string[]> => {
  if (useMockData()) {
    return [
      '[2026-01-10 10:00:00] Starting training job...',
      '[2026-01-10 10:00:15] Loading dataset (125,000 rows)',
      '[2026-01-10 10:00:30] Preprocessing data...',
      '[2026-01-10 10:01:00] Split data: 80% train, 20% test',
      '[2026-01-10 10:01:15] Training XGBoost model...',
      '[2026-01-10 10:05:00] Epoch 1/100 - Accuracy: 0.78',
      '[2026-01-10 10:08:00] Epoch 10/100 - Accuracy: 0.85',
      '[2026-01-10 10:15:00] Epoch 50/100 - Accuracy: 0.91',
      '[2026-01-10 10:20:00] Current epoch: 67/100 - Accuracy: 0.912',
    ];
  }

  return apiCall(apiClient.get<string[]>(`/training/jobs/${id}/logs`));
};

/**
 * Get live training metrics
 */
export const getTrainingMetrics = async (id: string): Promise<TrainingMetrics[]> => {
  if (useMockData()) {
    return [
      { epoch: 1, trainLoss: 0.65, valLoss: 0.68, trainAccuracy: 0.78, valAccuracy: 0.75, timestamp: '2026-01-10T10:05:00Z' },
      { epoch: 10, trainLoss: 0.42, valLoss: 0.45, trainAccuracy: 0.85, valAccuracy: 0.83, timestamp: '2026-01-10T10:08:00Z' },
      { epoch: 50, trainLoss: 0.28, valLoss: 0.32, trainAccuracy: 0.91, valAccuracy: 0.89, timestamp: '2026-01-10T10:15:00Z' },
      { epoch: 67, trainLoss: 0.25, valLoss: 0.30, trainAccuracy: 0.925, valAccuracy: 0.912, timestamp: '2026-01-10T10:20:00Z' },
    ];
  }

  return apiCall(apiClient.get<TrainingMetrics[]>(`/training/jobs/${id}/metrics`));
};

/**
 * Get recommended training settings for a dataset (OPTIONAL API - graceful fallback)
 */
export const getRecommendedSettings = async (
  datasetId: string,
  problemType: string,
  targetColumn: string
): Promise<RecommendedSettings> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return {
      algorithm: 'xgboost',
      hyperparameters: {
        max_depth: 6,
        learning_rate: 0.1,
        n_estimators: 100,
      },
      trainTestSplit: 0.8,
      crossValidationFolds: 5,
      expectedAccuracy: 0.87,
      estimatedTrainingTime: 300,
      reason: 'XGBoost is recommended for this dataset based on size and features',
    };
  }

  try {
    return await apiCall(
      apiClient.get<RecommendedSettings>('/algorithms/recommend', {
        params: { datasetId, problemType, targetColumn },
      })
    );
  } catch (error: any) {
    // ⚠️ GRACEFUL FALLBACK: If endpoint doesn't exist, return null
    console.warn('Recommendations API not available:', error.message);
    
    // Return basic recommendations based on problem type
    return {
      algorithm: problemType === 'CLASSIFICATION' ? 'xgboost' : 'linear_regression',
      hyperparameters: {
        max_depth: 6,
        learning_rate: 0.1,
        n_estimators: 100,
      },
      trainTestSplit: 0.8,
      crossValidationFolds: 5,
      expectedAccuracy: undefined,
      estimatedTrainingTime: undefined,
      reason: undefined,
    };
  }
};

/**
 * Get training results
 */
export const getTrainingResults = async (jobId: string): Promise<any> => {
  if (useMockData()) {
    const job = mockTrainingJobs.find((j) => j.id === jobId);
    if (!job) {
      throw {
        status: 404,
        message: 'Training job not found',
        code: 'JOB_NOT_FOUND',
      };
    }
    
    return {
      jobId: job.id,
      jobName: job.jobName || job.name,
      status: job.status,
      algorithm: job.algorithm,
      algorithmDisplayName: job.algorithmDisplayName || job.algorithm,
      problemType: job.problemType,
      accuracy: job.currentAccuracy || 0.93,
      accuracyLabel: job.currentAccuracyLabel || '93.0%',
      precision: 0.91,
      recall: 0.94,
      f1Score: 0.925,
      aucRoc: 0.96,
      modelId: job.modelId || `model_${job.id}`,
      modelPath: `training-model-${job.id}`,
      isDeployed: false, // Mock: not deployed yet
      endpointUrl: null,
      datasetId: job.datasetId,
      datasetName: job.datasetName || 'Unknown Dataset',
      targetVariable: job.targetVariable,
      trainTestSplit: job.trainTestSplit || 0.8,
      crossValidationFolds: job.crossValidationFolds || 5,
      trainingDuration: job.durationSeconds || 105,
      trainingDurationLabel: job.durationLabel || '1 min 45 sec',
      startedAt: job.startedAt || new Date().toISOString(),
      completedAt: job.completedAt || new Date().toISOString(),
    };
  }

  return apiCall(apiClient.get(`/training/jobs/${jobId}/results`));
};

/**
 * Deploy model from training job
 */
export const deployTrainingModel = async (
  jobId: string,
  deployRequest: { deploymentName?: string; description?: string; environment?: string }
): Promise<any> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return {
      deploymentId: `model_${jobId}`,
      modelId: `model_${jobId}`,
      name: deployRequest.deploymentName || 'Training Model',
      algorithm: 'xgboost',
      algorithmDisplayName: 'XGBoost (Gradient Boosting)',
      accuracy: 0.93,
      accuracyLabel: '93.0%',
      endpointUrl: `/api/predictions/realtime/training-model-${jobId}`,
      status: 'DEPLOYED',
      deployedAt: new Date().toISOString(),
      message: 'Model deployed successfully',
    };
  }

  // Use new deployment API
  const deploymentService = await import('../deployment/deploymentService');
  return deploymentService.deployFromTraining(jobId, deployRequest);
};

/**
 * Get deployment status for training job
 */
export const getDeploymentStatus = async (jobId: string): Promise<any> => {
  if (useMockData()) {
    return {
      jobId,
      modelId: `model_${jobId}`,
      isDeployed: false,
      deployedAt: null,
      endpointUrl: null,
      canDeploy: true,
    };
  }

  return apiCall(apiClient.get(`/training/jobs/${jobId}/deployment-status`));
};

/**
 * Export all training service methods
 */
export const trainingService = {
  getTrainingJobs,
  getTrainingJobById,
  getTrainingProgress,
  startTrainingJob,
  pauseTrainingJob,
  resumeTrainingJob,
  stopTrainingJob,
  deleteTrainingJob,
  getAlgorithms,
  getAlgorithmParams,
  getTrainingLogs,
  getTrainingMetrics,
  getRecommendedSettings,
  getTrainingResults,
  deployTrainingModel,
  getDeploymentStatus,
};

export default trainingService;