/**
 * Model Evaluation API Service
 * Real-time integration with backend evaluation endpoints
 */

import apiClient from '../api/client';
import {
  type ThresholdEvaluationRequest,
  type ThresholdEvaluationResponse,
  type BusinessImpactRequest,
  type BusinessImpactResponse,
  type OptimalThresholdRequest,
  type OptimalThresholdResponse,
  type ProductionReadinessRequest,
  type ProductionReadinessResponse,
  type CompleteEvaluationRequest,
  type CompleteEvaluationResponse,
  type BackendEvaluationResponse,
  transformBackendResponse,
} from './types';

const BASE_PATH = '/evaluation';

/**
 * Evaluation API Service
 */
export const evaluationApi = {
  /**
   * 1️⃣ THRESHOLD EVALUATION
   * Evaluate model performance at a specific classification threshold
   */
  evaluateThreshold: async (
    modelId: string,
    request: ThresholdEvaluationRequest
  ): Promise<ThresholdEvaluationResponse> => {
    const response = await apiClient.post<ThresholdEvaluationResponse>(
      `${BASE_PATH}/threshold/${modelId}`,
      request
    );
    return response.data;
  },

  /**
   * 2️⃣ BUSINESS IMPACT
   * Calculate financial impact based on threshold evaluation
   */
  calculateBusinessImpact: async (
    modelId: string,
    request: BusinessImpactRequest
  ): Promise<BusinessImpactResponse> => {
    const response = await apiClient.post<BusinessImpactResponse>(
      `${BASE_PATH}/business-impact/${modelId}`,
      request
    );
    return response.data;
  },

  /**
   * 3️⃣ OPTIMAL THRESHOLD
   * Find the threshold that maximizes profit
   */
  findOptimalThreshold: async (
    modelId: string,
    request: OptimalThresholdRequest
  ): Promise<OptimalThresholdResponse> => {
    const response = await apiClient.post<OptimalThresholdResponse>(
      `${BASE_PATH}/optimal-threshold/${modelId}`,
      request
    );
    return response.data;
  },

  /**
   * 4️⃣ PRODUCTION READINESS
   * Assess if model is ready for production
   */
  assessProductionReadiness: async (
    modelId: string,
    request: ProductionReadinessRequest
  ): Promise<ProductionReadinessResponse> => {
    const response = await apiClient.post<ProductionReadinessResponse>(
      `${BASE_PATH}/production-readiness/${modelId}`,
      request
    );
    return response.data;
  },

  /**
   * 5️⃣ COMPLETE EVALUATION (RECOMMENDED)
   * All-in-one endpoint: threshold + business impact + production readiness
   */
  completeEvaluation: async (
    modelId: string,
    request: CompleteEvaluationRequest
  ): Promise<CompleteEvaluationResponse> => {
    // Backend returns snake_case response, we transform it to camelCase
    const response = await apiClient.post<BackendEvaluationResponse>(
      `${BASE_PATH}/complete/${modelId}`,
      request
    );
    
    // Transform backend response to frontend format
    return transformBackendResponse(response.data);
  },
};

export default evaluationApi;