/**
 * AutoML Job Card
 * Individual job card for history section
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, CheckCircle, AlertCircle, Loader2, StopCircle, BarChart3, Play, Rocket } from 'lucide-react';
import type { AutoMLJobListItem } from '../../services/api/types';

interface AutoMLJobCardProps {
  job: AutoMLJobListItem;
  onViewProgress?: (jobId: string) => void;
  onViewResults?: (jobId: string) => void;
  onDeploy?: (jobId: string) => void;
  onActivate?: (deploymentId: string) => void;
}

export function AutoMLJobCard({ job, onViewProgress, onViewResults, onDeploy, onActivate }: AutoMLJobCardProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; color: string; label: string }> = {
      QUEUED: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
        label: 'Queued',
      },
      RUNNING: {
        icon: Loader2,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
        label: 'Running',
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
    };
    return configs[status] || configs.QUEUED;
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
              <h3 className="font-semibold text-lg truncate">{job.name}</h3>
              <Badge className={statusConfig.color}>
                <StatusIcon className={`h-3 w-3 mr-1 ${job.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                {statusConfig.label}
              </Badge>
              {job.isActiveDeployment && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">
                  <Rocket className="h-3 w-3 mr-1" />
                  {job.deploymentVersionLabel} Active
                </Badge>
              )}
              {job.isDeployed && !job.isActiveDeployment && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {job.deploymentVersionLabel} Deployed
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {job.problemType} • Created {formatDate(job.createdAt)}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {job.bestAlgorithm && (
            <div>
              <div className="text-xs text-muted-foreground">Best Algorithm</div>
              <div className="font-medium">{job.bestAlgorithm}</div>
            </div>
          )}
          {job.bestScore !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground">Best Score</div>
              <div className="font-medium text-green-600">
                {(job.bestScore * 100).toFixed(1)}%
              </div>
            </div>
          )}
          {job.algorithmsCount !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground">Algorithms</div>
              <div className="font-medium">{job.algorithmsCount}</div>
            </div>
          )}
          {job.elapsedTimeSeconds !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="font-medium">{formatTime(job.elapsedTimeSeconds)}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {job.status === 'RUNNING' && onViewProgress && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onViewProgress(job.jobId)}
            >
              <Play className="h-4 w-4" />
              View Progress
            </Button>
          )}
          {job.status === 'COMPLETED' && onViewResults && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onViewResults(job.jobId)}
            >
              <BarChart3 className="h-4 w-4" />
              View Results
            </Button>
          )}
          {/* Deployment Actions */}
          {job.isActiveDeployment ? (
            <Button
              disabled
              size="sm"
              className="flex-1 gap-2 bg-green-600 hover:bg-green-600 text-white"
            >
              ✓ Active
            </Button>
          ) : job.isDeployed && onActivate ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onActivate(job.deploymentId || '')}
            >
              ↻ Rollback to {job.deploymentVersionLabel}
            </Button>
          ) : job.status === 'COMPLETED' && onDeploy ? (
            <Button
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onDeploy(job.jobId)}
            >
              🚀 Deploy
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}