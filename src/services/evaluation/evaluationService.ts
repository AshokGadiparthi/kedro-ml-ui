/**
 * Model Evaluation API Service
 * =============================
 * Calls the real backend API endpoints instead of returning mock data.
 * 
 * API Base: /api/v1/evaluation
 * Backend: http://192.168.1.147:8000
 * 
 * Usage in ModelEvaluationContainer:
 *   import { evaluationApi } from '@/services/evaluation/evaluationService';
 *   const data = await evaluationApi.getCompleteEvaluation(modelId, params);
 */

import { apiClient } from '../api/client';
import type {
  CompleteEvaluationResponse,
  EvaluationParams,
  TrainedModelsListResponse,
  DiagnosticsResponse,
  ThresholdEvaluation,
  BusinessImpact,
  Curves,
  OptimalThreshold,
  LearningCurve,
  FeatureImportance,
  ProductionReadiness,
} from './types';

const BASE_PATH = '/api/v1/evaluation';

// ============================================================================
// EVALUATION API
// ============================================================================

export const evaluationApi = {

  /**
   * List trained models available from Kedro pipeline outputs.
   * Used to populate the model selector dropdown.
   * 
   * GET /api/v1/evaluation/trained-models
   */
  async getTrainedModels(): Promise<TrainedModelsListResponse> {
    const response = await apiClient.get(`${BASE_PATH}/trained-models`);
    console.log('📋 Trained models loaded:', response.data);
    return response.data;
  },

  /**
   * Get complete evaluation for all 5 dashboard tabs.
   * This is the PRIMARY call that feeds the entire dashboard.
   * 
   * GET /api/v1/evaluation/complete/{modelId}?threshold=0.5&cost_fp=500&...
   */
  async getCompleteEvaluation(
    modelId: string,
    params: EvaluationParams = {},
  ): Promise<CompleteEvaluationResponse> {
    const response = await apiClient.get(`${BASE_PATH}/complete/${encodeURIComponent(modelId)}`, {
      params: {
        threshold: params.threshold ?? 0.5,
        cost_fp: params.cost_fp ?? 500,
        cost_fn: params.cost_fn ?? 2000,
        revenue_tp: params.revenue_tp ?? 1000,
        volume: params.volume,
      },
    });

    console.log('📊 Complete evaluation loaded for model:', modelId, response.data);
    return response.data;
  },

  /**
   * Get only threshold evaluation (Tab 1 - Overview).
   * Lightweight call for threshold slider real-time updates.
   * 
   * GET /api/v1/evaluation/threshold/{modelId}?threshold=0.5
   */
  async getThresholdEvaluation(
    modelId: string,
    threshold: number = 0.5,
  ): Promise<ThresholdEvaluation> {
    const response = await apiClient.get(`${BASE_PATH}/threshold/${encodeURIComponent(modelId)}`, {
      params: { threshold },
    });
    return response.data;
  },

  /**
   * Get only business impact (Tab 2).
   * 
   * GET /api/v1/evaluation/business/{modelId}?threshold=0.5&cost_fp=500&...
   */
  async getBusinessImpact(
    modelId: string,
    params: EvaluationParams = {},
  ): Promise<BusinessImpact> {
    const response = await apiClient.get(`${BASE_PATH}/business/${encodeURIComponent(modelId)}`, {
      params: {
        threshold: params.threshold ?? 0.5,
        cost_fp: params.cost_fp ?? 500,
        cost_fn: params.cost_fn ?? 2000,
        revenue_tp: params.revenue_tp ?? 1000,
        volume: params.volume,
      },
    });
    return response.data;
  },

  /**
   * Get ROC + PR curves (Tab 3).
   * 
   * GET /api/v1/evaluation/curves/{modelId}
   */
  async getCurves(modelId: string): Promise<{ curves: Curves; optimalThreshold: OptimalThreshold }> {
    const response = await apiClient.get(`${BASE_PATH}/curves/${encodeURIComponent(modelId)}`);
    return response.data;
  },

  /**
   * Get learning curve + feature importance (Tab 4).
   * 
   * GET /api/v1/evaluation/advanced/{modelId}
   */
  async getAdvancedAnalysis(modelId: string): Promise<{ 
    learningCurve: LearningCurve; 
    featureImportance: FeatureImportance 
  }> {
    const response = await apiClient.get(`${BASE_PATH}/advanced/${encodeURIComponent(modelId)}`);
    return response.data;
  },

  /**
   * Get production readiness checklist (Tab 5).
   * 
   * GET /api/v1/evaluation/production/{modelId}?threshold=0.5
   */
  async getProductionReadiness(
    modelId: string, 
    threshold: number = 0.5
  ): Promise<ProductionReadiness> {
    const response = await apiClient.get(`${BASE_PATH}/production/${encodeURIComponent(modelId)}`, {
      params: { threshold },
    });
    return response.data;
  },

  /**
   * Clear backend cache. Call after re-running Kedro pipeline.
   * 
   * POST /api/v1/evaluation/refresh-cache
   */
  async refreshCache(): Promise<{ status: string; message: string }> {
    const response = await apiClient.post(`${BASE_PATH}/refresh-cache`);
    console.log('🔄 Evaluation cache refreshed:', response.data);
    return response.data;
  },

  /**
   * Check which Kedro artifacts are available (debugging).
   * 
   * GET /api/v1/evaluation/diagnostics
   */
  async getDiagnostics(): Promise<DiagnosticsResponse> {
    const response = await apiClient.get(`${BASE_PATH}/diagnostics`);
    console.log('🔍 Diagnostics:', response.data);
    return response.data;
  },
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default evaluationApi;
