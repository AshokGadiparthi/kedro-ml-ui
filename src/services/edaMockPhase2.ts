/**
 * PHASE 2 EDA - MOCK DATA GENERATORS
 * Temporary mock data for Phase 2 features until backend APIs are ready
 * Easy to swap with real API calls later
 */

import { StatisticsResponse, NumericalStats } from './edaApi';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface HistogramData {
  bins: string[];
  frequencies: number[];
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
    [columnName: string]: HistogramData;
  };
  generated_at: string;
}

export interface OutlierData {
  outlier_count: number;
  outlier_percentage: number;
  lower_bound: number;
  upper_bound: number;
  outlier_indices: number[];
}

export interface OutlierResponse {
  dataset_id: string;
  outliers: {
    [columnName: string]: OutlierData;
  };
  columns_with_outliers: number;
  generated_at: string;
}

export interface NormalityTestData {
  test_name: string;
  statistic: number;
  p_value: number;
  is_normal: boolean;
  skewness: number;
  kurtosis: number;
}

export interface NormalityResponse {
  dataset_id: string;
  normality_tests: {
    [columnName: string]: NormalityTestData;
  };
  generated_at: string;
}

export interface DistributionData {
  distribution_type: 'normal' | 'right_skewed' | 'left_skewed' | 'bimodal' | 'uniform';
  kurtosis_type: 'mesokurtic' | 'leptokurtic' | 'platykurtic';
  characteristics: string[];
}

export interface DistributionResponse {
  dataset_id: string;
  distributions: {
    [columnName: string]: DistributionData;
  };
  generated_at: string;
}

export interface CategoricalValueData {
  count: number;
  percentage: number;
}

export interface CategoricalDistributionData {
  unique_values: number;
  top_values: {
    [value: string]: CategoricalValueData;
  };
  entropy: number;
}

export interface CategoricalDistributionResponse {
  dataset_id: string;
  categorical_distributions: {
    [columnName: string]: CategoricalDistributionData;
  };
  generated_at: string;
}

export interface EnhancedCorrelationPair {
  column1: string;
  column2: string;
  correlation: number;
  p_value: number;
  strength: 'weak' | 'moderate' | 'strong';
  significant: boolean;
}

export interface EnhancedCorrelationResponse {
  dataset_id: string;
  high_correlations: EnhancedCorrelationPair[];
  generated_at: string;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate realistic histogram data from statistics
 */
export function generateMockHistograms(
  datasetId: string,
  statistics: StatisticsResponse
): HistogramResponse {
  const histograms: { [key: string]: HistogramData } = {};

  Object.entries(statistics.numerical).forEach(([columnName, stats]) => {
    const bins: string[] = [];
    const frequencies: number[] = [];
    
    // Create 12 bins for histogram
    const range = stats.max - stats.min;
    const binSize = range / 12;
    
    const mean = stats.mean;
    const std = stats.std;
    
    // Generate histogram using normal distribution approximation
    for (let i = 0; i < 12; i++) {
      const binStart = stats.min + i * binSize;
      const binEnd = stats.min + (i + 1) * binSize;
      const binMid = (binStart + binEnd) / 2;
      
      // Create bin label
      bins.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
      
      // Calculate frequency using normal distribution
      const zScore = std > 0 ? Math.abs((binMid - mean) / std) : 0;
      const normalValue = Math.exp(-0.5 * zScore * zScore);
      
      // Add some randomness for realistic look
      const randomFactor = 0.8 + Math.random() * 0.4;
      const frequency = Math.max(5, Math.round(normalValue * 150 * randomFactor));
      
      frequencies.push(frequency);
    }
    
    histograms[columnName] = {
      bins,
      frequencies,
      statistics: {
        mean: stats.mean,
        median: stats.median,
        std: stats.std,
        min: stats.min,
        max: stats.max,
        q1: stats.q1,
        q3: stats.q3,
      },
    };
  });

  return {
    dataset_id: datasetId,
    histograms,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate mock outlier detection data
 */
export function generateMockOutliers(
  datasetId: string,
  statistics: StatisticsResponse
): OutlierResponse {
  const outliers: { [key: string]: OutlierData } = {};
  let columnsWithOutliers = 0;

  Object.entries(statistics.numerical).forEach(([columnName, stats]) => {
    // Calculate IQR bounds
    const iqr = stats.q3 - stats.q1;
    const lower_bound = stats.q1 - 1.5 * iqr;
    const upper_bound = stats.q3 + 1.5 * iqr;
    
    // Randomly decide if this column has outliers
    const hasOutliers = Math.random() > 0.5;
    const outlier_count = hasOutliers ? Math.floor(Math.random() * 20) + 5 : 0;
    const outlier_percentage = (outlier_count / 1500) * 100; // Assuming 1500 rows
    
    if (outlier_count > 0) {
      columnsWithOutliers++;
    }
    
    outliers[columnName] = {
      outlier_count,
      outlier_percentage,
      lower_bound,
      upper_bound,
      outlier_indices: Array.from({ length: outlier_count }, (_, i) => i),
    };
  });

  return {
    dataset_id: datasetId,
    outliers,
    columns_with_outliers: columnsWithOutliers,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate mock normality test data
 */
export function generateMockNormalityTests(
  datasetId: string,
  statistics: StatisticsResponse
): NormalityResponse {
  const normality_tests: { [key: string]: NormalityTestData } = {};

  Object.entries(statistics.numerical).forEach(([columnName, stats]) => {
    // Generate realistic Shapiro-Wilk results
    const p_value = Math.random();
    const is_normal = p_value > 0.05;
    
    // Generate skewness and kurtosis
    const skewness = (Math.random() - 0.5) * 4; // -2 to 2
    const kurtosis = Math.random() * 4; // 0 to 4
    
    normality_tests[columnName] = {
      test_name: 'Shapiro-Wilk',
      statistic: 0.95 + Math.random() * 0.05,
      p_value,
      is_normal,
      skewness,
      kurtosis,
    };
  });

  return {
    dataset_id: datasetId,
    normality_tests,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate mock distribution analysis
 */
export function generateMockDistributions(
  datasetId: string,
  statistics: StatisticsResponse,
  normalityData: NormalityResponse
): DistributionResponse {
  const distributions: { [key: string]: DistributionData } = {};

  Object.entries(statistics.numerical).forEach(([columnName, stats]) => {
    const normality = normalityData.normality_tests[columnName];
    
    // Determine distribution type based on skewness
    let distribution_type: DistributionData['distribution_type'];
    if (normality.skewness > 0.5) {
      distribution_type = 'right_skewed';
    } else if (normality.skewness < -0.5) {
      distribution_type = 'left_skewed';
    } else if (normality.is_normal) {
      distribution_type = 'normal';
    } else {
      distribution_type = Math.random() > 0.5 ? 'bimodal' : 'uniform';
    }
    
    // Determine kurtosis type
    let kurtosis_type: DistributionData['kurtosis_type'];
    if (normality.kurtosis > 3) {
      kurtosis_type = 'leptokurtic';
    } else if (normality.kurtosis < 3) {
      kurtosis_type = 'platykurtic';
    } else {
      kurtosis_type = 'mesokurtic';
    }
    
    // Generate characteristics
    const characteristics: string[] = [];
    if (distribution_type === 'normal') {
      characteristics.push('Symmetrical bell curve');
      characteristics.push('Most values near the mean');
    } else if (distribution_type === 'right_skewed') {
      characteristics.push('Long tail on the right');
      characteristics.push('Mean > Median');
    } else if (distribution_type === 'left_skewed') {
      characteristics.push('Long tail on the left');
      characteristics.push('Mean < Median');
    }
    
    if (kurtosis_type === 'leptokurtic') {
      characteristics.push('Heavy tails, peaked center');
    } else if (kurtosis_type === 'platykurtic') {
      characteristics.push('Light tails, flat center');
    }
    
    distributions[columnName] = {
      distribution_type,
      kurtosis_type,
      characteristics,
    };
  });

  return {
    dataset_id: datasetId,
    distributions,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate mock categorical distributions
 */
export function generateMockCategoricalDistributions(
  datasetId: string,
  statistics: StatisticsResponse
): CategoricalDistributionResponse {
  const categorical_distributions: { [key: string]: CategoricalDistributionData } = {};

  Object.entries(statistics.categorical).forEach(([columnName, stats]) => {
    const unique_values = stats.unique;
    const top_values: { [key: string]: CategoricalValueData } = {};
    
    // Generate top 5 values with realistic distributions
    const totalCount = 1500; // Assuming 1500 rows
    let remainingCount = totalCount;
    
    const topN = Math.min(5, unique_values);
    for (let i = 0; i < topN; i++) {
      const isMode = i === 0;
      const count = isMode 
        ? stats.mode_frequency 
        : Math.floor(remainingCount * (0.2 - i * 0.03) * Math.random());
      
      const percentage = (count / totalCount) * 100;
      remainingCount -= count;
      
      const valueName = isMode 
        ? stats.mode 
        : `Value ${i + 1}`;
      
      top_values[valueName] = {
        count,
        percentage,
      };
    }
    
    // Calculate entropy (0 to log2(unique_values))
    const entropy = Math.log2(unique_values) * Math.random() * 0.8;
    
    categorical_distributions[columnName] = {
      unique_values,
      top_values,
      entropy,
    };
  });

  return {
    dataset_id: datasetId,
    categorical_distributions,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate mock enhanced correlations with p-values
 */
export function generateMockEnhancedCorrelations(
  datasetId: string,
  statistics: StatisticsResponse
): EnhancedCorrelationResponse {
  const high_correlations: EnhancedCorrelationPair[] = [];
  const numColumns = Object.keys(statistics.numerical);
  
  // Generate 5-10 correlation pairs
  const pairCount = Math.floor(Math.random() * 6) + 5;
  
  for (let i = 0; i < pairCount && i < numColumns.length - 1; i++) {
    const col1 = numColumns[i];
    const col2 = numColumns[i + 1];
    
    // Generate correlation coefficient
    const correlation = (Math.random() - 0.5) * 2; // -1 to 1
    const absCorr = Math.abs(correlation);
    
    // Generate p-value (inversely related to correlation strength)
    const p_value = absCorr > 0.7 ? Math.random() * 0.01 : Math.random() * 0.1;
    
    // Determine strength
    let strength: 'weak' | 'moderate' | 'strong';
    if (absCorr >= 0.7) {
      strength = 'strong';
    } else if (absCorr >= 0.4) {
      strength = 'moderate';
    } else {
      strength = 'weak';
    }
    
    high_correlations.push({
      column1: col1,
      column2: col2,
      correlation,
      p_value,
      strength,
      significant: p_value < 0.05,
    });
  }

  return {
    dataset_id: datasetId,
    high_correlations,
    generated_at: new Date().toISOString(),
  };
}

// ============================================================================
// UNIFIED PHASE 2 DATA GENERATOR
// ============================================================================

export interface Phase2CompleteData {
  histograms: HistogramResponse;
  outliers: OutlierResponse;
  normality: NormalityResponse;
  distributions: DistributionResponse;
  categorical: CategoricalDistributionResponse;
  correlations_enhanced: EnhancedCorrelationResponse;
}

/**
 * Generate all Phase 2 mock data at once
 * TODO: Replace with real API calls when backend is ready
 */
export function generatePhase2MockData(
  datasetId: string,
  statistics: StatisticsResponse
): Phase2CompleteData {
  console.log('📊 Generating Phase 2 mock data for dataset:', datasetId);
  
  const histograms = generateMockHistograms(datasetId, statistics);
  const outliers = generateMockOutliers(datasetId, statistics);
  const normality = generateMockNormalityTests(datasetId, statistics);
  const distributions = generateMockDistributions(datasetId, statistics, normality);
  const categorical = generateMockCategoricalDistributions(datasetId, statistics);
  const correlations_enhanced = generateMockEnhancedCorrelations(datasetId, statistics);
  
  console.log('✅ Phase 2 mock data generated:', {
    histograms: Object.keys(histograms.histograms).length,
    outliers: outliers.columns_with_outliers,
    normality: Object.keys(normality.normality_tests).length,
    distributions: Object.keys(distributions.distributions).length,
    categorical: Object.keys(categorical.categorical_distributions).length,
    correlations: correlations_enhanced.high_correlations.length,
  });
  
  return {
    histograms,
    outliers,
    normality,
    distributions,
    categorical,
    correlations_enhanced,
  };
}
