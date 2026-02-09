/**
 * Custom hook for polling ML Flow job logs and algorithm progress
 * Polls every 500ms when modal is open and job is running
 */

import { useState, useEffect, useRef } from 'react';
import * as jobService from '../services/jobs/jobService';

interface UseMLFlowLiveLogsResult {
  logs: string[];
  totalLogs: number;
  algorithmProgress: jobService.AlgorithmsStatusResponse | null;
  loading: boolean;
  error: string | null;
}

export function useMLFlowLiveLogs(
  jobId: string | null,
  isOpen: boolean,
  jobStatus?: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'stopped'
): UseMLFlowLiveLogsResult {
  const [logs, setLogs] = useState<string[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [algorithmProgress, setAlgorithmProgress] = useState<jobService.AlgorithmsStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only poll if modal is open, jobId exists, and job is running
    if (!isOpen || !jobId) {
      // Clear data when modal closes
      setLogs([]);
      setTotalLogs(0);
      setAlgorithmProgress(null);
      setError(null);
      return;
    }

    // Don't poll if job is completed or failed
    if (jobStatus === 'completed' || jobStatus === 'failed' || jobStatus === 'stopped') {
      // Fetch one final time
      fetchData();
      return;
    }

    // Fetch immediately
    fetchData();

    // Start polling every 500ms
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId, isOpen, jobStatus]);

  const fetchData = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch both logs and algorithm progress in parallel
      const [logsResponse, progressResponse] = await Promise.all([
        jobService.getJobLogs(jobId).catch(() => null),
        jobService.getAlgorithmsStatus(jobId).catch(() => null),
      ]);

      if (logsResponse) {
        setLogs(logsResponse.logs.recent_logs || []);
        setTotalLogs(logsResponse.logs.total_lines || 0);
      }

      if (progressResponse) {
        setAlgorithmProgress(progressResponse);
      }
    } catch (err: any) {
      console.error('Error fetching live logs:', err);
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  return {
    logs,
    totalLogs,
    algorithmProgress,
    loading,
    error,
  };
}
