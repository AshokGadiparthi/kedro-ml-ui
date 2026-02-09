/**
 * Phase 3 Multicollinearity Warnings Component
 * World-class collapsible warning cards with severity indicators
 */

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, XCircle } from 'lucide-react';
import { MulticollinearityWarningsResponse } from '@/services/edaApi';
import { getWarningSeverityColor } from '@/services/edaApi';
import { Button } from '@/app/components/ui/button';

interface Props {
  data: MulticollinearityWarningsResponse;
}

export function Phase3MulticollinearityWarnings({ data }: Props) {
  const [expandedWarnings, setExpandedWarnings] = useState<Set<number>>(new Set([0])); // First warning expanded by default

  const toggleWarning = (index: number) => {
    const newExpanded = new Set(expandedWarnings);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedWarnings(newExpanded);
  };

  const expandAll = () => {
    setExpandedWarnings(new Set(data.warnings.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedWarnings(new Set());
  };

  const getSeverityIcon = (severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    switch (severity) {
      case 'INFO':
        return <Info className="w-5 h-5" style={{ color: getWarningSeverityColor(severity) }} />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5" style={{ color: getWarningSeverityColor(severity) }} />;
      case 'CRITICAL':
        return <XCircle className="w-5 h-5" style={{ color: getWarningSeverityColor(severity) }} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'high_vif':
        return 'High VIF Detected';
      case 'high_correlation':
        return 'High Correlation';
      case 'cluster_detected':
        return 'Feature Cluster';
      default:
        return type;
    }
  };

  if (data.warnings.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Multicollinearity Warnings</h3>
        <div className="p-8 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Info className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">No Warnings Detected</div>
          <p className="text-green-700 dark:text-green-300">{data.overall_assessment}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Multicollinearity Warnings</h3>
          <p className="text-sm text-muted-foreground">
            {data.total_warnings} warnings detected • {data.critical_count} critical, {data.warning_count} moderate
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="text-sm font-medium text-muted-foreground mb-1">Overall Assessment</div>
        <p className="text-sm">{data.overall_assessment}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Total Warnings</div>
          <div className="text-2xl font-bold">{data.total_warnings}</div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-xs text-red-700 dark:text-red-300 font-medium">Critical</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{data.critical_count}</div>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Warnings</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{data.warning_count}</div>
        </div>
      </div>

      {/* Warning Cards */}
      <div className="space-y-3">
        {data.warnings.map((warning, index) => {
          const isExpanded = expandedWarnings.has(index);
          const borderColor = getWarningSeverityColor(warning.severity);

          return (
            <div
              key={index}
              className="border-2 rounded-lg overflow-hidden transition-all"
              style={{ borderColor }}
            >
              {/* Warning Header - Collapsible */}
              <button
                onClick={() => toggleWarning(index)}
                className="w-full p-4 flex items-start justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  {getSeverityIcon(warning.severity)}
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                        style={{
                          backgroundColor: `${borderColor}20`,
                          color: borderColor,
                        }}
                      >
                        {warning.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">{getTypeLabel(warning.type)}</span>
                    </div>
                    <div className="font-semibold text-sm">{warning.message}</div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {/* Warning Details - Expandable */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t bg-muted/10">
                  {/* Affected Features */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-muted-foreground mb-2">
                      Affected Features ({warning.affected_features.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {warning.affected_features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-white dark:bg-gray-800 rounded border text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                    <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      💡 Recommendation
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{warning.recommendation}</p>
                  </div>

                  {/* Details (if available) */}
                  {warning.details && (
                    <div className="mt-3 p-3 bg-muted/30 rounded border text-xs font-mono">
                      <div className="font-semibold mb-1">Additional Details</div>
                      <pre className="whitespace-pre-wrap">{JSON.stringify(warning.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
