/**
 * Phase 3 Advanced Correlations Tab - WORLD CLASS
 * Complete correlation analysis with heatmap, VIF, pairs, warnings, insights, and clustering
 */

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Activity, RefreshCw } from 'lucide-react';
import { edaApi, Phase3CompleteResponse } from '@/services/edaApi';
import { Button } from '@/app/components/ui/button';
import { Phase3CorrelationHeatmap } from './Phase3CorrelationHeatmap';
import { Phase3VIFAnalysis } from './Phase3VIFAnalysis';
import { Phase3CorrelationPairsTable } from './Phase3CorrelationPairsTable';
import { Phase3MulticollinearityWarnings } from './Phase3MulticollinearityWarnings';
import { Phase3RelationshipInsights } from './Phase3RelationshipInsights';
import { Phase3FeatureClustering } from './Phase3FeatureClustering';

interface Props {
  datasetId: string;
}

type ViewMode = 'overview' | 'heatmap' | 'vif' | 'pairs' | 'warnings' | 'insights' | 'clustering';

export function Phase3AdvancedCorrelations({ datasetId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Phase3CompleteResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await edaApi.getPhase3Complete(datasetId);
      console.log('✅ Phase 3 API Response:', response);
      setData(response);
    } catch (err: any) {
      console.error('Error fetching Phase 3 data:', err);
      setError(err.message || 'Failed to load correlation analysis');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [datasetId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // View mode tabs configuration
  const tabs: Array<{ key: ViewMode; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { key: 'heatmap', label: 'Heatmap', icon: null },
    { key: 'vif', label: 'VIF Analysis', icon: null },
    { key: 'pairs', label: 'Correlation Pairs', icon: null },
    { key: 'warnings', label: 'Warnings', icon: null },
    { key: 'insights', label: 'Insights', icon: null },
    { key: 'clustering', label: 'Clustering', icon: null },
  ];

  // Loading State
  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <div className="text-lg font-semibold">Loading Advanced Correlation Analysis...</div>
        <div className="text-sm text-muted-foreground mt-2">
          Analyzing feature relationships, VIF scores, and clustering...
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-lg font-semibold mb-2">Failed to Load Analysis</div>
        <div className="text-sm text-muted-foreground mb-4">{error}</div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Correlation Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Phase 3 • Complete multicollinearity and relationship analysis
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                viewMode === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {viewMode === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Features Analyzed</div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {data?.enhanced_correlations?.statistics?.total_features || 0}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Total Correlations</div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {data?.enhanced_correlations?.statistics?.total_correlations || 0}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">High Positive</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {data?.enhanced_correlations?.statistics?.high_positive_count || 0}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-700 dark:text-red-300 font-medium">High Negative</div>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100 mt-1">
                  {data?.enhanced_correlations?.statistics?.high_negative_count || 0}
                </div>
              </div>
            </div>

            {/* Warnings Preview */}
            {data?.warnings && data.warnings.total_warnings > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      {data.warnings.total_warnings} Multicollinearity Warning(s) Detected
                    </div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                      {data.warnings.overall_assessment}
                    </p>
                    <Button
                      onClick={() => setViewMode('warnings')}
                      size="sm"
                      variant="outline"
                      className="border-yellow-300 hover:bg-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-900/30"
                    >
                      View All Warnings
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => setViewMode('heatmap')}
                className="p-4 text-left border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
              >
                <div className="font-semibold mb-1 group-hover:text-blue-600">View Heatmap</div>
                <div className="text-sm text-muted-foreground">
                  Interactive correlation matrix visualization
                </div>
              </button>
              <button
                onClick={() => setViewMode('vif')}
                className="p-4 text-left border-2 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group"
              >
                <div className="font-semibold mb-1 group-hover:text-purple-600">VIF Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Variance Inflation Factor assessment
                </div>
              </button>
              <button
                onClick={() => setViewMode('pairs')}
                className="p-4 text-left border-2 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all group"
              >
                <div className="font-semibold mb-1 group-hover:text-green-600">Correlation Pairs</div>
                <div className="text-sm text-muted-foreground">
                  Detailed feature pair correlations
                </div>
              </button>
              <button
                onClick={() => setViewMode('insights')}
                className="p-4 text-left border-2 rounded-lg hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all group"
              >
                <div className="font-semibold mb-1 group-hover:text-orange-600">Relationship Insights</div>
                <div className="text-sm text-muted-foreground">
                  Strongest positive and negative relationships
                </div>
              </button>
              <button
                onClick={() => setViewMode('clustering')}
                className="p-4 text-left border-2 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-all group"
              >
                <div className="font-semibold mb-1 group-hover:text-cyan-600">Feature Clustering</div>
                <div className="text-sm text-muted-foreground">
                  Grouped features by correlation patterns
                </div>
              </button>
              <button
                onClick={() => setViewMode('warnings')}
                className="p-4 text-left border-2 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group"
              >
                <div className="font-semibold mb-1 group-hover:text-red-600">View Warnings</div>
                <div className="text-sm text-muted-foreground">
                  Multicollinearity alerts and recommendations
                </div>
              </button>
            </div>

            {/* Mini previews */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 bg-muted/20">
                <h4 className="font-semibold mb-2">VIF Summary</h4>
                <div className="text-sm text-muted-foreground mb-2">
                  Multicollinearity Level:{' '}
                  <span className="font-bold text-foreground">
                    {data?.vif_analysis?.overall_multicollinearity_level?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div className="text-sm">{data?.vif_analysis?.interpretation || 'No data available'}</div>
              </div>
              <div className="border rounded-lg p-4 bg-muted/20">
                <h4 className="font-semibold mb-2">Clustering Summary</h4>
                <div className="text-sm text-muted-foreground mb-2">
                  Total Clusters:{' '}
                  <span className="font-bold text-foreground">{data?.clustering?.total_clusters || 0}</span>
                </div>
                <div className="text-sm">{data?.clustering?.cluster_interpretation || 'No data available'}</div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'heatmap' && data?.heatmap_data && <Phase3CorrelationHeatmap data={data.heatmap_data} />}

        {viewMode === 'vif' && data?.vif_analysis && <Phase3VIFAnalysis data={data.vif_analysis} />}

        {viewMode === 'pairs' && data?.enhanced_correlations && <Phase3CorrelationPairsTable data={data.enhanced_correlations} />}

        {viewMode === 'warnings' && data?.warnings && <Phase3MulticollinearityWarnings data={data.warnings} />}

        {viewMode === 'insights' && data?.relationship_insights && <Phase3RelationshipInsights data={data.relationship_insights} />}

        {viewMode === 'clustering' && data?.clustering && <Phase3FeatureClustering data={data.clustering} />}
      </div>
    </div>
  );
}