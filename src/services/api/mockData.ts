/**
 * Mock Data
 * Sample data for testing before backend is ready
 */

import {
  Project,
  ProjectStats,
  Dataset,
  DatasetColumn,
  DatasetPreview,
  DataQuality,
  TrainingJob,
  Model,
  ModelMetrics,
  ConfusionMatrix,
  ROCCurve,
  FeatureImportance,
  ClassificationReport,
  SHAPGlobalExplanation,
  Activity,
  User,
  PredictionHistory,
  BatchPredictionJob,
  Algorithm,
  AlgorithmList,
} from './types';

// ============================================================================
// USERS
// ============================================================================

export const mockUser: User = {
  id: 'user_1',
  name: 'John Doe',
  email: 'john.doe@company.com',
  role: 'admin',
  avatar: 'https://i.pravatar.cc/150?img=12',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-01-09T12:00:00Z',
};

// ============================================================================
// PROJECTS
// ============================================================================

export const mockProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'Customer Churn Prediction',
    description: 'Predict customer churn for Q1 2024',
    status: 'active',
    teamMembers: 5,
    modelsCount: 8,
    datasetsCount: 3,
    predictionsCount: 12450,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-09T10:00:00Z',
    owner: mockUser,
  },
  {
    id: 'proj_2',
    name: 'Sales Forecasting',
    description: 'Forecast monthly sales using historical data',
    status: 'active',
    teamMembers: 3,
    modelsCount: 4,
    datasetsCount: 2,
    predictionsCount: 8320,
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2024-01-08T15:00:00Z',
    owner: mockUser,
  },
];

export const mockProjectStats: ProjectStats = {
  modelsCount: 8,
  modelsDeployed: 2,
  datasetsCount: 3,
  totalDataSize: 2400000000, // 2.4 GB
  avgAccuracy: 93.5,
  accuracyTrend: 2.3,
  predictionsCount: 12450,
  teamMembers: 5,
};

// ============================================================================
// DATASETS
// ============================================================================

export const mockDatasets: Dataset[] = [
  {
    id: 'ds_1',
    name: 'Customer Churn Data',
    description: 'Historical customer data with churn labels',
    dataSourceType: 'CSV',
    status: 'ready',
    rowCount: 125000,
    columnCount: 24,
    fileSize: 1500000000, // 1.5 GB
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
    lastSyncTime: '2024-01-09T08:00:00Z',
    qualityScore: 92,
    projectId: 'proj_1',
  },
  {
    id: 'ds_2',
    name: 'Transaction History',
    description: 'Customer transaction data',
    dataSourceType: 'POSTGRESQL',
    status: 'ready',
    rowCount: 500000,
    columnCount: 18,
    fileSize: 800000000, // 800 MB
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-06T14:00:00Z',
    lastSyncTime: '2024-01-09T09:00:00Z',
    qualityScore: 88,
    projectId: 'proj_1',
  },
  {
    id: 'ds_3',
    name: 'Product Catalog',
    description: 'Product information and pricing',
    dataSourceType: 'S3',
    status: 'ready',
    rowCount: 15000,
    columnCount: 12,
    fileSize: 50000000, // 50 MB
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-07T11:00:00Z',
    lastSyncTime: '2024-01-09T07:00:00Z',
    qualityScore: 95,
    projectId: 'proj_1',
  },
];

export const mockDatasetColumns: DatasetColumn[] = [
  {
    name: 'customer_id',
    dataType: 'int',
    nullCount: 0,
    uniqueCount: 125000,
    missingPercentage: 0,
  },
  {
    name: 'age',
    dataType: 'int',
    nullCount: 1250,
    uniqueCount: 85,
    mean: 42.5,
    median: 41,
    std: 15.2,
    min: 18,
    max: 90,
    missingPercentage: 1.0,
  },
  {
    name: 'tenure_months',
    dataType: 'int',
    nullCount: 0,
    uniqueCount: 72,
    mean: 32.8,
    median: 29,
    std: 24.6,
    min: 0,
    max: 72,
    missingPercentage: 0,
  },
  {
    name: 'monthly_charges',
    dataType: 'float',
    nullCount: 350,
    uniqueCount: 15000,
    mean: 64.76,
    median: 70.35,
    std: 30.09,
    min: 18.25,
    max: 118.75,
    missingPercentage: 0.28,
  },
  {
    name: 'total_charges',
    dataType: 'float',
    nullCount: 450,
    uniqueCount: 78000,
    mean: 2283.3,
    median: 1397.5,
    std: 2266.8,
    min: 18.8,
    max: 8684.8,
    missingPercentage: 0.36,
  },
  {
    name: 'churn',
    dataType: 'boolean',
    nullCount: 0,
    uniqueCount: 2,
    mode: false,
    missingPercentage: 0,
  },
];

export const mockDatasetPreview: DatasetPreview = {
  columns: ['customer_id', 'age', 'tenure_months', 'monthly_charges', 'total_charges', 'churn'],
  rows: [
    [1, 42, 24, 65.5, 1572.0, false],
    [2, 35, 12, 55.25, 663.0, true],
    [3, 58, 48, 89.9, 4315.2, false],
    [4, 29, 6, 45.75, 274.5, true],
    [5, 51, 36, 75.5, 2718.0, false],
  ],
  totalRows: 125000,
};

export const mockDataQuality: DataQuality = {
  score: 92,
  issues: [
    {
      type: 'missing_values',
      severity: 'low',
      count: 2050,
      description: 'Missing values found in 4 columns',
      affectedColumns: ['age', 'monthly_charges', 'total_charges', 'phone'],
    },
    {
      type: 'outliers',
      severity: 'medium',
      count: 387,
      description: 'Outliers detected in total_charges',
      affectedColumns: ['total_charges'],
    },
    {
      type: 'duplicates',
      severity: 'low',
      count: 45,
      description: 'Duplicate records found',
    },
  ],
  recommendations: [
    'Impute missing values using median for numeric columns',
    'Handle outliers in total_charges using IQR method',
    'Remove duplicate records before training',
  ],
};

// ============================================================================
// TRAINING JOBS
// ============================================================================

export const mockTrainingJobs: TrainingJob[] = [
  {
    id: 'job_1',
    jobName: 'XGBoost Churn Model v3',
    experimentName: 'XGBoost Churn Model v3',
    status: 'running',
    statusLabel: 'Training',
    statusMessage: 'Training epoch 67/100',
    progress: 67,
    progressLabel: '67/100',
    currentEpoch: 67,
    totalEpochs: 100,
    currentAccuracy: 0.912,
    currentAccuracyLabel: '91.2%',
    bestAccuracy: 0.915,
    currentLoss: 0.25,
    datasetId: 'ds_1',
    datasetName: 'Customer Churn Data',
    algorithm: 'xgboost',
    algorithmDisplayName: 'XGBoost (Gradient Boosting)',
    targetVariable: 'churn',
    problemType: 'CLASSIFICATION',
    trainTestSplit: 0.8,
    crossValidationFolds: 5,
    hyperparameters: {
      max_depth: 6,
      learning_rate: 0.1,
      n_estimators: 100,
    },
    gpuAcceleration: false,
    autoHyperparameterTuning: false,
    earlyStopping: true,
    earlyStoppingPatience: 10,
    batchSize: 32,
    evaluationMetric: 'accuracy',
    startedAt: '2026-01-10T10:00:00Z',
    startedAtLabel: '2026-01-10 10:00',
    completedAt: null,
    etaSeconds: 540,
    etaLabel: '9 min',
    durationSeconds: null,
    durationLabel: null,
    modelId: null,
    metrics: null,
    computeResources: 'CPU',
    costEstimate: 0.12,
    costLabel: '$0.12',
    errorMessage: null,
    projectId: 'proj_1',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:15:00Z',
  },
  {
    id: 'job_2',
    jobName: 'Random Forest Baseline',
    experimentName: 'Random Forest Baseline',
    status: 'completed',
    statusLabel: 'Completed',
    statusMessage: 'Training completed successfully',
    progress: 100,
    progressLabel: '100/100',
    currentEpoch: 100,
    totalEpochs: 100,
    currentAccuracy: 0.895,
    currentAccuracyLabel: '89.5%',
    bestAccuracy: 0.895,
    currentLoss: 0.28,
    datasetId: 'ds_1',
    datasetName: 'Customer Churn Data',
    algorithm: 'random_forest',
    algorithmDisplayName: 'Random Forest',
    targetVariable: 'churn',
    problemType: 'CLASSIFICATION',
    trainTestSplit: 0.8,
    crossValidationFolds: 5,
    hyperparameters: {
      n_estimators: 100,
      max_depth: 10,
    },
    gpuAcceleration: false,
    autoHyperparameterTuning: false,
    earlyStopping: true,
    earlyStoppingPatience: 10,
    batchSize: 32,
    evaluationMetric: 'accuracy',
    startedAt: '2026-01-10T08:00:00Z',
    startedAtLabel: '2026-01-10 08:00',
    completedAt: '2026-01-10T08:45:00Z',
    etaSeconds: 0,
    etaLabel: null,
    durationSeconds: 2700,
    durationLabel: '45 minutes',
    modelId: 'model_1',
    metrics: {
      accuracy: 0.895,
      precision: 0.882,
      recall: 0.875,
      f1_score: 0.878,
    },
    computeResources: 'CPU',
    costEstimate: 0.08,
    costLabel: '$0.08',
    errorMessage: null,
    projectId: 'proj_1',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:45:00Z',
  },
  {
    id: 'job_3',
    jobName: 'Neural Network Experiment',
    experimentName: 'Neural Network Experiment',
    status: 'failed',
    statusLabel: 'Failed',
    statusMessage: 'Training failed',
    progress: 23,
    progressLabel: '23/100',
    currentEpoch: 23,
    totalEpochs: 100,
    currentAccuracy: 0.78,
    currentAccuracyLabel: '78.0%',
    bestAccuracy: 0.78,
    currentLoss: 0.52,
    datasetId: 'ds_1',
    datasetName: 'Customer Churn Data',
    algorithm: 'neural_network',
    algorithmDisplayName: 'Neural Network',
    targetVariable: 'churn',
    problemType: 'CLASSIFICATION',
    trainTestSplit: 0.8,
    crossValidationFolds: 5,
    hyperparameters: {
      layers: [128, 64, 32],
      activation: 'relu',
      optimizer: 'adam',
    },
    gpuAcceleration: true,
    autoHyperparameterTuning: false,
    earlyStopping: true,
    earlyStoppingPatience: 10,
    batchSize: 64,
    evaluationMetric: 'accuracy',
    startedAt: '2026-01-08T15:00:00Z',
    startedAtLabel: '2026-01-08 15:00',
    completedAt: '2026-01-08T15:20:00Z',
    etaSeconds: 0,
    etaLabel: null,
    durationSeconds: 1200,
    durationLabel: '20 minutes',
    modelId: null,
    metrics: null,
    computeResources: 'GPU',
    costEstimate: 0.15,
    costLabel: '$0.15',
    errorMessage: 'Out of memory error during training',
    projectId: 'proj_1',
    createdAt: '2026-01-08T15:00:00Z',
    updatedAt: '2026-01-08T15:20:00Z',
  },
];

// ============================================================================
// MODELS
// ============================================================================

export const mockModels: Model[] = [
  {
    id: 'model_1',
    name: 'Churn Predictor v2.1',
    description: 'XGBoost model with optimized hyperparameters',
    algorithm: 'xgboost',
    problemType: 'classification',
    status: 'deployed',
    version: 'v2.1',
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-09T09:00:00Z',
    deployedAt: '2024-01-07T14:00:00Z',
    metrics: {
      accuracy: 93.5,
      precision: 92.8,
      recall: 91.2,
      f1Score: 92.0,
      aucRoc: 96.3,
      trainingTime: 2700, // 45 minutes
      inferenceTime: 15, // 15ms
    },
    datasetId: 'ds_1',
    trainingJobId: 'job_1',
    config: {
      trainTestSplit: 0.8,
      crossValidationFolds: 5,
      randomState: 42,
      hyperparameters: {
        max_depth: 6,
        learning_rate: 0.1,
        n_estimators: 100,
      },
    },
    targetColumn: 'churn',
    features: ['age', 'tenure_months', 'monthly_charges', 'total_charges', 'contract_type'],
    projectId: 'proj_1',
    tags: ['production', 'v2', 'optimized'],
  },
  {
    id: 'model_2',
    name: 'Random Forest Baseline',
    description: 'Baseline model for comparison',
    algorithm: 'random_forest',
    problemType: 'classification',
    status: 'trained',
    version: 'v1.0',
    createdAt: '2024-01-03T14:00:00Z',
    updatedAt: '2024-01-05T11:00:00Z',
    metrics: {
      accuracy: 89.5,
      precision: 88.2,
      recall: 87.5,
      f1Score: 87.8,
      aucRoc: 93.1,
      trainingTime: 1800, // 30 minutes
      inferenceTime: 25, // 25ms
    },
    datasetId: 'ds_1',
    trainingJobId: 'job_2',
    config: {
      trainTestSplit: 0.8,
      crossValidationFolds: 5,
      randomState: 42,
    },
    targetColumn: 'churn',
    features: ['age', 'tenure_months', 'monthly_charges', 'total_charges', 'contract_type'],
    projectId: 'proj_1',
    tags: ['baseline'],
  },
];

// ============================================================================
// EVALUATION
// ============================================================================

export const mockConfusionMatrix: ConfusionMatrix = {
  matrix: [
    [18500, 1200],
    [850, 4450],
  ],
  labels: ['Not Churned', 'Churned'],
  accuracy: 0.935,
  precision: [0.956, 0.787],
  recall: [0.939, 0.840],
  f1Score: [0.947, 0.813],
};

export const mockROCCurve: ROCCurve = {
  fpr: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0],
  tpr: [0, 0.6, 0.75, 0.85, 0.9, 0.95, 0.98, 1.0],
  thresholds: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.0],
  auc: 0.963,
};

export const mockFeatureImportance: FeatureImportance = {
  features: [
    { name: 'tenure_months', importance: 0.38, rank: 1 },
    { name: 'monthly_charges', importance: 0.24, rank: 2 },
    { name: 'total_charges', importance: 0.18, rank: 3 },
    { name: 'contract_type', importance: 0.12, rank: 4 },
    { name: 'age', importance: 0.08, rank: 5 },
  ],
};

export const mockClassificationReport: ClassificationReport = {
  classes: [
    {
      name: 'Not Churned',
      precision: 0.956,
      recall: 0.939,
      f1Score: 0.947,
      support: 19700,
    },
    {
      name: 'Churned',
      precision: 0.787,
      recall: 0.840,
      f1Score: 0.813,
      support: 5300,
    },
  ],
  accuracy: 0.935,
  macroAvg: {
    precision: 0.871,
    recall: 0.889,
    f1Score: 0.880,
  },
  weightedAvg: {
    precision: 0.936,
    recall: 0.935,
    f1Score: 0.935,
  },
};

// ============================================================================
// INTERPRETABILITY
// ============================================================================

export const mockSHAPGlobal: SHAPGlobalExplanation = {
  baseLine: 0.21, // 21% baseline churn rate
  features: [
    {
      name: 'tenure_months',
      importance: 0.38,
      positiveContribution: 0.12,
      negativeContribution: -0.26,
    },
    {
      name: 'monthly_charges',
      importance: 0.24,
      positiveContribution: 0.18,
      negativeContribution: -0.06,
    },
    {
      name: 'total_charges',
      importance: 0.18,
      positiveContribution: 0.08,
      negativeContribution: -0.10,
    },
    {
      name: 'contract_type',
      importance: 0.12,
      positiveContribution: 0.15,
      negativeContribution: -0.03,
    },
    {
      name: 'age',
      importance: 0.08,
      positiveContribution: 0.05,
      negativeContribution: -0.03,
    },
  ],
};

// ============================================================================
// ACTIVITY
// ============================================================================

export const mockActivities: Activity[] = [
  {
    id: 'act_1',
    type: 'training_completed',
    title: 'Training Completed',
    description: 'XGBoost Churn Model v3 training completed with 93.5% accuracy',
    userId: 'user_1',
    userName: 'John Doe',
    entityType: 'training_job',
    entityId: 'job_1',
    metadata: {
      accuracy: 93.5,
      duration: '45 minutes',
    },
    createdAt: '2024-01-09T10:45:00Z',
  },
  {
    id: 'act_2',
    type: 'model_deployed',
    title: 'Model Deployed',
    description: 'Churn Predictor v2.1 deployed to production',
    userId: 'user_1',
    userName: 'John Doe',
    entityType: 'model',
    entityId: 'model_1',
    createdAt: '2024-01-09T09:30:00Z',
  },
  {
    id: 'act_3',
    type: 'dataset_uploaded',
    title: 'Dataset Uploaded',
    description: 'Customer Churn Data uploaded (125k rows)',
    userId: 'user_1',
    userName: 'John Doe',
    entityType: 'dataset',
    entityId: 'ds_1',
    metadata: {
      rows: 125000,
      size: '1.5 GB',
    },
    createdAt: '2024-01-09T08:00:00Z',
  },
];

// ============================================================================
// PREDICTIONS
// ============================================================================

export const mockPredictionHistory: PredictionHistory[] = [
  {
    id: 'pred_1',
    modelId: 'model_1',
    modelName: 'Churn Predictor v2.1',
    input: {
      age: 42,
      tenure_months: 24,
      monthly_charges: 65.5,
      total_charges: 1572.0,
      contract_type: 'monthly',
    },
    prediction: 'Churn',
    probability: 0.78,
    confidence: 0.85,
    timestamp: '2024-01-09T12:30:00Z',
    responseTime: 15,
  },
  {
    id: 'pred_2',
    modelId: 'model_1',
    modelName: 'Churn Predictor v2.1',
    input: {
      age: 58,
      tenure_months: 48,
      monthly_charges: 89.9,
      total_charges: 4315.2,
      contract_type: 'yearly',
    },
    prediction: 'No Churn',
    probability: 0.92,
    confidence: 0.96,
    timestamp: '2024-01-09T12:15:00Z',
    responseTime: 12,
  },
];

export const mockBatchJobs: BatchPredictionJob[] = [
  {
    id: 'batch_1',
    name: 'Q1 Customer Predictions',
    modelId: 'model_1',
    status: 'completed',
    progress: 100,
    totalRecords: 50000,
    processedRecords: 50000,
    startedAt: '2024-01-09T08:00:00Z',
    completedAt: '2024-01-09T08:30:00Z',
    inputFilePath: '/uploads/q1_customers.csv',
    outputFilePath: '/results/q1_predictions.csv',
    outputFormat: 'csv',
  },
  {
    id: 'batch_2',
    name: 'Weekly Churn Check',
    modelId: 'model_1',
    status: 'running',
    progress: 67,
    totalRecords: 25000,
    processedRecords: 16750,
    startedAt: '2024-01-09T11:00:00Z',
    inputFilePath: '/uploads/weekly_batch.csv',
    outputFormat: 'json',
  },
];

// ============================================================================
// ALGORITHMS
// ============================================================================

export const mockAlgorithms: Algorithm[] = [
  {
    name: 'xgboost',
    displayName: 'XGBoost',
    description: 'Gradient boosting framework with high performance',
    supportedProblemTypes: ['classification', 'regression'],
    hyperparameters: [
      {
        name: 'max_depth',
        displayName: 'Max Depth',
        type: 'int',
        min: 1,
        max: 20,
        step: 1,
        default: 6,
        description: 'Maximum depth of trees',
      },
      {
        name: 'learning_rate',
        displayName: 'Learning Rate',
        type: 'float',
        min: 0.001,
        max: 1.0,
        step: 0.001,
        default: 0.1,
        description: 'Step size for weight updates',
      },
      {
        name: 'n_estimators',
        displayName: 'Number of Estimators',
        type: 'int',
        min: 10,
        max: 1000,
        step: 10,
        default: 100,
        description: 'Number of boosting rounds',
      },
    ],
    defaultValues: {
      max_depth: 6,
      learning_rate: 0.1,
      n_estimators: 100,
    },
  },
  {
    name: 'random_forest',
    displayName: 'Random Forest',
    description: 'Ensemble of decision trees',
    supportedProblemTypes: ['classification', 'regression'],
    hyperparameters: [
      {
        name: 'n_estimators',
        displayName: 'Number of Trees',
        type: 'int',
        min: 10,
        max: 500,
        step: 10,
        default: 100,
        description: 'Number of trees in the forest',
      },
      {
        name: 'max_depth',
        displayName: 'Max Depth',
        type: 'int',
        min: 1,
        max: 50,
        step: 1,
        default: 10,
        description: 'Maximum depth of trees',
      },
    ],
    defaultValues: {
      n_estimators: 100,
      max_depth: 10,
    },
  },
];

// ============================================================================
// ALGORITHMS LIST (for training screen)
// ============================================================================

export const mockAlgorithmsList: AlgorithmList = {
  classification: [
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      displayName: 'Logistic Regression',
      description: 'Simple linear classifier, fast and interpretable',
      category: 'classification',
      estimatedTime: '~2 minutes',
      complexity: 'low',
    },
    {
      id: 'random_forest',
      name: 'Random Forest',
      displayName: 'Random Forest',
      description: 'Ensemble of decision trees, good accuracy',
      category: 'classification',
      estimatedTime: '~10 minutes',
      complexity: 'medium',
    },
    {
      id: 'xgboost',
      name: 'XGBoost',
      displayName: 'XGBoost (Gradient Boosting)',
      description: 'Gradient boosting, often best performer',
      category: 'classification',
      estimatedTime: '~15 minutes',
      complexity: 'medium',
    },
    {
      id: 'gradient_boosting',
      name: 'Gradient Boosting',
      displayName: 'Gradient Boosting',
      description: 'Sequential ensemble method',
      category: 'classification',
      estimatedTime: '~15 minutes',
      complexity: 'medium',
    },
    {
      id: 'svm',
      name: 'SVM',
      displayName: 'Support Vector Machine',
      description: 'Effective in high dimensional spaces',
      category: 'classification',
      estimatedTime: '~20 minutes',
      complexity: 'high',
    },
    {
      id: 'decision_tree',
      name: 'Decision Tree',
      displayName: 'Decision Tree',
      description: 'Simple tree-based model, highly interpretable',
      category: 'classification',
      estimatedTime: '~2 minutes',
      complexity: 'low',
    },
  ],
  regression: [
    {
      id: 'linear_regression',
      name: 'Linear Regression',
      displayName: 'Linear Regression',
      description: 'Simple linear model',
      category: 'regression',
      estimatedTime: '~1 minute',
      complexity: 'low',
    },
    {
      id: 'ridge',
      name: 'Ridge Regression',
      displayName: 'Ridge Regression (L2)',
      description: 'Linear with L2 regularization',
      category: 'regression',
      estimatedTime: '~2 minutes',
      complexity: 'low',
    },
    {
      id: 'lasso',
      name: 'Lasso Regression',
      displayName: 'Lasso Regression (L1)',
      description: 'Linear with L1 regularization, feature selection',
      category: 'regression',
      estimatedTime: '~2 minutes',
      complexity: 'low',
    },
    {
      id: 'random_forest_regressor',
      name: 'Random Forest Regressor',
      displayName: 'Random Forest Regressor',
      description: 'Ensemble of decision trees for regression',
      category: 'regression',
      estimatedTime: '~10 minutes',
      complexity: 'medium',
    },
    {
      id: 'xgboost_regressor',
      name: 'XGBoost Regressor',
      displayName: 'XGBoost Regressor',
      description: 'Gradient boosting for regression',
      category: 'regression',
      estimatedTime: '~15 minutes',
      complexity: 'medium',
    },
  ],
};