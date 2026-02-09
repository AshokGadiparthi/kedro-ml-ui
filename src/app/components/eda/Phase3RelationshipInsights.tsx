/**
 * Phase 3 Relationship Insights Component
 * World-class relationship analysis with connectivity visualization
 */

import React from 'react';
import { TrendingUp, TrendingDown, Network } from 'lucide-react';
import { RelationshipInsightsResponse } from '@/services/edaApi';
import { getCorrelationValueColor, formatCorrelation } from '@/services/edaApi';

interface Props {
  data: RelationshipInsightsResponse;
}

export function Phase3RelationshipInsights({ data }: Props) {
  // Sort connectivity by score for better visualization
  const sortedConnectivity = [...data.feature_connectivity].sort(
    (a, b) => b.connectivity_score - a.connectivity_score
  );
  const maxConnectivity = sortedConnectivity[0]?.connectivity_score || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-lg">Relationship Insights</h3>
        <p className="text-sm text-muted-foreground">
          Feature relationships and connectivity analysis
        </p>
      </div>

      {/* Positive Relationships */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold">Strongest Positive Relationships</h4>
          <span className="text-xs text-muted-foreground">
            ({data.strongest_positive_relationships.length} pairs)
          </span>
        </div>
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-green-50 dark:bg-green-950/20">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold">#</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Feature 1</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Feature 2</th>
                <th className="text-center px-4 py-3 text-sm font-semibold">Correlation</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.strongest_positive_relationships.map((rel, index) => (
                <tr key={`pos-${index}`} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{rel.feature1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{rel.feature2}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <div
                        className="px-3 py-1 rounded-full text-white font-bold text-sm shadow-sm"
                        style={{ backgroundColor: getCorrelationValueColor(rel.correlation) }}
                      >
                        {formatCorrelation(rel.correlation)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{rel.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Negative Relationships */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-600" />
          <h4 className="font-semibold">Strongest Negative Relationships</h4>
          <span className="text-xs text-muted-foreground">
            ({data.strongest_negative_relationships.length} pairs)
          </span>
        </div>
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-red-50 dark:bg-red-950/20">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold">#</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Feature 1</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Feature 2</th>
                <th className="text-center px-4 py-3 text-sm font-semibold">Correlation</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.strongest_negative_relationships.map((rel, index) => (
                <tr key={`neg-${index}`} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{rel.feature1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{rel.feature2}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <div
                        className="px-3 py-1 rounded-full text-white font-bold text-sm shadow-sm"
                        style={{ backgroundColor: getCorrelationValueColor(rel.correlation) }}
                      >
                        {formatCorrelation(rel.correlation)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{rel.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Connectivity */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold">Feature Connectivity</h4>
          <span className="text-xs text-muted-foreground">
            ({data.feature_connectivity.length} features)
          </span>
        </div>
        <div className="space-y-2">
          {sortedConnectivity.map((conn, index) => {
            const barWidth = (conn.connectivity_score / maxConnectivity) * 100;
            const isHighlyConnected = conn.connectivity_score > 0.7;

            return (
              <div
                key={conn.feature}
                className={`p-3 rounded-lg border transition-all ${
                  isHighlyConnected
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="font-semibold">{conn.feature}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <span className="text-muted-foreground">Connected: </span>
                      <span className="font-bold">{conn.connected_count}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">Avg: </span>
                      <span className="font-bold">{conn.avg_correlation.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow-md">
                      Connectivity: {conn.connectivity_score.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-700 dark:text-green-300 font-medium">Positive Pairs</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {data.strongest_positive_relationships.length}
          </div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-xs text-red-700 dark:text-red-300 font-medium">Negative Pairs</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {data.strongest_negative_relationships.length}
          </div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Features Analyzed</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {data.feature_connectivity.length}
          </div>
        </div>
      </div>
    </div>
  );
}
