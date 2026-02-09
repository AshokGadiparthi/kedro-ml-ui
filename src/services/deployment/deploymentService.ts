/**
 * Deployment Service
 * API calls for deployment management, versioning, and rollback
 */

import apiClient, { apiCall } from '../api/client';
import { useMockData } from '../../config/environment';
import type {
  DeploymentResponse,
  DeploymentHistoryResponse,
  DeployFromAutoMLRequest,
  DeployFromTrainingRequest,
  RollbackRequest,
  DeactivateRequest,
  ActiveSummary,
  CompareResponse,
  PagedDeploymentResponse,
  DeploymentListItem,
} from '../api/types';

/**
 * Deploy model from AutoML job
 */
export const deployFromAutoML = async (
  autoMLJobId: string,
  request: DeployFromAutoMLRequest = {}
): Promise<DeploymentResponse> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return {
      id: `deployment_${Date.now()}`,
      name: request.name || `AutoML Deployment v${Math.floor(Math.random() * 10) + 1}`,
      description: request.description || null,
      projectId: 'project-123',
      projectName: 'ML Project',
      modelId: `model_${Date.now()}`,
      autoMLJobId,
      trainingJobId: null,
      version: Math.floor(Math.random() * 5) + 1,
      versionLabel: `v${Math.floor(Math.random() * 5) + 1}`,
      status: 'ACTIVE',
      statusLabel: 'active',
      isActive: true,
      algorithm: 'Random Forest',
      score: 0.925,
      metric: 'Accuracy',
      scoreFormatted: '92.5%',
      problemType: 'CLASSIFICATION',
      targetColumn: 'target',
      datasetName: 'dataset.csv',
      endpointUrl: `/api/predictions/realtime/model_${Date.now()}`,
      endpointPath: `/api/predictions/realtime/model_${Date.now()}`,
      deployedAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      deactivatedAt: null,
      createdAt: new Date().toISOString(),
      predictionsCount: 0,
      lastPredictionAt: null,
      deployedBy: request.deployedBy || null,
      deactivatedBy: null,
      deactivationReason: null,
      message: 'Model deployed successfully',
    };
  }

  return apiCall(
    apiClient.post<DeploymentResponse>(
      `/deployments/from-automl/${autoMLJobId}`,
      request
    )
  );
};

/**
 * Deploy model from Training job
 */
export const deployFromTraining = async (
  trainingJobId: string,
  request: DeployFromTrainingRequest = {}
): Promise<DeploymentResponse> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return {
      id: `deployment_${Date.now()}`,
      name: request.name || `Training Deployment v${Math.floor(Math.random() * 10) + 1}`,
      description: request.description || null,
      projectId: 'project-123',
      projectName: 'ML Project',
      modelId: `model_${Date.now()}`,
      autoMLJobId: null,
      trainingJobId,
      version: Math.floor(Math.random() * 5) + 1,
      versionLabel: `v${Math.floor(Math.random() * 5) + 1}`,
      status: 'ACTIVE',
      statusLabel: 'active',
      isActive: true,
      algorithm: 'XGBoost',
      score: 0.93,
      metric: 'accuracy',
      scoreFormatted: '93.0%',
      problemType: 'CLASSIFICATION',
      targetColumn: 'target',
      datasetName: 'dataset.csv',
      endpointUrl: `/api/predictions/realtime/model_${Date.now()}`,
      endpointPath: `/api/predictions/realtime/model_${Date.now()}`,
      deployedAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      deactivatedAt: null,
      createdAt: new Date().toISOString(),
      predictionsCount: 0,
      lastPredictionAt: null,
      deployedBy: request.deployedBy || null,
      deactivatedBy: null,
      deactivationReason: null,
      message: 'Model deployed successfully',
    };
  }

  return apiCall(
    apiClient.post<DeploymentResponse>(
      `/deployments/from-training/${trainingJobId}`,
      request
    )
  );
};

/**
 * Get active deployment for project
 */
export const getActiveDeployment = async (
  projectId: string
): Promise<DeploymentResponse | null> => {
  if (useMockData()) {
    return null; // Mock: no active deployment
  }

  return apiCall(
    apiClient.get<DeploymentResponse>(`/deployments/active?projectId=${projectId}`)
  );
};

/**
 * Get active deployment summary (for dashboard header)
 */
export const getActiveSummary = async (
  projectId: string
): Promise<ActiveSummary> => {
  if (useMockData()) {
    return {
      id: 'deployment-123',
      name: 'Random Forest v4',
      version: 4,
      versionLabel: 'v4',
      algorithm: 'Random Forest',
      score: 0.925,
      scoreFormatted: '92.5%',
      endpointPath: '/api/predictions/realtime/model-123',
      deployedAt: new Date().toISOString(),
      predictionsCount: 150,
      hasActiveDeployment: true,
    };
  }

  return apiCall(
    apiClient.get<ActiveSummary>(`/deployments/active/summary?projectId=${projectId}`)
  );
};

/**
 * Get deployment history (for versioning UI)
 */
export const getDeploymentHistory = async (
  projectId: string
): Promise<DeploymentHistoryResponse> => {
  if (useMockData()) {
    const mockHistory: DeploymentListItem[] = [
      {
        id: 'deployment-4',
        name: 'AutoML Run - v4',
        projectId,
        version: 4,
        versionLabel: 'v4',
        status: 'ACTIVE',
        statusLabel: 'active',
        isActive: true,
        algorithm: 'Random Forest',
        score: 0.925,
        metric: 'Accuracy',
        scoreFormatted: '92.5%',
        problemType: 'CLASSIFICATION',
        autoMLJobId: 'automl-4',
        autoMLJobName: 'AutoML Run - 1/11/2026',
        trainingJobId: null,
        trainingJobName: null,
        source: 'AUTOML',
        endpointPath: '/api/predictions/realtime/model-4',
        deployedAt: new Date(Date.now() - 3600000).toISOString(),
        deactivatedAt: null,
        predictionsCount: 0,
        deployedBy: 'admin@company.com',
      },
      {
        id: 'deployment-3',
        name: 'AutoML Run - v3',
        projectId,
        version: 3,
        versionLabel: 'v3',
        status: 'INACTIVE',
        statusLabel: 'inactive',
        isActive: false,
        algorithm: 'Random Forest',
        score: 0.92,
        metric: 'Accuracy',
        scoreFormatted: '92.0%',
        problemType: 'CLASSIFICATION',
        autoMLJobId: 'automl-3',
        autoMLJobName: 'AutoML Run - 1/10/2026',
        trainingJobId: null,
        trainingJobName: null,
        source: 'AUTOML',
        endpointPath: '/api/predictions/realtime/model-3',
        deployedAt: new Date(Date.now() - 7200000).toISOString(),
        deactivatedAt: new Date(Date.now() - 3600000).toISOString(),
        predictionsCount: 15,
        deployedBy: 'admin@company.com',
      },
    ];

    return {
      projectId,
      projectName: 'ML Project',
      totalDeployments: mockHistory.length,
      activeDeployment: {
        id: mockHistory[0].id,
        name: mockHistory[0].name,
        version: mockHistory[0].version,
        versionLabel: mockHistory[0].versionLabel,
        algorithm: mockHistory[0].algorithm,
        score: mockHistory[0].score,
        scoreFormatted: mockHistory[0].scoreFormatted,
        endpointPath: mockHistory[0].endpointPath,
        deployedAt: mockHistory[0].deployedAt,
        predictionsCount: mockHistory[0].predictionsCount,
        hasActiveDeployment: true,
      },
      history: mockHistory,
    };
  }

  return apiCall(
    apiClient.get<DeploymentHistoryResponse>(`/deployments/history?projectId=${projectId}`)
  );
};

/**
 * Rollback to previous version
 */
export const rollbackDeployment = async (
  deploymentId: string,
  request: RollbackRequest = {}
): Promise<DeploymentResponse> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      id: deploymentId,
      name: 'Rolled Back Deployment',
      description: null,
      projectId: 'project-123',
      projectName: 'ML Project',
      modelId: 'model-123',
      autoMLJobId: 'automl-3',
      trainingJobId: null,
      version: 3,
      versionLabel: 'v3',
      status: 'ACTIVE',
      statusLabel: 'active',
      isActive: true,
      algorithm: 'Random Forest',
      score: 0.92,
      metric: 'Accuracy',
      scoreFormatted: '92.0%',
      problemType: 'CLASSIFICATION',
      targetColumn: 'target',
      datasetName: 'dataset.csv',
      endpointUrl: '/api/predictions/realtime/model-3',
      endpointPath: '/api/predictions/realtime/model-3',
      deployedAt: new Date(Date.now() - 7200000).toISOString(),
      activatedAt: new Date().toISOString(),
      deactivatedAt: null,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      predictionsCount: 15,
      lastPredictionAt: null,
      deployedBy: 'admin@company.com',
      deactivatedBy: null,
      deactivationReason: null,
      message: 'Rolled back to v3',
    };
  }

  return apiCall(
    apiClient.post<DeploymentResponse>(`/deployments/${deploymentId}/rollback`, request)
  );
};

/**
 * Activate specific version (same as rollback)
 */
export const activateDeployment = async (
  deploymentId: string,
  request: RollbackRequest = {}
): Promise<DeploymentResponse> => {
  if (useMockData()) {
    return rollbackDeployment(deploymentId, request);
  }

  return apiCall(
    apiClient.post<DeploymentResponse>(`/deployments/${deploymentId}/activate`, request)
  );
};

/**
 * Deactivate deployment
 */
export const deactivateDeployment = async (
  deploymentId: string,
  request: DeactivateRequest = {}
): Promise<DeploymentResponse> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      id: deploymentId,
      name: 'Deactivated Deployment',
      description: null,
      projectId: 'project-123',
      projectName: 'ML Project',
      modelId: 'model-123',
      autoMLJobId: 'automl-4',
      trainingJobId: null,
      version: 4,
      versionLabel: 'v4',
      status: 'INACTIVE',
      statusLabel: 'inactive',
      isActive: false,
      algorithm: 'Random Forest',
      score: 0.925,
      metric: 'Accuracy',
      scoreFormatted: '92.5%',
      problemType: 'CLASSIFICATION',
      targetColumn: 'target',
      datasetName: 'dataset.csv',
      endpointUrl: '/api/predictions/realtime/model-4',
      endpointPath: '/api/predictions/realtime/model-4',
      deployedAt: new Date(Date.now() - 3600000).toISOString(),
      activatedAt: new Date(Date.now() - 3600000).toISOString(),
      deactivatedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      predictionsCount: 0,
      lastPredictionAt: null,
      deployedBy: 'admin@company.com',
      deactivatedBy: request.deactivatedBy || null,
      deactivationReason: request.reason || null,
      message: 'Deployment deactivated',
    };
  }

  return apiCall(
    apiClient.post<DeploymentResponse>(`/deployments/${deploymentId}/deactivate`, request)
  );
};

/**
 * Compare two deployments
 */
export const compareDeployments = async (
  deploymentId1: string,
  deploymentId2: string
): Promise<CompareResponse> => {
  if (useMockData()) {
    return {
      deployment1: {
        id: deploymentId1,
        name: 'v3 - Random Forest',
        projectId: 'project-123',
        version: 3,
        versionLabel: 'v3',
        status: 'INACTIVE',
        statusLabel: 'inactive',
        isActive: false,
        algorithm: 'Random Forest',
        score: 0.92,
        metric: 'Accuracy',
        scoreFormatted: '92.0%',
        problemType: 'CLASSIFICATION',
        autoMLJobId: 'automl-3',
        autoMLJobName: 'AutoML Run - v3',
        trainingJobId: null,
        trainingJobName: null,
        source: 'AUTOML',
        endpointPath: '/api/predictions/realtime/model-3',
        deployedAt: new Date(Date.now() - 7200000).toISOString(),
        deactivatedAt: new Date(Date.now() - 3600000).toISOString(),
        predictionsCount: 15,
        deployedBy: 'admin@company.com',
      },
      deployment2: {
        id: deploymentId2,
        name: 'v4 - Random Forest',
        projectId: 'project-123',
        version: 4,
        versionLabel: 'v4',
        status: 'ACTIVE',
        statusLabel: 'active',
        isActive: true,
        algorithm: 'Random Forest',
        score: 0.925,
        metric: 'Accuracy',
        scoreFormatted: '92.5%',
        problemType: 'CLASSIFICATION',
        autoMLJobId: 'automl-4',
        autoMLJobName: 'AutoML Run - v4',
        trainingJobId: null,
        trainingJobName: null,
        source: 'AUTOML',
        endpointPath: '/api/predictions/realtime/model-4',
        deployedAt: new Date(Date.now() - 3600000).toISOString(),
        deactivatedAt: null,
        predictionsCount: 0,
        deployedBy: 'admin@company.com',
      },
      scoreDifference: 0.005,
      recommendation: 'v4 has slightly better accuracy (92.5% vs 92.0%)',
    };
  }

  return apiCall(
    apiClient.get<CompareResponse>(
      `/deployments/compare?deploymentId1=${deploymentId1}&deploymentId2=${deploymentId2}`
    )
  );
};

/**
 * List all deployments (paginated)
 */
export const listDeployments = async (
  projectId: string,
  page: number = 0,
  size: number = 10
): Promise<PagedDeploymentResponse> => {
  if (useMockData()) {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page,
      size,
    };
  }

  return apiCall(
    apiClient.get<PagedDeploymentResponse>(
      `/deployments?projectId=${projectId}&page=${page}&size=${size}`
    )
  );
};

/**
 * Delete deployment
 */
export const deleteDeployment = async (deploymentId: string): Promise<void> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return;
  }

  return apiCall(apiClient.delete(`/deployments/${deploymentId}`));
};

/**
 * Export all deployment service methods
 */
export const deploymentService = {
  deployFromAutoML,
  deployFromTraining,
  getActiveDeployment,
  getActiveSummary,
  getDeploymentHistory,
  rollbackDeployment,
  activateDeployment,
  deactivateDeployment,
  compareDeployments,
  listDeployments,
  deleteDeployment,
};

export default deploymentService;
