/**
 * CORRELATION MATRIX COMPONENT
 * Endpoint: GET /api/eda/analysis/correlation/{edaId}
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { AlertCircle, Info, Loader2, TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import { edaApi, type CorrelationResponse } from '@/services/edaApi';
import { toast } from 'sonner';

interface CorrelationMatrixProps {
  edaId: string | null;
}

export function CorrelationMatrix({ edaId }: CorrelationMatrixProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CorrelationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (edaId) {
      fetchCorrelation();
    }
  }, [edaId]);

  const fetchCorrelation = async () => {
    if (!edaId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await edaApi.getCorrelation(edaId, threshold);
      console.log('✅ Correlation Response:', response);
      setData(response);
    } catch (err: any) {
      console.error('❌ Correlation Error:', err);
      setError(err.message || 'Failed to load correlation data');
      toast.error('Failed to load correlation data');
    } finally {
      setLoading(false);
    }
  };

  const getCorrelationColor = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 0.8) return value > 0 ? 'bg-green-600' : 'bg-red-600';
    if (abs >= 0.6) return value > 0 ? 'bg-green-400' : 'bg-red-400';
    if (abs >= 0.4) return value > 0 ? 'bg-green-200' : 'bg-red-200';
    if (abs >= 0.2) return value > 0 ? 'bg-green-100' : 'bg-red-100';
    return 'bg-gray-100';
  };

  const getCorrelationTextColor = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 0.6) return 'text-white';
    return 'text-gray-900';
  };

  const getCorrelationIntensity = (value: number): number => {
    return Math.abs(value) * 100;
  };

  const getCorrelationLabel = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 0.8) return value > 0 ? 'Strong Positive' : 'Strong Negative';
    if (abs >= 0.6) return value > 0 ? 'Moderate Positive' : 'Moderate Negative';
    if (abs >= 0.4) return value > 0 ? 'Weak Positive' : 'Weak Negative';
    if (abs >= 0.2) return value > 0 ? 'Very Weak Positive' : 'Very Weak Negative';
    return 'No Correlation';
  };

  const getCorrelationIcon = (value: number) => {
    if (Math.abs(value) < 0.2) return <Minus className="h-4 w-4" />;
    return value > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
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
          No correlation data available. Run analysis first.
        </AlertDescription>
      </Alert>
    );
  }

  const features = Object.keys(data.results.correlation_matrix);
  const filteredStrongCorrelations = data.results.strong_correlations.filter(
    corr => 
      corr.feature1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      corr.feature2.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Correlation Analysis
          </CardTitle>
          <CardDescription>
            Measure linear relationships between numeric features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="text-sm text-muted-foreground mb-1">Features Analyzed</div>
              <div className="text-2xl font-bold">{features.length}</div>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
              <div className="text-sm text-muted-foreground mb-1">Strong Correlations</div>
              <div className="text-2xl font-bold text-purple-600">
                {data.results.total_strong_correlations}
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <div className="text-sm text-muted-foreground mb-1">Threshold</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.results.strong_threshold.toFixed(2)}
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-indigo-50 border-indigo-200">
              <div className="text-sm text-muted-foreground mb-1">Total Pairs</div>
              <div className="text-2xl font-bold text-indigo-600">
                {(features.length * (features.length - 1) / 2).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Correlation values range from -1 (perfect negative) to +1 (perfect positive). 
          Values closer to 0 indicate weak or no linear relationship.
        </AlertDescription>
      </Alert>

      {/* Strong Correlations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Strong Correlations (|r| ≥ {data.results.strong_threshold})</CardTitle>
              <CardDescription>
                Feature pairs with significant linear relationships
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-4 py-1">
              {filteredStrongCorrelations.length} found
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          {data.results.strong_correlations.length > 5 && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {filteredStrongCorrelations.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
              <Info className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium text-muted-foreground">
                {searchQuery ? 'No matching correlations found' : 'No strong correlations detected'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery 
                  ? 'Try a different search term' 
                  : `All feature correlations are below the ${data.results.strong_threshold} threshold`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStrongCorrelations.map((corr, index) => {
                const absValue = Math.abs(corr.correlation);
                const isPositive = corr.correlation > 0;
                
                return (
                  <div 
                    key={index}
                    className={`p-4 border-2 rounded-lg ${
                      absValue >= 0.8 
                        ? isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        : isPositive ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCorrelationIcon(corr.correlation)}
                        <div>
                          <div className="font-semibold">
                            {corr.feature1} ↔ {corr.feature2}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getCorrelationLabel(corr.correlation)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`text-2xl font-bold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {corr.correlation.toFixed(3)}
                        </div>
                        <Badge variant={absValue >= 0.8 ? 'default' : 'secondary'}>
                          {(absValue * 100).toFixed(1)}% strength
                        </Badge>
                      </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          isPositive 
                            ? absValue >= 0.8 ? 'bg-green-600' : 'bg-green-400'
                            : absValue >= 0.8 ? 'bg-red-600' : 'bg-red-400'
                        }`}
                        style={{ width: `${getCorrelationIntensity(corr.correlation)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Correlation Matrix Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Correlation Matrix Heatmap</CardTitle>
          <CardDescription>
            Complete correlation matrix for all feature pairs ({features.length}x{features.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {features.length > 20 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Matrix too large to display ({features.length}x{features.length}). 
                Showing strong correlations above instead.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border bg-muted/50"></th>
                      {features.map((feature) => (
                        <th 
                          key={feature} 
                          className="p-2 border text-xs font-medium bg-muted/50"
                          style={{ 
                            minWidth: '60px',
                            maxWidth: '100px',
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed'
                          }}
                        >
                          <div className="truncate" title={feature}>
                            {feature.length > 15 ? feature.substring(0, 15) + '...' : feature}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature1) => (
                      <tr key={feature1}>
                        <td 
                          className="p-2 border text-xs font-medium bg-muted/50 sticky left-0"
                          style={{ maxWidth: '150px' }}
                        >
                          <div className="truncate" title={feature1}>
                            {feature1}
                          </div>
                        </td>
                        {features.map((feature2) => {
                          const value = data.results.correlation_matrix[feature1]?.[feature2] ?? 0;
                          const isDiagonal = feature1 === feature2;
                          
                          return (
                            <td
                              key={feature2}
                              className={`p-2 border text-center text-xs font-mono ${getCorrelationColor(value)} ${getCorrelationTextColor(value)}`}
                              title={`${feature1} vs ${feature2}: ${value.toFixed(3)}`}
                            >
                              {isDiagonal ? '1.00' : value.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Color Scale Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium mb-2">Positive Correlations</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>0.8-1.0 Strong</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span>0.6-0.8 Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 rounded"></div>
                  <span>0.4-0.6 Weak</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>0.2-0.4 Very Weak</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-2">Negative Correlations</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>-0.8 to -1.0 Strong</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded"></div>
                  <span>-0.6 to -0.8 Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span>-0.4 to -0.6 Weak</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 rounded"></div>
                  <span>-0.2 to -0.4 Very Weak</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 bg-gray-100 rounded border"></div>
              <span>-0.2 to 0.2 No Correlation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center">
        Analysis ID: {data.edaId} • Threshold: {data.threshold} • Generated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
