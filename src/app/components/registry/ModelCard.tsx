/**
 * Model Card Component
 * Beautiful card display for registered models
 */

import { RegisteredModel } from '../../../services/models/modelRegistryService';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Trophy,
  GitBranch,
  Rocket,
  Clock,
  TrendingUp,
  Archive,
  Eye,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Download,
} from 'lucide-react';

interface ModelCardProps {
  model: RegisteredModel;
  onViewDetails: (modelId: string) => void;
  onDeploy?: (modelId: string) => void;
  onDownloadSource?: (modelId: string) => void;
}

export function ModelCard({ model, onViewDetails, onDeploy, onDownloadSource }: ModelCardProps) {
  const statusConfig = {
    production: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    staging: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      icon: <PlayCircle className="h-3 w-3" />,
    },
    draft: {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
      icon: <Clock className="h-3 w-3" />,
    },
    archived: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      icon: <Archive className="h-3 w-3" />,
    },
    deprecated: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };

  const config = statusConfig[model.status] || statusConfig.draft;
  const accuracyColor = model.best_accuracy >= 0.9 ? 'text-green-600' : model.best_accuracy >= 0.8 ? 'text-blue-600' : 'text-yellow-600';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer overflow-hidden">
      <div className="p-6" onClick={() => onViewDetails(model.id)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {model.name}
              </h3>
              {model.is_deployed && (
                <Rocket className="h-4 w-4 text-green-600 animate-pulse" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {model.description}
            </p>
          </div>
          <Badge variant="secondary" className={`${config.color} flex items-center gap-1`}>
            {config.icon}
            <span className="capitalize">{model.status}</span>
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Trophy className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
            <div className={`text-2xl font-bold ${accuracyColor}`}>
              {(model.best_accuracy * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <GitBranch className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {model.total_versions}
            </div>
            <div className="text-xs text-muted-foreground">Versions</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="text-sm font-bold text-purple-900 dark:text-purple-100 truncate">
              {model.best_algorithm}
            </div>
            <div className="text-xs text-muted-foreground">Algorithm</div>
          </div>
        </div>

        {/* Version & Dataset Info */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current Version:</span>
            <Badge variant="outline" className="font-mono">{model.current_version}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Dataset:</span>
            <span className="text-sm font-medium truncate max-w-[180px]">
              {model.source_dataset_name || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Problem Type:</span>
            <Badge variant="secondary" className="capitalize">
              {model.problem_type}
            </Badge>
          </div>
        </div>

        {/* Tags */}
        {model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {model.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {model.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{model.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer - Timestamp */}
        <div className="flex items-center text-xs text-muted-foreground border-t pt-3">
          <Clock className="h-3 w-3 mr-1" />
          Updated {new Date(model.updated_at).toLocaleDateString()}
        </div>
      </div>

      {/* Action Buttons - Show on Hover */}
      <div className="border-t bg-gray-50 dark:bg-gray-900 p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(model.id);
          }}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Button>
        {!model.is_deployed && onDeploy && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDeploy(model.id);
            }}
            className="gap-2"
          >
            <Rocket className="h-4 w-4" />
            Deploy
          </Button>
        )}
        {model.is_deployed && (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Deployed
          </Badge>
        )}
        {onDownloadSource && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadSource(model.id);
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Source
          </Button>
        )}
      </div>
    </Card>
  );
}