/**
 * Model Evaluation Types
 * ======================
 * TypeScript interfaces matching the FastAPI backend Pydantic schemas exactly.
 * Used by ModelEvaluationDashboard and ModelEvaluationContainer.
 * 
 * Backend source: FastAPI @ http://192.168.1.147:8000
 * API endpoint:   GET /api/v1/evaluation/complete/{modelId}
 */

// ============================================================================
// TAB 1: OVERVIEW - Threshold Evaluation
// ============================================================================

export interface ConfusionMatrix {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
  total: number;
}

export interface Metrics {
  accuracy: number;   // 0.0 - 1.0
  precision: number;  // 0.0 - 1.0
  recall: number;     // 0.0 - 1.0
  f1Score: number;    // 0.0 - 1.0
  aucRoc: number;     // 0.0 - 1.0
}

export interface Rates {
  falsePositiveRate: number;  // 0.0 - 1.0
  falseNegativeRate: number;  // 0.0 - 1.0
}

export interface ThresholdEvaluation {
  confusionMatrix: ConfusionMatrix;
  metrics: Metrics;
  rates: Rates;
}

// ============================================================================
// TAB 2: BUSINESS IMPACT
// ============================================================================

export interface Costs {
  totalCost: number;
  falsePositiveCost: number;
  falseNegativeCost: number;
  costPerFalsePositive?: number;
  costPerFalseNegative?: number;
}

export interface Revenue {
  truePositiveRevenue: number;
  revenuePerTruePositive?: number;
}

export interface Financial {
  profit: number;
  improvementVsBaseline: number;  // percentage
  atVolume?: number;
  approvalRate?: number;          // 0.0 - 1.0
}

export interface ScaledCounts {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
}

export interface BusinessImpact {
  costs: Costs;
  revenue: Revenue;
  financial: Financial;
  scaledCounts?: ScaledCounts;
}

// ============================================================================
// TAB 3: CURVES & THRESHOLD
// ============================================================================

export interface ROCCurve {
  fpr: number[];
  tpr: number[];
  thresholds: (number | null)[];
  auc: number;
}

export interface PRCurve {
  precision: number[];
  recall: number[];
  thresholds: (number | null)[];
  ap: number;
}

export interface Curves {
  rocCurve: ROCCurve;
  prCurve: PRCurve;
}

export interface OptimalThreshold {
  optimalThreshold: number;
  optimalProfit: number;
  recommendation: string;
}

// ============================================================================
// TAB 4: ADVANCED ANALYSIS
// ============================================================================

export interface LearningCurve {
  trainAccuracy: number;     // 0.0 - 1.0
  testAccuracy: number;      // 0.0 - 1.0
  overfittingRatio: number;  // 0.0 - 1.0 (gap)
  status: 'acceptable' | 'moderate' | 'overfitting';
}

export interface FeatureDetail {
  name: string;
  importancePercent: number;       // 0 - 100
  correlationWithTarget: number;   // -1.0 to 1.0
  correlationStrength: 'strong' | 'moderate' | 'weak' | 'negligible';
}

export interface FeatureInteraction {
  feature1: string;
  feature2: string;
  interactionStrength: number;     // 0.0 - 1.0
  interactionDirection: 'positive' | 'negative';
}

export interface FeatureImportance {
  features: FeatureDetail[];
  interactions: FeatureInteraction[];
}

// ============================================================================
// TAB 5: PRODUCTION READINESS
// ============================================================================

export interface ReadinessCriterion {
  name: string;
  description: string;
  passed: boolean;
  category?: string;
}

export interface ReadinessSummary {
  passed: number;
  totalCriteria: number;
  passPercentage: number;
}

export interface ProductionReadiness {
  overallStatus: 'READY' | 'WARNING' | 'NOT_READY';
  summary: ReadinessSummary;
  criteria: ReadinessCriterion[];
}

// ============================================================================
// MODEL INFO
// ============================================================================

export interface ModelInfo {
  requestedId: string;
  resolvedName: string;
  algorithmType: string;
}

// ============================================================================
// COMPLETE EVALUATION RESPONSE (all 5 tabs)
// ============================================================================

export interface CompleteEvaluationResponse {
  // Required (Tab 1 + Tab 2 + Tab 5 always computed)
  thresholdEvaluation: ThresholdEvaluation;
  businessImpact: BusinessImpact;
  productionReadiness: ProductionReadiness;

  // Optional (may be null if artifacts not available)
  curves?: Curves | null;
  learningCurve?: LearningCurve | null;
  featureImportance?: FeatureImportance | null;
  optimalThreshold?: OptimalThreshold | null;
  overallScore?: number | null;
  
  // Model metadata
  modelInfo?: ModelInfo;
}

// ============================================================================
// MODEL LIST (for selector dropdown)
// ============================================================================

export interface TrainedModelInfo {
  id: string;
  name: string;
  algorithm: string;
  accuracy?: number | null;
  testScore?: number | null;
  problemType: string;
  trainedAt?: string | null;
}

export interface TrainedModelsListResponse {
  models: TrainedModelInfo[];
  bestModelId?: string | null;
  totalModels: number;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface EvaluationParams {
  threshold?: number;
  cost_fp?: number;
  cost_fn?: number;
  revenue_tp?: number;
  volume?: number;
}

// ============================================================================
// DIAGNOSTICS
// ============================================================================

export interface ArtifactStatus {
  path: string;
  exists: boolean;
  size_bytes: number;
  status: string;
}

export interface DiagnosticsResponse {
  kedro_project_path: string;
  kedro_project_exists: boolean;
  artifacts: Record<string, ArtifactStatus>;
  summary: {
    found: number;
    total: number;
    percentage: number;
    ready_for_evaluation: boolean;
  };
  tab_readiness: {
    tab1_overview: boolean;
    tab2_business: boolean;
    tab3_curves: boolean;
    tab4_advanced: boolean;
    tab5_production: boolean;
  };
}
