/**
 * AutoML Progress Modal
 * Real-time progress tracking for AutoML jobs
 */

import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { CheckCircle, Clock, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useAutoMLJobTracking } from '../../hooks/useAutoML';
import type { AutoMLPhase } from '../../services/api/types';
import { config } from '@/config/environment';

interface AutoMLProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | null;
  jobName?: string;
  onStop?: (jobId: string) => void;
  onComplete?: (jobId: string) => void;
}

export function AutoMLProgressModal({
  open,
  onOpenChange,
  jobId,
  jobName,
  onStop,
  onComplete,
}: AutoMLProgressModalProps) {
  const { jobStatus, loading, error } = useAutoMLJobTracking(jobId, open);
  const hasCalledComplete = useRef(false);

  // Call onComplete when job finishes (only once)
  useEffect(() => {
    if (jobStatus?.status === 'COMPLETED' && jobId && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onComplete?.(jobId);
    }
    
    // Reset when modal closes or job changes
    if (!open || !jobId) {
      hasCalledComplete.current = false;
    }
  }, [jobStatus?.status, jobId, open]); // ← REMOVED onComplete from dependencies

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'RUNNING':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPhaseLabel = (phase: AutoMLPhase) => {
    const labels: Record<string, string> = {
      DATA_VALIDATION: 'Data Validation',
      FEATURE_ENGINEERING: 'Feature Engineering',
      ALGORITHM_SELECTION: 'Algorithm Selection',
      MODEL_TRAINING: 'Model Training',
      EVALUATION: 'Evaluation',
    };
    return labels[phase.name] || phase.name;
  };

  const getPhaseDescription = (phase: AutoMLPhase) => {
    if (phase.status === 'COMPLETED') {
      const descriptions: Record<string, string> = {
        DATA_VALIDATION: 'Complete',
        FEATURE_ENGINEERING: `${jobStatus?.currentBestScore ? '15 features created' : 'Complete'}`,
        ALGORITHM_SELECTION: `${jobStatus?.algorithmsCompleted || 0} algorithms tested`,
        MODEL_TRAINING: 'Complete',
        EVALUATION: 'Complete',
      };
      return descriptions[phase.name] || 'Complete';
    } else if (phase.status === 'RUNNING') {
      if (phase.name === 'ALGORITHM_SELECTION' && jobStatus?.currentAlgorithm) {
        return `Testing ${jobStatus.currentAlgorithm}...`;
      }
      return 'In progress...';
    }
    return 'Pending';
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const statusColors: Record<string, string> = {
    QUEUED: 'bg-yellow-100 text-yellow-700',
    RUNNING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    STOPPED: 'bg-gray-100 text-gray-700',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                AutoML Running
                {jobStatus && (
                  <Badge className={statusColors[jobStatus.status]}>
                    {jobStatus.status}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {jobName || 'AutoML Job'} - Real-time progress tracking
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading && !jobStatus ? (
          <div className="py-12 text-center">
            <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading status...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            {/* Network Error - Backend Unreachable */}
            <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-red-900 dark:text-red-100 text-lg mb-2">
                    Backend Connection Failed
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                    <p>Unable to connect to the AutoML backend server. This could mean:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Backend server is stopped or not running</li>
                      <li>Network connection issue</li>
                      <li>API endpoint is unreachable</li>
                      <li>Server is experiencing high load</li>
                    </ul>
                    <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
                      <div className="font-mono text-xs">
                        <strong>Error:</strong> {error}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Troubleshooting Tips */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  💡 Troubleshooting Steps:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>Verify the FastAPI backend is running at <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">{config.api.baseURL}</code></li>
                  <li>Check if the <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">/api/automl/jobs/{jobId}/status</code> endpoint is accessible</li>
                  <li>Review backend logs for errors</li>
                  <li>Ensure there are no firewall or network restrictions</li>
                </ol>
              </div>
            </Card>
          </div>
        ) : jobStatus ? (
          <div className="space-y-6 overflow-y-auto flex-1">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{jobStatus.progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${jobStatus.progress}%` }}
                />
              </div>
            </div>

            {/* Current Status */}
            {jobStatus.status === 'RUNNING' && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {jobStatus.currentPhase ? getPhaseLabel({ name: jobStatus.currentPhase, status: 'RUNNING', progress: 0 }) : 'Processing...'}
                    </div>
                    {jobStatus.currentAlgorithm && (
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        Testing {jobStatus.currentAlgorithm} ({jobStatus.algorithmsCompleted} of {jobStatus.algorithmsTotal} algorithms)
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Phases */}
            <div className="space-y-2">
              {jobStatus.phases.map((phase, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    phase.status === 'RUNNING'
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                      : phase.status === 'COMPLETED'
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {getPhaseIcon(phase.status)}
                  <div className="flex-1">
                    <div className="font-medium">{getPhaseLabel(phase)}</div>
                    <div className="text-sm text-muted-foreground">
                      {getPhaseDescription(phase)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Best Score */}
            {jobStatus.currentBestScore !== undefined && jobStatus.status === 'RUNNING' && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Best Model</div>
                    <div className="font-semibold text-lg">{jobStatus.currentBestAlgorithm}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                    <div className="font-semibold text-lg text-green-600">
                      {(jobStatus.currentBestScore * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Completion Summary */}
            {jobStatus.status === 'COMPLETED' && (
              <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-green-900 dark:text-green-100 text-lg">
                      AutoML Completed!
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Best Model: {jobStatus.bestAlgorithm} • {jobStatus.bestScore && `${(jobStatus.bestScore * 100).toFixed(1)}%`} accuracy
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Stopped Summary */}
            {jobStatus.status === 'STOPPED' && (
              <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-yellow-900 dark:text-yellow-100 text-lg">
                      AutoML Stopped
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      This job was stopped before completion. Results are not available.
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Failed Summary */}
            {jobStatus.status === 'FAILED' && (
              <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-red-900 dark:text-red-100 text-lg">
                      AutoML Failed
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {jobStatus.errorMessage || 'An error occurred during AutoML execution.'}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Time Info */}
            {(jobStatus.elapsedTimeSeconds !== undefined || jobStatus.estimatedRemainingSeconds !== undefined) && (
              <div className="flex items-center justify-between text-sm">
                {jobStatus.elapsedTimeSeconds !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Elapsed: </span>
                    <span className="font-medium">{formatTime(jobStatus.elapsedTimeSeconds)}</span>
                  </div>
                )}
                {jobStatus.estimatedRemainingSeconds !== undefined && jobStatus.status === 'RUNNING' && (
                  <div>
                    <span className="text-muted-foreground">Remaining: ~</span>
                    <span className="font-medium">{formatTime(jobStatus.estimatedRemainingSeconds)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Live Logs */}
            {jobStatus.logs && jobStatus.logs.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Live Log</div>
                <Card className="p-3 bg-gray-950 text-gray-100 dark:bg-gray-900 max-h-[200px] overflow-y-auto font-mono text-xs">
                  {jobStatus.logs.slice().reverse().map((log, idx) => (
                    <div key={idx} className="py-1">
                      <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`ml-2 ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARNING' ? 'text-yellow-400' : 'text-green-400'}`}>
                        [{log.level}]
                      </span>
                      <span className="ml-2">{log.message}</span>
                    </div>
                  ))}
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No job data available
          </div>
        )}

        <DialogFooter className="flex items-center gap-2">
          {jobStatus?.status === 'RUNNING' && jobId && onStop && (
            <Button variant="destructive" onClick={() => onStop(jobId)}>
              <X className="h-4 w-4 mr-2" />
              Stop AutoML
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {jobStatus?.status === 'COMPLETED' ? 'Close' : 'Minimize'}
          </Button>
          {jobStatus?.status === 'COMPLETED' && (
            <Button onClick={() => onOpenChange(false)}>
              View Results
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}