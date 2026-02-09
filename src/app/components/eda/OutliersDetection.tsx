/**
 * OUTLIERS DETECTION COMPONENT
 * Endpoint: GET /api/eda/analysis/outliers/{edaId}
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle, Info, Loader2, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { edaApi, type OutliersResponse } from '@/services/edaApi';
import { toast } from 'sonner';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface OutliersDetectionProps {
  edaId: string | null;
}

export function OutliersDetection({ edaId }: OutliersDetectionProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OutliersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<'IQR' | 'ZSCORE'>('IQR');

  useEffect(() => {
    if (edaId) {
      fetchOutliers();
    }
  }, [edaId, method]);

  const fetchOutliers = async () => {
    if (!edaId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await edaApi.getOutliers(edaId, method);
      console.log('✅ Outliers Response:', response);
      setData(response);
    } catch (err: any) {
      console.error('❌ Outliers Error:', err);
      setError(err.message || 'Failed to load outliers data');
      toast.error('Failed to load outliers data');
    } finally {
      setLoading(false);
    }
  };

  const getOutlierColor = (percentage: number): string => {
    if (percentage === 0) return 'bg-green-50 border-green-200';
    if (percentage < 5) return 'bg-blue-50 border-blue-200';
    if (percentage < 10) return 'bg-yellow-50 border-yellow-200';
    if (percentage < 20) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getOutlierTextColor = (percentage: number): string => {
    if (percentage === 0) return 'text-green-600';
    if (percentage < 5) return 'text-blue-600';
    if (percentage < 10) return 'text-yellow-600';
    if (percentage < 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBarColor = (percentage: number): string => {
    if (percentage === 0) return '#10b981';
    if (percentage < 5) return '#3b82f6';
    if (percentage < 10) return '#f59e0b';
    if (percentage < 20) return '#f97316';
    return '#ef4444';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No outliers data available. Run analysis first.
        </AlertDescription>
      </Alert>
    );
  }

  const features = Object.entries(data.results.features).sort(
    ([, a], [, b]) => b.outlier_percentage - a.outlier_percentage
  );

  const chartData = features.map(([name, stats]) => ({
    name: name.length > 20 ? name.substring(0, 20) + '...' : name,
    fullName: name,
    percentage: stats.outlier_percentage,
    count: stats.outlier_count,
  }));

  const totalOutliers = features.reduce((sum, [, stats]) => sum + stats.outlier_count, 0);
  const featuresWithOutliers = features.filter(([, stats]) => stats.outlier_count > 0).length;

  return (
    <div className="space-y-6">
      {/* Header with Method Selection */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Outlier Detection
              </CardTitle>
              <CardDescription>
                Identify data points that deviate significantly from the norm
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Method:</label>
              <Select value={method} onValueChange={(val) => setMethod(val as 'IQR' | 'ZSCORE')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IQR">IQR Method</SelectItem>
                  <SelectItem value="ZSCORE">Z-Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="text-sm text-muted-foreground mb-1">Total Features</div>
              <div className="text-2xl font-bold">{features.length}</div>
            </div>
            <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
              <div className="text-sm text-muted-foreground mb-1">Features with Outliers</div>
              <div className="text-2xl font-bold text-orange-600">{featuresWithOutliers}</div>
            </div>
            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="text-sm text-muted-foreground mb-1">Total Outliers</div>
              <div className="text-2xl font-bold text-red-600">{totalOutliers.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>{method === 'IQR' ? 'IQR Method' : 'Z-Score Method'}:</strong>{' '}
          {method === 'IQR' 
            ? 'Detects outliers using Interquartile Range (values below Q1-1.5×IQR or above Q3+1.5×IQR)'
            : 'Detects outliers using Z-Score (values with |z| > 3 standard deviations from mean)'}
        </AlertDescription>
      </Alert>

      {/* Chart */}
      {features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Outlier Percentage by Feature</CardTitle>
            <CardDescription>
              Percentage of outliers detected in each numeric feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(300, features.length * 40)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'auto']} />
                <YAxis type="category" dataKey="name" width={110} />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold mb-1">{data.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            Outliers: {data.count} ({data.percentage.toFixed(2)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed List */}
      <Card>
        <CardHeader>
          <CardTitle>Outlier Details by Feature</CardTitle>
          <CardDescription>
            Detailed statistics for each feature with bounds and outlier counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {features.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No numeric features found for outlier detection
            </div>
          ) : (
            <div className="space-y-3">
              {features.map(([featureName, stats]) => (
                <div 
                  key={featureName} 
                  className={`p-4 border-2 rounded-lg ${getOutlierColor(stats.outlier_percentage)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold">{featureName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.outlier_count > 0 
                          ? `${stats.outlier_count.toLocaleString()} outlier${stats.outlier_count !== 1 ? 's' : ''} detected`
                          : 'No outliers detected'}
                      </p>
                    </div>
                    <Badge 
                      variant={stats.outlier_percentage === 0 ? 'default' : stats.outlier_percentage < 5 ? 'secondary' : 'destructive'}
                    >
                      {stats.outlier_percentage.toFixed(2)}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-background/50 rounded border">
                      <div className="text-xs text-muted-foreground">Lower Bound</div>
                      <div className="font-mono font-semibold">{stats.lower_bound.toFixed(4)}</div>
                    </div>
                    <div className="p-2 bg-background/50 rounded border">
                      <div className="text-xs text-muted-foreground">Upper Bound</div>
                      <div className="font-mono font-semibold">{stats.upper_bound.toFixed(4)}</div>
                    </div>
                  </div>

                  {stats.outlier_count > 0 && (
                    <>
                      {/* Progress Bar */}
                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stats.outlier_percentage === 0 ? 'bg-green-500' : stats.outlier_percentage < 5 ? 'bg-blue-500' : stats.outlier_percentage < 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(stats.outlier_percentage, 100)}%` }}
                        />
                      </div>

                      {/* Warning for high outlier percentage */}
                      {stats.outlier_percentage >= 10 && (
                        <Alert className="mt-3 py-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            High outlier percentage detected. Consider investigating this feature.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Severity Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>0% - Clean</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>&lt;5% - Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>&lt;10% - Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>&lt;20% - High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>≥20% - Critical</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center">
        Analysis ID: {data.edaId} • Method: {data.method} • Generated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
