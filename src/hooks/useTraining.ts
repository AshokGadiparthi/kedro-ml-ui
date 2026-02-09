/**
 * Training Hook
 * React hooks for managing training jobs
 */

import { useState, useEffect } from 'react';
import * as trainingService from '../services/training/trainingService';
import {
  TrainingJob,
  TrainingJobListItem,
  AlgorithmList,
} from '../services/api/types';

/**
 * Hook to fetch and manage training jobs
 */
export function useTrainingJobs(projectId?: string) {
  const [jobs, setJobs] = useState<TrainingJobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainingService.getTrainingJobs(projectId);
      setJobs(data);
    } catch (err: any) {
      console.error('Failed to fetch training jobs:', err);
      setError(err.message || 'Failed to load training jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [projectId]);

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
  };
}

/**
 * Hook to fetch a single training job with auto-refresh for running jobs
 */
export function useTrainingJob(jobId: string | null, autoRefresh = false) {
  const [job, setJob] = useState<TrainingJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      return;
    }

    let interval: NodeJS.Timeout | null = null;

    const fetchJob = async () => {
      try {
        setError(null);
        const data = await trainingService.getTrainingJobById(jobId);
        setJob(data);
        
        // If job is running and autoRefresh is enabled, set up polling
        if (autoRefresh && (data.status === 'running' || data.status === 'queued' || data.status === 'starting')) {
          if (!interval) {
            interval = setInterval(fetchJob, 2000); // Poll every 2 seconds
          }
        } else {
          // Job is not running, clear interval if it exists
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch training job:', err);
        setError(err.message || 'Failed to load training job');
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJob();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [jobId, autoRefresh]);

  return {
    job,
    loading,
    error,
  };
}

/**
 * Hook to fetch available algorithms
 */
export function useAlgorithms() {
  const [algorithms, setAlgorithms] = useState<AlgorithmList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await trainingService.getAlgorithms();
        setAlgorithms(data);
      } catch (err: any) {
        console.error('Failed to fetch algorithms:', err);
        setError(err.message || 'Failed to load algorithms');
      } finally {
        setLoading(false);
      }
    };

    fetchAlgorithms();
  }, []);

  return {
    algorithms,
    loading,
    error,
  };
}
