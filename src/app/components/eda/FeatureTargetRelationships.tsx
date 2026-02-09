/**
 * FEATURE-TARGET RELATIONSHIPS - CRITICAL FEATURE #3
 * Standalone component for visualizing feature-target relationships
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart3, Sparkles } from 'lucide-react';

export function FeatureTargetRelationships() {
  const featureRelationships = [
    { name: 'annual_income', approved_mean: 78500, rejected_mean: 42300, correlation: 0.78 },
    { name: 'credit_score', approved_mean: 715, rejected_mean: 625, correlation: 0.62 },
    { name: 'loan_amount', approved_mean: 165000, rejected_mean: 225000, correlation: 0.51 },
    { name: 'employment_years', approved_mean: 9.2, rejected_mean: 6.8, correlation: 0.42 },
  ];

  return (
    <Card className="border-2 border-indigo-200 dark:border-indigo-900 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Feature-Target Relationships
        </CardTitle>
        <CardDescription>
          How each feature relates to the target variable (approved vs rejected)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {featureRelationships.map((feat, idx) => {
            const approvedHigher = feat.approved_mean > feat.rejected_mean;
            const percentDiff = approvedHigher 
              ? ((feat.approved_mean / feat.rejected_mean - 1) * 100)
              : ((feat.rejected_mean / feat.approved_mean - 1) * 100);
            
            return (
              <div 
                key={idx} 
                className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg border border-indigo-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">{feat.name}</span>
                  <Badge variant="secondary" className="text-xs">r={feat.correlation.toFixed(2)}</Badge>
                </div>
                
                {/* Bar comparison */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-green-700 dark:text-green-400 font-medium">✓ Approved</span>
                      <span className="font-semibold">{feat.approved_mean.toLocaleString()}</span>
                    </div>
                    <div className="h-6 bg-green-600 rounded shadow-sm" style={{ width: '100%' }}></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-red-700 dark:text-red-400 font-medium">✗ Rejected</span>
                      <span className="font-semibold">{feat.rejected_mean.toLocaleString()}</span>
                    </div>
                    <div 
                      className="h-6 bg-red-600 rounded shadow-sm" 
                      style={{ 
                        width: approvedHigher 
                          ? `${(feat.rejected_mean / feat.approved_mean) * 100}%` 
                          : '100%'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-center p-2 bg-white/50 dark:bg-slate-900/50 rounded">
                  <span className={approvedHigher ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                    {approvedHigher ? '✓ Approved' : '✗ Rejected'} has <strong>{percentDiff.toFixed(0)}%</strong> higher {feat.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold mb-1 text-emerald-900 dark:text-emerald-100">🎯 Key Insight</div>
              <div className="text-sm text-muted-foreground">
                Approved applications have significantly higher <strong>annual_income</strong> (+85.5%) and <strong>credit_score</strong> (+14.4%).
                These are your strongest predictive features with correlations of 0.78 and 0.62 respectively.
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
            <div className="text-xs text-muted-foreground mb-1">Most Predictive</div>
            <div className="font-bold text-lg text-blue-600">annual_income</div>
            <div className="text-xs text-muted-foreground">r=0.78, 85.5% difference</div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
            <div className="text-xs text-muted-foreground mb-1">Negative Indicator</div>
            <div className="font-bold text-lg text-purple-600">loan_amount</div>
            <div className="text-xs text-muted-foreground">Higher in rejected (-26.7%)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
