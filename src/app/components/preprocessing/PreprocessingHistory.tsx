/**
 * PREPROCESSING HISTORY COMPONENT
 * Shows past preprocessing jobs and configurations
 */

import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface PreprocessingHistoryProps {
  datasetId: string;
}

export function PreprocessingHistory({ datasetId }: PreprocessingHistoryProps) {
  // Mock data - replace with actual API call
  const historyItems = [
    {
      id: '587d3fac-f4ac-4394-897f-de03462374d8',
      timestamp: '2026-02-05T22:18:17',
      status: 'completed',
      config: {
        missingValues: 'mean',
        outliers: 'iqr-cap',
        scaling: 'standard',
      },
      stats: {
        rowsBefore: 1000,
        rowsAfter: 800,
        executionTime: '4.59s',
      },
    },
    {
      id: 'a1b2c3d4-e5f6-4789-0abc-def123456789',
      timestamp: '2026-02-05T20:15:30',
      status: 'completed',
      config: {
        missingValues: 'drop',
        outliers: 'zscore-remove',
        scaling: 'minmax',
      },
      stats: {
        rowsBefore: 1000,
        rowsAfter: 750,
        executionTime: '3.82s',
      },
    },
    {
      id: 'xyz789-1234-5678-90ab-cdef12345678',
      timestamp: '2026-02-05T18:45:12',
      status: 'failed',
      config: {
        missingValues: 'median',
        outliers: 'isolation-forest',
        scaling: 'none',
      },
      stats: {
        rowsBefore: 1000,
        rowsAfter: 0,
        executionTime: '1.23s',
      },
      error: 'Isolation Forest failed: Not enough samples',
    },
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      completed: {
        icon: CheckCircle2,
        variant: 'default' as const,
        text: 'Completed',
      },
      failed: {
        icon: XCircle,
        variant: 'destructive' as const,
        text: 'Failed',
      },
      processing: {
        icon: Loader2,
        variant: 'secondary' as const,
        text: 'Processing',
      },
    };

    const statusConfig = config[status as keyof typeof config] || config.processing;
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className="gap-1.5">
        <Icon
          className={`w-3.5 h-3.5 ${status === 'processing' ? 'animate-spin' : ''}`}
        />
        {statusConfig.text}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {historyItems.length === 0 ? (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">No History Yet</h3>
          <p className="text-sm text-muted-foreground">
            Your preprocessing jobs will appear here
          </p>
        </Card>
      ) : (
        historyItems.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold font-mono text-sm">{item.id}</h3>
                  {getStatusBadge(item.status)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {formatTimestamp(item.timestamp)}
                  <span>•</span>
                  <span>{item.stats.executionTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'completed' && (
                  <>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reuse Config
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Missing Values</div>
                <div className="text-sm font-medium capitalize">
                  {item.config.missingValues}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Outliers</div>
                <div className="text-sm font-medium uppercase">{item.config.outliers}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Scaling</div>
                <div className="text-sm font-medium capitalize">{item.config.scaling}</div>
              </div>
            </div>

            {/* Statistics or Error */}
            {item.status === 'completed' ? (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Rows:</span>
                  <span className="font-medium">
                    {item.stats.rowsBefore} → {item.stats.rowsAfter}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Reduction:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {(
                      ((item.stats.rowsBefore - item.stats.rowsAfter) /
                        item.stats.rowsBefore) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            ) : item.error ? (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <XCircle className="w-4 h-4" />
                  <span className="font-medium">Error:</span>
                  {item.error}
                </div>
              </div>
            ) : null}
          </Card>
        ))
      )}
    </div>
  );
}
