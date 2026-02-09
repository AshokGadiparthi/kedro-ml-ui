/**
 * EDA UI IMPROVEMENTS
 * Add these sections to ExploratoryDataAnalysisReal.tsx
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AlertTriangle, Download, FileText } from 'lucide-react';
import { Button } from './ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ScatterChart, Scatter, Cell,
} from 'recharts';

// ============================================================================
// 1. MISSING DATA VISUALIZATION
// ============================================================================

interface MissingDataTabProps {
  features: any;
  summary: any;
}

export function MissingDataTab({ features, summary }: MissingDataTabProps) {
  if (!features || !features.analysis) return null;

  const featuresWithMissing = features.analysis.statistics
    .filter((f: any) => (f.missingCount || f.missingValues || 0) > 0)
    .map((f: any) => ({
      name: f.name,
      missingCount: f.missingCount || f.missingValues || 0,
      missingPercentage: f.missingPercentage || 0,
      total: summary?.rowCount || 1000,
    }))
    .sort((a: any, b: any) => b.missingPercentage - a.missingPercentage);

  const totalMissing = featuresWithMissing.reduce((sum: number, f: any) => sum + f.missingCount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Missing Data Summary
          </CardTitle>
          <CardDescription>
            Analysis of missing values across all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Missing Values</div>
              <div className="text-2xl font-bold">{totalMissing.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Features Affected</div>
              <div className="text-2xl font-bold">{featuresWithMissing.length} / {features.analysis.statistics.length}</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Overall Completeness</div>
              <div className="text-2xl font-bold">{(100 - (totalMissing / (summary?.rowCount * features.analysis.statistics.length) * 100)).toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Chart */}
      {featuresWithMissing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing Data by Feature</CardTitle>
            <CardDescription>Features sorted by missing percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={featuresWithMissing} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Missing']}
                />
                <Bar dataKey="missingPercentage" radius={[0, 4, 4, 0]}>
                  {featuresWithMissing.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.missingPercentage > 50 ? '#ef4444' :
                        entry.missingPercentage > 20 ? '#f59e0b' :
                        '#3b82f6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Missing Data Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Missing Data Report</CardTitle>
        </CardHeader>
        <CardContent>
          {featuresWithMissing.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">✨</div>
              <div className="text-lg font-medium">No Missing Data!</div>
              <div className="text-sm">All features have complete data</div>
            </div>
          ) : (
            <div className="space-y-3">
              {featuresWithMissing.map((feature: any) => (
                <div key={feature.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{feature.name}</div>
                    <Badge variant={
                      feature.missingPercentage > 50 ? 'destructive' :
                      feature.missingPercentage > 20 ? 'default' :
                      'secondary'
                    }>
                      {feature.missingPercentage.toFixed(1)}% missing
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Missing: {feature.missingCount.toLocaleString()}</span>
                      <span>Present: {(feature.total - feature.missingCount).toLocaleString()}</span>
                    </div>
                    <Progress value={100 - feature.missingPercentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// 2. EXPORT BUTTON COMPONENT
// ============================================================================

interface ExportButtonProps {
  edaId: string;
  disabled?: boolean;
}

export function ExportButton({ edaId, disabled }: ExportButtonProps) {
  const handleExportPDF = async () => {
    try {
      const response = await fetch(`http://192.168.1.147:8080/api/eda/export/${edaId}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eda-report-${edaId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportCSV = () => {
    // Export statistics as CSV
    const csv = 'Feature,Type,Mean,StdDev,Min,Max,Missing\n';
    // Add CSV generation logic
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eda-stats-${edaId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportPDF} disabled={disabled} variant="outline" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button onClick={handleExportCSV} disabled={disabled} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
}

// ============================================================================
// 3. SCATTER PLOT COMPONENT
// ============================================================================

interface ScatterPlotProps {
  edaId: string;
  feature1: string;
  feature2: string;
}

export function ScatterPlotCard({ edaId, feature1, feature2 }: ScatterPlotProps) {
  // In production, fetch from: GET /api/eda/scatter/{edaId}?feature1=x&feature2=y
  const mockData = Array.from({ length: 100 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {feature1} vs {feature2}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="x"
              name={feature1}
              tick={{ fontSize: 11 }}
              label={{ value: feature1, position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              dataKey="y"
              name={feature2}
              tick={{ fontSize: 11 }}
              label={{ value: feature2, angle: -90, position: 'insideLeft' }}
            />
            <RechartsTooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Scatter data={mockData} fill="hsl(var(--primary))" opacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 4. OUTLIER DETECTION CARD
// ============================================================================

interface OutlierCardProps {
  feature: any;
}

export function OutlierCard({ feature }: OutlierCardProps) {
  if (feature.dataType !== 'NUMERIC') return null;

  // Calculate IQR-based outliers (mock calculation)
  const q1 = feature.min || 0;
  const q3 = feature.max || 100;
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outlierCount = Math.floor(Math.random() * 10); // Mock - replace with real data

  return (
    <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
          Outlier Detection (IQR Method)
        </div>
        {outlierCount > 0 && (
          <Badge variant="destructive">{outlierCount} outliers</Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">Lower Bound</div>
          <div className="font-semibold">{lowerBound.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Upper Bound</div>
          <div className="font-semibold">{upperBound.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. CATEGORICAL VALUE DISTRIBUTION
// ============================================================================

interface CategoricalDistributionProps {
  feature: any;
  edaId: string;
}

export function CategoricalDistribution({ feature, edaId }: CategoricalDistributionProps) {
  if (feature.dataType !== 'CATEGORICAL') return null;

  // Mock data - replace with API call to GET /api/eda/categorical/{edaId}/{featureName}
  const mockValues = [
    { value: 'Category A', count: 450, percentage: 45 },
    { value: 'Category B', count: 300, percentage: 30 },
    { value: 'Category C', count: 150, percentage: 15 },
    { value: 'Category D', count: 100, percentage: 10 },
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Value Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockValues.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="font-medium">{item.value}</span>
                <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200} className="mt-4">
          <BarChart data={mockValues}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="value" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <RechartsTooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
