/**
 * Training Configuration Service
 * API client for managing training configurations
 */

import apiClient, { apiCall } from '../api/client';
import { useMockData } from '../../config/environment';
import {
  SaveConfigRequest,
  ConfigResponse,
  ConfigListItem,
  ListConfigParams,
  ConfigScope,
} from './configTypes';

const API_BASE = '/training/configurations';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockConfigs: ConfigResponse[] = [
  {
    id: 'cfg-1',
    name: 'XGBoost Production Config',
    description: 'Best performing config for customer churn prediction',
    scope: 'PROJECT',
    scopeLabel: 'Project Level',
    projectId: 'proj_1',
    datasetId: 'ds_1',
    datasetName: 'Customer Churn Data',
    datasourceId: null,
    datasourceName: null,
    targetVariable: 'churn',
    problemType: 'CLASSIFICATION',
    algorithm: 'xgboost',
    algorithmDisplayName: 'XGBoost (Gradient Boosting)',
    trainTestSplit: 0.8,
    crossValidationFolds: 5,
    hyperparameters: {
      max_depth: 6,
      learning_rate: 0.1,
      n_estimators: 100,
      subsample: 0.8,
    },
    gpuAcceleration: false,
    autoHyperparameterTuning: false,
    earlyStopping: true,
    earlyStoppingPatience: 10,
    batchSize: 32,
    evaluationMetric: 'accuracy',
    tags: ['xgboost', 'churn', 'production'],
    usageCount: 12,
    lastUsedAt: '2026-01-09T15:30:00Z',
    createdBy: 'user_1',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-09T15:30:00Z',
  },
  {
    id: 'cfg-2',
    name: 'Random Forest Template',
    description: 'Global template for Random Forest classification',
    scope: 'GLOBAL',
    scopeLabel: 'Global',
    projectId: null,
    datasetId: null,
    datasetName: null,
    datasourceId: null,
    datasourceName: null,
    targetVariable: null,
    problemType: 'CLASSIFICATION',
    algorithm: 'random_forest',
    algorithmDisplayName: 'Random Forest',
    trainTestSplit: 0.8,
    crossValidationFolds: 5,
    hyperparameters: {
      n_estimators: 100,
      max_depth: 10,
      min_samples_split: 2,
    },
    gpuAcceleration: false,
    autoHyperparameterTuning: false,
    earlyStopping: false,
    earlyStoppingPatience: 10,
    batchSize: 32,
    evaluationMetric: 'accuracy',
    tags: ['template', 'random-forest'],
    usageCount: 25,
    lastUsedAt: '2026-01-10T08:00:00Z',
    createdBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cfg-3',
    name: 'Loan Dataset Config',
    description: 'Optimized for loan approval dataset',
    scope: 'DATASET',
    scopeLabel: 'Dataset Level',
    projectId: 'proj_1',
    datasetId: 'ds_2',
    datasetName: 'Loan Applications',
    datasourceId: null,
    datasourceName: null,
    targetVariable: 'loan_approved',
    problemType: 'CLASSIFICATION',
    algorithm: 'logistic_regression',
    algorithmDisplayName: 'Logistic Regression',
    trainTestSplit: 0.75,
    crossValidationFolds: 10,
    hyperparameters: {
      C: 1.0,
      penalty: 'l2',
      solver: 'lbfgs',
    },
    gpuAcceleration: false,
    autoHyperparameterTuning: true,
    earlyStopping: true,
    earlyStoppingPatience: 5,
    batchSize: 64,
    evaluationMetric: 'f1',
    tags: ['loan', 'logistic-regression'],
    usageCount: 8,
    lastUsedAt: '2026-01-08T14:20:00Z',
    createdBy: 'user_1',
    createdAt: '2026-01-03T12:00:00Z',
    updatedAt: '2026-01-08T14:20:00Z',
  },
];

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Save new configuration
 */
export const saveConfiguration = async (request: SaveConfigRequest): Promise<ConfigResponse> => {
  console.log('trainingConfigService.save: Saving configuration with request:', {
    name: request.name,
    scope: request.scope,
    projectId: request.projectId,
    datasetId: request.datasetId,
    algorithm: request.algorithm,
    targetVariable: request.targetVariable,
  });
  
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newConfig: ConfigResponse = {
      id: `cfg-${Date.now()}`,
      name: request.name,
      description: request.description || null,
      scope: request.scope || 'PROJECT',
      scopeLabel: getScopeLabel(request.scope || 'PROJECT'),
      projectId: request.projectId || null,
      datasetId: request.datasetId || null,
      datasetName: request.datasetName || null,
      datasourceId: request.datasourceId || null,
      datasourceName: request.datasourceName || null,
      targetVariable: request.targetVariable || null,
      problemType: request.problemType || null,
      algorithm: request.algorithm || null,
      algorithmDisplayName: request.algorithmDisplayName || null,
      trainTestSplit: request.trainTestSplit || 0.8,
      crossValidationFolds: request.crossValidationFolds || 5,
      hyperparameters: request.hyperparameters || {},
      gpuAcceleration: request.gpuAcceleration || false,
      autoHyperparameterTuning: request.autoHyperparameterTuning || false,
      earlyStopping: request.earlyStopping !== undefined ? request.earlyStopping : true,
      earlyStoppingPatience: request.earlyStoppingPatience || 10,
      batchSize: request.batchSize || 32,
      evaluationMetric: request.evaluationMetric || 'accuracy',
      tags: request.tags || [],
      usageCount: 0,
      lastUsedAt: null,
      createdBy: 'user_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockConfigs.push(newConfig);
    console.log('trainingConfigService.save: Configuration saved successfully:', {
      id: newConfig.id,
      name: newConfig.name,
      scope: newConfig.scope,
      projectId: newConfig.projectId,
      datasetId: newConfig.datasetId,
    });
    return newConfig;
  }

  console.log('trainingConfigService.save: Calling API...');
  const result = await apiCall(
    apiClient.post<ConfigResponse>(API_BASE, request)
  );
  console.log('trainingConfigService.save: Configuration saved successfully:', result);
  return result;
};

/**
 * List configurations with filters
 */
export const listConfigurations = async (params: ListConfigParams = {}): Promise<ConfigListItem[]> => {
  if (useMockData()) {
    console.log('trainingConfigService.list: Using mock data with params:', params);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    let filtered = [...mockConfigs];
    
    // Filter by scope
    if (params.scope) {
      filtered = filtered.filter(c => c.scope === params.scope);
    }
    
    // Filter by projectId
    if (params.projectId) {
      if (params.includeParentScopes !== false) {
        // Include project-level, dataset-level (in this project), and global
        filtered = filtered.filter(c => 
          c.scope === 'GLOBAL' || 
          c.projectId === params.projectId
        );
      } else {
        filtered = filtered.filter(c => c.projectId === params.projectId);
      }
    }
    
    // Filter by datasetId
    if (params.datasetId) {
      if (params.includeParentScopes !== false) {
        // Include dataset-level, project-level, and global
        filtered = filtered.filter(c => 
          c.scope === 'GLOBAL' || 
          c.projectId === params.projectId ||
          c.datasetId === params.datasetId
        );
      } else {
        filtered = filtered.filter(c => c.datasetId === params.datasetId);
      }
    }
    
    // Filter by datasourceId
    if (params.datasourceId) {
      filtered = filtered.filter(c => c.datasourceId === params.datasourceId);
    }
    
    // Search
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.description?.toLowerCase().includes(search) ||
        c.algorithm?.toLowerCase().includes(search)
      );
    }
    
    // Convert to list items
    const result = filtered.map(toListItem);
    console.log('trainingConfigService.list: Returning', result.length, 'configs:', result);
    return result;
  }

  const query = new URLSearchParams();
  if (params.scope) query.append('scope', params.scope);
  if (params.projectId) query.append('projectId', params.projectId);
  if (params.datasetId) query.append('datasetId', params.datasetId);
  if (params.datasourceId) query.append('datasourceId', params.datasourceId);
  if (params.search) query.append('search', params.search);
  if (params.includeParentScopes !== undefined) {
    query.append('includeParentScopes', String(params.includeParentScopes));
  }

  console.log('trainingConfigService.list: Calling API with query:', query.toString());
  const result = await apiCall(
    apiClient.get<ConfigListItem[]>(`${API_BASE}?${query.toString()}`)
  );
  console.log('trainingConfigService.list: API returned', result.length, 'configs:', result);
  return result;
};

/**
 * Get configuration by ID
 */
export const getConfiguration = async (id: string): Promise<ConfigResponse> => {
  console.log('trainingConfigService.get: Fetching config with ID:', id);
  
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const config = mockConfigs.find(c => c.id === id);
    if (!config) {
      console.error('trainingConfigService.get: Config not found:', id);
      throw {
        status: 404,
        message: 'Configuration not found',
        code: 'CONFIG_NOT_FOUND',
      };
    }
    console.log('trainingConfigService.get: Config found:', config);
    return config;
  }

  const result = await apiCall(
    apiClient.get<ConfigResponse>(`${API_BASE}/${id}`)
  );
  console.log('trainingConfigService.get: API returned:', result);
  return result;
};

/**
 * Update configuration
 */
export const updateConfiguration = async (
  id: string,
  request: Partial<SaveConfigRequest>
): Promise<ConfigResponse> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockConfigs.findIndex(c => c.id === id);
    if (index === -1) {
      throw {
        status: 404,
        message: 'Configuration not found',
        code: 'CONFIG_NOT_FOUND',
      };
    }
    
    mockConfigs[index] = {
      ...mockConfigs[index],
      ...request,
      updatedAt: new Date().toISOString(),
    };
    
    return mockConfigs[index];
  }

  return apiCall(
    apiClient.put<ConfigResponse>(`${API_BASE}/${id}`, request)
  );
};

/**
 * Delete configuration
 */
export const deleteConfiguration = async (id: string): Promise<void> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockConfigs.findIndex(c => c.id === id);
    if (index !== -1) {
      mockConfigs.splice(index, 1);
    }
    return;
  }

  return apiCall(
    apiClient.delete<void>(`${API_BASE}/${id}`)
  );
};

/**
 * Clone configuration
 */
export const cloneConfiguration = async (
  id: string,
  newName?: string,
  newScope?: ConfigScope
): Promise<ConfigResponse> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const original = mockConfigs.find(c => c.id === id);
    if (!original) {
      throw {
        status: 404,
        message: 'Configuration not found',
        code: 'CONFIG_NOT_FOUND',
      };
    }
    
    const cloned: ConfigResponse = {
      ...original,
      id: `cfg-${Date.now()}`,
      name: newName || `${original.name} (Copy)`,
      scope: newScope || original.scope,
      scopeLabel: getScopeLabel(newScope || original.scope),
      usageCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockConfigs.push(cloned);
    return cloned;
  }

  const query = new URLSearchParams();
  if (newName) query.append('newName', newName);
  if (newScope) query.append('newScope', newScope);

  return apiCall(
    apiClient.post<ConfigResponse>(`${API_BASE}/${id}/clone?${query.toString()}`)
  );
};

/**
 * Record usage (call when loading a config)
 */
export const recordConfigUsage = async (id: string): Promise<void> => {
  console.log('trainingConfigService.recordUsage: Recording usage for config:', id);
  
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const config = mockConfigs.find(c => c.id === id);
    if (config) {
      const oldUsageCount = config.usageCount;
      config.usageCount += 1;
      config.lastUsedAt = new Date().toISOString();
      console.log('trainingConfigService.recordUsage: Updated -', {
        configId: id,
        configName: config.name,
        usageCount: `${oldUsageCount} → ${config.usageCount}`,
        lastUsedAt: config.lastUsedAt,
        message: 'This config will now appear in /recent endpoint'
      });
    } else {
      console.warn('trainingConfigService.recordUsage: Config not found:', id);
    }
    return;
  }

  console.log('trainingConfigService.recordUsage: Calling API...');
  await apiCall(
    apiClient.post<void>(`${API_BASE}/${id}/usage`)
  );
  console.log('trainingConfigService.recordUsage: API call successful');
};

/**
 * Get popular configurations
 */
export const getPopularConfigurations = async (
  projectId?: string,
  datasetId?: string,
  limit = 10
): Promise<ConfigListItem[]> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    let filtered = [...mockConfigs];
    
    if (projectId) {
      filtered = filtered.filter(c => c.scope === 'GLOBAL' || c.projectId === projectId);
    }
    if (datasetId) {
      filtered = filtered.filter(c => 
        c.scope === 'GLOBAL' || 
        c.projectId === projectId ||
        c.datasetId === datasetId
      );
    }
    
    return filtered
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
      .map(toListItem);
  }

  const query = new URLSearchParams();
  if (projectId) query.append('projectId', projectId);
  if (datasetId) query.append('datasetId', datasetId);
  query.append('limit', String(limit));

  return apiCall(
    apiClient.get<ConfigListItem[]>(`${API_BASE}/popular?${query.toString()}`)
  );
};

/**
 * Get recent configurations
 */
export const getRecentConfigurations = async (
  projectId?: string,
  limit = 10
): Promise<ConfigListItem[]> => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    let filtered = [...mockConfigs];
    
    if (projectId) {
      filtered = filtered.filter(c => c.scope === 'GLOBAL' || c.projectId === projectId);
    }
    
    return filtered
      .filter(c => c.lastUsedAt !== null)
      .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())
      .slice(0, limit)
      .map(toListItem);
  }

  const query = new URLSearchParams();
  if (projectId) query.append('projectId', projectId);
  query.append('limit', String(limit));

  return apiCall(
    apiClient.get<ConfigListItem[]>(`${API_BASE}/recent?${query.toString()}`)
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getScopeLabel(scope: ConfigScope): string {
  switch (scope) {
    case 'GLOBAL':
      return 'Global';
    case 'PROJECT':
      return 'Project Level';
    case 'DATASET':
      return 'Dataset Level';
    case 'DATASOURCE':
      return 'DataSource Level';
  }
}

function toListItem(config: ConfigResponse): ConfigListItem {
  let scopeEntityName: string | null = null;
  
  switch (config.scope) {
    case 'GLOBAL':
      scopeEntityName = 'All Projects';
      break;
    case 'PROJECT':
      scopeEntityName = 'Project'; // Could be enhanced with actual project name
      break;
    case 'DATASET':
      scopeEntityName = config.datasetName;
      break;
    case 'DATASOURCE':
      scopeEntityName = config.datasourceName;
      break;
  }
  
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    scope: config.scope,
    scopeLabel: config.scopeLabel,
    scopeEntityName,
    algorithm: config.algorithm,
    algorithmDisplayName: config.algorithmDisplayName,
    problemType: config.problemType,
    datasetName: config.datasetName,
    targetVariable: config.targetVariable,
    usageCount: config.usageCount,
    lastUsedAt: config.lastUsedAt,
    createdAt: config.createdAt,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const trainingConfigService = {
  save: saveConfiguration,
  list: listConfigurations,
  get: getConfiguration,
  update: updateConfiguration,
  delete: deleteConfiguration,
  clone: cloneConfiguration,
  recordUsage: recordConfigUsage,
  getPopular: getPopularConfigurations,
  getRecent: getRecentConfigurations,
};