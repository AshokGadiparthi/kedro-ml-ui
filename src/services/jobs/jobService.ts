/**
 * Job Service
 * Handles ML pipeline job tracking API calls
 */

import { apiClient, apiCall } from '../api/client';

/**
 * Job Status Response from /api/v1/jobs/{job_id}
 */
export interface JobStatusResponse {
  id: string;
  pipeline_name: string;
  user_id?: string;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'stopped';
  
  // Progress tracking
  progress?: number; // 0-100
  current_phase?: string;
  current_algorithm?: string;
  
  // Phases
  phases?: Array<{
    name: string;
    status: string;
    progress?: number;
  }>;
  
  // Algorithm progress
  algorithms_completed?: number;
  algorithms_total?: number;
  current_best_score?: number;
  current_best_algorithm?: string;
  
  // Time tracking
  elapsed_time_seconds?: number;
  estimated_remaining_seconds?: number;
  
  // Live logs
  logs?: Array<{
    timestamp: string;
    level: 'INFO' | 'WARNING' | 'ERROR';
    message: string;
  }>;
  
  // Completion info
  best_algorithm?: string;
  best_score?: number;
  
  // Original fields
  parameters: any;
  results?: any;
  result?: any;
  error_message?: string;
  created_at: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string;
  execution_time?: number;
}

/**
 * Job Logs Response from /api/v1/jobs/logs/{job_id}
 */
export interface JobLogsResponse {
  id: string;
  pipeline_name: string;
  status: string;
  created_at: string;
  updated_at?: string;
  parameters: any;
  result: any;
  logs: {
    total_lines: number;
    recent_logs: string[];
  };
}

/**
 * Current Algorithm Response from /api/v1/jobs/logs/{job_id}/current-algorithm
 */
export interface CurrentAlgorithmResponse {
  job_id: string;
  currently_running: string | null;
  is_running: boolean;
  total_logs: number;
}

/**
 * Algorithms Status Response from /api/v1/jobs/logs/{job_id}/algorithms-status
 */
export interface AlgorithmsStatusResponse {
  currently_running: string | null;
  completed: string[];
  failed: string[];
  total: number;
  completed_count: number;
  failed_count: number;
  progress_percent: number;
}

/**
 * Progress Response from /api/v1/jobs/logs/{job_id}/progress
 */
export interface JobProgressResponse {
  id: string;
  pipeline_name: string;
  status: string;
  progress: {
    currently_running: string | null;
    completed_count: number;
    failed_count: number;
    total_count: number;
    progress_percent: number;
    completed: string[];
    failed: string[];
  };
  total_logs: number;
  timestamp: string;
}

/**
 * Get job status and results
 * GET /api/v1/jobs/{job_id}
 */
export const getJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
  return apiCall(
    apiClient.get(`/api/v1/jobs/${jobId}`)
  );
};

/**
 * Get job logs
 * GET /api/v1/jobs/logs/{job_id}
 */
export const getJobLogs = async (jobId: string): Promise<JobLogsResponse> => {
  return apiCall(
    apiClient.get(`/api/v1/jobs/logs/${jobId}`)
  );
};

/**
 * Get current algorithm
 * GET /api/v1/jobs/logs/{job_id}/current-algorithm
 */
export const getCurrentAlgorithm = async (jobId: string): Promise<CurrentAlgorithmResponse> => {
  return apiCall(
    apiClient.get(`/api/v1/jobs/logs/${jobId}/current-algorithm`)
  );
};

/**
 * Get algorithms status
 * GET /api/v1/jobs/logs/{job_id}/algorithms-status
 */
export const getAlgorithmsStatus = async (jobId: string): Promise<AlgorithmsStatusResponse> => {
  return apiCall(
    apiClient.get(`/api/v1/jobs/logs/${jobId}/algorithms-status`)
  );
};

/**
 * Get job progress with algorithm details
 * GET /api/v1/jobs/logs/{job_id}/progress
 */
export const getJobProgress = async (jobId: string): Promise<JobProgressResponse> => {
  return apiCall(
    apiClient.get(`/api/v1/jobs/logs/${jobId}/progress`)
  );
};

/**
 * Phase 4 Report Response from /api/v1/jobs/reports/phase4
 */
export interface Phase4ReportResponse {
  summary: {
    total_models: number;
    best_model: string;
    best_score: number;
    problem_type: string;
  };
  best_model: {
    name: string;
    best_score: number;
    details: {
      Algorithm: string;
      Train_Score: number;
      Test_Score: number;
      Diff: number;
    };
  };
  top_ranked: Array<{
    Algorithm: string;
    Train_Score: number;
    Test_Score: number;
    Diff: number;
  }>;
  ranked: Array<{
    Algorithm: string;
    Train_Score: number;
    Test_Score: number;
    Diff: number;
  }>;
  full_report: Array<{
    Algorithm: string;
    Train_Score: number;
    Test_Score: number;
    Diff: number;
  }>;
}

/**
 * Get Phase 4 training report
 * GET /api/v1/jobs/reports/phase4
 */
export const getPhase4Report = async (): Promise<Phase4ReportResponse> => {
  return apiCall(
    apiClient.get(`/api/v1/jobs/reports/phase4`)
  );
};