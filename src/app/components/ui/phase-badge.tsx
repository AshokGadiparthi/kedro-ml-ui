/**
 * Phase Badge Component
 * Shows which development phase a feature is in
 */

import { Badge } from '@/app/components/ui/badge';
import { Sparkles, CheckCircle2, Clock } from 'lucide-react';

export type PhaseStatus = 'complete' | 'current' | 'upcoming';

interface PhaseBadgeProps {
  phase: number;
  status: PhaseStatus;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export function PhaseBadge({ 
  phase, 
  status, 
  label, 
  showIcon = true,
  className = '' 
}: PhaseBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'complete':
        return {
          color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800',
          icon: CheckCircle2,
          text: label || `Phase ${phase} - Complete`
        };
      case 'current':
        return {
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          icon: Sparkles,
          text: label || `Phase ${phase} - Active`
        };
      case 'upcoming':
        return {
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          icon: Clock,
          text: label || `Phase ${phase} - Coming Soon`
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} gap-1.5 ${className}`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.text}
    </Badge>
  );
}

/**
 * Feature Phase Indicator
 * Shows a tooltip-style indicator for upcoming features
 */
interface FeaturePhaseProps {
  phase: number;
  featureName: string;
  description?: string;
}

export function FeaturePhaseIndicator({ phase, featureName, description }: FeaturePhaseProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            {featureName}
          </p>
          <PhaseBadge phase={phase} status="upcoming" showIcon={false} className="text-xs" />
        </div>
        {description && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
