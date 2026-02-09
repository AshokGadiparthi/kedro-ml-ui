/**
 * DATA PREPROCESSING COMPONENT
 * World-class preprocessing interface with before/after comparison
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  RefreshCw,
  Download,
  Play,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Clock,
} from 'lucide-react';
import { PreprocessingOptions } from './PreprocessingOptions';
import { PreprocessingStatistics } from './PreprocessingStatistics';
import { PreprocessingPreview } from './PreprocessingPreview';
import { PreprocessingHistory } from './PreprocessingHistory';
import { preprocessingApi, type PreprocessingJobResponse } from '@/services/preprocessingApi';
import { useProject } from '@/contexts/ProjectContext';

export function DataPreprocessing() {
  const { currentProject } = useProject();
  const datasetId = currentProject?.id || 'mock-dataset-id';

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<PreprocessingJobResponse | null>(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preprocessing configuration
  const [config, setConfig] = useState({
    missingValues: {
      strategy: 'drop',
      threshold: 50,
    },
    outliers: {
      method: 'iqr',
      severity: 'medium',
      action: 'cap',
    },
    dataTypes: {
      autoDetect: true,
      manualOverrides: {},
    },
    scaling: {
      method: 'standard',
    },
    sampling: {
      sampleSize: null as number | null,
      filterCondition: '',
    },
  });

  // Start preprocessing job
  const handleStartPreprocessing = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await preprocessingApi.startPreprocessing(datasetId, config);
      setJobStatus(response);
      setPolling(true);

      // Start polling for job status
      pollJobStatus(response.job_id);
    } catch (err: any) {
      console.error('Failed to start preprocessing:', err);
      setError(err.message || 'Failed to start preprocessing');
    } finally {
      setLoading(false);
    }
  };

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await preprocessingApi.getJobStatus(jobId);
        setJobStatus(status);

        if (status.status === 'completed' || status.status === 'failed') {
          setPolling(false);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setPolling(false);
        clearInterval(pollInterval);
      }
    }, 1000);
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!jobStatus) return null;

    const statusConfig = {
      queued: { icon: Clock, variant: 'secondary' as const, text: 'Queued' },
      processing: { icon: Loader2, variant: 'default' as const, text: 'Processing' },
      completed: { icon: CheckCircle2, variant: 'default' as const, text: 'Completed' },
      failed: { icon: AlertCircle, variant: 'destructive' as const, text: 'Failed' },
    };

    const config = statusConfig[jobStatus.status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${jobStatus.status === 'processing' ? 'animate-spin' : ''}`} />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Preprocessing</h1>
          <p className="text-muted-foreground mt-1">
            Prepare data for feature engineering and modeling
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            disabled={loading || polling}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!jobStatus || jobStatus.status !== 'completed'}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Progress Bar */}
      {polling && jobStatus && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{jobStatus.current_phase || 'Processing...'}</span>
                <span className="text-sm text-muted-foreground">{jobStatus.progress || 0}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${jobStatus.progress || 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content - Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab('options')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Configure Options
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={handleStartPreprocessing}
                    disabled={loading || polling}
                  >
                    {loading || polling ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Start Preprocessing
                  </Button>
                </div>

                {/* Current Configuration Summary */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-semibold mb-3">Current Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Missing Values:</span>
                      <span className="font-medium capitalize">{config.missingValues.strategy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outlier Method:</span>
                      <span className="font-medium uppercase">{config.outliers.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scaling:</span>
                      <span className="font-medium capitalize">{config.scaling.method}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Statistics */}
            <div className="lg:col-span-2">
              <PreprocessingStatistics jobStatus={jobStatus} />
            </div>
          </div>
        </TabsContent>

        {/* Options Tab */}
        <TabsContent value="options">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PreprocessingOptions config={config} setConfig={setConfig} />
            </div>
            <div>
              <PreprocessingStatistics jobStatus={jobStatus} />
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <PreprocessingPreview datasetId={datasetId} jobStatus={jobStatus} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <PreprocessingHistory datasetId={datasetId} />
        </TabsContent>
      </Tabs>

      {/* Bottom Actions (when completed) */}
      {jobStatus?.status === 'completed' && (
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Preprocessing Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your data is ready for the next step
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Clean Data
              </Button>
              <Button size="sm">
                Continue to Feature Engineering
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}