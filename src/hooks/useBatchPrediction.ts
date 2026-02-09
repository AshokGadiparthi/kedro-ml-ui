/**
 * Batch Prediction Hook - State management for batch predictions
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { predictionService, type BatchValidationResponse, type BatchJobResponse } from '../services/predictionService';
import { toast } from 'sonner';

export function useBatchPrediction(modelId: string | null, projectId?: string) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<BatchValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<BatchJobResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Validate uploaded file
  const validateFile = useCallback(async (file: File) => {
    if (!modelId) {
      toast.error('Please select a model first');
      return null;
    }

    setIsValidating(true);
    setValidation(null);

    try {
      const result = await predictionService.validateBatchFile(modelId, file);
      setValidation(result);
      
      if (result.valid) {
        toast.success(`File "${file.name}" validated successfully`);
      } else if (result.errors.length > 0) {
        toast.error(`Validation failed: ${result.errors[0]}`);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to validate file';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [modelId]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setUploadedFile(file);
    await validateFile(file);
  }, [validateFile]);

  // Poll for job status
  const pollJobStatus = useCallback(async (id: string) => {
    try {
      const status = await predictionService.getBatchJobStatus(id);
      setJobStatus(status);
      setProgress(status.progress);

      if (status.status === 'COMPLETED') {
        setIsProcessing(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        toast.success('Batch prediction completed!');
      } else if (status.status === 'FAILED') {
        setIsProcessing(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        toast.error('Batch prediction failed');
      }
    } catch (err: any) {
      console.error('Failed to poll job status:', err);
    }
  }, []);

  // Start batch prediction
  const startBatchPrediction = useCallback(async (jobName?: string) => {
    if (!modelId) {
      toast.error('Please select a model first');
      return null;
    }

    if (!uploadedFile || !validation) {
      toast.error('Please upload and validate a CSV file first');
      return null;
    }

    if (!validation.valid) {
      toast.error('Please fix validation errors before proceeding');
      return null;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await predictionService.startBatchPrediction(
        modelId,
        uploadedFile,
        jobName,
        projectId
      );

      setJobId(result.jobId);
      setJobStatus(result);

      // Start polling for status updates
      pollingIntervalRef.current = setInterval(() => {
        pollJobStatus(result.jobId);
      }, 2000); // Poll every 2 seconds

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start batch prediction';
      toast.error(errorMessage);
      setIsProcessing(false);
      return null;
    }
  }, [modelId, uploadedFile, validation, projectId, pollJobStatus]);

  // Download results
  const downloadResults = useCallback(async () => {
    if (!jobId) {
      toast.error('No job results to download');
      return;
    }

    try {
      const fileName = `batch_results_${jobId}.csv`;
      await predictionService.downloadBatchResults(jobId, fileName);
      toast.success('Results downloaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download results');
    }
  }, [jobId]);

  // Reset state
  const reset = useCallback(() => {
    setUploadedFile(null);
    setValidation(null);
    setJobId(null);
    setJobStatus(null);
    setProgress(0);
    setIsProcessing(false);
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    uploadedFile,
    setUploadedFile,
    validation,
    isValidating,
    isProcessing,
    progress,
    jobStatus,
    handleFileUpload,
    startBatchPrediction,
    downloadResults,
    reset,
  };
}
