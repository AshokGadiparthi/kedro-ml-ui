/**
 * PREPROCESSING STATISTICS COMPONENT
 * Before → After comparison with visual indicators
 */

import React from 'react';
import { Card } from '@/app/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Database, AlertTriangle } from 'lucide-react';
import type { PreprocessingJobResponse } from '@/services/preprocessingApi';

interface PreprocessingStatisticsProps {
  jobStatus: PreprocessingJobResponse | null;
}

export function PreprocessingStatistics({ jobStatus }: PreprocessingStatisticsProps) {
  // Mock data - replace with actual data from jobStatus
  const stats = {
    before: {
      rows: 1000,
      cols: 6,
      missing: 145,
      missingPercent: 4.6,
      duplicates: 34,
      outliers: 23,
      memoryMB: 5.2,
    },
    after: {
      rows: 800,
      cols: 5,
      missing: 0,
      missingPercent: 0,
      duplicates: 0,
      outliers: 0,
      memoryMB: 4.8,
    },
  };

  const StatRow = ({
    label,
    before,
    after,
    unit = '',
    showTrend = true,
  }: {
    label: string;
    before: number | string;
    after: number | string;
    unit?: string;
    showTrend?: boolean;
  }) => {
    const beforeNum = typeof before === 'number' ? before : parseFloat(before as string);
    const afterNum = typeof after === 'number' ? after : parseFloat(after as string);
    const isImprovement =
      label.includes('Missing') ||
      label.includes('Duplicates') ||
      label.includes('Outliers') ||
      label.includes('Memory')
        ? afterNum < beforeNum
        : afterNum >= beforeNum;

    const TrendIcon = !showTrend
      ? null
      : afterNum > beforeNum
      ? TrendingUp
      : afterNum < beforeNum
      ? TrendingDown
      : Minus;

    const trendColor = !showTrend
      ? ''
      : isImprovement
      ? 'text-green-600 dark:text-green-400'
      : afterNum === beforeNum
      ? 'text-gray-500'
      : 'text-red-600 dark:text-red-400';

    return (
      <div className="flex items-center justify-between py-3 border-b last:border-0">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono">
            {typeof before === 'number' ? before.toLocaleString() : before}
            {unit}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="text-sm font-mono font-semibold">
            {typeof after === 'number' ? after.toLocaleString() : after}
            {unit}
          </span>
          {TrendIcon && <TrendIcon className={`w-4 h-4 ${trendColor}`} />}
        </div>
      </div>
    );
  };

  if (!jobStatus || jobStatus.status !== 'completed') {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Before → After Comparison</h3>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No preprocessing results yet</p>
          <p className="text-xs mt-1">Run preprocessing to see statistics</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Before → After Comparison</h3>
      </div>

      <div className="space-y-1">
        <StatRow label="Rows" before={stats.before.rows} after={stats.after.rows} showTrend={false} />
        <StatRow label="Columns" before={stats.before.cols} after={stats.after.cols} showTrend={false} />
        <StatRow
          label="Missing Values"
          before={`${stats.before.missing} (${stats.before.missingPercent}%)`}
          after={`${stats.after.missing} (${stats.after.missingPercent}%)`}
        />
        <StatRow label="Duplicates" before={stats.before.duplicates} after={stats.after.duplicates} />
        <StatRow label="Outliers" before={stats.before.outliers} after="Capped" showTrend={false} />
        <StatRow label="Memory" before={stats.before.memoryMB} after={stats.after.memoryMB} unit=" MB" />
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.after.rows}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Clean Rows</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
            <div className="text-xs text-muted-foreground mt-1">Complete</div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              -{((1 - stats.after.memoryMB / stats.before.memoryMB) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Memory Saved</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
