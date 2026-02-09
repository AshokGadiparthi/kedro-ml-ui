/**
 * Training Job Card
 * Individual job card for training history section (matches AutoML design)
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, CheckCircle, AlertCircle, Loader2, StopCircle, BarChart3, Play, Rocket, Pause } from 'lucide-react';
import type { TrainingJob } from '../../services/api/types';

interface TrainingJobCardProps {
  job: TrainingJob;
  onViewProgress?: (jobId: string) => void;
  onViewResults?: (jobId: string) => void;
  onActivate?: (deploymentId: string) => void;
  onStop?: (jobId: string) => void;
  onResume?: (jobId: string) => void;
}

export function TrainingJobCard({ 
  job, 
  onViewProgress, 
  onViewResults, 
  onActivate,
  onStop,
  onResume 
}: TrainingJobCardProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    const configs: Record<string, { icon: any; color: string; label: string }> = {
      QUEUED: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
        label: 'Queued',
      },
      STARTING: {
        icon: Loader2,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
        label: 'Starting',
      },
      RUNNING: {
        icon: Loader2,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
        label: 'Running',
      },
      TRAINING: {
        icon: Loader2,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
        label: 'Training',
      },
      COMPLETED: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
        label: 'Completed',
      },
      FAILED: {
        icon: AlertCircle,
        color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        label: 'Failed',
      },
      STOPPED: {
        icon: StopCircle,
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
        label: 'Stopped',
      },
      CANCELLED: {
        icon: StopCircle,
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
        label: 'Cancelled',
      },
      PAUSED: {
        icon: Pause,
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
        label: 'Paused',
      },
    };
    return configs[normalizedStatus] || configs.QUEUED;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{job.jobName}</h3>
              <Badge className={statusConfig.color}>
                <StatusIcon className={`h-3 w-3 mr-1 ${['RUNNING', 'TRAINING', 'STARTING'].includes(job.status.toUpperCase()) ? 'animate-spin' : ''}`} />
                {statusConfig.label}
              </Badge>
              {/* Active Deployment Badge */}
              {job.isActiveDeployment && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">
                  <Rocket className="h-3 w-3 mr-1" />
                  {job.deploymentVersionLabel} Active
                </Badge>
              )}
              {/* Deployed (but not active) Badge */}
              {job.isDeployed && !job.isActiveDeployment && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {job.deploymentVersionLabel} Deployed
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {job.algorithmDisplayName} • Created {formatDate(job.createdAt || '')}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="font-medium">{job.progressLabel}</div>
          </div>
          {job.currentAccuracyLabel && (
            <div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
              <div className="font-medium text-green-600">
                {job.currentAccuracyLabel}
              </div>
            </div>
          )}
          {job.problemType && (
            <div>
              <div className="text-xs text-muted-foreground">Type</div>
              <div className="font-medium">{job.problemType}</div>
            </div>
          )}
          {job.etaLabel && (
            <div>
              <div className="text-xs text-muted-foreground">ETA</div>
              <div className="font-medium">{job.etaLabel}</div>
            </div>
          )}
        </div>

        {/* Actions - Matches AutoML pattern */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {/* View Progress Button (for running jobs) */}
          {['RUNNING', 'TRAINING'].includes(job.status.toUpperCase()) && onViewProgress && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onViewProgress(job.id)}
            >
              <Play className="h-4 w-4" />
              View Progress
            </Button>
          )}
          
          {/* View Results Button (for completed jobs) */}
          {job.status.toUpperCase() === 'COMPLETED' && onViewResults && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onViewResults(job.id)}
            >
              <BarChart3 className="h-4 w-4" />
              View Results
            </Button>
          )}

          {/* Resume Button (for paused jobs) */}
          {job.status.toUpperCase() === 'PAUSED' && onResume && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onResume(job.id)}
            >
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}

          {/* Deployment Actions (matches AutoML exactly) */}
          {job.isActiveDeployment ? (
            // Active deployment - show disabled green button
            <Button
              disabled
              size="sm"
              className="flex-1 gap-2 bg-green-600 hover:bg-green-600 text-white"
            >
              ✓ Active
            </Button>
          ) : job.isDeployed && onActivate ? (
            // Deployed but not active - show Rollback button
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onActivate(job.deploymentId || '')}
            >
              ↻ Rollback to {job.deploymentVersionLabel}
            </Button>
          ) : null}
          {/* Note: "Deploy" button removed - deployment only from Results Modal */}

          {/* Stop Button (for running jobs) */}
          {['RUNNING', 'TRAINING'].includes(job.status.toUpperCase()) && onStop && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onStop(job.id)}
            >
              <StopCircle className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
