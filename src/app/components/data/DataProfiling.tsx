/**
 * WORLD-CLASS Data Profiling Component
 * Automatic data quality analysis - inspired by Pandas Profiling, Great Expectations
 * Features: Quality score, missing values, distributions, correlations, suggestions
 */
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Info,
  Lightbulb,
  Download,
  RefreshCw,
} from 'lucide-react';

interface DataProfilingProps {
  datasetName: string;
  onClose: () => void;
}

export function DataProfiling({ datasetName, onClose }: DataProfilingProps) {
  // Mock profiling data (replace with real API)
  const profileData = {
    overallQuality: 87,
    totalRows: 125430,
    totalColumns: 24,
    memoryUsage: '2.4 GB',
    lastProfiled: '2 minutes ago',
    
    qualityBreakdown: {
      excellent: 15,
      good: 6,
      warning: 2,
      critical: 1,
    },

    columnStats: [
      {
        name: 'customer_id',
        type: 'Integer',
        quality: 100,
        missing: 0,
        unique: 125430,
        mean: null,
        insights: ['Unique identifier', 'No duplicates'],
        issues: [],
      },
      {
        name: 'purchase_amount',
        type: 'Float',
        quality: 95,
        missing: 2.1,
        unique: 8934,
        mean: 247.32,
        min: 0.99,
        max: 9999.99,
        insights: ['Right-skewed distribution', 'Some outliers detected'],
        issues: ['2,634 missing values'],
      },
      {
        name: 'customer_age',
        type: 'Integer',
        quality: 92,
        missing: 0.5,
        unique: 73,
        mean: 42.3,
        min: 18,
        max: 95,
        insights: ['Normal distribution', 'Realistic age range'],
        issues: ['627 missing values', '12 potential outliers (age > 90)'],
      },
      {
        name: 'email',
        type: 'String',
        quality: 78,
        missing: 8.2,
        unique: 115123,
        insights: ['Most are unique', 'Some duplicates found'],
        issues: ['10,285 missing values', '1,847 duplicate emails', '234 invalid email formats'],
      },
      {
        name: 'product_category',
        type: 'Categorical',
        quality: 98,
        missing: 0.1,
        unique: 12,
        insights: ['Well-balanced categories', 'No misspellings detected'],
        issues: ['125 missing values'],
      },
      {
        name: 'purchase_date',
        type: 'DateTime',
        quality: 88,
        missing: 1.2,
        insights: ['Continuous time range', '2023-01-01 to 2024-12-31'],
        issues: ['1,505 missing dates', '45 future dates detected'],
      },
    ],

    suggestions: [
      {
        type: 'warning',
        title: 'High Missing Values in Email',
        description: '8.2% of email addresses are missing. Consider imputation or feature engineering.',
        action: 'Auto-Fix',
        severity: 'medium',
      },
      {
        type: 'error',
        title: 'Invalid Email Formats Detected',
        description: '234 email addresses have invalid formats. These should be cleaned.',
        action: 'Clean Data',
        severity: 'high',
      },
      {
        type: 'info',
        title: 'Duplicate Emails Found',
        description: '1,847 duplicate emails suggest multiple purchases per customer. Consider aggregation.',
        action: 'View Duplicates',
        severity: 'low',
      },
      {
        type: 'success',
        title: 'Good Data Quality Overall',
        description: '87% quality score! Your data is ready for model training.',
        action: 'Start Training',
        severity: 'low',
      },
    ],

    correlations: [
      { col1: 'customer_age', col2: 'purchase_amount', correlation: 0.42, strength: 'Moderate' },
      { col1: 'loyalty_points', col2: 'purchase_frequency', correlation: 0.78, strength: 'Strong' },
      { col1: 'product_category', col2: 'purchase_amount', correlation: 0.31, strength: 'Weak' },
    ],
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 95) return 'text-green-600';
    if (quality >= 80) return 'text-blue-600';
    if (quality >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (quality: number) => {
    if (quality >= 95) return { label: 'Excellent', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' };
    if (quality >= 80) return { label: 'Good', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' };
    if (quality >= 60) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' };
    return { label: 'Poor', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' };
  };

  const severityConfig = {
    high: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-900' },
    medium: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-900' },
    low: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="max-w-7xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Data Profiling: {datasetName}</h2>
                <p className="text-sm text-muted-foreground">
                  Automatic quality analysis and insights • Last updated {profileData.lastProfiled}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Re-Profile
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>

            {/* Overall Quality Score */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="p-4 md:col-span-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="text-sm text-muted-foreground mb-2">Overall Data Quality</div>
                <div className="flex items-center gap-4">
                  <div className={`text-5xl font-bold ${getQualityColor(profileData.overallQuality)}`}>
                    {profileData.overallQuality}%
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${profileData.overallQuality}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {profileData.qualityBreakdown.excellent} excellent • {profileData.qualityBreakdown.good} good • {profileData.qualityBreakdown.warning} warnings • {profileData.qualityBreakdown.critical} critical
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Rows</div>
                <div className="text-2xl font-bold">{profileData.totalRows.toLocaleString()}</div>
              </Card>

              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Total Columns</div>
                <div className="text-2xl font-bold">{profileData.totalColumns}</div>
              </Card>

              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Memory Usage</div>
                <div className="text-2xl font-bold">{profileData.memoryUsage}</div>
              </Card>
            </div>
          </div>

          {/* Suggestions & Issues */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-lg">Smart Suggestions</h3>
              <Badge variant="outline">{profileData.suggestions.length} insights</Badge>
            </div>

            <div className="space-y-3">
              {profileData.suggestions.map((suggestion, index) => {
                const config = severityConfig[suggestion.severity as keyof typeof severityConfig];
                const Icon = config.icon;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{suggestion.title}</div>
                        <div className="text-sm text-muted-foreground">{suggestion.description}</div>
                      </div>
                      <Button size="sm" variant="outline">
                        {suggestion.action}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Column Statistics */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">Column Analysis</h3>
            </div>

            <div className="space-y-3">
              {profileData.columnStats.map((column, index) => {
                const qualityBadge = getQualityBadge(column.quality);

                return (
                  <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{column.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {column.type}
                          </Badge>
                          <Badge className={qualityBadge.color}>
                            {column.quality}% {qualityBadge.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {column.unique.toLocaleString()} unique values
                          {column.missing > 0 && ` • ${column.missing}% missing`}
                          {column.mean !== null && column.mean !== undefined && ` • Mean: ${column.mean}`}
                        </div>
                      </div>
                    </div>

                    {column.insights.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold mb-1 text-green-600">✓ Insights:</div>
                        <div className="flex flex-wrap gap-1">
                          {column.insights.map((insight, i) => (
                            <span key={i} className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                              {insight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {column.issues.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold mb-1 text-red-600">⚠ Issues:</div>
                        <div className="flex flex-wrap gap-1">
                          {column.issues.map((issue, i) => (
                            <span key={i} className="text-xs bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Correlations */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-lg">Feature Correlations</h3>
            </div>

            <div className="space-y-3">
              {profileData.correlations.map((corr, index) => (
                <div key={index} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {corr.col1} ↔ {corr.col2}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {corr.strength} correlation
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            Math.abs(corr.correlation) > 0.7
                              ? 'bg-green-500'
                              : Math.abs(corr.correlation) > 0.4
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`}
                          style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                        />
                      </div>
                      <span className="font-semibold w-12 text-right">{corr.correlation.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button className="flex-1" onClick={onClose}>
              Start Model Training
            </Button>
            <Button variant="outline" className="flex-1">
              Clean Data Issues
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
