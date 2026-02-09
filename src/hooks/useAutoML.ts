/**
 * useAutoML Hook
 * Custom hook for managing AutoML jobs with real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as automlService from '../services/automl/automlService';
import type {
  AutoMLJobListItem,
  AutoMLJobStatus_Response,
  AutoMLResults,
} from '../services/api/types';

/**
 * Hook for managing AutoML job list
 */
export function useAutoMLJobs(projectId?: string) {
  const [jobs, setJobs] = useState<AutoMLJobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await automlService.listAutoMLJobs(projectId);
      setJobs(response.content);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AutoML jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, refetchTrigger]);

  useEffect(() => {
    if (projectId) {
      fetchJobs();
    }
  }, [fetchJobs, projectId]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { jobs, loading, error, refetch };
}

/**
 * Hook for tracking a single AutoML job with polling
 */
export function useAutoMLJobTracking(jobId: string | null, enabled: boolean = true) {
  const [jobStatus, setJobStatus] = useState<AutoMLJobStatus_Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);
      const status = await automlService.getAutoMLJobStatus(jobId);
      setJobStatus(status);

      // Stop polling if job is completed, failed, or stopped
      if (['COMPLETED', 'FAILED', 'STOPPED'].includes(status.status)) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job status');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId || !enabled) {
      return;
    }

    // Fetch immediately
    fetchJobStatus();

    // Start polling every 2 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchJobStatus();
    }, 2000);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [jobId, enabled, fetchJobStatus]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  return { jobStatus, loading, error, stopPolling, refetch: fetchJobStatus };
}

/**
 * Hook for fetching AutoML results
 * Only fetches when job status is COMPLETED
 */
export function useAutoMLResults(jobId: string | null, jobStatus?: string) {
  const [results, setResults] = useState<AutoMLResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await automlService.getAutoMLJobResults(jobId);
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    // Only fetch results if job is COMPLETED
    if (jobId && jobStatus === 'COMPLETED') {
      fetchResults();
    } else if (jobId && jobStatus && jobStatus !== 'COMPLETED') {
      // Clear results if job is not completed
      setResults(null);
      setError(null);
    }
  }, [fetchResults, jobId, jobStatus]);

  return { results, loading, error, refetch: fetchResults };
}