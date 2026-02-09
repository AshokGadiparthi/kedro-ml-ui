/**
 * Quality Tab Component
 * Displays dataset quality metrics from /api/datasets/{id}/quality
 */

import { useState, useEffect } from 'react';
import { datasetService } from '@/services';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle, AlertTriangle, TrendingUp, Database } from 'lucide-react';

interface QualityTabProps {
  datasetId: string;
}

export function QualityTab({ datasetId }: QualityTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<any>(null);

  useEffect(() => {
    fetchQuality();
  }, [datasetId]);

  const fetchQuality = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await datasetService.getDatasetQuality(datasetId);
      setQuality(data);
    } catch (err: any) {
      console.error('Failed to fetch quality:', err);
      setError(err.message || 'Failed to load quality metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!quality) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No quality information available
      </div>
    );
  }

  // Helper to get score color and icon
  const getScoreColor = (score: number) => {
    if (score >= 90) return { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
    if (score >= 70) return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle };
    return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const overallScore = quality.overallScore ?? quality.overall_quality_score ?? 0;
  const completeness = quality.completenessScore ?? quality.completeness ?? 0;
  const uniqueness = quality.uniquenessScore ?? quality.uniqueness ?? 0;
  const consistency = quality.consistencyScore ?? quality.consistency ?? 0;

  return (
    <div className="space-y-4">
      {/* Overall Quality Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Overall Quality Score</h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-3xl font-bold text-green-600">{overallScore.toFixed(1)}%</span>
          </div>
        </div>
        <Progress value={overallScore} className="h-3" />
      </Card>

      {/* Quality Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completeness */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Completeness</h4>
            <CheckCircle className={`h-5 w-5 ${getScoreColor(completeness).color}`} />
          </div>
          <div className="text-2xl font-bold mb-2">{completeness.toFixed(1)}%</div>
          <Progress value={completeness} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Percentage of non-missing values
          </p>
        </Card>

        {/* Uniqueness */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Uniqueness</h4>
            <CheckCircle className={`h-5 w-5 ${getScoreColor(uniqueness).color}`} />
          </div>
          <div className="text-2xl font-bold mb-2">{uniqueness.toFixed(1)}%</div>
          <Progress value={uniqueness} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Percentage of unique records
          </p>
        </Card>

        {/* Consistency */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Consistency</h4>
            <CheckCircle className={`h-5 w-5 ${getScoreColor(consistency).color}`} />
          </div>
          <div className="text-2xl font-bold mb-2">{consistency.toFixed(1)}%</div>
          <Progress value={consistency} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Data consistency score
          </p>
        </Card>
      </div>

      {/* Statistics Summary */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Dataset Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Rows</div>
            <div className="text-xl font-bold">{quality.totalRows?.toLocaleString() || quality.total_rows?.toLocaleString() || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Columns</div>
            <div className="text-xl font-bold">{quality.columnCount || quality.total_columns || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Duplicate Rows</div>
            <div className="text-xl font-bold">{quality.duplicateRows || quality.duplicate_rows || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Missing %</div>
            <div className="text-xl font-bold">{(quality.missingPct ?? quality.missing_percentage ?? 0).toFixed(1)}%</div>
          </div>
        </div>
      </Card>

      {/* Column Quality Details */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Column Quality ({quality.columnQuality?.length || quality.column_quality?.length || 0})</h3>
        <div className="space-y-2">
          {(quality.columnQuality || quality.column_quality || []).map((column: any, index: number) => {
            const missingPct = column.missingPct ?? column.missing_percentage ?? 0;
            const uniqueCount = column.uniqueValues ?? column.unique_count ?? 0;
            const hasMissing = missingPct > 0;
            const columnName = column.column || column.name;
            const dataType = column.dataType || column.data_type;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{columnName}</div>
                    <div className="text-sm text-muted-foreground">{dataType}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {uniqueCount.toLocaleString()} unique
                  </div>
                  
                  {hasMissing ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {missingPct.toFixed(1)}% missing
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Complete
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quality Insights */}
      {(quality.duplicateRows ?? quality.duplicate_rows ?? 0) > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Duplicate Rows Detected</h4>
              <p className="text-sm text-yellow-800">
                Found {quality.duplicateRows || quality.duplicate_rows} duplicate rows. 
                Consider removing duplicates to improve data quality.
              </p>
            </div>
          </div>
        </Card>
      )}

      {(quality.missingPct ?? quality.missing_percentage ?? 0) > 5 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Missing Values Detected</h4>
              <p className="text-sm text-yellow-800">
                {(quality.missingPct ?? quality.missing_percentage ?? 0).toFixed(1)}% of values are missing. 
                Consider data imputation or handling missing values.
              </p>
            </div>
          </div>
        </Card>
      )}

      {overallScore === 100 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Excellent Data Quality</h4>
              <p className="text-sm text-green-800">
                Your dataset has perfect quality scores with no missing values or duplicates!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
