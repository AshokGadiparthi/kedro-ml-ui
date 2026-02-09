/**
 * Phase 3 VIF Analysis Component
 * World-class VIF (Variance Inflation Factor) analysis with sortable table
 */

import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ArrowUpDown, Info } from 'lucide-react';
import { VIFAnalysisResponse } from '@/services/edaApi';
import { getVIFSeverityColor, getVIFBackgroundColor, getMulticollinearityLevelColor } from '@/services/edaApi';

interface Props {
  data: VIFAnalysisResponse;
}

type SortField = 'feature' | 'vif_score' | 'severity';
type SortDirection = 'asc' | 'desc';

export function Phase3VIFAnalysis({ data }: Props) {
  const [sortField, setSortField] = useState<SortField>('vif_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const vifEntries = useMemo(() => {
    return Object.entries(data.vif_scores).map(([feature, vifData]) => ({
      feature,
      ...vifData,
    }));
  }, [data.vif_scores]);

  const sortedData = useMemo(() => {
    const sorted = [...vifEntries].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'severity') {
        const severityOrder = { CRITICAL: 3, WARNING: 2, OK: 1 };
        aVal = severityOrder[a.severity];
        bVal = severityOrder[b.severity];
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    return sorted;
  }, [vifEntries, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSeverityIcon = (severity: 'OK' | 'WARNING' | 'CRITICAL') => {
    switch (severity) {
      case 'OK':
        return <CheckCircle className="w-4 h-4" style={{ color: getVIFSeverityColor(severity) }} />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4" style={{ color: getVIFSeverityColor(severity) }} />;
      case 'CRITICAL':
        return <XCircle className="w-4 h-4" style={{ color: getVIFSeverityColor(severity) }} />;
    }
  };

  const criticalCount = vifEntries.filter((v) => v.severity === 'CRITICAL').length;
  const warningCount = vifEntries.filter((v) => v.severity === 'WARNING').length;
  const okCount = vifEntries.filter((v) => v.severity === 'OK').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">VIF (Variance Inflation Factor) Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Multicollinearity assessment • VIF &lt; 5: Good, 5-10: Moderate, &gt;10: High
          </p>
        </div>
      </div>

      {/* Overall Assessment Card */}
      <div
        className="p-4 rounded-lg border-2"
        style={{
          borderColor: getMulticollinearityLevelColor(data.overall_multicollinearity_level),
          backgroundColor: `${getMulticollinearityLevelColor(data.overall_multicollinearity_level)}10`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Overall Multicollinearity Level</div>
            <div
              className="text-2xl font-bold uppercase mt-1"
              style={{ color: getMulticollinearityLevelColor(data.overall_multicollinearity_level) }}
            >
              {data.overall_multicollinearity_level}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-muted-foreground">Analyzed Features</div>
            <div className="text-2xl font-bold mt-1">{data.analyzed_features}</div>
          </div>
        </div>
        <p className="text-sm mt-3 text-muted-foreground">{data.interpretation}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-xs text-red-600 dark:text-red-400 font-medium">Critical</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">{criticalCount}</div>
            </div>
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">VIF &gt; 10</div>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Warning</div>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{warningCount}</div>
            </div>
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">VIF 5-10</div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">OK</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{okCount}</div>
            </div>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">VIF &lt; 5</div>
        </div>
      </div>

      {/* VIF Scores Table */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th
                  className="text-left px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort('feature')}
                >
                  <div className="flex items-center gap-2">
                    Feature
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th
                  className="text-center px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort('vif_score')}
                >
                  <div className="flex items-center justify-center gap-2">
                    VIF Score
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th
                  className="text-center px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort('severity')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Severity
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedData.map((vif, index) => (
                <tr
                  key={vif.feature}
                  className={`hover:bg-muted/30 transition-colors ${getVIFBackgroundColor(vif.vif_score)}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{vif.feature}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white dark:bg-gray-800 border font-bold text-sm">
                      {vif.vif_score.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {getSeverityIcon(vif.severity)}
                      <span
                        className="font-semibold text-sm"
                        style={{ color: getVIFSeverityColor(vif.severity) }}
                      >
                        {vif.severity}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{vif.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 dark:text-blue-100">
          <div className="font-semibold mb-1">What is VIF?</div>
          <p>
            VIF measures how much the variance of a regression coefficient is inflated due to multicollinearity. 
            A VIF &gt; 10 indicates high multicollinearity that may require attention, such as removing or combining features.
          </p>
        </div>
      </div>
    </div>
  );
}
