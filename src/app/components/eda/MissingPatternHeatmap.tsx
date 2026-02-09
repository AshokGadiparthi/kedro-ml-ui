/**
 * MISSING PATTERN HEATMAP COMPONENT
 * Endpoint: GET /api/eda/analysis/missing-pattern/{edaId}
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Info, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { edaApi, type MissingPatternResponse } from '@/services/edaApi';
import { toast } from 'sonner';

interface MissingPatternHeatmapProps {
  edaId: string | null;
}

export function MissingPatternHeatmap({ edaId }: MissingPatternHeatmapProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MissingPatternResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (edaId) {
      fetchMissingPattern();
    }
  }, [edaId]);

  const fetchMissingPattern = async () => {
    if (!edaId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await edaApi.getMissingPattern(edaId);
      console.log('✅ Missing Pattern Response:', response);
      setData(response);
    } catch (err: any) {
      console.error('❌ Missing Pattern Error:', err);
      setError(err.message || 'Failed to load missing pattern data');
      toast.error('Failed to load missing pattern data');
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (rating: string): string => {
    switch (rating.toUpperCase()) {
      case 'EXCELLENT': return 'text-green-600';
      case 'GOOD': return 'text-blue-600';
      case 'FAIR': return 'text-yellow-600';
      case 'POOR': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityBadge = (rating: string) => {
    switch (rating.toUpperCase()) {
      case 'EXCELLENT': return 'default';
      case 'GOOD': return 'secondary';
      case 'FAIR': return 'outline';
      case 'POOR': return 'destructive';
      default: return 'outline';
    }
  };

  const getQualityIcon = (rating: string) => {
    switch (rating.toUpperCase()) {
      case 'EXCELLENT': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'GOOD': return <Info className="h-5 w-5 text-blue-600" />;
      case 'FAIR': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'POOR': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMissingColor = (percentage: number): string => {
    if (percentage === 0) return 'bg-green-100 border-green-200';
    if (percentage < 5) return 'bg-blue-100 border-blue-200';
    if (percentage < 20) return 'bg-yellow-100 border-yellow-200';
    if (percentage < 50) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  const getMissingIntensity = (percentage: number): string => {
    if (percentage === 0) return 'bg-green-500';
    if (percentage < 5) return 'bg-blue-400';
    if (percentage < 20) return 'bg-yellow-400';
    if (percentage < 50) return 'bg-orange-500';
    return 'bg-red-600';
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
          No missing pattern data available. Run analysis first.
        </AlertDescription>
      </Alert>
    );
  }

  const { results } = data;
  const missingColumns = Object.entries(results.missing_per_column).sort(
    ([, a], [, b]) => b.percentage - a.percentage
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Missing Data Pattern Analysis
                {getQualityIcon(results.quality_rating)}
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of missing values across the dataset
              </CardDescription>
            </div>
            <Badge variant={getQualityBadge(results.quality_rating)} className="text-lg px-4 py-1">
              {results.quality_rating}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="text-sm text-muted-foreground mb-1">Total Rows</div>
              <div className="text-2xl font-bold">{results.total_rows.toLocaleString()}</div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="text-sm text-muted-foreground mb-1">Total Columns</div>
              <div className="text-2xl font-bold">{results.total_columns}</div>
            </div>
            <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
              <div className="text-sm text-muted-foreground mb-1">Missing Values</div>
              <div className="text-2xl font-bold text-amber-600">
                {results.total_missing.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {results.total_missing_percentage.toFixed(2)}% of total
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
              <div className="text-sm text-muted-foreground mb-1">Rows with Missing</div>
              <div className="text-2xl font-bold text-orange-600">
                {results.rows_with_missing.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {((results.rows_with_missing / results.total_rows) * 100).toFixed(2)}% of rows
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Completeness</CardTitle>
          <CardDescription>
            Overall percentage of non-missing values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress 
                value={100 - results.total_missing_percentage} 
                className="h-6"
              />
            </div>
            <div className={`text-3xl font-bold ${getQualityColor(results.quality_rating)}`}>
              {(100 - results.total_missing_percentage).toFixed(2)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Pattern Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Missing Values by Column</CardTitle>
          <CardDescription>
            Heatmap visualization of missing data patterns ({missingColumns.length} columns)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {missingColumns.length === 0 ? (
            <div className="flex items-center justify-center py-8 border-2 border-dashed rounded-lg bg-green-50">
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-2" />
                <p className="font-semibold text-green-700">Perfect! No Missing Data</p>
                <p className="text-sm text-muted-foreground">All columns have complete data</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {missingColumns.map(([columnName, stats]) => (
                <div 
                  key={columnName} 
                  className={`p-4 border-2 rounded-lg ${getMissingColor(stats.percentage)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{columnName}</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.count.toLocaleString()} missing values
                      </p>
                    </div>
                    <Badge 
                      variant={stats.percentage === 0 ? 'default' : stats.percentage < 5 ? 'secondary' : 'destructive'}
                      className="ml-2"
                    >
                      {stats.percentage.toFixed(2)}%
                    </Badge>
                  </div>
                  
                  {/* Visual Bar */}
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getMissingIntensity(stats.percentage)} transition-all duration-500`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Color Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>0% - Perfect</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span>&lt;5% - Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>&lt;20% - Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>&lt;50% - Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>≥50% - Poor</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center">
        Analysis ID: {data.edaId} • Generated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
