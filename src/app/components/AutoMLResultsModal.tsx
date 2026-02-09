/**
 * AutoML Results Modal
 * Displays leaderboard and feature importance
 */

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Trophy, Download, Rocket, BarChart3, AlertCircle } from 'lucide-react';
import { useAutoMLResults } from '../../hooks/useAutoML';
import * as automlService from '../../services/automl/automlService';
import * as deploymentService from '../../services/deployment/deploymentService';
import type { AutoMLLeaderboardModel } from '../../services/api/types';

interface AutoMLResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | null;
  onDeploy?: (jobId: string) => void;
}

export function AutoMLResultsModal({
  open,
  onOpenChange,
  jobId,
  onDeploy,
}: AutoMLResultsModalProps) {
  const [jobStatus, setJobStatus] = useState<string | undefined>(undefined);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const [hasFetchedStatus, setHasFetchedStatus] = useState(false);

  // Fetch job status ONCE when modal opens
  useEffect(() => {
    const fetchStatus = async () => {
      if (!jobId || !open) {
        // Reset when modal closes
        if (!open) {
          setJobStatus(undefined);
          setHasFetchedStatus(false);
        }
        return;
      }

      // Only fetch once per modal open
      if (hasFetchedStatus) return;

      try {
        setFetchingStatus(true);
        const status = await automlService.getAutoMLJobStatus(jobId);
        setJobStatus(status.status);
        setHasFetchedStatus(true);
      } catch (error) {
        console.error('Failed to fetch job status:', error);
        setJobStatus('ERROR'); // Custom status for network errors
        setHasFetchedStatus(true);
      } finally {
        setFetchingStatus(false);
      }
    };

    fetchStatus();
  }, [jobId, open, hasFetchedStatus]);

  // Only fetch results when job is COMPLETED
  const { results, loading, error } = useAutoMLResults(jobId, jobStatus);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const formatMetric = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return (value * 100).toFixed(1) + '%';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getBestModelScore = () => {
    if (!results) return null;
    const bestModel = results.leaderboard[0];
    if (!bestModel) return null;

    // Display correct metric based on problem type
    if (results.problemType === 'CLASSIFICATION') {
      return {
        value: bestModel.accuracy,
        label: 'Accuracy',
      };
    } else {
      return {
        value: bestModel.r2Score,
        label: 'R² Score',
      };
    }
  };

  const getMetricValue = (model: AutoMLLeaderboardModel | undefined) => {
    if (!results || !model) return 0;
    
    // Return correct metric based on problem type
    if (results.problemType === 'CLASSIFICATION') {
      return model.accuracy || 0;
    } else {
      return model.r2Score || 0;
    }
  };

  const getMetricLabel = () => {
    if (!results) return 'Score';
    return results.problemType === 'CLASSIFICATION' ? 'Accuracy' : 'R² Score';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            AutoML Results
          </DialogTitle>
          <DialogDescription>
            Algorithm comparison and feature importance analysis
          </DialogDescription>
        </DialogHeader>

        {fetchingStatus ? (
          <div className="py-12 text-center">
            <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Fetching job status...</p>
          </div>
        ) : jobStatus === 'ERROR' ? (
          <div className="space-y-4 p-6">
            <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-red-900 dark:text-red-100 text-lg mb-2">
                    Backend Connection Failed
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                    <p>Unable to fetch results from the backend server.</p>
                    {error && (
                      <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
                        <div className="font-mono text-xs">
                          <strong>Error:</strong> {error}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  💡 Possible Issues:
                </div>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>Backend server is not running</li>
                  <li>Network connectivity issue</li>
                  <li>API endpoint <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/api/automl/jobs/{jobId}/results</code> is unreachable</li>
                </ul>
              </div>
            </Card>
          </div>
        ) : jobStatus !== 'COMPLETED' ? (
          <div className="py-12 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-4" />
            <p className="text-lg font-semibold">Job Status: {jobStatus}</p>
            <p className="text-sm">
              {jobStatus === 'RUNNING' && 'AutoML is still running. Please wait for completion.'}
              {jobStatus === 'QUEUED' && 'Job is queued and waiting to start.'}
              {jobStatus === 'STOPPED' && 'This job was stopped before completion.'}
              {jobStatus === 'FAILED' && 'This job failed during execution.'}
            </p>
          </div>
        ) : loading ? (
          <div className="py-12 text-center">
            <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        ) : results ? (
          <div className="space-y-6 overflow-y-auto flex-1">
            {/* Best Model Summary */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Best Model</div>
                  <div className="text-2xl font-bold">{results.bestModel.algorithm}</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Target: {results.targetColumn} • {results.problemType}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">{getMetricLabel()}</div>
                  <div className="text-3xl font-bold text-green-600">
                    {results.leaderboard && results.leaderboard.length > 0 
                      ? formatMetric(getMetricValue(results.leaderboard[0]))
                      : '-'
                    }
                  </div>
                </div>
              </div>
            </Card>

            {/* Dataset Info */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Total Rows</div>
                <div className="text-xl font-semibold">{results.datasetInfo.totalRows.toLocaleString()}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Train Size</div>
                <div className="text-xl font-semibold">{results.datasetInfo.trainSize.toLocaleString()}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Test Size</div>
                <div className="text-xl font-semibold">{results.datasetInfo.testSize.toLocaleString()}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Features</div>
                <div className="text-xl font-semibold">{results.featureEngineering.engineeredFeatures}</div>
              </Card>
            </div>

            {/* Algorithm Leaderboard */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Algorithm Leaderboard
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Rank</th>
                      <th className="px-4 py-3 text-left font-medium">Algorithm</th>
                      <th className="px-4 py-3 text-right font-medium">{getMetricLabel()}</th>
                      {results.problemType === 'CLASSIFICATION' && (
                        <>
                          <th className="px-4 py-3 text-right font-medium">AUC</th>
                          <th className="px-4 py-3 text-right font-medium">F1</th>
                        </>
                      )}
                      {results.problemType === 'REGRESSION' && (
                        <>
                          <th className="px-4 py-3 text-right font-medium">RMSE</th>
                          <th className="px-4 py-3 text-right font-medium">MAE</th>
                        </>
                      )}
                      <th className="px-4 py-3 text-right font-medium">Time</th>
                      <th className="px-4 py-3 text-right font-medium">CV Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.leaderboard.map((model, idx) => (
                      <tr
                        key={idx}
                        className={`border-t hover:bg-muted/50 transition-colors ${
                          model.rank === 1 ? 'bg-green-50 dark:bg-green-950/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getMedalIcon(model.rank)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {model.algorithm}
                          {model.rank === 1 && (
                            <Badge className="ml-2 bg-green-100 text-green-700">Best</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatMetric(getMetricValue(model))}
                        </td>
                        {results.problemType === 'CLASSIFICATION' && (
                          <>
                            <td className="px-4 py-3 text-right">{formatMetric(model.auc)}</td>
                            <td className="px-4 py-3 text-right">{formatMetric(model.f1Score)}</td>
                          </>
                        )}
                        {results.problemType === 'REGRESSION' && (
                          <>
                            <td className="px-4 py-3 text-right">{model.rmse?.toFixed(3) || '-'}</td>
                            <td className="px-4 py-3 text-right">{model.mae?.toFixed(3) || '-'}</td>
                          </>
                        )}
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {formatTime(model.trainingTimeSeconds)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatMetric(model.cvScore)}
                          {model.cvStd && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ±{(model.cvStd * 100).toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importance */}
            {results.featureImportance && results.featureImportance.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Top Feature Importance</h4>
                <div className="space-y-2">
                  {results.featureImportance.slice(0, 8).map((feature, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{feature.feature}</span>
                        <span className="text-muted-foreground">
                          {(feature.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                          style={{ width: `${feature.importance * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Engineering Info */}
            {results.featureEngineering.enabled && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Feature Engineering Applied
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <div>
                    • Scaling Method: <span className="font-medium">{results.featureEngineering.scalingMethod}</span>
                  </div>
                  <div>
                    • Original Features: <span className="font-medium">{results.featureEngineering.originalFeatures}</span>
                  </div>
                  <div>
                    • Engineered Features: <span className="font-medium">{results.featureEngineering.engineeredFeatures}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No results available
          </div>
        )}

        <DialogFooter className="flex items-center gap-2">
          {results?.comparisonCsvPath && (
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          )}
          {results?.bestModel && jobId && onDeploy && (
            <Button
              className="gap-2"
              onClick={() => onDeploy(jobId)}
            >
              <Rocket className="h-4 w-4" />
              Deploy Best Model
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