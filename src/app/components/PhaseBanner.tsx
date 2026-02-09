/**
 * Phase Banner Component
 * Shows current development phase and upcoming features
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { PhaseBadge } from './ui/phase-badge';
import { CheckCircle2, Clock, Sparkles, Info, X } from 'lucide-react';

export function PhaseBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('ml_platform_phase_banner_dismissed') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('ml_platform_phase_banner_dismissed', 'true');
  };

  if (isDismissed) return null;

  const phases = [
    {
      number: 0,
      name: 'Authentication & Workspaces',
      status: 'complete' as const,
      features: ['User Registration & Login', 'Workspace Management', 'Multi-tenant Support'],
    },
    {
      number: 1,
      name: 'Project Management',
      status: 'complete' as const,
      features: ['Create & Manage Projects', 'Project Organization', 'Team Collaboration'],
    },
    {
      number: 2,
      name: 'Data Ingestion',
      status: 'complete' as const,
      features: ['Data Source Configuration', 'Dataset Upload & Processing', 'Data Preview & Validation'],
    },
    {
      number: 3,
      name: 'Model Training & Evaluation',
      status: 'upcoming' as const,
      features: ['Model Training Workflows', 'Performance Metrics', 'Model Comparison', 'Activity Tracking'],
    },
    {
      number: 4,
      name: 'Deployment & Monitoring',
      status: 'upcoming' as const,
      features: ['Model Deployment', 'Real-time Predictions', 'Performance Monitoring', 'Model Versioning'],
    },
  ];

  const currentPhase = phases.find(p => p.status === 'current') || phases.find(p => p.number === 2);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800 mb-6">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Platform Development Status
                </h3>
                <PhaseBadge 
                  phase={currentPhase?.number || 2} 
                  status="complete" 
                  label={`Phase ${currentPhase?.number} Complete`}
                  className="text-xs"
                />
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Currently running Phase 0-2: Authentication, Projects, and Data Ingestion are fully operational. 
                Model training and activity tracking features coming in Phase 3!
              </p>

              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {phases.map((phase) => (
                    <div 
                      key={phase.number}
                      className={`p-3 rounded-lg border ${
                        phase.status === 'complete' 
                          ? 'bg-white dark:bg-gray-900 border-green-200 dark:border-green-800'
                          : 'bg-white/50 dark:bg-gray-900/50 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {phase.status === 'complete' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        )}
                        <h4 className="font-medium text-sm">
                          Phase {phase.number}: {phase.name}
                        </h4>
                      </div>
                      <ul className="space-y-1">
                        {phase.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="text-[10px] mt-0.5">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 h-auto p-0"
              >
                {isExpanded ? 'Show less' : 'View all phases'}
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
