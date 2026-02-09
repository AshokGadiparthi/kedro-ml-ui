/**
 * ENHANCED OVERVIEW TAB
 * Replace the existing overview tab with this improved version
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Database, Layers, CheckCircle2, AlertCircle, TrendingUp, 
  Activity, BarChart3, FileText, Calendar, Target 
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

interface EnhancedOverviewProps {
  summary: any;
  quality: any;
  features: any;
  insights: any;
}

export function EnhancedOverview({ summary, quality, features, insights }: EnhancedOverviewProps) {
  if (!summary) return null;

  // Quality breakdown for pie chart
  const qualityData = quality ? [
    { name: 'Completeness', value: quality.metrics.completeness, color: '#10b981' },
    { name: 'Uniqueness', value: quality.metrics.uniqueness, color: '#3b82f6' },
    { name: 'Consistency', value: quality.metrics.consistency, color: '#f59e0b' },
    { name: 'Validity', value: quality.metrics.validity, color: '#8b5cf6' },
  ] : [];

  // Feature type breakdown
  const featureTypeData = features ? [
    { name: 'Numeric', value: features.analysis.numericFeatures, color: '#3b82f6' },
    { name: 'Categorical', value: features.analysis.categoricalFeatures, color: '#10b981' },
    { name: 'DateTime', value: features.analysis.dateTimeFeatures, color: '#f59e0b' },
  ].filter(d => d.value > 0) : [];

  // Issue severity breakdown
  const issuesData = insights ? [
    { severity: 'Critical', count: insights.criticalCount, color: '#ef4444' },
    { severity: 'High', count: insights.highCount, color: '#f59e0b' },
    { severity: 'Medium', count: insights.mediumCount, color: '#3b82f6' },
    { severity: 'Low', count: insights.lowCount, color: '#10b981' },
  ].filter(d => d.count > 0) : [];

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dataset Size */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Database className="h-8 w-8 text-blue-500" />
              <Badge variant="outline" className="text-xs">Dataset</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {summary.rowCount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Rows</div>
            <div className="text-xs text-muted-foreground mt-2">
              {summary.columnCount} columns
            </div>
          </CardContent>
        </Card>

        {/* Quality Score */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                {summary.assessment}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {summary.qualityScore}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Quality Score</div>
            <Progress value={summary.qualityScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* Missing Data */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <Badge variant="outline" className="text-xs">Data Quality</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {summary.missingPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Missing Data</div>
            <div className="text-xs text-muted-foreground mt-2">
              {summary.duplicateRowsCount} duplicates
            </div>
          </CardContent>
        </Card>

        {/* Issues */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8 text-red-500" />
              <Badge variant="destructive" className="text-xs">
                {summary.criticalIssues + summary.highIssues}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {summary.criticalIssues + summary.highIssues + summary.mediumIssues + summary.lowIssues}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Issues</div>
            <div className="text-xs text-muted-foreground mt-2">
              {summary.criticalIssues} critical
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Dimensions Radar Chart */}
        {quality && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quality Dimensions</CardTitle>
              <CardDescription>Multi-dimensional quality assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={qualityData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Radar 
                    name="Quality" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.6} 
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Feature Types */}
        {features && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Types</CardTitle>
              <CardDescription>Distribution of column data types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={featureTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {featureTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Issues Breakdown */}
        {insights && issuesData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Issues by Severity</CardTitle>
              <CardDescription>Data quality concerns breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={issuesData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="severity" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {issuesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Concern */}
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-900 dark:text-red-100 mb-1">Top Concern</div>
                  <div className="text-sm text-red-800 dark:text-red-200">{summary.topConcern}</div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Recommendation</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">{summary.recommendation}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analysis Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Analysis ID</div>
              <div className="font-mono text-xs truncate" title={summary.edaId}>
                {summary.edaId.substring(0, 12)}...
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Dataset ID</div>
              <div className="font-mono text-xs truncate" title={summary.datasetId}>
                {summary.datasetId.substring(0, 12)}...
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Analyzed At</div>
              <div className="font-medium text-xs">
                {new Date(summary.timestamp).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Status</div>
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
