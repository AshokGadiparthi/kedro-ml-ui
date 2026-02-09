/**
 * HISTOGRAM COMPONENT WITH REAL API
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { edaApi, type HistogramResponse } from '../../services/edaApi';
import { Loader2 } from 'lucide-react';

interface RealHistogramChartProps {
  edaId: string;
  featureName: string;
}

export function RealHistogramChart({ edaId, featureName }: RealHistogramChartProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistogram = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: HistogramResponse = await edaApi.getHistogram(edaId, featureName);
        
        // Transform response.results[featureName].bins to chart data
        const featureData = response.results[featureName];
        if (featureData && featureData.bins) {
          const chartData = Object.entries(featureData.bins).map(([range, count]) => ({
            bin: range,
            value: count,
          }));
          setData({ chartData, stats: featureData });
        }
      } catch (err: any) {
        console.error('Failed to fetch histogram:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistogram();
  }, [edaId, featureName]);

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4 border-destructive">
        <CardContent className="p-4 text-destructive text-sm">
          Failed to load histogram: {error}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Distribution
          {data.stats && (
            <span className="text-xs text-muted-foreground font-normal">
              {data.stats.distribution}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data.chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="bin" 
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--primary))" 
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Stats Display */}
        {data.stats && (
          <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
            <div>
              <div className="text-muted-foreground">Mean</div>
              <div className="font-semibold">{data.stats.mean.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Median</div>
              <div className="font-semibold">{data.stats.median.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Std Dev</div>
              <div className="font-semibold">{data.stats.std.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Count</div>
              <div className="font-semibold">{data.stats.count}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * CATEGORICAL COMPONENT WITH REAL API
 */

import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { type CategoricalResponse } from '../../services/edaApi';

interface RealCategoricalChartProps {
  edaId: string;
  featureName: string;
  topN?: number;
}

export function RealCategoricalChart({ edaId, featureName, topN = 10 }: RealCategoricalChartProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorical = async () => {
      setLoading(true);
      setError(null);
      try {
        const response: CategoricalResponse = await edaApi.getCategorical(edaId, featureName, topN);
        
        const featureData = response.results[featureName];
        if (featureData && featureData.top_values) {
          const chartData = Object.entries(featureData.top_values).map(([value, count]) => ({
            value,
            count,
            percentage: (count as number) / featureData.unique_values * 100,
          }));
          setData({ chartData, stats: featureData });
        }
      } catch (err: any) {
        console.error('Failed to fetch categorical:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorical();
  }, [edaId, featureName, topN]);

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4 border-destructive">
        <CardContent className="p-4 text-destructive text-sm">
          Failed to load categorical distribution: {error}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Value Distribution
          {data.stats && (
            <Badge variant="outline">{data.stats.unique_values} unique</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.chartData.map((item: any, index: number) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="font-medium truncate">{item.value}</span>
                <span className="text-muted-foreground">{item.count} ({item.percentage.toFixed(1)}%)</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200} className="mt-4">
          <BarChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="value" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
            <YAxis tick={{ fontSize: 11 }} />
            <RechartsTooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {data.stats && (
          <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-muted/30 rounded-lg text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Mode</div>
              <div className="font-semibold">{data.stats.mode}</div>
              <div className="text-xs text-muted-foreground">{data.stats.mode_frequency} occurrences</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Entropy</div>
              <div className="font-semibold">{data.stats.entropy.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Balance: {(data.stats.balance_ratio * 100).toFixed(0)}%</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
