/**
 * MODEL EVALUATION DASHBOARD - REAL-TIME API INTEGRATION
 * Production-ready dashboard with live backend data
 */

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend, Area, AreaChart
} from 'recharts';
import {
  Target, TrendingUp, Download, AlertTriangle, CheckCircle2,
  Info, DollarSign, Sparkles, AlertCircle, FileText, Database,
  Loader2, XCircle, RefreshCw
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";
import type { CompleteEvaluationResponse } from '@/services/evaluation/types';

interface ModelEvaluationDashboardProps {
  data: CompleteEvaluationResponse;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  loading?: boolean;
  modelId: string;
  modelName?: string;
  onRefresh?: () => void;
  onChangeModel?: () => void;
}

export function ModelEvaluationDashboard({
  data,
  threshold,
  onThresholdChange,
  loading = false,
  modelId,
  modelName,
  onRefresh,
  onChangeModel,
}: ModelEvaluationDashboardProps) {
  
  // Extract data from API response
  const { thresholdEvaluation, businessImpact, productionReadiness } = data;

  // Handle null response from backend (endpoint returns 200 but with null data)
  if (!thresholdEvaluation || !businessImpact) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-2xl border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Backend Returns Empty Evaluation</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  The API endpoint accepted the request (200 OK) but returned null for all evaluation fields.
                  This suggests the backend evaluation logic is not implemented yet.
                </p>
                <div className="text-xs text-muted-foreground bg-muted p-4 rounded-lg mt-4 text-left">
                  <div className="font-semibold mb-2">API Response:</div>
                  <pre className="overflow-auto">{JSON.stringify(data, null, 2)}</pre>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg max-w-md">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <div className="font-semibold mb-2">💡 Backend TODO:</div>
                  <ol className="list-decimal list-inside space-y-1 text-left">
                    <li>Implement evaluation calculation logic in the backend</li>
                    <li>Return populated thresholdEvaluation object</li>
                    <li>Return populated businessImpact object</li>
                    <li>Return populated productionReadiness object</li>
                  </ol>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { confusionMatrix, metrics, rates } = thresholdEvaluation;
  const { costs, revenue, financial } = businessImpact;

  // Format metrics for display
  const displayMetrics = useMemo(() => ({
    accuracy: (metrics.accuracy * 100).toFixed(1),
    precision: (metrics.precision * 100).toFixed(1),
    recall: (metrics.recall * 100).toFixed(1),
    f1: (metrics.f1Score * 100).toFixed(1),
    fpr: (rates.falsePositiveRate * 100).toFixed(1),
    fnr: (rates.falseNegativeRate * 100).toFixed(1),
    aucRoc: (metrics.aucRoc * 100).toFixed(1),
  }), [metrics, rates]);

  // Class imbalance detection
  const classBalance = useMemo(() => {
    const { tn, fp, fn, tp } = confusionMatrix;
    const negatives = tn + fp;
    const positives = fn + tp;
    const total = negatives + positives;

    const negativePercent = (negatives / total) * 100;
    const positivePercent = (positives / total) * 100;
    const imbalanceRatio = negatives / positives;

    return {
      negativePercent: negativePercent.toFixed(1),
      positivePercent: positivePercent.toFixed(1),
      imbalanceRatio: imbalanceRatio.toFixed(1),
      isImbalanced: imbalanceRatio > 3 || imbalanceRatio < 0.33,
    };
  }, [confusionMatrix]);

  // Confusion matrix display data
  const confusionData = [
    { predicted: 'Negative', actual: 'Negative', value: confusionMatrix.tn, label: 'TN', color: '#10b981' },
    { predicted: 'Positive', actual: 'Negative', value: confusionMatrix.fp, label: 'FP', color: '#ef4444' },
    { predicted: 'Negative', actual: 'Positive', value: confusionMatrix.fn, label: 'FN', color: '#f59e0b' },
    { predicted: 'Positive', actual: 'Positive', value: confusionMatrix.tp, label: 'TP', color: '#3b82f6' },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Model Evaluation</h1>
            <p className="text-muted-foreground mt-2">
              Real-time performance analysis • Model: {modelId}
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Executive Summary (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Database className="h-4 w-4 mr-2" />
                  Metrics (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Technical Report (PDF)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Class Imbalance Warning */}
        {classBalance.isImbalanced && (
          <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Class Imbalance Detected:</strong> {classBalance.negativePercent}% negative vs {classBalance.positivePercent}% positive
              (ratio: {classBalance.imbalanceRatio}:1). Focus on Precision and Recall over Accuracy.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="business">Business Impact</TabsTrigger>
            <TabsTrigger value="curves">Curves & Threshold</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Analysis</TabsTrigger>
            <TabsTrigger value="production">Production Readiness</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Classification performance at current threshold</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Accuracy</span>
                        <span className="text-lg font-bold">{displayMetrics.accuracy}%</span>
                      </div>
                      <Progress value={parseFloat(displayMetrics.accuracy)} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Precision</span>
                        <span className="text-lg font-bold">{displayMetrics.precision}%</span>
                      </div>
                      <Progress value={parseFloat(displayMetrics.precision)} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Recall</span>
                        <span className="text-lg font-bold">{displayMetrics.recall}%</span>
                      </div>
                      <Progress value={parseFloat(displayMetrics.recall)} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">F1 Score</span>
                        <span className="text-lg font-bold">{displayMetrics.f1}%</span>
                      </div>
                      <Progress value={parseFloat(displayMetrics.f1)} className="h-2" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <span className="text-sm font-medium">AUC-ROC</span>
                    <span className="text-2xl font-bold text-blue-600">{displayMetrics.aucRoc}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Confusion Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle>Confusion Matrix</CardTitle>
                  <CardDescription>Classification outcomes at threshold {threshold.toFixed(2)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-4 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{confusionMatrix.tn.toLocaleString()}</div>
                      <div className="text-xs text-green-700 dark:text-green-300 mt-1">True Negative</div>
                    </div>
                    <div className="text-center p-4 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <div className="text-3xl font-bold text-red-600">{confusionMatrix.fp.toLocaleString()}</div>
                      <div className="text-xs text-red-700 dark:text-red-300 mt-1">False Positive</div>
                    </div>
                    <div className="text-center p-4 border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      <div className="text-3xl font-bold text-amber-600">{confusionMatrix.fn.toLocaleString()}</div>
                      <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">False Negative</div>
                    </div>
                    <div className="text-center p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{confusionMatrix.tp.toLocaleString()}</div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">True Positive</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Total Samples: {confusionMatrix.total.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Threshold Control */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Interactive Threshold Control
                </CardTitle>
                <CardDescription>Adjust the classification threshold to optimize for your use case</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Threshold:</span>
                    <Badge variant="outline" className="text-lg px-3 py-1">{threshold.toFixed(2)}</Badge>
                  </div>

                  {/* Threshold Presets */}
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                      variant={Math.abs(threshold - 0.40) < 0.01 ? "default" : "outline"}
                      size="sm"
                      onClick={() => onThresholdChange(0.40)}
                      className="text-xs"
                      disabled={loading}
                    >
                      Conservative (0.40)
                    </Button>
                    <Button
                      variant={Math.abs(threshold - 0.50) < 0.01 ? "default" : "outline"}
                      size="sm"
                      onClick={() => onThresholdChange(0.50)}
                      className="text-xs"
                      disabled={loading}
                    >
                      Balanced (0.50)
                    </Button>
                    <Button
                      variant={Math.abs(threshold - 0.55) < 0.01 ? "default" : "outline"}
                      size="sm"
                      onClick={() => onThresholdChange(0.55)}
                      className="text-xs"
                      disabled={loading}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Recommended (0.55)
                    </Button>
                    <Button
                      variant={Math.abs(threshold - 0.60) < 0.01 ? "default" : "outline"}
                      size="sm"
                      onClick={() => onThresholdChange(0.60)}
                      className="text-xs"
                      disabled={loading}
                    >
                      Aggressive (0.60)
                    </Button>
                  </div>

                  <div className="relative">
                    <Slider
                      value={[threshold]}
                      onValueChange={([value]) => onThresholdChange(value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                      disabled={loading}
                    />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.0 (Minimize FN)</span>
                    <span>0.5 (Balanced)</span>
                    <span>1.0 (Minimize FP)</span>
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/30">
                    <div className="text-xs text-muted-foreground mb-1">False Positive Rate</div>
                    <div className="text-2xl font-bold text-blue-600">{displayMetrics.fpr}%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg bg-purple-50 dark:bg-purple-950/30">
                    <div className="text-xs text-muted-foreground mb-1">False Negative Rate</div>
                    <div className="text-2xl font-bold text-purple-600">{displayMetrics.fnr}%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg bg-green-50 dark:bg-green-950/30">
                    <div className="text-xs text-muted-foreground mb-1">Precision</div>
                    <div className="text-2xl font-bold text-green-600">{displayMetrics.precision}%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <div className="text-xs text-muted-foreground mb-1">Recall</div>
                    <div className="text-2xl font-bold text-amber-600">{displayMetrics.recall}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BUSINESS IMPACT TAB */}
          <TabsContent value="business" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ${revenue.truePositiveRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {confusionMatrix.tp.toLocaleString()} true positives
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    ${costs.totalCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    FP: ${costs.falsePositiveCost.toLocaleString()} • FN: ${costs.falseNegativeCost.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Net Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ${financial.profit.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {financial.improvementVsBaseline >= 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          +{financial.improvementVsBaseline.toFixed(1)}% vs baseline
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-600 font-medium">
                          {financial.improvementVsBaseline.toFixed(1)}% vs baseline
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Breakdown</CardTitle>
                <CardDescription>
                  Detailed cost and revenue analysis
                  {businessImpact.financial.atVolume && (
                    <> • Projected at {businessImpact.financial.atVolume.toLocaleString()} volume</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Unit Cost/Revenue</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">True Positives (Revenue)</TableCell>
                      <TableCell>
                        {businessImpact.scaledCounts 
                          ? businessImpact.scaledCounts.truePositives.toLocaleString() 
                          : confusionMatrix.tp.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${businessImpact.revenue.revenuePerTruePositive?.toLocaleString() || '1,000'}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        +${revenue.truePositiveRevenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">False Positives (Cost)</TableCell>
                      <TableCell>
                        {businessImpact.scaledCounts 
                          ? businessImpact.scaledCounts.falsePositives.toLocaleString() 
                          : confusionMatrix.fp.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${businessImpact.costs.costPerFalsePositive?.toLocaleString() || '500'}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">
                        -${costs.falsePositiveCost.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">False Negatives (Cost)</TableCell>
                      <TableCell>
                        {businessImpact.scaledCounts 
                          ? businessImpact.scaledCounts.falseNegatives.toLocaleString() 
                          : confusionMatrix.fn.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${businessImpact.costs.costPerFalseNegative?.toLocaleString() || '2,000'}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">
                        -${costs.falseNegativeCost.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold">Net Profit</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right text-xl font-bold text-green-600">
                        ${financial.profit.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                {businessImpact.financial.approvalRate !== undefined && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">Approval Rate</div>
                    <div className="text-lg font-bold">{(businessImpact.financial.approvalRate * 100).toFixed(1)}%</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CURVES & THRESHOLD TAB */}
          <TabsContent value="curves" className="space-y-6">
            {/* Optimal Threshold Recommendation */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Optimal Threshold Recommendation
                </CardTitle>
                <CardDescription>Threshold that maximizes business profit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Current Threshold</div>
                    <div className="text-2xl font-bold">{threshold.toFixed(2)}</div>
                    <div className="text-sm text-green-600 mt-1">
                      Profit: ${financial.profit.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                    <div className="text-sm text-muted-foreground mb-1">
                      Optimal Threshold
                    </div>
                    <div className="text-2xl font-bold">
                      {data.optimalThreshold ? data.optimalThreshold.optimalThreshold.toFixed(2) : threshold.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Expected Profit: ${data.optimalThreshold ? data.optimalThreshold.optimalProfit.toLocaleString() : financial.profit.toLocaleString()}
                    </div>
                  </div>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommendation:</strong> {data.optimalThreshold ? data.optimalThreshold.recommendation : `Adjust threshold from ${threshold.toFixed(2)} to 0.55 for optimal profit. _NA`}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* ROC and PR Curves */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    ROC Curve
                    {!data.curves?.rocCurve && <Badge variant="outline" className="ml-2">_NA</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Receiver Operating Characteristic • AUC: {data.curves?.rocCurve?.auc 
                      ? (data.curves.rocCurve.auc * 100).toFixed(1) 
                      : displayMetrics.aucRoc}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.curves?.rocCurve ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={data.curves.rocCurve.fpr.map((fpr, i) => ({
                          fpr: fpr,
                          tpr: data.curves!.rocCurve.tpr[i],
                          threshold: data.curves!.rocCurve.thresholds[i],
                        }))}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="fpr" 
                          label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }}
                          domain={[0, 1]}
                        />
                        <YAxis 
                          label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
                          domain={[0, 1]}
                        />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background border rounded-lg p-3 shadow-lg">
                                  <p className="text-sm font-semibold">ROC Point</p>
                                  <p className="text-xs">FPR: {payload[0].payload.fpr.toFixed(3)}</p>
                                  <p className="text-xs">TPR: {payload[0].payload.tpr.toFixed(3)}</p>
                                  {payload[0].payload.threshold !== null && (
                                    <p className="text-xs">Threshold: {payload[0].payload.threshold.toFixed(2)}</p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="tpr" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                        {/* Diagonal reference line (random classifier) */}
                        <Line 
                          type="monotone" 
                          data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]} 
                          dataKey="tpr"
                          stroke="#94a3b8" 
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">ROC Curve data not available</p>
                        <Badge variant="outline" className="mt-2">No Data</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Precision-Recall Curve
                    {!data.curves?.prCurve && <Badge variant="outline" className="ml-2">_NA</Badge>}
                  </CardTitle>
                  <CardDescription>
                    PR Curve • AP Score: {data.curves?.prCurve?.ap 
                      ? (data.curves.prCurve.ap * 100).toFixed(1) 
                      : displayMetrics.f1}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.curves?.prCurve ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={data.curves.prCurve.recall.map((recall, i) => ({
                          recall: recall,
                          precision: data.curves!.prCurve.precision[i],
                          threshold: i < data.curves!.prCurve.thresholds.length 
                            ? data.curves!.prCurve.thresholds[i] 
                            : null,
                        }))}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="recall" 
                          label={{ value: 'Recall', position: 'insideBottom', offset: -5 }}
                          domain={[0, 1]}
                        />
                        <YAxis 
                          label={{ value: 'Precision', angle: -90, position: 'insideLeft' }}
                          domain={[0, 1]}
                        />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background border rounded-lg p-3 shadow-lg">
                                  <p className="text-sm font-semibold">PR Point</p>
                                  <p className="text-xs">Recall: {payload[0].payload.recall.toFixed(3)}</p>
                                  <p className="text-xs">Precision: {payload[0].payload.precision.toFixed(3)}</p>
                                  {payload[0].payload.threshold !== null && (
                                    <p className="text-xs">Threshold: {payload[0].payload.threshold.toFixed(2)}</p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="precision" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Precision-Recall Curve data not available</p>
                        <Badge variant="outline" className="mt-2">No Data</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Threshold Impact Table */}
            <Card>
              <CardHeader>
                <CardTitle>Threshold Impact Analysis</CardTitle>
                <CardDescription>How different thresholds affect model performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Precision</TableHead>
                      <TableHead>Recall</TableHead>
                      <TableHead>F1 Score</TableHead>
                      <TableHead className="text-right">Expected Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[0.40, 0.45, 0.50, 0.55, 0.60].map((t) => {
                      // Use current threshold's data if it matches, otherwise show placeholder
                      const isCurrent = Math.abs(t - threshold) < 0.01;
                      
                      return (
                        <TableRow key={t} className={isCurrent ? 'bg-blue-50 dark:bg-blue-950/30' : ''}>
                          <TableCell className="font-medium">
                            {t.toFixed(2)}
                            {isCurrent && <Badge variant="outline" className="ml-2">Current</Badge>}
                          </TableCell>
                          <TableCell>
                            {isCurrent ? `${(metrics.precision * 100).toFixed(1)}%` : '—'}
                          </TableCell>
                          <TableCell>
                            {isCurrent ? `${(metrics.recall * 100).toFixed(1)}%` : '—'}
                          </TableCell>
                          <TableCell>
                            {isCurrent ? `${(metrics.f1Score * 100).toFixed(1)}%` : '—'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {isCurrent ? `$${financial.profit.toLocaleString()}` : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="mt-4 text-sm text-muted-foreground">
                  💡 Tip: Adjust the threshold slider above to see how metrics change at different decision boundaries.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADVANCED ANALYSIS TAB */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Learning Curve */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Curve Analysis
                </CardTitle>
                <CardDescription>Training vs validation performance • Overfitting detection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.learningCurve ? (
                  <>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Training Accuracy</div>
                        <div className="text-2xl font-bold">{(data.learningCurve.trainAccuracy * 100).toFixed(1)}%</div>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Test Accuracy</div>
                        <div className="text-2xl font-bold">{(data.learningCurve.testAccuracy * 100).toFixed(1)}%</div>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Overfitting Gap</div>
                        <div className="text-2xl font-bold">{(data.learningCurve.overfittingRatio * 100).toFixed(1)}%</div>
                        <Badge variant={data.learningCurve.overfittingRatio < 0.05 ? 'default' : 'destructive'} className="mt-1">
                          {data.learningCurve.status}
                        </Badge>
                      </div>
                    </div>
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Status:</strong> {data.learningCurve.status === 'acceptable' 
                          ? 'Model shows good generalization with minimal overfitting.' 
                          : 'Warning: Model may be overfitting to training data.'}
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Learning curve data not available</p>
                      <Badge variant="outline" className="mt-2">_NA</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feature Importance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Feature Importance
                </CardTitle>
                <CardDescription>Top features driving model predictions</CardDescription>
              </CardHeader>
              <CardContent>
                {data.featureImportance && data.featureImportance.features.length > 0 ? (
                  <div className="space-y-3">
                    {data.featureImportance.features.slice(0, 5).map((feature, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{feature.name}</span>
                          <span className="text-muted-foreground">{feature.importancePercent.toFixed(1)}%</span>
                        </div>
                        <Progress value={feature.importancePercent} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          Correlation: {feature.correlationWithTarget.toFixed(3)} • {feature.correlationStrength}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Feature importance not available</p>
                      <Badge variant="outline" className="mt-2">No Data</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feature Correlations */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Interactions</CardTitle>
                <CardDescription>Top feature interactions and correlations</CardDescription>
              </CardHeader>
              <CardContent>
                {data.featureImportance && data.featureImportance.interactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature 1</TableHead>
                        <TableHead>Feature 2</TableHead>
                        <TableHead>Interaction</TableHead>
                        <TableHead>Direction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.featureImportance.interactions.slice(0, 5).map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.feature1}</TableCell>
                          <TableCell>{item.feature2}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={item.interactionStrength * 100} className="h-2 w-20" />
                              <span className="text-sm">{item.interactionStrength.toFixed(2)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.interactionDirection === 'positive' ? 'default' : 'secondary'}>
                              {item.interactionDirection}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Feature interactions not available</p>
                      <Badge variant="outline" className="mt-2">No Data</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTION READINESS TAB */}
          <TabsContent value="production" className="space-y-6">
            {/* Overall Status */}
            <Card className={
              productionReadiness.overallStatus === 'READY' ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950/30' :
              productionReadiness.overallStatus === 'WARNING' ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30' :
              'border-2 border-red-500 bg-red-50 dark:bg-red-950/30'
            }>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {productionReadiness.overallStatus === 'READY' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                  {productionReadiness.overallStatus === 'WARNING' && <AlertTriangle className="h-6 w-6 text-amber-600" />}
                  {productionReadiness.overallStatus === 'NOT_READY' && <XCircle className="h-6 w-6 text-red-600" />}
                  Production Readiness: {productionReadiness.overallStatus}
                </CardTitle>
                <CardDescription>
                  {productionReadiness.summary.passed} of {productionReadiness.summary.totalCriteria} criteria passed
                  ({productionReadiness.summary.passPercentage.toFixed(0)}%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={productionReadiness.summary.passPercentage} className="h-3" />
              </CardContent>
            </Card>

            {/* Criteria Checklist - Grouped by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Readiness Criteria</CardTitle>
                <CardDescription>Detailed production deployment checklist</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Group criteria by category
                  const grouped = productionReadiness.criteria.reduce((acc, criterion) => {
                    const category = criterion.category || 'Other';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(criterion);
                    return acc;
                  }, {} as Record<string, typeof productionReadiness.criteria>);

                  return (
                    <div className="space-y-6">
                      {Object.entries(grouped).map(([category, criteria]) => (
                        <div key={category} className="space-y-3">
                          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            {category}
                          </h3>
                          <div className="space-y-2">
                            {criteria.map((criterion, index) => (
                              <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-lg border ${
                                  criterion.passed
                                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                                }`}
                              >
                                {criterion.passed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium">{criterion.name}</div>
                                  <div className="text-sm text-muted-foreground mt-1">{criterion.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

export default ModelEvaluationDashboard;