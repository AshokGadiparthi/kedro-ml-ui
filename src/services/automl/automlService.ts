/**
 * AutoML Service
 * Handles all AutoML-related API calls
 */

import apiClient, { apiCall } from '../api/client';
import { useMockData } from '../../config/environment';
import type {
  StartAutoMLRequest,
  AutoMLJobResponse,
  AutoMLJobStatus_Response,
  AutoMLResults,
  AutoMLJobsListResponse,
  StopAutoMLResponse,
  DeployAutoMLModelRequest,
  DeployAutoMLModelResponse,
} from '../api/types';

/**
 * Start a new AutoML job
 */
export const startAutoMLJob = async (request: StartAutoMLRequest): Promise<AutoMLJobResponse> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      jobId: `automl-job-${Date.now()}`,
      projectId: request.projectId,
      datasetId: request.datasetId,
      name: request.name,
      status: 'QUEUED',
      problemType: request.problemType,
      targetColumn: request.targetColumn,
      maxTrainingTimeMinutes: request.maxTrainingTimeMinutes,
      createdAt: new Date().toISOString(),
      message: 'AutoML job queued successfully',
    };
  }

  return apiCall(apiClient.post('/api/automl/jobs', request));
};

/**
 * Get AutoML job status and progress
 */
export const getAutoMLJobStatus = async (jobId: string): Promise<AutoMLJobStatus_Response> => {
  if (useMockData()) {
    // Simulate different states based on random
    const states = ['RUNNING', 'COMPLETED'];
    const status = states[Math.floor(Math.random() * states.length)] as any;

    if (status === 'RUNNING') {
      return {
        jobId,
        name: 'Customer Churn AutoML',
        status: 'RUNNING',
        progress: 45,
        currentPhase: 'ALGORITHM_SELECTION',
        currentAlgorithm: 'XGBoost',
        phases: [
          { name: 'DATA_VALIDATION', status: 'COMPLETED', progress: 100 },
          { name: 'FEATURE_ENGINEERING', status: 'COMPLETED', progress: 100 },
          { name: 'ALGORITHM_SELECTION', status: 'RUNNING', progress: 60 },
          { name: 'MODEL_TRAINING', status: 'PENDING', progress: 0 },
          { name: 'EVALUATION', status: 'PENDING', progress: 0 },
        ],
        algorithmsCompleted: 3,
        algorithmsTotal: 5,
        currentBestScore: 0.923,
        currentBestAlgorithm: 'XGBoost',
        elapsedTimeSeconds: 180,
        estimatedRemainingSeconds: 220,
        logs: [
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'AutoML job started' },
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'Data validation completed' },
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'Feature engineering: 15 features created' },
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'Testing Logistic Regression...' },
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'Logistic Regression: 0.876 accuracy' },
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'Testing Random Forest...' },
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'Random Forest: 0.912 accuracy' },
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'Testing XGBoost...' },
          { timestamp: new Date().toISOString(), level: 'INFO', message: 'XGBoost: 0.923 accuracy - New best!' },
        ],
      };
    }

    return {
      jobId,
      name: 'Customer Churn AutoML',
      status: 'COMPLETED',
      progress: 100,
      currentPhase: 'EVALUATION',
      phases: [
        { name: 'DATA_VALIDATION', status: 'COMPLETED', progress: 100 },
        { name: 'FEATURE_ENGINEERING', status: 'COMPLETED', progress: 100 },
        { name: 'ALGORITHM_SELECTION', status: 'COMPLETED', progress: 100 },
        { name: 'MODEL_TRAINING', status: 'COMPLETED', progress: 100 },
        { name: 'EVALUATION', status: 'COMPLETED', progress: 100 },
      ],
      completedAt: new Date().toISOString(),
      elapsedTimeSeconds: 360,
      bestModelId: 'model-001',
      bestAlgorithm: 'XGBoost',
      bestScore: 0.934,
      bestMetric: 'accuracy',
    };
  }

  return apiCall(apiClient.get(`/automl/jobs/${jobId}`));
};

/**
 * Get AutoML job results (leaderboard)
 */
export const getAutoMLJobResults = async (jobId: string): Promise<AutoMLResults> => {
  if (useMockData()) {
    return {
      jobId,
      status: 'COMPLETED',
      problemType: 'classification',
      targetColumn: 'churn',
      datasetInfo: {
        totalRows: 10000,
        totalFeatures: 15,
        trainSize: 8000,
        testSize: 2000,
      },
      featureEngineering: {
        enabled: true,
        scalingMethod: 'standard',
        originalFeatures: 12,
        engineeredFeatures: 15,
        featuresUsed: [
          'age',
          'tenure',
          'monthly_charges',
          'total_charges',
          'contract_type_Month-to-month',
          'payment_method_Electronic_check',
        ],
      },
      leaderboard: [
        {
          rank: 1,
          modelId: 'model-001',
          algorithm: 'XGBoost',
          accuracy: 0.934,
          precision: 0.921,
          recall: 0.908,
          f1Score: 0.914,
          auc: 0.956,
          trainingTimeSeconds: 45,
          cvScore: 0.928,
          cvStd: 0.015,
        },
        {
          rank: 2,
          modelId: 'model-002',
          algorithm: 'Gradient Boosting',
          accuracy: 0.921,
          precision: 0.912,
          recall: 0.895,
          f1Score: 0.903,
          auc: 0.948,
          trainingTimeSeconds: 52,
          cvScore: 0.918,
          cvStd: 0.018,
        },
        {
          rank: 3,
          modelId: 'model-003',
          algorithm: 'Random Forest',
          accuracy: 0.912,
          precision: 0.905,
          recall: 0.887,
          f1Score: 0.896,
          auc: 0.941,
          trainingTimeSeconds: 38,
          cvScore: 0.908,
          cvStd: 0.021,
        },
        {
          rank: 4,
          modelId: 'model-004',
          algorithm: 'SVM',
          accuracy: 0.895,
          precision: 0.889,
          recall: 0.872,
          f1Score: 0.88,
          auc: 0.923,
          trainingTimeSeconds: 120,
          cvScore: 0.891,
          cvStd: 0.024,
        },
        {
          rank: 5,
          modelId: 'model-005',
          algorithm: 'Logistic Regression',
          accuracy: 0.876,
          precision: 0.865,
          recall: 0.851,
          f1Score: 0.858,
          auc: 0.912,
          trainingTimeSeconds: 5,
          cvScore: 0.872,
          cvStd: 0.019,
        },
      ],
      bestModel: {
        modelId: 'model-001',
        algorithm: 'XGBoost',
        modelPath: 'models/automl_xgboost_model.pkl',
        featureEngineerPath: 'models/feature_engineer.pkl',
        featureNamesPath: 'models/feature_names.pkl',
      },
      featureImportance: [
        { feature: 'tenure', importance: 0.185 },
        { feature: 'monthly_charges', importance: 0.152 },
        { feature: 'total_charges', importance: 0.128 },
        { feature: 'contract_type_Month-to-month', importance: 0.095 },
        { feature: 'payment_method_Electronic_check', importance: 0.087 },
        { feature: 'age', importance: 0.065 },
        { feature: 'internet_service_Fiber_optic', importance: 0.053 },
        { feature: 'tech_support_No', importance: 0.042 },
      ],
      comparisonCsvPath: 'models/automl_comparison.csv',
    };
  }

  return apiCall(apiClient.get(`/automl/jobs/${jobId}/results`));
};

/**
 * List AutoML jobs
 */
export const listAutoMLJobs = async (
  projectId?: string,
  status?: string,
  page: number = 0,
  size: number = 10
): Promise<AutoMLJobsListResponse> => {
  if (useMockData()) {
    return {
      content: [
        {
          jobId: 'automl-job-789',
          name: 'Customer Churn AutoML',
          projectId: projectId,
          status: 'COMPLETED',
          problemType: 'classification',
          bestAlgorithm: 'XGBoost',
          bestScore: 0.934,
          algorithmsCount: 5,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 5.9 * 60 * 60 * 1000).toISOString(),
          elapsedTimeSeconds: 360,
        },
        {
          jobId: 'automl-job-788',
          name: 'Revenue Prediction',
          projectId: projectId,
          status: 'RUNNING',
          problemType: 'regression',
          algorithmsCount: 5,
          createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          elapsedTimeSeconds: 180,
        },
      ],
      totalElements: 2,
      totalPages: 1,
      page: 0,
      size: 10,
    };
  }

  return apiCall(
    apiClient.get('/api/automl/jobs', {
      params: { projectId, status, page, size },
    })
  );
};

/**
 * Stop a running AutoML job
 */
export const stopAutoMLJob = async (jobId: string): Promise<StopAutoMLResponse> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      jobId,
      status: 'STOPPED',
      message: 'AutoML job stopped',
      algorithmsCompleted: 3,
      bestScoreAchieved: 0.923,
      stoppedAt: new Date().toISOString(),
    };
  }

  return apiCall(apiClient.post(`/automl/jobs/${jobId}/stop`));
};

/**
 * Deploy best model from AutoML job (NEW API)
 */
export const deployAutoMLModel = async (
  jobId: string,
  request: DeployAutoMLModelRequest
): Promise<DeployAutoMLModelResponse> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      deploymentId: `deploy-${Date.now()}`,
      modelId: request.modelId,
      name: request.deploymentName,
      status: 'DEPLOYED',
      endpoint: `/api/predictions/realtime/deploy-${Date.now()}`,
      deployedAt: new Date().toISOString(),
    };
  }

  // NEW: Use deployment/from-automl API
  return apiCall(apiClient.post(`/deployments/from-automl/${jobId}`, {
    name: request.deploymentName,
    description: request.description,
  }));
};