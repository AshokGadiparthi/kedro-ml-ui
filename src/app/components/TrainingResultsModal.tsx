/**
 * Training Results Modal
 * Displays training results and deployment options (similar to AutoML)
 */

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Trophy, Download, Rocket, BarChart3, AlertCircle, CheckCircle2, TrendingUp, Target, Clock } from 'lucide-react';
import { toast } from 'sonner';
import * as trainingService from '../../services/training/trainingService';
import * as deploymentService from '../../services/deployment/deploymentService';
import type { TrainingResults } from '../../services/api/types';

interface TrainingResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | null;
  onDeploy?: (jobId: string) => void;
}

export function TrainingResultsModal({
  open,
  onOpenChange,
  jobId,
  onDeploy,
}: TrainingResultsModalProps) {
  const [results, setResults] = useState<TrainingResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);

  // Fetch results when modal opens
  useEffect(() => {
    const fetchResults = async () => {
      if (!jobId || !open) {
        // Reset when modal closes
        if (!open) {
          setResults(null);
          setError(null);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await trainingService.getTrainingResults(jobId);
        setResults(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch results');
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [jobId, open]);

  const handleDeploy = async () => {
    if (!jobId || !results) return;

    try {
      setDeploying(true);
      const response = await deploymentService.deployFromTraining(jobId, {
        name: results.jobName,
        description: `Deployment from training job: ${results.algorithmDisplayName}`,
      });
      
      // Show success toast with version
      toast.success(`Model deployed successfully as ${response.versionLabel}!`);
      
      // Call onDeploy callback but DON'T close modal (user can see deployment status)
      onDeploy?.(jobId);
      
      // Refresh results to show deployment status
      const updatedResults = await trainingService.getTrainingResults(jobId);
      setResults(updatedResults);
      
      setError(null); // Clear any previous errors
    } catch (err: any) {
      setError(err.message || 'Failed to deploy model');
      toast.error('Failed to deploy model');
    } finally {
      setDeploying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'FAILED':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Training Results
          </DialogTitle>
          <DialogDescription>
            {results ? results.jobName : 'Loading training results...'}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-12 text-center">
            <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        )}

        {error && (
          <Card className="p-6 border-destructive bg-destructive/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Error Loading Results</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {results && (
          <div className="space-y-6">
            {/* Status and Info */}
            <Card className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(results.status)}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Algorithm</p>
                  <p className="text-sm font-medium">{results.algorithmDisplayName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Problem Type</p>
                  <p className="text-sm font-medium">{results.problemType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Training Time</p>
                  <p className="text-sm font-medium">{results.trainingDurationLabel}</p>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Accuracy */}
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {results.accuracyLabel}
                  </p>
                </Card>

                {/* Precision */}
                {results.precision !== null && (
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">Precision</p>
                    <p className="text-2xl font-bold">{(results.precision * 100).toFixed(1)}%</p>
                  </Card>
                )}

                {/* Recall */}
                {results.recall !== null && (
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">Recall</p>
                    <p className="text-2xl font-bold">{(results.recall * 100).toFixed(1)}%</p>
                  </Card>
                )}

                {/* F1 Score */}
                {results.f1Score !== null && (
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">F1 Score</p>
                    <p className="text-2xl font-bold">{(results.f1Score * 100).toFixed(1)}%</p>
                  </Card>
                )}

                {/* AUC-ROC */}
                {results.aucRoc !== null && (
                  <Card className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">AUC-ROC</p>
                    <p className="text-2xl font-bold">{(results.aucRoc * 100).toFixed(1)}%</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Dataset Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Training Configuration
              </h3>
              <Card className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Dataset</p>
                    <p className="font-medium">{results.datasetName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Target Variable</p>
                    <p className="font-medium">{results.targetVariable}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Train/Test Split</p>
                    <p className="font-medium">{(results.trainTestSplit * 100).toFixed(0)}% / {((1 - results.trainTestSplit) * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">CV Folds</p>
                    <p className="font-medium">{results.crossValidationFolds}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Started At</p>
                    <p className="font-medium">{new Date(results.startedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Completed At</p>
                    <p className="font-medium">{new Date(results.completedAt).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Deployment Status */}
            {results.isDeployed ? (
              <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-600 dark:text-green-400">Model Deployed</p>
                    <p className="text-sm text-muted-foreground">
                      Endpoint: <code className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded">{results.endpointUrl}</code>
                    </p>
                  </div>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-600 dark:text-blue-400">Ready to Deploy</p>
                    <p className="text-sm text-muted-foreground">
                      Deploy this model to make predictions
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          {results && !results.isDeployed && (
            <Button
              onClick={handleDeploy}
              disabled={deploying}
              className="gap-2"
            >
              {deploying ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Deploy Model
                </>
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}