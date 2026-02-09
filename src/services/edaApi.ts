/**
 * EDA API SERVICE - FastAPI Backend Integration
 * Complete integration with new FastAPI backend (port 8000)
 * Implements async job-based analysis workflow
 */

import { config, getAuthToken } from '@/config/environment';

const BASE_URL = config.api.baseURL;

// ============================================================================
// TYPE DEFINITIONS (matching FastAPI backend responses)
// ============================================================================

// Health Check Response
export interface HealthResponse {
  status: string;
  timestamp: string;
  components: {
    api: string;
    cache: string;
    database: string;
  };
  version: string;
}

// Start Analysis Response
export interface StartAnalysisResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  dataset_id: string;
  created_at: string;
  estimated_time: string;
  polling_endpoint: string;
}

// Job Status Response
export interface JobStatusResponse {
  job_id: string;
  dataset_id: string;
  user_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  current_phase: string;
  created_at: string;
  updated_at: string;
  error?: string;
}

// Data Profile Summary
export interface DataProfileSummary {
  rows: number;
  columns: number;
  memory_mb: number;
  missing_values_percent: number;
  duplicate_rows: number;
  data_types: {
    int64?: number;
    float64?: number;
    object?: number;
    bool?: number;
    datetime64?: number;
  };
  numeric_columns: string[];
  categorical_columns: string[];
  datetime_columns: string[];
  generated_at: string;
}

// ============================================================================
// PHASE 2 TYPE DEFINITIONS
// ============================================================================

// Histogram Response
export interface HistogramColumn {
  column: string;
  bins: string[];
  frequencies: number[];
  bin_edges: number[];
  total_count: number;
  missing_count: number;
  statistics: {
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
    q1: number;
    q3: number;
  };
}

export interface HistogramResponse {
  dataset_id: string;
  histograms: {
    [columnName: string]: HistogramColumn;
  };
  total_numeric_columns: number;
  successfully_generated: number;
}

// Outlier Response
export interface OutlierColumn {
  column: string;
  lower_bound: number;
  upper_bound: number;
  IQR: number;
  outlier_count: number;
  outlier_percentage: number;
  outlier_indices: number[];
  min_outlier: number;
  max_outlier: number;
  statistics: {
    mean: number;
    median: number;
    q1: number;
    q3: number;
  };
}

export interface OutlierResponse {
  dataset_id: string;
  outliers: {
    [columnName: string]: OutlierColumn;
  };
  total_numeric_columns: number;
  columns_with_outliers: number;
  method: string;
}

// Normality Response
export interface NormalityColumn {
  column: string;
  test: string;
  statistic: number;
  p_value: number;
  is_normal: boolean;
  interpretation: string;
  skewness: number;
  kurtosis: number;
  sample_size: number;
}

export interface NormalityResponse {
  dataset_id: string;
  normality_tests: {
    [columnName: string]: NormalityColumn;
  };
  total_numeric_columns: number;
  normal_columns: number;
  non_normal_columns: number;
}

// Distribution Response
export interface DistributionColumn {
  column: string;
  skewness: number;
  kurtosis: number;
  distribution_type: string;
  kurtosis_type: string;
  characteristics: string[];
}

export interface DistributionResponse {
  dataset_id: string;
  distributions: {
    [columnName: string]: DistributionColumn;
  };
  total_numeric_columns: number;
  analyzed_columns: number;
}

// Categorical Response
export interface CategoricalValueData {
  count: number;
  percentage: number;
}

export interface CategoricalColumn {
  column: string;
  unique_values: number;
  top_values: {
    [value: string]: CategoricalValueData;
  };
  total_rows: number;
  missing_count: number;
}

export interface CategoricalResponse {
  dataset_id: string;
  categorical_distributions: {
    [columnName: string]: CategoricalColumn;
  };
  total_categorical_columns: number;
  analyzed_columns: number;
}

// Enhanced Correlations Response
export interface CorrelationPair {
  column1: string;
  column2: string;
  correlation: number;
  p_value: number;
  strength: string;
}

export interface EnhancedCorrelationResponse {
  dataset_id: string;
  all_correlations: {
    [key: string]: {
      correlation: number;
      p_value: number;
      significant: boolean;
      strength: string;
    };
  };
  high_correlations: CorrelationPair[];
  threshold: number;
  total_correlations: number;
  high_correlation_count: number;
}

// Complete Phase 2 Response
export interface Phase2CompleteResponse {
  dataset_id: string;
  timestamp: string;
  phase: number;
  histograms: HistogramResponse;
  outliers: OutlierResponse;
  normality: NormalityResponse;
  distributions: DistributionResponse;
  categorical: CategoricalResponse;
  correlations_enhanced: EnhancedCorrelationResponse;
}

// ============================================================================
// PHASE 3 TYPE DEFINITIONS - ADVANCED CORRELATION ANALYSIS
// ============================================================================

// VIF Analysis Response
export interface VIFScore {
  vif_score: number;
  severity: 'OK' | 'WARNING' | 'CRITICAL';
  recommendation: string;
}

export interface VIFAnalysisResponse {
  dataset_id: string;
  vif_scores: {
    [feature: string]: VIFScore;
  };
  overall_multicollinearity_level: 'low' | 'moderate' | 'high' | 'severe';
  interpretation: string;
  analyzed_features: number;
}

// Heatmap Data Response
export interface HeatmapDataResponse {
  dataset_id: string;
  numeric_columns: string[];
  heatmap: number[][];
  min_value: number;
  max_value: number;
}

// Clustering Response
export interface FeatureCluster {
  cluster_id: number;
  features: string[];
  size: number;
  avg_internal_correlation: number;
}

export interface ClusteringResponse {
  dataset_id: string;
  clusters: FeatureCluster[];
  cluster_interpretation: string;
  total_clusters: number;
  method: string;
}

// Relationship Insights Response
export interface RelationshipPair {
  feature1: string;
  feature2: string;
  correlation: number;
  interpretation: string;
}

export interface FeatureConnectivity {
  feature: string;
  connected_count: number;
  connectivity_score: number;
  avg_correlation: number;
}

export interface RelationshipInsightsResponse {
  dataset_id: string;
  strongest_positive_relationships: RelationshipPair[];
  strongest_negative_relationships: RelationshipPair[];
  feature_connectivity: FeatureConnectivity[];
}

// Multicollinearity Warnings Response
export interface MulticollinearityWarning {
  type: 'high_vif' | 'high_correlation' | 'cluster_detected';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  affected_features: string[];
  recommendation: string;
  details?: any;
}

export interface MulticollinearityWarningsResponse {
  dataset_id: string;
  warnings: MulticollinearityWarning[];
  overall_assessment: string;
  total_warnings: number;
  critical_count: number;
  warning_count: number;
}

// Enhanced Correlations Response (Phase 3)
export interface CorrelationStatistics {
  total_features: number;
  total_correlations: number;
  high_positive_count: number;
  high_negative_count: number;
  avg_correlation: number;
  max_correlation: number;
  min_correlation: number;
}

export interface Phase3EnhancedCorrelationsResponse {
  dataset_id: string;
  correlation_matrix: {
    [feature: string]: {
      [feature: string]: number;
    };
  };
  correlation_pairs: Array<{
    feature1: string;
    feature2: string;
    correlation: number;
    p_value: number;
    strength: string;
  }>;
  high_correlations: Array<{
    feature1: string;
    feature2: string;
    correlation: number;
    strength: string;
  }>;
  statistics: CorrelationStatistics;
}

// Complete Phase 3 Analysis Response
export interface Phase3CompleteResponse {
  dataset_id: string;
  timestamp: string;
  phase: number;
  enhanced_correlations: Phase3EnhancedCorrelationsResponse;
  vif_analysis: VIFAnalysisResponse;
  heatmap_data: HeatmapDataResponse;
  clustering: ClusteringResponse;
  relationship_insights: RelationshipInsightsResponse;
  warnings: MulticollinearityWarningsResponse;
}

// ============================================================================
// BACKEND RESPONSE TYPES & ADAPTERS (Phase 1)
// ============================================================================

// ✅ Backend raw response (what FastAPI actually returns)
interface BackendProfileResponse {
  dataset_id: string;
  shape: [number, number];
  columns: string[];
  dtypes: Record<string, string>;
  memory_usage: string;
}

// Backend Statistics Response
export interface NumericalStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  missing: number;
  missing_percent: number;
}

export interface CategoricalStats {
  count: number;
  unique: number;
  mode: string;
  mode_frequency: number;
  missing: number;
  missing_percent: number;
}

interface BackendStatisticsResponse {
  dataset_id: string;
  numeric_statistics: {
    [key: string]: NumericalStats;
  };
  categorical_statistics: {
    [key: string]: CategoricalStats;
  };
}

export interface StatisticsResponse {
  dataset_id: string;
  numerical: {
    [key: string]: NumericalStats;
  };
  categorical: {
    [key: string]: CategoricalStats;
  };
}

// Backend Quality Response
export interface QualityCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  score: number;
  message: string;
  details?: any;
}

interface BackendQualityResponse {
  dataset_id: string;
  overall_quality_score: number;
  quality_checks: QualityCheck[];
  recommendations?: string[];
  completeness?: number;
  consistency?: number;
  validity?: number;
  uniqueness?: number;
  missing_values_count?: number;
  duplicate_rows?: number;
  total_cells?: number;
}

export interface QualityReportResponse {
  dataset_id: string;
  overall_quality_score: number;
  checks: QualityCheck[];
  recommendations: string[];
  generated_at?: string;
}

// Backend Correlations Response
export interface CorrelationPairOld {
  feature1: string;
  feature2: string;
  correlation: number;
  p_value?: number;
  strength?: string;
}

interface BackendCorrelationsResponse {
  dataset_id: string;
  correlations: {
    [key: string]: number; // e.g., "credit_score-loan_approved": 0.498
  };
  high_correlation_pairs: number;
  numeric_columns_analyzed: number;
  threshold: number;
  vif_scores?: any;
}

export interface CorrelationsResponse {
  dataset_id: string;
  correlation_type?: string;
  pairs: CorrelationPairOld[];
  high_correlation_pairs: number;
  multicollinearity_detected?: boolean;
  generated_at?: string;
}

// Full Report Response
export interface FullReportResponse {
  dataset_id: string;
  summary: DataProfileSummary;
  statistics: StatisticsResponse;
  quality: QualityReportResponse;
  correlations: CorrelationsResponse;
  generated_at: string;
}

// ✅ Adapter function to transform backend profile to frontend format
function adaptProfileResponse(backend: BackendProfileResponse): DataProfileSummary {
  const [rows, cols] = backend.shape;
  const memoryMB = parseFloat(backend.memory_usage.replace(' MB', ''));
  
  // Categorize columns by dtype
  const numericTypes = ['int64', 'float64', 'int32', 'float32'];
  const datetimeTypes = ['datetime64', 'datetime64[ns]'];
  
  const numeric_columns: string[] = [];
  const categorical_columns: string[] = [];
  const datetime_columns: string[] = [];
  
  Object.entries(backend.dtypes).forEach(([col, dtype]) => {
    if (numericTypes.includes(dtype)) {
      numeric_columns.push(col);
    } else if (datetimeTypes.includes(dtype)) {
      datetime_columns.push(col);
    } else {
      categorical_columns.push(col);
    }
  });
  
  // Count data types
  const data_types: any = {};
  Object.values(backend.dtypes).forEach((dtype) => {
    data_types[dtype] = (data_types[dtype] || 0) + 1;
  });
  
  return {
    rows,
    columns: cols,
    memory_mb: memoryMB,
    missing_values_percent: 0, // TODO: Calculate from backend
    duplicate_rows: 0, // TODO: Get from backend
    data_types,
    numeric_columns,
    categorical_columns,
    datetime_columns,
    generated_at: new Date().toISOString(),
  };
}

// ✅ Adapter for statistics
function adaptStatisticsResponse(backend: BackendStatisticsResponse): StatisticsResponse {
  return {
    dataset_id: backend.dataset_id,
    numerical: backend.numeric_statistics,
    categorical: backend.categorical_statistics,
  };
}

// ✅ Adapter for quality report
function adaptQualityResponse(backend: BackendQualityResponse): QualityReportResponse {
  return {
    dataset_id: backend.dataset_id,
    overall_quality_score: backend.overall_quality_score,
    checks: backend.quality_checks,
    recommendations: backend.recommendations || [],
    generated_at: backend.generated_at,
  };
}

// ✅ Adapter for correlations
function adaptCorrelationsResponse(backend: BackendCorrelationsResponse): CorrelationsResponse {
  const pairs: CorrelationPairOld[] = [];
  
  for (const key in backend.correlations) {
    const [feature1, feature2] = key.split('-');
    const correlation = backend.correlations[key];
    pairs.push({ 
      feature1, 
      feature2, 
      correlation,
      p_value: 0.001, // Default p_value since backend doesn't provide it
      strength: getCorrelationStrength(correlation)
    });
  }
  
  return {
    dataset_id: backend.dataset_id,
    correlation_type: 'pearson',
    pairs,
    high_correlation_pairs: backend.high_correlation_pairs,
    multicollinearity_detected: false,
    generated_at: new Date().toISOString(),
  };
}

// Helper function to determine correlation strength
function getCorrelationStrength(correlation: number): string {
  const abs = Math.abs(correlation);
  if (abs >= 0.7) return correlation > 0 ? 'strong_positive' : 'strong_negative';
  if (abs >= 0.4) return correlation > 0 ? 'moderate_positive' : 'moderate_negative';
  return correlation > 0 ? 'weak_positive' : 'weak_negative';
}

// ============================================================================
// API CLIENT
// ============================================================================

class EdaApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Auth token added to headers:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No auth token found in getHeaders()!');
    }

    return headers;
  }

  /**
   * Generic API call handler with error handling
   */
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      // ✅ FIX: Merge headers properly to avoid overwriting auth token
      const mergedHeaders = {
        ...this.getHeaders(),
        ...options.headers,
      };
      
      console.log('📡 EDA API Call:', {
        url,
        method: options.method || 'GET',
        hasAuthHeader: 'Authorization' in mergedHeaders,
        authHeaderValue: mergedHeaders['Authorization'] ? 
          String(mergedHeaders['Authorization']).substring(0, 30) + '...' : 
          'MISSING',
        allHeaders: mergedHeaders,
      });
      
      const response = await fetch(url, {
        ...options,
        headers: mergedHeaders,
      });

      // Handle different status codes
      if (response.status === 400) {
        const error = await response.json().catch(() => ({ detail: 'Bad Request' }));
        throw new Error(`Validation Error: ${error.detail || 'Invalid request'}`);
      }

      if (response.status === 401) {
        const error = await response.json().catch(() => ({ detail: 'Unauthorized' }));
        throw new Error(`Authentication Error: ${error.detail || 'Missing or invalid authorization'}`);
      }

      if (response.status === 404) {
        const error = await response.json().catch(() => ({ detail: 'Not Found' }));
        throw new Error(`Not Found: ${error.detail || 'Resource not found'}`);
      }

      if (response.status === 500) {
        const error = await response.json().catch(() => ({ detail: 'Internal Server Error' }));
        throw new Error(`Server Error: ${error.detail || 'Internal server error'}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * 1. GET /api/eda/health - Health check
   */
  async checkHealth(): Promise<HealthResponse> {
    return this.apiCall<HealthResponse>('/api/eda/health');
  }

  /**
   * 2. POST /api/eda/dataset/{dataset_id}/analyze - Start analysis
   */
  async startAnalysis(datasetId: string): Promise<StartAnalysisResponse> {
    return this.apiCall<StartAnalysisResponse>(
      `/api/eda/dataset/${datasetId}/analyze`,
      { method: 'POST' }
    );
  }

  /**
   * 3. GET /api/eda/jobs/{job_id} - Get job status
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.apiCall<JobStatusResponse>(`/api/eda/jobs/${jobId}`);
  }

  /**
   * 4. GET /api/eda/{dataset_id}/summary - Get data profile summary
   */
  async getSummary(datasetId: string): Promise<DataProfileSummary> {
    const backendResponse = await this.apiCall<BackendProfileResponse>(`/api/eda/${datasetId}/summary`);
    return adaptProfileResponse(backendResponse);
  }

  /**
   * 5. GET /api/eda/{dataset_id}/statistics - Get statistics
   */
  async getStatistics(datasetId: string): Promise<StatisticsResponse> {
    const backendResponse = await this.apiCall<BackendStatisticsResponse>(`/api/eda/${datasetId}/statistics`);
    return adaptStatisticsResponse(backendResponse);
  }

  /**
   * 6. GET /api/eda/{dataset_id}/quality-report - Get quality report
   */
  async getQualityReport(datasetId: string): Promise<QualityReportResponse> {
    const backendResponse = await this.apiCall<BackendQualityResponse>(`/api/eda/${datasetId}/quality-report`);
    return adaptQualityResponse(backendResponse);
  }

  /**
   * 7. GET /api/eda/{dataset_id}/correlations - Get correlations
   */
  async getCorrelations(
    datasetId: string,
    threshold: number = 0.3
  ): Promise<CorrelationsResponse> {
    const backendResponse = await this.apiCall<BackendCorrelationsResponse>(
      `/api/eda/${datasetId}/correlations?threshold=${threshold}`
    );
    return adaptCorrelationsResponse(backendResponse);
  }

  /**
   * 8. GET /api/eda/{dataset_id}/full-report - Get full report
   */
  async getFullReport(
    datasetId: string,
    format: string = 'json'
  ): Promise<FullReportResponse> {
    return this.apiCall<FullReportResponse>(
      `/api/eda/${datasetId}/full-report?format=${format}`
    );
  }

  /**
   * HELPER: Poll job until completion
   * @param jobId - Job ID to poll
   * @param onProgress - Optional callback for progress updates
   * @param maxAttempts - Maximum polling attempts (default: 180 = 3 minutes at 1s interval)
   * @returns Final job status
   */
  async pollJobStatus(
    jobId: string,
    onProgress?: (status: JobStatusResponse) => void,
    maxAttempts: number = 180
  ): Promise<JobStatusResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.getJobStatus(jobId);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check if job is complete
      if (status.status === 'completed') {
        return status;
      }

      // Check if job failed
      if (status.status === 'failed') {
        throw new Error(status.error || 'Analysis job failed');
      }

      // Wait 1 second before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Analysis timed out - exceeded maximum polling attempts');
  }

  /**
   * CONVENIENCE METHOD: Run complete analysis workflow
   * Start analysis, poll until complete, then return dataset_id for fetching results
   */
  async analyzeDataset(
    datasetId: string,
    onProgress?: (progress: number, phase: string) => void
  ): Promise<{ datasetId: string; jobId: string }> {
    // Start analysis
    const job = await this.startAnalysis(datasetId);

    // Poll until complete
    await this.pollJobStatus(job.job_id, (status) => {
      if (onProgress) {
        onProgress(status.progress, status.current_phase);
      }
    });

    return { datasetId, jobId: job.job_id };
  }

  // ============================================================================
  // PHASE 2 API METHODS
  // ============================================================================

  /**
   * GET /api/eda/{dataset_id}/phase2/histograms - Get histogram data
   */
  async getHistograms(datasetId: string, bins: number = 15): Promise<HistogramResponse> {
    return this.apiCall<HistogramResponse>(
      `/api/eda/${datasetId}/phase2/histograms?bins=${bins}`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase2/outliers - Get outlier detection data
   */
  async getOutliers(datasetId: string): Promise<OutlierResponse> {
    return this.apiCall<OutlierResponse>(
      `/api/eda/${datasetId}/phase2/outliers`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase2/normality - Get normality test data
   */
  async getNormalityTests(datasetId: string): Promise<NormalityResponse> {
    return this.apiCall<NormalityResponse>(
      `/api/eda/${datasetId}/phase2/normality`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase2/distributions - Get distribution analysis
   */
  async getDistributionAnalysis(datasetId: string): Promise<DistributionResponse> {
    return this.apiCall<DistributionResponse>(
      `/api/eda/${datasetId}/phase2/distributions`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase2/categorical - Get categorical distributions
   */
  async getCategoricalDistributions(
    datasetId: string,
    topN: number = 10
  ): Promise<CategoricalResponse> {
    return this.apiCall<CategoricalResponse>(
      `/api/eda/${datasetId}/phase2/categorical?top_n=${topN}`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase2/correlations-enhanced - Get enhanced correlations
   */
  async getEnhancedCorrelations(
    datasetId: string,
    threshold: number = 0.3
  ): Promise<EnhancedCorrelationResponse> {
    return this.apiCall<EnhancedCorrelationResponse>(
      `/api/eda/${datasetId}/phase2/correlations-enhanced?threshold=${threshold}`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase2/complete - Get complete Phase 2 analysis
   */
  async getPhase2Complete(datasetId: string): Promise<Phase2CompleteResponse> {
    return this.apiCall<Phase2CompleteResponse>(
      `/api/eda/${datasetId}/phase2/complete`
    );
  }

  // ============================================================================
  // PHASE 3 API METHODS
  // ============================================================================

  /**
   * GET /api/eda/{dataset_id}/phase3/correlations/vif - Get VIF analysis
   */
  async getVIFAnalysis(datasetId: string): Promise<VIFAnalysisResponse> {
    return this.apiCall<VIFAnalysisResponse>(
      `/api/eda/${datasetId}/phase3/correlations/vif`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase3/correlations/heatmap-data - Get heatmap data
   */
  async getHeatmapData(datasetId: string): Promise<HeatmapDataResponse> {
    return this.apiCall<HeatmapDataResponse>(
      `/api/eda/${datasetId}/phase3/correlations/heatmap-data`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase3/correlations/clustering - Get clustering analysis
   */
  async getClustering(datasetId: string): Promise<ClusteringResponse> {
    return this.apiCall<ClusteringResponse>(
      `/api/eda/${datasetId}/phase3/correlations/clustering`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase3/correlations/relationship-insights - Get relationship insights
   */
  async getRelationshipInsights(datasetId: string): Promise<RelationshipInsightsResponse> {
    return this.apiCall<RelationshipInsightsResponse>(
      `/api/eda/${datasetId}/phase3/correlations/relationship-insights`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase3/correlations/warnings - Get multicollinearity warnings
   */
  async getMulticollinearityWarnings(datasetId: string): Promise<MulticollinearityWarningsResponse> {
    return this.apiCall<MulticollinearityWarningsResponse>(
      `/api/eda/${datasetId}/phase3/correlations/warnings`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase3/correlations/enhanced - Get enhanced correlations (Phase 3)
   */
  async getPhase3EnhancedCorrelations(
    datasetId: string,
    threshold: number = 0.3
  ): Promise<Phase3EnhancedCorrelationsResponse> {
    return this.apiCall<Phase3EnhancedCorrelationsResponse>(
      `/api/eda/${datasetId}/phase3/correlations/enhanced?threshold=${threshold}`
    );
  }

  /**
   * GET /api/eda/{dataset_id}/phase3/correlations/complete - Get complete Phase 3 analysis
   */
  async getPhase3Complete(datasetId: string): Promise<Phase3CompleteResponse> {
    const rawResponse = await this.apiCall<any>(
      `/api/eda/${datasetId}/phase3/correlations/complete`
    );
    
    // Adapt the backend response to match our interface
    return adaptPhase3Response(rawResponse);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const edaApi = new EdaApiClient();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get quality score color
 */
export function getQualityColor(score: number): string {
  if (score >= 90) return '#10b981'; // green
  if (score >= 75) return '#3b82f6'; // blue
  if (score >= 60) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}

/**
 * Get quality score assessment
 */
export function getQualityAssessment(score: number): string {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 75) return 'GOOD';
  if (score >= 60) return 'FAIR';
  return 'POOR';
}

/**
 * Get assessment badge variant
 */
export function getAssessmentVariant(
  assessment: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (assessment === 'EXCELLENT') return 'default';
  if (assessment === 'GOOD') return 'secondary';
  if (assessment === 'FAIR') return 'outline';
  return 'destructive';
}

/**
 * Get check status color
 */
export function getCheckStatusColor(status: string): string {
  switch (status) {
    case 'pass':
      return '#10b981'; // green
    case 'warning':
      return '#f59e0b'; // yellow
    case 'fail':
      return '#ef4444'; // red
    default:
      return '#64748b'; // gray
  }
}

/**
 * Get check status variant
 */
export function getCheckStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pass':
      return 'default';
    case 'warning':
      return 'outline';
    case 'fail':
      return 'destructive';
    default:
      return 'secondary';
  }
}

/**
 * Get correlation strength color
 */
export function getCorrelationColor(strength: string): string {
  switch (strength) {
    case 'strong_positive':
      return '#10b981'; // green
    case 'moderate_positive':
      return '#3b82f6'; // blue
    case 'weak_positive':
      return '#93c5fd'; // light blue
    case 'strong_negative':
      return '#ef4444'; // red
    case 'moderate_negative':
      return '#f97316'; // orange
    case 'weak_negative':
      return '#fdba74'; // light orange
    default:
      return '#64748b'; // gray
  }
}

/**
 * Format timestamp
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Calculate missing percentage
 */
export function calculateMissingPercentage(
  missingValues: number,
  totalRows: number
): number {
  if (totalRows === 0) return 0;
  return Number(((missingValues / totalRows) * 100).toFixed(2));
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

// ============================================================================
// PHASE 3 HELPER FUNCTIONS
// ============================================================================

/**
 * Get correlation color based on value (-1 to 1)
 */
export function getCorrelationValueColor(correlation: number): string {
  const abs = Math.abs(correlation);
  
  if (correlation >= 0.7) return '#1a5490'; // Dark Blue
  if (correlation >= 0.5) return '#3b5998'; // Blue
  if (correlation >= 0.3) return '#6c9bcf'; // Light Blue
  if (correlation >= 0) return '#c8e0f4'; // Very Light Blue
  if (correlation >= -0.3) return '#fce5e5'; // Very Light Red
  if (correlation >= -0.5) return '#f5a7a7'; // Light Red
  if (correlation >= -0.7) return '#e84c3d'; // Red
  return '#8b0000'; // Dark Red
}

/**
 * Get VIF severity color
 */
export function getVIFSeverityColor(severity: 'OK' | 'WARNING' | 'CRITICAL'): string {
  switch (severity) {
    case 'OK':
      return '#28a745'; // Green
    case 'WARNING':
      return '#ffc107'; // Amber
    case 'CRITICAL':
      return '#dc3545'; // Red
    default:
      return '#64748b'; // Gray
  }
}

/**
 * Get VIF background color for table rows
 */
export function getVIFBackgroundColor(vifScore: number): string {
  if (vifScore < 5) return 'bg-green-50 dark:bg-green-950/20';
  if (vifScore < 10) return 'bg-yellow-50 dark:bg-yellow-950/20';
  return 'bg-red-50 dark:bg-red-950/20';
}

/**
 * Get warning severity color
 */
export function getWarningSeverityColor(severity: 'INFO' | 'WARNING' | 'CRITICAL'): string {
  switch (severity) {
    case 'INFO':
      return '#17a2b8'; // Cyan
    case 'WARNING':
      return '#ffc107'; // Amber
    case 'CRITICAL':
      return '#dc3545'; // Red
    default:
      return '#64748b'; // Gray
  }
}

/**
 * Get multicollinearity level color
 */
export function getMulticollinearityLevelColor(
  level: 'low' | 'moderate' | 'high' | 'severe'
): string {
  switch (level) {
    case 'low':
      return '#28a745'; // Green
    case 'moderate':
      return '#ffc107'; // Amber
    case 'high':
      return '#f97316'; // Orange
    case 'severe':
      return '#dc3545'; // Red
    default:
      return '#64748b'; // Gray
  }
}

/**
 * Format correlation value for display
 */
export function formatCorrelation(correlation: number): string {
  return correlation.toFixed(3);
}

/**
 * Get correlation strength text
 */
export function getCorrelationStrengthText(correlation: number): string {
  const abs = Math.abs(correlation);
  const direction = correlation >= 0 ? 'Positive' : 'Negative';
  
  if (abs >= 0.7) return `Strong ${direction}`;
  if (abs >= 0.5) return `Moderate ${direction}`;
  if (abs >= 0.3) return `Weak ${direction}`;
  return 'Very Weak';
}

/**
 * Sort correlation pairs by absolute value (descending)
 */
export function sortCorrelationPairs<T extends { correlation: number }>(
  pairs: T[]
): T[] {
  return [...pairs].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

/**
 * Filter high correlations based on threshold
 */
export function filterHighCorrelations<T extends { correlation: number }>(
  pairs: T[],
  threshold: number = 0.5
): T[] {
  return pairs.filter((pair) => Math.abs(pair.correlation) >= threshold);
}

// ============================================================================
// ADAPTER FUNCTIONS FOR PHASE 3 RESPONSE
// ============================================================================

/**
 * Adapter function to transform backend Phase 3 response to frontend format
 */
function adaptPhase3Response(rawResponse: any): Phase3CompleteResponse {
  // ✅ Backend wraps everything in an 'analysis' object
  const analysis = rawResponse.analysis || rawResponse;
  
  const {
    dataset_id,
    timestamp,
    total_features,
  } = rawResponse;

  return {
    dataset_id,
    timestamp,
    phase: 3,
    enhanced_correlations: adaptEnhancedCorrelationsResponse(analysis.enhanced_correlations),
    vif_analysis: adaptVIFAnalysisResponse(analysis.vif_analysis),
    heatmap_data: adaptHeatmapDataResponse(analysis.heatmap_data),
    clustering: adaptClusteringResponse(analysis.clustering),
    relationship_insights: adaptRelationshipInsightsResponse(analysis.relationship_insights),
    warnings: adaptMulticollinearityWarningsResponse(analysis.multicollinearity_warnings),
  };
}

/**
 * Adapter function to transform backend enhanced correlations response to frontend format
 */
function adaptEnhancedCorrelationsResponse(rawResponse: any): Phase3EnhancedCorrelationsResponse {
  const {
    correlation_matrix,
    correlation_pairs,
    high_correlations,
    statistics,
  } = rawResponse;

  console.log('🔧 Adapting enhanced correlations:', {
    rawStatistics: statistics,
    pairsCount: correlation_pairs?.length,
    highCorrelationsCount: high_correlations?.length,
  });

  // Backend uses column1/column2, frontend uses feature1/feature2
  const adaptedPairs = (correlation_pairs || []).map((pair: any) => ({
    feature1: pair.column1,
    feature2: pair.column2,
    correlation: pair.correlation,
    p_value: pair.p_value,
    strength: pair.strength || getCorrelationStrengthText(pair.correlation),
  }));

  const adaptedHighCorrelations = (high_correlations || []).map((pair: any) => ({
    feature1: pair.column1 || pair.feature1,
    feature2: pair.column2 || pair.feature2,
    correlation: pair.correlation,
    strength: pair.strength || getCorrelationStrengthText(pair.correlation),
  }));

  // Count numeric features from correlation matrix
  const numericFeatures = correlation_matrix ? Object.keys(correlation_matrix).length : 0;

  // Backend statistics field mapping
  const adaptedStatistics: CorrelationStatistics = {
    total_features: numericFeatures || statistics?.total_features || 0,
    total_correlations: statistics?.total_pairs || statistics?.total_correlations || 0,
    high_positive_count: statistics?.high_positive_count || 0,
    high_negative_count: statistics?.high_negative_count || 0,
    avg_correlation: statistics?.mean_correlation || statistics?.avg_correlation || 0,
    max_correlation: statistics?.max_correlation || 0,
    min_correlation: statistics?.min_correlation || 0,
  };

  console.log('✅ Adapted statistics:', adaptedStatistics);

  return {
    dataset_id: rawResponse.dataset_id || '',
    correlation_matrix,
    correlation_pairs: adaptedPairs,
    high_correlations: adaptedHighCorrelations,
    statistics: adaptedStatistics,
  };
}

/**
 * Adapter function to transform backend VIF analysis response to frontend format
 */
function adaptVIFAnalysisResponse(rawResponse: any): VIFAnalysisResponse {
  const {
    dataset_id,
    vif_scores,
    overall_multicollinearity_level,
    interpretation,
    analyzed_features,
  } = rawResponse;

  return {
    dataset_id,
    vif_scores,
    overall_multicollinearity_level,
    interpretation,
    analyzed_features,
  };
}

/**
 * Adapter function to transform backend heatmap data response to frontend format
 */
function adaptHeatmapDataResponse(rawResponse: any): HeatmapDataResponse {
  const { numeric_columns, heatmap, min_value, max_value } = rawResponse;

  // Backend returns array of objects like: [{x: 'age', y: 'age', correlation: 1}, ...]
  // Convert to 2D matrix
  const matrix: number[][] = [];
  const size = numeric_columns.length;
  
  // Initialize matrix
  for (let i = 0; i < size; i++) {
    matrix[i] = new Array(size).fill(0);
  }
  
  // Fill matrix from backend data
  if (Array.isArray(heatmap)) {
    heatmap.forEach((cell: any) => {
      const rowIndex = numeric_columns.indexOf(cell.y);
      const colIndex = numeric_columns.indexOf(cell.x);
      if (rowIndex >= 0 && colIndex >= 0) {
        matrix[rowIndex][colIndex] = cell.correlation;
      }
    });
  }

  return {
    dataset_id: rawResponse.dataset_id || '',
    numeric_columns,
    heatmap: matrix,
    min_value,
    max_value,
  };
}

/**
 * Adapter function to transform backend clustering response to frontend format
 */
function adaptClusteringResponse(rawResponse: any): ClusteringResponse {
  const {
    cluster_count,
    cluster_interpretation,
    clusters,
  } = rawResponse;

  // Backend returns clusters as object {1: ['feat1'], 2: ['feat2']}
  // Convert to array of FeatureCluster objects
  const clusterArray: FeatureCluster[] = [];
  
  if (clusters && typeof clusters === 'object') {
    Object.entries(clusters).forEach(([clusterId, features]) => {
      if (Array.isArray(features)) {
        clusterArray.push({
          cluster_id: parseInt(clusterId),
          features,
          size: features.length,
          avg_internal_correlation: 0, // Not provided by backend
        });
      }
    });
  }

  return {
    dataset_id: rawResponse.dataset_id || '',
    clusters: clusterArray,
    cluster_interpretation: cluster_interpretation || '',
    total_clusters: cluster_count || clusterArray.length,
    method: 'hierarchical', // Default
  };
}

/**
 * Adapter function to transform backend relationship insights response to frontend format
 */
function adaptRelationshipInsightsResponse(rawResponse: any): RelationshipInsightsResponse {
  const {
    strongest_positive_relationships,
    strongest_negative_relationships,
    feature_connectivity,
  } = rawResponse;

  // Convert feature_connectivity from object to array
  const connectivityArray: FeatureConnectivity[] = [];
  
  if (feature_connectivity && typeof feature_connectivity === 'object') {
    Object.entries(feature_connectivity).forEach(([feature, data]: [string, any]) => {
      connectivityArray.push({
        feature,
        connected_count: data.total_features || 0,
        connectivity_score: data.connectivity_score || 0,
        avg_correlation: 0, // Not provided by backend
      });
    });
  }

  return {
    dataset_id: rawResponse.dataset_id || '',
    strongest_positive_relationships: strongest_positive_relationships || [],
    strongest_negative_relationships: strongest_negative_relationships || [],
    feature_connectivity: connectivityArray,
  };
}

/**
 * Adapter function to transform backend multicollinearity warnings response to frontend format
 */
function adaptMulticollinearityWarningsResponse(rawResponse: any): MulticollinearityWarningsResponse {
  const {
    dataset_id,
    warnings,
    overall_assessment,
    total_warnings,
    critical_count,
    warning_count,
  } = rawResponse;

  return {
    dataset_id,
    warnings,
    overall_assessment,
    total_warnings,
    critical_count,
    warning_count,
  };
}