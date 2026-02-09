/**
 * Phase 3 Feature Clustering Component
 * World-class feature cluster visualization with badges
 */

import React from 'react';
import { Layers, Info } from 'lucide-react';
import { ClusteringResponse } from '@/services/edaApi';

interface Props {
  data: ClusteringResponse;
}

export function Phase3FeatureClustering({ data }: Props) {
  // Color palette for clusters
  const clusterColors = [
    { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-300 dark:border-blue-700' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-300 dark:border-purple-700' },
    { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', border: 'border-green-300 dark:border-green-700' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-300 dark:border-orange-700' },
    { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-200', border: 'border-pink-300 dark:border-pink-700' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-800 dark:text-cyan-200', border: 'border-cyan-300 dark:border-cyan-700' },
    { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-300 dark:border-amber-700' },
    { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-800 dark:text-teal-200', border: 'border-teal-300 dark:border-teal-700' },
  ];

  const getClusterColor = (index: number) => {
    return clusterColors[index % clusterColors.length];
  };

  // Sort clusters by size (descending)
  const sortedClusters = [...data.clusters].sort((a, b) => b.size - a.size);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">Feature Clustering</h3>
          <p className="text-sm text-muted-foreground">
            {data.total_clusters} clusters identified using {data.method}
          </p>
        </div>
      </div>

      {/* Interpretation */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Clustering Interpretation
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">{data.cluster_interpretation}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Total Clusters</div>
          <div className="text-2xl font-bold">{data.total_clusters}</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Largest Cluster</div>
          <div className="text-2xl font-bold">{sortedClusters[0]?.size || 0}</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Smallest Cluster</div>
          <div className="text-2xl font-bold">{sortedClusters[sortedClusters.length - 1]?.size || 0}</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Method</div>
          <div className="text-base font-bold truncate" title={data.method}>{data.method}</div>
        </div>
      </div>

      {/* Cluster Cards */}
      <div className="space-y-3">
        {sortedClusters.map((cluster, index) => {
          const colors = getClusterColor(cluster.cluster_id);
          
          return (
            <div
              key={cluster.cluster_id}
              className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}
            >
              {/* Cluster Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 border ${colors.border}`}>
                    <Layers className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Cluster #{cluster.cluster_id}</div>
                    <div className="text-sm text-muted-foreground">
                      {cluster.size} features • Avg correlation: {cluster.avg_internal_correlation.toFixed(3)}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
                  <span className={`font-bold text-sm ${colors.text}`}>
                    Size: {cluster.size}
                  </span>
                </div>
              </div>

              {/* Internal Correlation Bar */}
              <div className="mb-3">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Internal Correlation Strength
                </div>
                <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${colors.bg}`}
                    style={{ width: `${cluster.avg_internal_correlation * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {(cluster.avg_internal_correlation * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Features - Badge Display */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Features in this cluster:
                </div>
                <div className="flex flex-wrap gap-2">
                  {cluster.features.map((feature) => (
                    <span
                      key={feature}
                      className={`px-3 py-1.5 rounded-md font-medium text-sm border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cluster Size Distribution */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="text-sm font-semibold mb-3">Cluster Size Distribution</div>
        <div className="space-y-2">
          {sortedClusters.map((cluster) => {
            const maxSize = sortedClusters[0].size;
            const widthPercent = (cluster.size / maxSize) * 100;
            const colors = getClusterColor(cluster.cluster_id);

            return (
              <div key={`dist-${cluster.cluster_id}`} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium">Cluster #{cluster.cluster_id}</div>
                <div className="flex-1 relative h-8 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${colors.bg}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-sm font-bold">{cluster.size} features</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
