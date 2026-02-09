/**
 * Mock Evaluation Data
 * Comprehensive mock data for all Model Evaluation tabs
 * Matches CompleteEvaluationResponse type structure
 */

import type { CompleteEvaluationResponse } from './types';

/**
 * Get mock evaluation data for a model
 * This provides complete data for all tabs: Overview, Performance, Confusion Matrix, Business Impact, ROC Curve, Threshold
 */
export function getMockEvaluationData(modelId: string): CompleteEvaluationResponse {
  return {
    modelId,
    overallScore: 92,
    
    // ============================================================================
    // THRESHOLD EVALUATION (Performance + Confusion Matrix)
    // ============================================================================
    thresholdEvaluation: {
      modelId,
      threshold: 0.5,
      confusionMatrix: {
        tn: 850,   // True Negatives
        fp: 45,    // False Positives
        fn: 32,    // False Negatives
        tp: 873,   // True Positives
        total: 1800,
      },
      metrics: {
        accuracy: 0.9572,
        precision: 0.9510,
        recall: 0.9646,
        f1Score: 0.9578,
        aucRoc: 0.9823,
      },
      rates: {
        falsePositiveRate: 0.0503,   // FP / (FP + TN)
        falseNegativeRate: 0.0354,   // FN / (FN + TP)
        truePositiveRate: 0.9646,    // TP / (TP + FN) - Same as Recall
        trueNegativeRate: 0.9497,    // TN / (TN + FP)
      },
    },
    
    // ============================================================================
    // BUSINESS IMPACT DATA
    // ============================================================================
    businessImpact: {
      modelId,
      costs: {
        falsePositiveCost: 22500,     // FP * cost_fp = 45 * 500
        falseNegativeCost: 64000,     // FN * cost_fn = 32 * 2000
        totalCost: 86500,             // falsePositiveCost + falseNegativeCost
        costPerFalsePositive: 500,
        costPerFalseNegative: 2000,
      },
      revenue: {
        truePositiveRevenue: 873000,  // TP * revenue_tp = 873 * 1000
        revenueIfOptimal: 905000,     // If we had optimal threshold
        revenuePerTruePositive: 1000,
      },
      financial: {
        profit: 786500,               // revenue - cost = 873000 - 86500
        improvementVsBaseline: 0.2338, // 23.38% improvement over baseline
        atVolume: 1800,
        approvalRate: 0.51,
      },
      scaledCounts: {
        truePositives: 873,
        falsePositives: 45,
        falseNegatives: 32,
      },
    },
    
    // ============================================================================
    // PRODUCTION READINESS
    // ============================================================================
    productionReadiness: {
      modelId,
      overallStatus: 'READY',
      summary: {
        passed: 5,
        totalCriteria: 5,
        passPercentage: 100,
      },
      criteria: [
        {
          name: 'Model Performance',
          passed: true,
          value: 95,
          threshold: 85,
          description: 'Excellent performance metrics (F1: 0.96, AUC: 0.98)',
          category: 'Performance',
        },
        {
          name: 'Business Value',
          passed: true,
          value: 98,
          threshold: 80,
          description: 'Strong ROI (909%) and profit margin (90%)',
          category: 'Business',
        },
        {
          name: 'Model Calibration',
          passed: true,
          value: 92,
          threshold: 80,
          description: 'Well-calibrated predictions',
          category: 'Quality',
        },
        {
          name: 'Feature Stability',
          passed: true,
          value: 88,
          threshold: 75,
          description: 'Top features show consistent importance',
          category: 'Stability',
        },
        {
          name: 'Learning Convergence',
          passed: true,
          value: 90,
          threshold: 80,
          description: 'Learning curves show good convergence',
          category: 'Training',
        },
      ],
    },
    
    // ============================================================================
    // LEARNING CURVE DATA
    // ============================================================================
    learningCurve: {
      trainAccuracy: 0.947,
      testAccuracy: 0.957,
      overfittingRatio: 0.989,  // testAccuracy / trainAccuracy (closer to 1 is better)
      status: 'Good Fit',
    },
    
    // ============================================================================
    // FEATURE IMPORTANCE
    // ============================================================================
    featureImportance: {
      topFeatures: 10,
      totalFeatures: 15,
      features: [
        {
          rank: 1,
          name: 'Credit Score',
          importanceScore: 0.2845,
          importancePercent: 28.45,
          correlationWithTarget: 0.68,
          correlationStrength: 'Strong Positive',
        },
        {
          rank: 2,
          name: 'Annual Income',
          importanceScore: 0.2156,
          importancePercent: 21.56,
          correlationWithTarget: 0.54,
          correlationStrength: 'Moderate Positive',
        },
        {
          rank: 3,
          name: 'Debt-to-Income Ratio',
          importanceScore: 0.1823,
          importancePercent: 18.23,
          correlationWithTarget: -0.62,
          correlationStrength: 'Strong Negative',
        },
        {
          rank: 4,
          name: 'Employment Length',
          importanceScore: 0.1245,
          importancePercent: 12.45,
          correlationWithTarget: 0.42,
          correlationStrength: 'Moderate Positive',
        },
        {
          rank: 5,
          name: 'Previous Defaults',
          importanceScore: 0.0892,
          importancePercent: 8.92,
          correlationWithTarget: -0.71,
          correlationStrength: 'Strong Negative',
        },
        {
          rank: 6,
          name: 'Loan Amount',
          importanceScore: 0.0567,
          importancePercent: 5.67,
          correlationWithTarget: -0.23,
          correlationStrength: 'Weak Negative',
        },
        {
          rank: 7,
          name: 'Age',
          importanceScore: 0.0234,
          importancePercent: 2.34,
          correlationWithTarget: 0.18,
          correlationStrength: 'Weak Positive',
        },
        {
          rank: 8,
          name: 'Number of Accounts',
          importanceScore: 0.0156,
          importancePercent: 1.56,
          correlationWithTarget: 0.12,
          correlationStrength: 'Weak Positive',
        },
        {
          rank: 9,
          name: 'Home Ownership',
          importanceScore: 0.0052,
          importancePercent: 0.52,
          correlationWithTarget: 0.08,
          correlationStrength: 'Very Weak',
        },
        {
          rank: 10,
          name: 'Purpose',
          importanceScore: 0.003,
          importancePercent: 0.30,
          correlationWithTarget: -0.05,
          correlationStrength: 'Very Weak',
        },
      ],
      interactions: [
        {
          feature1: 'Credit Score',
          feature2: 'Annual Income',
          interactionStrength: 0.42,
          interactionDirection: 'Positive Synergy',
        },
        {
          feature1: 'Debt-to-Income Ratio',
          feature2: 'Loan Amount',
          interactionStrength: 0.38,
          interactionDirection: 'Negative Synergy',
        },
        {
          feature1: 'Employment Length',
          feature2: 'Age',
          interactionStrength: 0.28,
          interactionDirection: 'Positive Synergy',
        },
      ],
    },
    
    // ============================================================================
    // ROC CURVE & PR CURVE
    // ============================================================================
    curves: {
      rocCurve: {
        fpr: [0.0, 0.02, 0.05, 0.08, 0.12, 0.18, 0.25, 0.35, 0.48, 0.65, 0.82, 1.0],
        tpr: [0.0, 0.65, 0.82, 0.89, 0.93, 0.96, 0.975, 0.988, 0.995, 0.998, 0.999, 1.0],
        thresholds: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.0],
        auc: 0.9823,
      },
      prCurve: {
        precision: [0.95, 0.951, 0.948, 0.945, 0.942, 0.935, 0.925, 0.91, 0.89, 0.85, 0.78, 0.65],
        recall: [0.65, 0.72, 0.79, 0.84, 0.88, 0.92, 0.95, 0.97, 0.985, 0.993, 0.998, 1.0],
        thresholds: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05, 0.0],
        ap: 0.9456,
      },
    },
    
    // ============================================================================
    // OPTIMAL THRESHOLD
    // ============================================================================
    optimalThreshold: {
      currentThreshold: 0.5,
      optimalThreshold: 0.52,
      currentProfit: 786500,
      optimalProfit: 791200,
      improvement: 4700,
      recommendation: 'Increasing threshold to 0.52 would maximize profit while maintaining high F1-Score',
    },
  };
}

/**
 * Get mock data for multiple models (for comparison)
 */
export function getMockEvaluationComparison(modelIds: string[]): CompleteEvaluationResponse[] {
  return modelIds.map((modelId, index) => {
    const baseData = getMockEvaluationData(modelId);
    
    // Vary metrics slightly for comparison
    const variance = (index * 0.02) - 0.01;
    
    return {
      ...baseData,
      thresholdEvaluation: {
        ...baseData.thresholdEvaluation,
        metrics: {
          accuracy: Math.max(0.85, Math.min(0.98, baseData.thresholdEvaluation.metrics.accuracy + variance)),
          precision: Math.max(0.85, Math.min(0.98, baseData.thresholdEvaluation.metrics.precision + variance)),
          recall: Math.max(0.85, Math.min(0.98, baseData.thresholdEvaluation.metrics.recall + variance)),
          f1Score: Math.max(0.85, Math.min(0.98, baseData.thresholdEvaluation.metrics.f1Score + variance)),
          aucRoc: Math.max(0.85, Math.min(0.99, baseData.thresholdEvaluation.metrics.aucRoc + variance)),
        },
      },
    };
  });
}
