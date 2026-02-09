/**
 * API Types
 * Complete TypeScript definitions for all API entities
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'cancelled';

export type DataSourceType = 'CSV' | 'POSTGRESQL' | 'MYSQL' | 'S3' | 'BIGQUERY' | 'GCS';

export type ProblemType = 'classification' | 'regression' | 'clustering' | 'timeseries';

export type AlgorithmType =
  | 'logistic_regression'
  | 'decision_tree'
  | 'random_forest'
  | 'gradient_boosting'
  | 'xgboost'
  | 'lightgbm'
  | 'catboost'
  | 'svm'
  | 'knn'
  | 'neural_network'
  | 'naive_bayes'
  | 'linear_regression'
  | 'ridge'
  | 'lasso'
  | 'elastic_net';

export type MetricType =
  | 'accuracy'
  | 'precision'
  | 'recall'
  | 'f1_score'
  | 'auc_roc'
  | 'mse'
  | 'rmse'
  | 'mae'
  | 'r2_score';

export type JobStatus =
  | 'queued'
  | 'starting'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'stopping';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string | null;
  color?: string;
  status: Status;
  modelsCount?: number;
  datasetsCount?: number;
  predictionsCount?: number;
  createdAt?: string;
  updatedAt: string;
  owner?: User;
  teamMembers?: number;
}

export interface ProjectStats {
  modelsCount: number;
  deployedModelsCount: number;
  datasetsCount: number;
  totalDataSize: string; // e.g. "1.2 GB"
  totalDataSizeBytes: number;
  avgAccuracy: number; // 0.942 (0-1 scale)
  accuracyTrend: number; // 0.023 (percentage as decimal)
  accuracyTrendLabel: string; // "+2.3%"
  predictionsCount: number;
  predictionsThisMonth: number;
  predictionsLabel: string; // "15.4K"
  dataQualityScore: number; // 0.92 (0-1 scale)
}

export interface RecentModel {
  id: string;
  name: string;
  version: string;
  algorithm: string; // 'xgboost', 'random_forest', etc.
  algorithmDisplayName: string; // 'XGBoost (Gradient Boosting)'
  accuracy: number; // 0.935 (0-1 scale)
  accuracyLabel: string; // '93.5%'
  isDeployed: boolean;
  isBest: boolean;
  statusLabel: string; // 'Deployed', 'Training', 'Completed', 'Failed'
  createdAt: string; // ISO timestamp
  createdAtLabel: string; // '2h ago'
}

export interface RecentActivity {
  id: string;
  activityType: string; // 'MODEL_DEPLOYED', 'DATASET_UPLOADED', etc.
  activityTypeLabel: string; // 'Model Deployed', 'Dataset Uploaded'
  icon: string; // 'rocket', 'upload', 'cog', etc.
  iconColor: string; // 'green', 'purple', 'blue', 'red', 'cyan'
  title: string;
  description: string;
  userName: string;
  userEmail: string;
  userInitials: string; // 'JS', 'JD'
  entityId: string;
  entityType: string; // 'MODEL', 'DATASET', 'TRAINING_JOB', 'BATCH_PREDICTION'
  entityName: string;
  projectId: string;
  createdAt: string; // ISO timestamp
  createdAtLabel: string; // '2h ago', '1d ago'
}

export interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  thisWeekActivities: number;
  modelDeployments: number;
  datasetsUploaded: number;
  trainingCompleted: number;
  predictionsProcessed: number;
}

export interface PaginatedActivities {
  activities: RecentActivity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  iconUrl?: string;
  color?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: Status;
  iconUrl?: string;
  color?: string;
}

// ============================================================================
// DATASET TYPES
// ============================================================================

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  filePath?: string;
  fileSize: string; // "2.5 MB"
  fileSizeBytes: number;
  rowCount: number;
  columnCount: number;
  status: DatasetStatus;
  qualityScore: number | null; // 0-1 (null if processing)
  missingValuesPct?: number;
  duplicateRowsPct?: number;
  projectId?: string;
  createdAt: string;
  createdAtLabel?: string;
  updatedAt?: string;
}

export type DatasetStatus = 'UPLOADING' | 'PROCESSING' | 'ACTIVE' | 'ERROR' | 'DELETED';

export interface DatasetPreview {
  datasetId: string;
  columns: string[];
  rows: any[][];
  totalRows: number;
  previewRows: number;
}

export interface ColumnInfo {
  name: string;
  dataType: 'numeric' | 'categorical' | 'datetime' | 'text';
  originalType: string;
  uniqueValues: number;
  missingPct: number;
  min?: number | null;
  max?: number | null;
  mean?: number | null;
  std?: number | null;
  sampleValues: string[];
  isTarget: boolean;
  isFeature: boolean;
}

export interface DataQualityReport {
  datasetId: string;
  overallScore: number; // 0-1
  completenessScore: number; // 0-1
  uniquenessScore: number; // 0-1
  consistencyScore: number; // 0-1
  totalRows: number;
  duplicateRows: number;
  missingCells: number;
  missingPct: number;
  columnQuality: ColumnQuality[];
}

export interface ColumnQuality {
  column: string;
  dataType: string;
  missingPct: number;
  uniqueValues: number;
  hasOutliers: boolean;
  qualityIssue: string | null;
}

export interface UploadDatasetRequest {
  name: string;
  description?: string;
  projectId?: string;
  file: File;
}

export interface UpdateDatasetRequest {
  name?: string;
  description?: string;
}

// ============================================================================
// DATA SOURCE TYPES
// ============================================================================

export interface DataSource {
  id: string;
  name: string;
  description?: string;
  sourceType: DataSourceType;
  status: DataSourceStatus;
  // Database fields
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  // Cloud storage fields
  bucketName?: string;
  region?: string;
  // Metadata
  lastTestedAt?: string;
  projectId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type DataSourceType = 
  | 'POSTGRESQL' 
  | 'MYSQL' 
  | 'SQLITE' 
  | 'BIGQUERY' 
  | 'AWS_S3' 
  | 'GCS' 
  | 'API' 
  | 'CSV_FILE';

export type DataSourceStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'TESTING';

export interface CreateDataSourceRequest {
  name: string;
  description?: string;
  sourceType: DataSourceType;
  projectId?: string;
  // Database fields
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
  // AWS S3 fields
  bucketName?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  // BigQuery/GCS fields
  credentialsJson?: string;
}

export interface UpdateDataSourceRequest {
  name?: string;
  description?: string;
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
  bucketName?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  credentialsJson?: string;
}

export interface TestConnectionRequest {
  sourceType: DataSourceType;
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
  bucketName?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  credentialsJson?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs: number | null;
  serverVersion: string | null;
  tablesCount: number | null;
  availableTables: string[] | null;
}

// ============================================================================
// TRAINING TYPES
// ============================================================================

export interface TrainingJob {
  id: string;
  jobName: string;
  experimentName: string;
  status: JobStatus;
  statusLabel: string;
  statusMessage: string | null;
  progress: number; // 0-100
  progressLabel: string;
  currentEpoch: number;
  totalEpochs: number;
  currentAccuracy: number | null;
  currentAccuracyLabel: string | null;
  bestAccuracy: number | null;
  currentLoss: number | null;
  datasetId: string;
  datasetName: string;
  algorithm: string;
  algorithmDisplayName: string;
  targetVariable: string;
  problemType: string;
  trainTestSplit: number;
  crossValidationFolds: number;
  hyperparameters: Record<string, any>;
  gpuAcceleration: boolean;
  autoHyperparameterTuning: boolean;
  earlyStopping: boolean;
  earlyStoppingPatience: number;
  batchSize: number;
  evaluationMetric: string;
  startedAt: string | null;
  startedAtLabel: string | null;
  completedAt: string | null;
  etaSeconds: number | null;
  etaLabel: string | null;
  durationSeconds: number | null;
  durationLabel: string | null;
  modelId: string | null;
  metrics: Record<string, number> | null;
  computeResources: string;
  costEstimate: number;
  costLabel: string;
  errorMessage: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string | null;
  // Deployment fields (matches AutoML pattern)
  isDeployed?: boolean;
  isActiveDeployment?: boolean;
  deploymentId?: string | null;
  deploymentVersionLabel?: string | null;
}

export interface TrainingJobListItem {
  id: string;
  jobName: string;
  algorithm: string;
  algorithmDisplayName: string;
  datasetName: string;
  datasetId: string; // Add datasetId for grouping
  status: JobStatus;
  statusLabel: string;
  progress: number;
  progressLabel: string;
  currentAccuracy: number | null;
  currentAccuracyLabel: string | null;
  startedAt: string | null;
  startedAtLabel: string | null;
  etaLabel: string | null;
  problemType: string; // Add problemType
  createdAt: string; // Add createdAt
  // Deployment fields (matches AutoML pattern)
  isDeployed?: boolean;
  isActiveDeployment?: boolean;
  deploymentId?: string | null;
  deploymentVersionLabel?: string | null;
}

export interface TrainingProgress {
  jobId: string;
  status: JobStatus;
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  currentAccuracy: number | null;
  currentLoss: number | null;
  etaSeconds: number | null;
  etaLabel: string | null;
  message: string;
}

export interface TrainingResults {
  jobId: string;
  jobName: string;
  status: string;
  algorithm: string;
  algorithmDisplayName: string;
  problemType: string;
  accuracy: number;
  accuracyLabel: string;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  aucRoc: number | null;
  modelId: string;
  modelPath: string;
  isDeployed: boolean;
  endpointUrl: string | null;
  datasetId: string;
  datasetName: string;
  targetVariable: string;
  trainTestSplit: number;
  crossValidationFolds: number;
  trainingDuration: number;
  trainingDurationLabel: string;
  startedAt: string;
  completedAt: string;
}

export interface TrainingConfig {
  trainTestSplit: number; // 0-1
  crossValidationFolds?: number;
  randomState?: number;
  hyperparameters?: Record<string, any>;
  optimization?: OptimizationConfig;
  features?: string[];
  scalingMethod?: 'standard' | 'minmax' | 'robust' | 'none';
}

export interface OptimizationConfig {
  enableGPU?: boolean;
  autoHyperparameterTuning?: boolean;
  earlyStoppingEnabled?: boolean;
  patience?: number;
  batchSize?: number;
  evaluationMetric?: MetricType;
}

export interface CreateTrainingJobRequest {
  experimentName?: string;
  datasetId: string;
  algorithm: string;
  targetVariable: string;
  problemType: 'CLASSIFICATION' | 'REGRESSION';
  projectId?: string;
  trainTestSplit?: number;
  crossValidationFolds?: number;
  hyperparameters?: Record<string, any>;
  gpuAcceleration?: boolean;
  autoHyperparameterTuning?: boolean;
  earlyStopping?: boolean;
  earlyStoppingPatience?: number;
  batchSize?: number;
  evaluationMetric?: string;
}

export interface TrainingMetrics {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAccuracy?: number;
  valAccuracy?: number;
  timestamp: string;
}

export interface AlgorithmList {
  classification: AlgorithmInfo[];
  regression: AlgorithmInfo[];
}

export interface AlgorithmInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  estimatedTime: string;
  complexity: 'low' | 'medium' | 'high';
}

export interface AlgorithmParams {
  algorithmId: string;
  algorithmName: string;
  parameters: HyperparameterSchema[];
}

export interface Algorithm {
  name: AlgorithmType;
  displayName: string;
  description: string;
  supportedProblemTypes: ProblemType[];
  hyperparameters: HyperparameterSchema[];
  defaultValues: Record<string, any>;
}

export interface HyperparameterSchema {
  name: string;
  displayName: string;
  type: 'integer' | 'float' | 'select' | 'boolean' | 'int';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: any;
  defaultValue?: any;
  description: string;
}

export interface RecommendedSettings {
  algorithm: AlgorithmType;
  hyperparameters: Record<string, any>;
  reason: string;
  expectedAccuracy?: number;
  estimatedTrainingTime?: number;
}

// ============================================================================
// MODEL TYPES
// ============================================================================

export interface Model {
  id: string;
  name: string;
  description?: string;
  algorithm: AlgorithmType;
  problemType: ProblemType;
  status: 'trained' | 'deployed' | 'failed' | 'archived';
  version: string;
  createdAt: string;
  updatedAt: string;
  deployedAt?: string;
  metrics: ModelMetrics;
  datasetId: string;
  trainingJobId: string;
  config: TrainingConfig;
  targetColumn: string;
  features: string[];
  projectId?: string;
  tags?: string[];
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  aucRoc?: number;
  mse?: number;
  rmse?: number;
  mae?: number;
  r2Score?: number;
  trainingTime?: number; // in seconds
  inferenceTime?: number; // in milliseconds
}

export interface ModelHealth {
  overall: 'healthy' | 'warning' | 'critical';
  dataQuality: number; // 0-100
  performanceTrend: 'improving' | 'stable' | 'degrading';
  predictionVolume: number;
  errorRate: number;
  lastChecked: string;
  issues: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  tags?: string[];
  status?: 'trained' | 'deployed' | 'archived';
}

export interface DeployModelRequest {
  environment?: 'production' | 'staging' | 'development';
  replicas?: number;
  autoScaling?: boolean;
}

export interface ModelVersion {
  version: string;
  createdAt: string;
  metrics: ModelMetrics;
  status: 'active' | 'inactive';
  description?: string;
}

// ============================================================================
// EVALUATION TYPES
// ============================================================================

export interface ConfusionMatrix {
  matrix: number[][];
  labels: string[];
  accuracy: number;
  precision: number[];
  recall: number[];
  f1Score: number[];
}

export interface ROCCurve {
  fpr: number[];
  tpr: number[];
  thresholds: number[];
  auc: number;
}

export interface PRCurve {
  precision: number[];
  recall: number[];
  thresholds: number[];
  auc: number;
}

export interface LearningCurve {
  trainSizes: number[];
  trainScores: number[];
  valScores: number[];
}

export interface FeatureImportance {
  features: {
    name: string;
    importance: number;
    rank: number;
  }[];
}

export interface ClassificationReport {
  classes: {
    name: string;
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  }[];
  accuracy: number;
  macroAvg: {
    precision: number;
    recall: number;
    f1Score: number;
  };
  weightedAvg: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export interface ModelComparisonResult {
  models: {
    id: string;
    name: string;
    algorithm: AlgorithmType;
    metrics: ModelMetrics;
    featureImportance?: FeatureImportance;
  }[];
  winner?: string;
  recommendation: string;
}

// ============================================================================
// INTERPRETABILITY TYPES
// ============================================================================

export interface SHAPGlobalExplanation {
  features: {
    name: string;
    importance: number;
    positiveContribution: number;
    negativeContribution: number;
  }[];
  baseLine: number;
}

export interface SHAPLocalExplanation {
  prediction: number;
  baseLine: number;
  features: {
    name: string;
    value: any;
    contribution: number;
    direction: 'positive' | 'negative';
  }[];
}

export interface SHAPSummaryPlot {
  features: string[];
  shapValues: number[][];
  featureValues: number[][];
}

export interface LIMEExplanation {
  prediction: number;
  features: {
    name: string;
    value: any;
    weight: number;
    direction: 'positive' | 'negative';
  }[];
  intercept: number;
  r2Score: number;
}

export interface PDPData {
  feature: string;
  values: number[];
  pdpValues: number[];
}

export interface ICEData {
  feature: string;
  values: number[];
  iceLines: number[][];
  pdpLine: number[];
}

export interface WhatIfRequest {
  features: Record<string, any>;
  baselineFeatures?: Record<string, any>;
}

export interface WhatIfResponse {
  prediction: number;
  probability?: number;
  baselinePrediction?: number;
  baselineProbability?: number;
  change: number;
  changePercentage: number;
  recommendations?: string[];
}

// ============================================================================
// PREDICTION TYPES
// ============================================================================

export interface SinglePredictionRequest {
  modelId: string;
  features: Record<string, any>;
  explainPrediction?: boolean;
}

export interface SinglePredictionResponse {
  prediction: any;
  probability?: number;
  confidence?: number;
  explanation?: SHAPLocalExplanation;
  timestamp: string;
}

export interface BatchPredictionJob {
  id: string;
  name?: string;
  modelId: string;
  status: JobStatus;
  progress: number; // 0-100
  totalRecords: number;
  processedRecords: number;
  startedAt?: string;
  completedAt?: string;
  inputFilePath: string;
  outputFilePath?: string;
  outputFormat: 'csv' | 'json' | 'parquet';
  notificationEmail?: string;
  error?: string;
}

export interface CreateBatchPredictionRequest {
  modelId: string;
  inputFile: File;
  outputFormat?: 'csv' | 'json' | 'parquet';
  notificationEmail?: string;
  name?: string;
}

export interface PredictionHistory {
  id: string;
  modelId: string;
  modelName: string;
  input: Record<string, any>;
  prediction: any;
  probability?: number;
  confidence?: number;
  timestamp: string;
  responseTime?: number; // in ms
}

// ============================================================================
// ACTIVITY TYPES
// ============================================================================

export interface Activity {
  id: string;
  type:
    | 'project_created'
    | 'dataset_uploaded'
    | 'training_started'
    | 'training_completed'
    | 'model_deployed'
    | 'prediction_made'
    | 'model_updated'
    | 'dataset_deleted';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  entityType: 'project' | 'dataset' | 'model' | 'training_job' | 'prediction';
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  // Legacy fields for backward compatibility
  name?: string;
  role?: 'admin' | 'user' | 'viewer';
  avatar?: string;
  lastLoginAt?: string;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string; // Frontend uses 'email' for better UX
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthError {
  detail: string;
}

// ============================================================================
// WORKSPACE TYPES
// ============================================================================

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}

export interface Settings {
  notifications: {
    email: boolean;
    slack: boolean;
    trainingComplete: boolean;
    modelDeployed: boolean;
    errorAlerts: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

// ============================================================================
// AUTOML TYPES
// ============================================================================

export type AutoMLJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'STOPPED';
export type AutoMLPhaseStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type AutoMLPhaseName = 'DATA_VALIDATION' | 'FEATURE_ENGINEERING' | 'ALGORITHM_SELECTION' | 'MODEL_TRAINING' | 'EVALUATION';

export interface AutoMLConfig {
  problemType: ProblemType;
  maxTrainingTime: number; // in minutes
  accuracyVsSpeed: 'low' | 'medium' | 'high';
  interpretabilityLevel: 'low' | 'medium' | 'high';
  algorithms?: AlgorithmType[];
  metric?: MetricType;
  enableFeatureEngineering?: boolean;
  scalingMethod?: 'standard' | 'minmax' | 'robust' | 'none';
  polynomialDegree?: number | null;
  selectFeatures?: number | null;
  cvFolds?: number;
  enableExplainability?: boolean;
  enableHyperparameterTuning?: boolean;
  tuningMethod?: 'grid' | 'random' | 'bayesian';
}

export interface StartAutoMLRequest {
  projectId?: string;
  datasetId: string;
  name: string;
  targetColumn: string;
  problemType: ProblemType;
  maxTrainingTimeMinutes: number;
  accuracyVsSpeed: 'low' | 'medium' | 'high';
  interpretability: 'low' | 'medium' | 'high';
  config: {
    enableFeatureEngineering?: boolean;
    scalingMethod?: 'standard' | 'minmax' | 'robust' | 'none';
    polynomialDegree?: number | null;
    selectFeatures?: number | null;
    cvFolds?: number;
    enableExplainability?: boolean;
    enableHyperparameterTuning?: boolean;
    tuningMethod?: 'grid' | 'random' | 'bayesian';
  };
  // Dataset metadata for Kedro source code generation
  collection_id?: string;  // Collection UUID for multi-table datasets (empty for single datasets)
  dataset_path?: string;   // File path for single datasets (e.g., "data.csv"), folder for multi-table (e.g., "m1/")
}

export interface AutoMLJobResponse {
  jobId: string;
  projectId?: string;
  datasetId: string;
  name: string;
  status: AutoMLJobStatus;
  problemType: ProblemType;
  targetColumn: string;
  maxTrainingTimeMinutes: number;
  createdAt: string;
  message: string;
}

export interface AutoMLPhase {
  name: AutoMLPhaseName;
  status: AutoMLPhaseStatus;
  progress: number; // 0-100
}

export interface AutoMLLog {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
}

export interface AutoMLJobStatus_Response {
  jobId: string;
  name: string;
  status: AutoMLJobStatus;
  progress: number; // 0-100
  currentPhase?: AutoMLPhaseName;
  currentAlgorithm?: string;
  phases: AutoMLPhase[];
  algorithmsCompleted?: number;
  algorithmsTotal?: number;
  currentBestScore?: number;
  currentBestAlgorithm?: string;
  elapsedTimeSeconds?: number;
  estimatedRemainingSeconds?: number;
  logs?: AutoMLLog[];
  completedAt?: string;
  bestModelId?: string;
  bestAlgorithm?: string;
  bestScore?: number;
  bestMetric?: string;
}

export interface AutoMLLeaderboardModel {
  rank: number;
  modelId: string;
  algorithm: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  mse?: number;
  rmse?: number;
  mae?: number;
  r2Score?: number;
  trainingTimeSeconds: number;
  cvScore?: number;
  cvStd?: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface AutoMLResults {
  jobId: string;
  status: AutoMLJobStatus;
  problemType: ProblemType;
  targetColumn: string;
  datasetInfo: {
    totalRows: number;
    totalFeatures: number;
    trainSize: number;
    testSize: number;
  };
  featureEngineering: {
    enabled: boolean;
    scalingMethod?: string;
    originalFeatures: number;
    engineeredFeatures: number;
    featuresUsed: string[];
  };
  leaderboard: AutoMLLeaderboardModel[];
  bestModel: {
    modelId: string;
    algorithm: string;
    modelPath: string;
    featureEngineerPath?: string;
    featureNamesPath?: string;
  };
  featureImportance: FeatureImportance[];
  comparisonCsvPath?: string;
}

export interface AutoMLJobListItem {
  jobId: string;
  name: string;
  projectId?: string;
  datasetId?: string; // Added dataset ID for grouping
  status: AutoMLJobStatus;
  problemType: ProblemType;
  bestAlgorithm?: string;
  bestScore?: number;
  algorithmsCount?: number;
  createdAt: string;
  completedAt?: string;
  elapsedTimeSeconds?: number;
  
  // NEW: Deployment fields
  isDeployed?: boolean;
  deploymentId?: string;
  deployedModelId?: string;
  deploymentEndpoint?: string;
  deployedAt?: string;
  deploymentVersion?: number;
  deploymentVersionLabel?: string;
  isActiveDeployment?: boolean;
}

export interface AutoMLJobsListResponse {
  content: AutoMLJobListItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface StopAutoMLResponse {
  jobId: string;
  status: AutoMLJobStatus;
  message: string;
  algorithmsCompleted?: number;
  bestScoreAchieved?: number;
  stoppedAt: string;
}

export interface DeployAutoMLModelRequest {
  modelId: string;
  deploymentName: string;
  description?: string;
}

export interface DeployAutoMLModelResponse {
  deploymentId: string;
  modelId: string;
  name: string;
  status: string;
  endpoint: string;
  deployedAt: string;
}

export interface AutoMLRequest {
  datasetId: string;
  targetColumn: string;
  config: AutoMLConfig;
  projectId?: string;
}

export interface AutoMLResponse {
  jobId: string;
  status: JobStatus;
  message: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  status: number;
  message: string;
  code: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

// ============================================================================
// DEPLOYMENT TYPES (VERSIONING & ROLLBACK)
// ============================================================================

export type DeploymentStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'FAILED';

export interface DeployFromAutoMLRequest {
  name?: string;
  description?: string;
  deployedBy?: string;
}

export interface DeployFromTrainingRequest {
  name?: string;
  description?: string;
  deployedBy?: string;
}

export interface RollbackRequest {
  reason?: string;
  activatedBy?: string;
}

export interface DeactivateRequest {
  reason?: string;
  deactivatedBy?: string;
}

export interface DeploymentResponse {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
  projectName: string;
  modelId: string;
  autoMLJobId: string | null;
  trainingJobId: string | null;
  
  // Versioning
  version: number;
  versionLabel: string;  // "v1", "v2", etc.
  
  // Status
  status: DeploymentStatus;
  statusLabel: string;
  isActive: boolean;
  
  // Model info
  algorithm: string;
  score: number;
  metric: string;
  scoreFormatted: string;  // "92.5%"
  problemType: 'CLASSIFICATION' | 'REGRESSION';
  targetColumn: string;
  datasetName: string;
  
  // Endpoint
  endpointUrl: string;
  endpointPath: string;
  
  // Timestamps
  deployedAt: string;
  activatedAt: string | null;
  deactivatedAt: string | null;
  createdAt: string;
  
  // Stats
  predictionsCount: number;
  lastPredictionAt: string | null;
  
  // Metadata
  deployedBy: string | null;
  deactivatedBy: string | null;
  deactivationReason: string | null;
  
  // Message
  message: string;
}

export interface DeploymentListItem {
  id: string;
  name: string;
  projectId: string;
  
  // Versioning
  version: number;
  versionLabel: string;
  
  // Status
  status: DeploymentStatus;
  statusLabel: string;
  isActive: boolean;
  
  // Model info
  algorithm: string;
  score: number;
  metric: string;
  scoreFormatted: string;
  problemType: 'CLASSIFICATION' | 'REGRESSION';
  
  // Source
  autoMLJobId: string | null;
  autoMLJobName: string | null;
  trainingJobId: string | null;
  trainingJobName: string | null;
  source: 'AUTOML' | 'TRAINING';
  
  // Endpoint
  endpointPath: string;
  
  // Timestamps
  deployedAt: string;
  deactivatedAt: string | null;
  
  // Stats
  predictionsCount: number;
  
  // User
  deployedBy: string | null;
}

export interface ActiveSummary {
  id: string;
  name: string;
  version: number;
  versionLabel: string;
  algorithm: string;
  score: number;
  scoreFormatted: string;
  endpointPath: string;
  deployedAt: string;
  predictionsCount: number;
  hasActiveDeployment: boolean;
}

export interface DeploymentHistoryResponse {
  projectId: string;
  projectName: string;
  totalDeployments: number;
  activeDeployment: ActiveSummary | null;
  history: DeploymentListItem[];
}

export interface CompareResponse {
  deployment1: DeploymentListItem;
  deployment2: DeploymentListItem;
  scoreDifference: number;
  recommendation: string;
}

export interface PagedDeploymentResponse {
  content: DeploymentListItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}