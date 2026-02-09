/**
 * Training Progress Modal
 * Real-time progress tracking for training jobs with dynamic phases
 */

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { CheckCircle, Clock, AlertCircle, RefreshCw, X, Brain, Database, Settings, Target, TrendingUp, Zap } from 'lucide-react';
import { getTrainingProgress } from '../../services/training/trainingService';
import { toast } from 'sonner';
import { config } from '@/config/environment';

interface TrainingPhase {
  name: string;
  displayName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  icon: React.ElementType;
}

interface TrainingProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | null;
  jobName?: string;
  onStop?: (jobId: string) => void;
  onComplete?: (jobId: string) => void;
}

export function TrainingProgressModal({
  open,
  onOpenChange,
  jobId,
  jobName,
  onStop,
  onComplete,
}: TrainingProgressModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('QUEUED');
  const [progress, setProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(100);
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [currentLoss, setCurrentLoss] = useState<number | null>(null);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [message, setMessage] = useState('Initializing...');
  
  const hasCalledComplete = useRef(false);

  // Define training phases based on progress
  const getTrainingPhases = (): TrainingPhase[] => {
    const phases: TrainingPhase[] = [
      {
        name: 'DATA_LOADING',
        displayName: 'Data Loading',
        status: progress > 5 ? 'COMPLETED' : progress > 0 ? 'RUNNING' : 'PENDING',
        progress: Math.min((progress / 5) * 100, 100),
        icon: Database,
      },
      {
        name: 'PREPROCESSING',
        displayName: 'Data Preprocessing',
        status: progress > 15 ? 'COMPLETED' : progress > 5 ? 'RUNNING' : 'PENDING',
        progress: progress > 5 ? Math.min(((progress - 5) / 10) * 100, 100) : 0,
        icon: Settings,
      },
      {
        name: 'TRAINING',
        displayName: 'Model Training',
        status: progress > 85 ? 'COMPLETED' : progress > 15 ? 'RUNNING' : 'PENDING',
        progress: progress > 15 ? Math.min(((progress - 15) / 70) * 100, 100) : 0,
        icon: Brain,
      },
      {
        name: 'VALIDATION',
        displayName: 'Model Validation',
        status: progress > 95 ? 'COMPLETED' : progress > 85 ? 'RUNNING' : 'PENDING',
        progress: progress > 85 ? Math.min(((progress - 85) / 10) * 100, 100) : 0,
        icon: Target,
      },
      {
        name: 'FINALIZATION',
        displayName: 'Saving Model',
        status: progress >= 100 ? 'COMPLETED' : progress > 95 ? 'RUNNING' : 'PENDING',
        progress: progress > 95 ? Math.min(((progress - 95) / 5) * 100, 100) : 0,
        icon: TrendingUp,
      },
    ];

    return phases;
  };

  const phases = getTrainingPhases();

  // Fetch progress
  useEffect(() => {
    if (!open || !jobId) return;

    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const fetchProgress = async () => {
      try {
        setLoading(false);
        const progressData = await getTrainingProgress(jobId);
        
        if (!isMounted) return;
        
        setStatus(progressData.status);
        setProgress(progressData.progress || 0);
        setCurrentEpoch(progressData.currentEpoch || 0);
        setTotalEpochs(progressData.totalEpochs || 100);
        setCurrentAccuracy(progressData.currentAccuracy || null);
        setCurrentLoss(progressData.currentLoss || null);
        setEtaSeconds(progressData.etaSeconds || null);
        setMessage(progressData.message || 'Training in progress...');
        setError(null);

        // Check if completed
        if (progressData.status === 'COMPLETED' && !hasCalledComplete.current) {
          hasCalledComplete.current = true;
          setTimeout(() => {
            if (isMounted) {
              onComplete?.(jobId);
              toast.success('Training completed successfully!');
            }
          }, 1000);
        }

        // Check if failed
        if (progressData.status === 'FAILED') {
          setError('Training failed. Please check the logs for details.');
          clearInterval(intervalId);
        }

        // Stop polling if terminal state
        if (progressData.status === 'COMPLETED' || progressData.status === 'FAILED' || progressData.status === 'STOPPED') {
          clearInterval(intervalId);
        }

      } catch (err: any) {
        console.error('Failed to fetch training progress:', err);
        if (isMounted) {
          setError(err.message || 'Failed to connect to training backend');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchProgress();

    // Poll every 2 seconds
    intervalId = setInterval(() => {
      fetchProgress();
    }, 2000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [open, jobId, onComplete]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      hasCalledComplete.current = false;
    }
  }, [open]);

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

  const getPhaseDescription = (phase: TrainingPhase) => {
    if (phase.status === 'COMPLETED') {
      return 'Complete';
    } else if (phase.status === 'RUNNING') {
      if (phase.name === 'TRAINING' && currentEpoch && totalEpochs) {
        return `Epoch ${currentEpoch}/${totalEpochs}`;
      }
      return 'In progress...';
    }
    return 'Pending';
  };

  const formatTime = (seconds?: number | null) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const statusColors: Record<string, string> = {
    QUEUED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    STARTING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    RUNNING: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    FAILED: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    STOPPED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    PAUSED: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Training in Progress
                <Badge className={statusColors[status] || statusColors.QUEUED}>
                  {status}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {jobName || 'Training Job'} - Real-time progress tracking
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading training status...</p>
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
                    <p>Unable to connect to the training backend server. This could mean:</p>
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
                  <li>Check if the <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">/api/training/jobs/{'{jobId}'}/progress</code> endpoint is accessible</li>
                  <li>Review backend logs for errors</li>
                  <li>Ensure there are no firewall or network restrictions</li>
                </ol>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto flex-1">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Current Status */}
            {status === 'RUNNING' && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      {message}
                    </div>
                    {etaSeconds && (
                      <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Estimated time remaining: {formatTime(etaSeconds)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Training Phases */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Training Phases</h4>
              <div className="space-y-2">
                {phases.map((phase) => {
                  const Icon = phase.icon;
                  return (
                    <div
                      key={phase.name}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        phase.status === 'RUNNING'
                          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700'
                          : phase.status === 'COMPLETED'
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            phase.status === 'RUNNING'
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : phase.status === 'COMPLETED'
                              ? 'bg-green-100 dark:bg-green-900'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              phase.status === 'RUNNING'
                                ? 'text-blue-600 dark:text-blue-400'
                                : phase.status === 'COMPLETED'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{phase.displayName}</div>
                            <div className="text-xs text-muted-foreground">
                              {getPhaseDescription(phase)}
                            </div>
                          </div>
                        </div>
                        {getPhaseIcon(phase.status)}
                      </div>
                      {phase.status === 'RUNNING' && (
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Training Metrics */}
            {(currentAccuracy !== null || currentLoss !== null) && (
              <div className="grid grid-cols-2 gap-4">
                {currentAccuracy !== null && (
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                    <div className="text-sm text-muted-foreground mb-1">Current Accuracy</div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {(currentAccuracy * 100).toFixed(2)}%
                    </div>
                  </Card>
                )}
                {currentLoss !== null && (
                  <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
                    <div className="text-sm text-muted-foreground mb-1">Current Loss</div>
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {currentLoss.toFixed(4)}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Epoch Progress */}
            {totalEpochs > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Training Epochs</div>
                  <div className="text-sm text-muted-foreground">
                    {currentEpoch} / {totalEpochs}
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${(currentEpoch / totalEpochs) * 100}%` }}
                  />
                </div>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              {status === 'RUNNING' && etaSeconds && (
                <span>Est. {formatTime(etaSeconds)} remaining</span>
              )}
            </div>
            <div className="flex gap-2">
              {(status === 'RUNNING' || status === 'QUEUED') && onStop && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (jobId) {
                      onStop(jobId);
                      onOpenChange(false);
                    }
                  }}
                >
                  Stop Training
                </Button>
              )}
              <Button
                variant={status === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                {status === 'COMPLETED' ? 'View Results' : 'Close'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}