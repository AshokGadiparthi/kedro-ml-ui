/**
 * Training Configuration Service
 * Client-side storage for training configurations (can be migrated to backend API later)
 */

import { CreateTrainingJobRequest } from '../api/types';

export interface TrainingConfiguration {
  id: string;
  name: string;
  projectId?: string;
  datasetId: string;
  datasetName?: string;
  
  // Basic settings
  experimentName: string;
  algorithm: string;
  algorithmDisplayName?: string;
  targetVariable: string;
  problemType: 'CLASSIFICATION' | 'REGRESSION';
  trainTestSplit: number;
  crossValidationFolds: number;
  
  // Advanced hyperparameters
  hyperparameters: {
    max_depth: number;
    learning_rate: number;
    n_estimators: number;
    min_samples_split?: number;
    min_samples_leaf?: number;
    max_features?: string;
    random_state?: number;
  };
  
  // Optimization settings
  gpuAcceleration: boolean;
  autoHyperparameterTuning: boolean;
  earlyStopping: boolean;
  earlyStoppingPatience: number;
  batchSize: number;
  evaluationMetric: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  usageCount?: number; // Track how many times this config was used
  lastUsedAt?: string;
}

const STORAGE_KEY = 'ml_platform_training_configs';

/**
 * Get all saved configurations
 */
export const getSavedConfigurations = (projectId?: string): TrainingConfiguration[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const allConfigs: TrainingConfiguration[] = JSON.parse(stored);
    
    // Filter by project if specified
    if (projectId) {
      return allConfigs.filter(config => config.projectId === projectId);
    }
    
    return allConfigs;
  } catch (error) {
    console.error('Failed to load configurations:', error);
    return [];
  }
};

/**
 * Get a specific configuration by ID
 */
export const getConfigurationById = (id: string): TrainingConfiguration | null => {
  const configs = getSavedConfigurations();
  return configs.find(config => config.id === id) || null;
};

/**
 * Save a new configuration
 */
export const saveConfiguration = (config: Omit<TrainingConfiguration, 'id' | 'createdAt' | 'updatedAt'>): TrainingConfiguration => {
  try {
    const allConfigs = getSavedConfigurations();
    
    const newConfig: TrainingConfiguration = {
      ...config,
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
    };
    
    allConfigs.push(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));
    
    return newConfig;
  } catch (error) {
    console.error('Failed to save configuration:', error);
    throw new Error('Failed to save configuration');
  }
};

/**
 * Update an existing configuration
 */
export const updateConfiguration = (
  id: string,
  updates: Partial<Omit<TrainingConfiguration, 'id' | 'createdAt'>>
): TrainingConfiguration => {
  try {
    const allConfigs = getSavedConfigurations();
    const index = allConfigs.findIndex(config => config.id === id);
    
    if (index === -1) {
      throw new Error('Configuration not found');
    }
    
    allConfigs[index] = {
      ...allConfigs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));
    
    return allConfigs[index];
  } catch (error) {
    console.error('Failed to update configuration:', error);
    throw new Error('Failed to update configuration');
  }
};

/**
 * Delete a configuration
 */
export const deleteConfiguration = (id: string): void => {
  try {
    const allConfigs = getSavedConfigurations();
    const filtered = allConfigs.filter(config => config.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete configuration:', error);
    throw new Error('Failed to delete configuration');
  }
};

/**
 * Increment usage count when a config is used
 */
export const incrementUsageCount = (id: string): void => {
  try {
    const allConfigs = getSavedConfigurations();
    const index = allConfigs.findIndex(config => config.id === id);
    
    if (index !== -1) {
      allConfigs[index].usageCount = (allConfigs[index].usageCount || 0) + 1;
      allConfigs[index].lastUsedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));
    }
  } catch (error) {
    console.error('Failed to update usage count:', error);
  }
};

/**
 * Convert configuration to training job request
 */
export const configurationToJobRequest = (config: TrainingConfiguration): CreateTrainingJobRequest => {
  return {
    experimentName: config.experimentName,
    datasetId: config.datasetId,
    algorithm: config.algorithm,
    targetVariable: config.targetVariable,
    problemType: config.problemType,
    trainTestSplit: config.trainTestSplit,
    crossValidationFolds: config.crossValidationFolds,
    hyperparameters: config.hyperparameters,
    gpuAcceleration: config.gpuAcceleration,
    autoHyperparameterTuning: config.autoHyperparameterTuning,
    earlyStopping: config.earlyStopping,
    earlyStoppingPatience: config.earlyStoppingPatience,
    batchSize: config.batchSize,
    evaluationMetric: config.evaluationMetric,
    projectId: config.projectId,
  };
};

/**
 * Get configurations sorted by most recent usage
 */
export const getRecentConfigurations = (projectId?: string, limit: number = 10): TrainingConfiguration[] => {
  const configs = getSavedConfigurations(projectId);
  
  return configs
    .sort((a, b) => {
      const aDate = a.lastUsedAt || a.createdAt;
      const bDate = b.lastUsedAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })
    .slice(0, limit);
};

/**
 * Get most used configurations
 */
export const getPopularConfigurations = (projectId?: string, limit: number = 5): TrainingConfiguration[] => {
  const configs = getSavedConfigurations(projectId);
  
  return configs
    .filter(config => (config.usageCount || 0) > 0)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit);
};

/**
 * Export configuration as JSON file
 */
export const exportConfiguration = (config: TrainingConfiguration): void => {
  const dataStr = JSON.stringify(config, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `training-config-${config.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import configuration from JSON file
 */
export const importConfiguration = (file: File): Promise<TrainingConfiguration> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string) as Omit<TrainingConfiguration, 'id' | 'createdAt' | 'updatedAt'>;
        const savedConfig = saveConfiguration(config);
        resolve(savedConfig);
      } catch (error) {
        reject(new Error('Invalid configuration file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
