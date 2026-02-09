/**
 * QUALITY ASSESSMENT DETAIL COMPONENT
 * Endpoint: GET /api/eda/analysis/quality/{edaId}
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Info, 
  Loader2, TrendingUp, TrendingDown, Minus 
} from 'lucide-react';
import { edaApi, type QualityAssessmentResponse } from '@/services/edaApi';
import { toast } from 'sonner';

interface QualityAssessmentDetailProps {
  edaId: string | null;
}

export function QualityAssessmentDetail({ edaId }: QualityAssessmentDetailProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QualityAssessmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (edaId) {
      fetchQualityAssessment();
    }
  }, [edaId]);

  const fetchQualityAssessment = async () => {
    if (!edaId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await edaApi.getQualityAssessment(edaId);
      console.log('✅ Quality Assessment Response:', response);
      setData(response);
    } catch (err: any) {
      console.error('❌ Quality Assessment Error:', err);
      setError(err.message || 'Failed to load quality assessment');
      toast.error('Failed to load quality assessment');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 75) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'EXCELLENT':
      case 'HIGH':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'GOOD':
      case 'MEDIUM':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'FAIR':
      case 'LOW':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'POOR':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const levelUpper = level.toUpperCase();
    if (levelUpper === 'EXCELLENT' || levelUpper === 'HIGH') return 'default';
    if (levelUpper === 'GOOD' || levelUpper === 'MEDIUM') return 'secondary';
    if (levelUpper === 'FAIR' || levelUpper === 'LOW') return 'outline';
    return 'destructive';
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
          No quality assessment data available. Run analysis first.
        </AlertDescription>
      </Alert>
    );
  }

  const metrics = [
    { key: 'completeness', label: 'Completeness', ...data.metrics.completeness },
    { key: 'validity', label: 'Validity', ...data.metrics.validity },
    { key: 'uniqueness', label: 'Uniqueness', ...data.metrics.uniqueness },
    { key: 'consistency', label: 'Consistency', ...data.metrics.consistency },
    { key: 'timeliness', label: 'Timeliness', ...data.metrics.timeliness },
  ];

  // Add accuracy if available
  if (data.metrics.accuracy) {
    metrics.push({ key: 'accuracy', label: 'Accuracy', ...data.metrics.accuracy });
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className={`border-2 ${getScoreBgColor(data.quality_score)}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quality Assessment Score</span>
            <Badge variant={data.assessment === 'EXCELLENT' ? 'default' : 'outline'} className="text-lg px-4 py-1">
              {data.assessment}
            </Badge>
          </CardTitle>
          <CardDescription>
            Comprehensive data quality evaluation across multiple dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className={`text-7xl font-bold ${getScoreColor(data.quality_score)}`}>
              {data.quality_score.toFixed(1)}
            </div>
            <div className="flex-1">
              <Progress value={data.quality_score} className="h-4 mb-2" />
              <p className="text-sm text-muted-foreground">
                Overall quality score based on {metrics.length} quality dimensions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.key} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{metric.label}</CardTitle>
                {getLevelIcon(metric.level)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score.toFixed(1)}
                </span>
                <span className="text-muted-foreground">/100</span>
              </div>
              
              <Progress value={metric.score} className="h-2" />
              
              <div className="flex items-center justify-between">
                <Badge variant={getLevelBadge(metric.level)}>
                  {metric.level}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Quality Improvement Recommendations
            </CardTitle>
            <CardDescription>
              Action items to improve your data quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-sm flex-1">{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center">
        Analysis ID: {data.edaId} • Generated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
