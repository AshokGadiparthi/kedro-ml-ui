/**
 * Deployment Hooks
 * React hooks for deployment data fetching
 */

import { useState, useEffect } from 'react';
import * as deploymentService from '../services/deployment/deploymentService';
import type { DeploymentHistory, DeploymentSummary } from '../services/api/types';

/**
 * Hook to fetch deployment history for a project
 */
export function useDeploymentHistory(projectId?: string) {
  const [history, setHistory] = useState<DeploymentHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!projectId) {
      setHistory(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await deploymentService.getDeploymentHistory(projectId);
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to fetch deployment history:', err);
      setError(err.message || 'Failed to fetch deployment history');
      setHistory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [projectId]);

  return { history, loading, error, refetch: fetchHistory };
}

/**
 * Hook to fetch active deployment summary for a project
 */
export function useActiveDeployment(projectId?: string) {
  const [deployment, setDeployment] = useState<DeploymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployment = async () => {
    if (!projectId) {
      setDeployment(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await deploymentService.getActiveDeploymentSummary(projectId);
      setDeployment(data);
    } catch (err: any) {
      console.error('Failed to fetch active deployment:', err);
      setError(err.message || 'Failed to fetch active deployment');
      setDeployment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployment();
  }, [projectId]);

  return { deployment, loading, error, refetch: fetchDeployment };
}
