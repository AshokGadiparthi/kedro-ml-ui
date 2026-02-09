/**
 * useMLFlowJob Hook
 * Custom hook for managing ML Flow jobs with real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as jobService from '../services/jobs/jobService';
import type { JobStatusResponse } from '../services/jobs/jobService';

/**
 * Hook for tracking a single ML Flow job with polling
 */
export function useMLFlowJobTracking(jobId: string | null, enabled: boolean = true) {
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);
      const status = await jobService.getJobStatus(jobId);
      setJobStatus(status);

      // Stop polling if job is completed, failed, or stopped
      if (['completed', 'failed', 'stopped', 'COMPLETED', 'FAILED', 'STOPPED'].includes(status.status)) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch job status:', err);
      setError(err.message || 'Failed to fetch job status');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId || !enabled) {
      return;
    }

    console.log('🔄 Starting ML Flow job polling for:', jobId);

    // Fetch immediately
    fetchJobStatus();

    // Start polling every 2 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchJobStatus();
    }, 2000);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        console.log('🛑 Stopping ML Flow job polling');
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
