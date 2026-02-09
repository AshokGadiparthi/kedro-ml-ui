/**
 * useModels Hook - React hook for model management
 */

import { useState, useEffect } from 'react';
import * as modelService from '../services/models/modelService';
import type { Model, ModelMetrics, ModelInterpretability } from '../services/api/types';

export function useModels(projectId?: string) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setModels([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchModels() {
      try {
        setLoading(true);
        const data = await modelService.getModels(projectId!);
        if (mounted) {
          setModels(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load models');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchModels();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  return { models, loading, error };
}

export function useModel(modelId?: string) {
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) {
      setModel(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchModel() {
      try {
        setLoading(true);
        const data = await modelService.getModel(modelId!);
        if (mounted) {
          setModel(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load model');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchModel();

    return () => {
      mounted = false;
    };
  }, [modelId]);

  return { model, loading, error };
}

export function useModelMetrics(modelId?: string) {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) {
      setMetrics(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchMetrics() {
      try {
        setLoading(true);
        const data = await modelService.getModelMetrics(modelId!);
        if (mounted) {
          setMetrics(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load metrics');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMetrics();

    return () => {
      mounted = false;
    };
  }, [modelId]);

  return { metrics, loading, error };
}

export function useModelInterpretability(modelId?: string) {
  const [interpretability, setInterpretability] = useState<ModelInterpretability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) {
      setInterpretability(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchInterpretability() {
      try {
        setLoading(true);
        const data = await modelService.getModelInterpretability(modelId!);
        if (mounted) {
          setInterpretability(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load interpretability');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchInterpretability();

    return () => {
      mounted = false;
    };
  }, [modelId]);

  return { interpretability, loading, error };
}
