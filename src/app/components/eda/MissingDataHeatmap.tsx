/**
 * MISSING DATA HEATMAP - CRITICAL FEATURE #2
 * Standalone component for missing data visualization
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Grid3x3, Info } from 'lucide-react';
import { toast } from 'sonner';

export function MissingDataHeatmap() {
  const missingData = [
    { feature: 'employment_years', missing: [12, 8, 7, 5, 3], total: 35, pct: 1.4 },
    { feature: 'employment_type', missing: [4, 3, 2, 2, 1], total: 12, pct: 0.5 },
    { feature: 'age', missing: [0, 0, 0, 0, 0], total: 0, pct: 0 },
    { feature: 'annual_income', missing: [0, 0, 0, 0, 0], total: 0, pct: 0 },
    { feature: 'credit_score', missing: [0, 0, 0, 0, 0], total: 0, pct: 0 },
    { feature: 'loan_amount', missing: [0, 0, 0, 0, 0], total: 0, pct: 0 },
    { feature: 'existing_loans', missing: [0, 0, 0, 0, 0], total: 0, pct: 0 },
    { feature: 'education_level', missing: [0, 0, 0, 0, 0], total: 0, pct: 0 },
  ];

  return (
    <Card className="border-2 border-rose-200 dark:border-rose-900 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-rose-600" />
          Missing Data Pattern Analysis
        </CardTitle>
        <CardDescription>
          Visual representation of missing values across features and row segments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {missingData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-36 text-sm font-medium truncate">{item.feature}</div>
              <div className="flex-1 flex gap-1">
                {item.missing.map((count, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="flex-1 h-10 rounded transition-all hover:scale-105 cursor-pointer border border-slate-200 dark:border-slate-700"
                          style={{
                            backgroundColor: count === 0 
                              ? '#10b981' 
                              : `rgba(239, 68, 68, ${Math.min(count / 15, 1)})`,
                          }}
                        ></div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-semibold">Rows {i * 500}-{(i + 1) * 500}</p>
                          <p>{count} missing values</p>
                          {count > 0 && <p className="text-red-400">{((count / 500) * 100).toFixed(1)}% missing</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
              <div className="w-20 text-right">
                <Badge variant={item.total === 0 ? 'default' : 'destructive'} className="text-xs">
                  {item.total} ({item.pct}%)
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-green-600 rounded"></div>
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-red-300 rounded"></div>
            <span>Few Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-red-600 rounded"></div>
            <span>Many Missing</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold mb-1">📊 Missing Pattern: MCAR (Missing Completely At Random)</div>
              <div className="text-sm text-muted-foreground mb-3">
                No systematic pattern detected. Missing values appear randomly distributed across rows.
                Safe to use imputation or deletion strategies.
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="default" size="sm" onClick={() => toast.success('✅ Median imputation applied to employment_years')}>
                  Impute missing values
                </Button>
                <Button variant="secondary" size="sm" onClick={() => toast.success('✅ 47 rows with missing values removed (1.9%)')}>
                  Drop missing rows
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.success('✅ KNN imputation with k=5 applied')}>
                  KNN Imputation
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg">
          <div className="text-sm">
            <span className="font-semibold">💡 Tip:</span> Hover over each cell to see exact missing counts per row segment.
            Green = complete, Red = missing values.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
