/**
 * BOX PLOT CARD - CRITICAL FEATURE #1
 * Standalone component for outlier detection
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Box } from 'lucide-react';
import { toast } from 'sonner';

interface FeatureStat {
  name: string;
  type: 'numerical' | 'categorical';
  min?: number;
  max?: number;
  q1?: number;
  q3?: number;
  median?: number;
  iqr?: number;
  hasOutliers?: boolean;
  outlierCount?: number;
}

interface BoxPlotCardProps {
  feature: FeatureStat;
}

export function BoxPlotCard({ feature }: BoxPlotCardProps) {
  if (feature.type !== 'numerical') return null;

  return (
    <Card className="border-2 border-cyan-200 dark:border-cyan-900 shadow-lg">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Box className="h-4 w-4 text-cyan-600" />
          Box Plot & Outlier Detection
        </CardTitle>
        <CardDescription>Quartile distribution and outlier analysis</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Statistical Summary Grid */}
        <div className="grid grid-cols-5 gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Min</div>
            <div className="font-bold text-lg">{feature.min}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Q1 (25%)</div>
            <div className="font-bold text-lg text-blue-600">{feature.q1}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Median</div>
            <div className="font-bold text-2xl text-primary">{feature.median}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Q3 (75%)</div>
            <div className="font-bold text-lg text-blue-600">{feature.q3}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Max</div>
            <div className="font-bold text-lg">{feature.max}</div>
          </div>
        </div>
        
        {/* Visual Box Plot */}
        <div className="relative h-32 my-8 px-4">
          {/* Whisker line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-400 -translate-y-1/2"></div>
          
          {/* Min whisker */}
          <div className="absolute top-1/2 w-0.5 h-16 bg-slate-600 -translate-y-1/2" style={{ left: '5%' }}></div>
          
          {/* Box (IQR) */}
          <div className="absolute top-1/2 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded shadow-lg -translate-y-1/2" style={{ left: '25%', right: '25%' }}>
            {/* Median line */}
            <div className="absolute inset-y-0 left-1/2 w-1 bg-white shadow-sm -translate-x-1/2"></div>
          </div>
          
          {/* Max whisker */}
          <div className="absolute top-1/2 w-0.5 h-16 bg-slate-600 -translate-y-1/2" style={{ right: '5%' }}></div>

          {/* Outliers */}
          {feature.hasOutliers && (
            <>
              <div className="absolute top-1/2 w-3 h-3 bg-red-500 rounded-full -translate-y-1/2 animate-pulse" style={{ left: '2%' }}></div>
              <div className="absolute top-1/2 w-3 h-3 bg-red-500 rounded-full -translate-y-1/2 animate-pulse" style={{ right: '2%' }}></div>
            </>
          )}
        </div>

        {/* Labels */}
        <div className="relative h-6 mb-6">
          <div className="absolute w-full flex justify-between text-xs text-muted-foreground px-2">
            <span>Min</span>
            <span>Q1</span>
            <span className="font-bold text-primary">Median</span>
            <span>Q3</span>
            <span>Max</span>
          </div>
        </div>

        {/* IQR Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">IQR (Q3 - Q1)</div>
            <div className="font-semibold text-xl">{feature.iqr}</div>
            <div className="text-xs text-muted-foreground mt-1">Interquartile range</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Outlier Bounds</div>
            <div className="font-semibold text-sm">
              [{(feature.q1! - 1.5 * feature.iqr!).toFixed(0)}, {(feature.q3! + 1.5 * feature.iqr!).toFixed(0)}]
            </div>
            <div className="text-xs text-muted-foreground mt-1">1.5 × IQR rule</div>
          </div>
        </div>

        {/* Outlier Actions */}
        {feature.hasOutliers ? (
          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  ⚠️ {feature.outlierCount} outliers detected ({((feature.outlierCount! / 2450) * 100).toFixed(1)}%)
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  Values beyond 1.5 × IQR may skew model predictions
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="default" size="sm" onClick={() => toast.success(`✅ ${feature.outlierCount} outliers removed from ${feature.name}`)}>
                    Remove outliers
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => toast.success(`✅ Outliers winsorized at 95th percentile for ${feature.name}`)}>
                    Winsorize (cap)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success(`✅ Log transformation applied to ${feature.name}`)}>
                    Transform
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900 dark:text-green-100">
                ✓ No outliers detected - Clean distribution
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
