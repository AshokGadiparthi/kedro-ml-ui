/**
 * Training Configuration Types
 * Based on the new Save Configuration API
 */

// ============ ENUMS ============

export type ConfigScope = 'GLOBAL' | 'PROJECT' | 'DATASET' | 'DATASOURCE';
export type ProblemType = 'CLASSIFICATION' | 'REGRESSION';

// ============ REQUEST ============

export interface SaveConfigRequest {
  name: string;
  description?: string;
  
  // Scope
  scope?: ConfigScope;  // default: 'PROJECT'
  projectId?: string;
  datasetId?: string;
  datasetName?: string;
  datasourceId?: string;
  datasourceName?: string;
  
  // Training Settings
  targetVariable?: string;
  problemType?: ProblemType;
  algorithm?: string;
  algorithmDisplayName?: string;
  
  // Basic Settings
  trainTestSplit?: number;        // default: 0.8
  crossValidationFolds?: number;  // default: 5
  
  // Hyperparameters (algorithm-specific)
  hyperparameters?: Record<string, any>;
  
  // Optimization Settings
  gpuAcceleration?: boolean;           // default: false
  autoHyperparameterTuning?: boolean;  // default: false
  earlyStopping?: boolean;             // default: true
  earlyStoppingPatience?: number;      // default: 10
  batchSize?: number;                  // default: 32
  evaluationMetric?: string;           // default: 'accuracy'
  
  // Tags
  tags?: string[];
}

// ============ RESPONSE ============

export interface ConfigResponse {
  id: string;
  name: string;
  description: string | null;
  
  // Scope
  scope: ConfigScope;
  scopeLabel: string;  // "Global", "Project Level", "Dataset Level", "DataSource Level"
  projectId: string | null;
  datasetId: string | null;
  datasetName: string | null;
  datasourceId: string | null;
  datasourceName: string | null;
  
  // Training Settings
  targetVariable: string | null;
  problemType: ProblemType | null;
  algorithm: string | null;
  algorithmDisplayName: string | null;
  
  // Basic Settings
  trainTestSplit: number;
  crossValidationFolds: number;
  
  // Hyperparameters
  hyperparameters: Record<string, any>;
  
  // Optimization Settings
  gpuAcceleration: boolean;
  autoHyperparameterTuning: boolean;
  earlyStopping: boolean;
  earlyStoppingPatience: number;
  batchSize: number;
  evaluationMetric: string;
  
  // Tags & Usage
  tags: string[];
  usageCount: number;
  lastUsedAt: string | null;
  
  // Audit
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigListItem {
  id: string;
  name: string;
  description: string | null;
  
  // Scope
  scope: ConfigScope;
  scopeLabel: string;
  scopeEntityName: string | null;  // Name of project/dataset/datasource
  
  // Training Settings
  algorithm: string | null;
  algorithmDisplayName: string | null;
  problemType: ProblemType | null;
  datasetName: string | null;
  targetVariable: string | null;
  
  // Usage
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

// ============ API PARAMS ============

export interface ListConfigParams {
  scope?: ConfigScope;
  projectId?: string;
  datasetId?: string;
  datasourceId?: string;
  search?: string;
  includeParentScopes?: boolean;
}
