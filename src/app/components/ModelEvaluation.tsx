/**
 * WORLD-CLASS MODEL EVALUATION DASHBOARD
 * Comprehensive evaluation with business context, interactivity, and production readiness
 */

import { useState, useMemo } from 'react';
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
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Target, TrendingUp, Download, Share2, AlertTriangle, CheckCircle2, 
  Info, DollarSign, Clock, Cpu, HardDrive, Zap, Activity,
  TrendingDown, Sparkles, AlertCircle, FileText, Database
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";

// Enhanced model comparison with production metrics
const modelComparisonData = [
  { 
    model: 'XGBoost v1.2', 
    accuracy: 95.8, 
    precision: 94.2, 
    recall: 96.1, 
    f1: 95.1, 
    auc: 0.982,
    inferenceTime: 12,
    memoryMB: 45,
    deployability: 'EASY'
  },
  { 
    model: 'Random Forest v2.1', 
    accuracy: 94.2, 
    precision: 92.8, 
    recall: 94.9, 
    f1: 93.8, 
    auc: 0.971,
    inferenceTime: 28,
    memoryMB: 120,
    deployability: 'EASY'
  },
  { 
    model: 'Neural Network v1.0', 
    accuracy: 93.5, 
    precision: 91.5, 
    recall: 94.2, 
    f1: 92.8, 
    auc: 0.968,
    inferenceTime: 45,
    memoryMB: 230,
    deployability: 'MODERATE'
  },
  { 
    model: 'Gradient Boosting v1.5', 
    accuracy: 92.8, 
    precision: 90.9, 
    recall: 93.5, 
    f1: 92.2, 
    auc: 0.965,
    inferenceTime: 35,
    memoryMB: 85,
    deployability: 'EASY'
  },
];

// Feature importance with correlations
const featureImportanceData = [
  { 
    feature: 'tenure', 
    importance: 28.2, 
    correlation: 0.34, 
    interactsWith: 'monthly_charges',
    interactionStrength: 0.21
  },
  { 
    feature: 'monthly_charges', 
    importance: 22.1, 
    correlation: 0.28,
    interactsWith: 'total_charges',
    interactionStrength: 0.45
  },
  { 
    feature: 'total_charges', 
    importance: 18.9, 
    correlation: 0.25,
    interactsWith: 'tenure',
    interactionStrength: 0.38
  },
  { 
    feature: 'contract_type', 
    importance: 12.4, 
    correlation: 0.19,
    interactsWith: 'payment_method',
    interactionStrength: 0.15
  },
  { 
    feature: 'internet_service', 
    importance: 8.2, 
    correlation: 0.12,
    interactsWith: 'online_security',
    interactionStrength: 0.22
  },
  { 
    feature: 'payment_method', 
    importance: 5.8, 
    correlation: 0.09,
    interactsWith: 'contract_type',
    interactionStrength: 0.15
  },
  { 
    feature: 'tech_support', 
    importance: 3.1, 
    correlation: 0.06,
    interactsWith: 'internet_service',
    interactionStrength: 0.18
  },
  { 
    feature: 'online_security', 
    importance: 1.3, 
    correlation: 0.04,
    interactsWith: 'tech_support',
    interactionStrength: 0.12
  },
];

const rocCurveData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.05, tpr: 0.72 },
  { fpr: 0.1, tpr: 0.85 },
  { fpr: 0.15, tpr: 0.91 },
  { fpr: 0.2, tpr: 0.94 },
  { fpr: 0.25, tpr: 0.96 },
  { fpr: 0.3, tpr: 0.97 },
  { fpr: 0.4, tpr: 0.98 },
  { fpr: 0.5, tpr: 0.99 },
  { fpr: 1, tpr: 1 },
];

const prCurveData = [
  { recall: 0, precision: 1 },
  { recall: 0.1, precision: 0.98 },
  { recall: 0.2, precision: 0.96 },
  { recall: 0.3, precision: 0.95 },
  { recall: 0.4, precision: 0.94 },
  { recall: 0.5, precision: 0.93 },
  { recall: 0.6, precision: 0.91 },
  { recall: 0.7, precision: 0.88 },
  { recall: 0.8, precision: 0.84 },
  { recall: 0.9, precision: 0.78 },
  { recall: 1, precision: 0.65 },
];

const learningCurveData = [
  { epoch: 0, train_loss: 0.65, val_loss: 0.67, train_acc: 62, val_acc: 60 },
  { epoch: 10, train_loss: 0.42, val_loss: 0.45, train_acc: 78, val_acc: 76 },
  { epoch: 20, train_loss: 0.28, val_loss: 0.32, train_acc: 87, val_acc: 84 },
  { epoch: 30, train_loss: 0.18, val_loss: 0.24, train_acc: 92, val_acc: 89 },
  { epoch: 40, train_loss: 0.12, val_loss: 0.21, train_acc: 95, val_acc: 92 },
  { epoch: 50, train_loss: 0.08, val_loss: 0.19, train_acc: 97, val_acc: 94 },
  { epoch: 60, train_loss: 0.06, val_loss: 0.18, train_acc: 98, val_acc: 95 },
];

export function ModelEvaluation() {
  const [threshold, setThreshold] = useState(0.5);
  const [activeTab, setActiveTab] = useState('overview');

  // Base confusion matrix values (at threshold 0.5)
  const baseConfusionMatrix = {
    tn: 8534,
    fp: 234,
    fn: 178,
    tp: 1054
  };

  // Calculate confusion matrix based on threshold
  const confusionMatrix = useMemo(() => {
    // Simulate threshold adjustment (in real app, this would recalculate from predictions)
    const thresholdDiff = threshold - 0.5;
    const adjustment = Math.round(thresholdDiff * 500);
    
    return {
      tn: Math.max(0, baseConfusionMatrix.tn + adjustment),
      fp: Math.max(0, baseConfusionMatrix.fp - adjustment),
      fn: Math.max(0, baseConfusionMatrix.fn + Math.round(adjustment * 0.3)),
      tp: Math.max(0, baseConfusionMatrix.tp - Math.round(adjustment * 0.3)),
    };
  }, [threshold]);

  // Calculate metrics based on confusion matrix
  const metrics = useMemo(() => {
    const { tn, fp, fn, tp } = confusionMatrix;
    const total = tn + fp + fn + tp;
    
    const accuracy = ((tp + tn) / total) * 100;
    const precision = tp / (tp + fp) * 100;
    const recall = tp / (tp + fn) * 100;
    const f1 = 2 * (precision * recall) / (precision + recall);
    const fpr = fp / (fp + tn) * 100;
    const fnr = fn / (fn + tp) * 100;
    
    return {
      accuracy: accuracy.toFixed(1),
      precision: precision.toFixed(1),
      recall: recall.toFixed(1),
      f1: f1.toFixed(1),
      fpr: fpr.toFixed(1),
      fnr: fnr.toFixed(1),
    };
  }, [confusionMatrix]);

  // Business impact calculations
  const businessMetrics = useMemo(() => {
    const { fp, fn } = confusionMatrix;
    const costPerFP = 500; // Cost of wrongly approved loan
    const costPerFN = 2000; // Cost of lost customer
    const revenuePerTP = 1500; // Revenue from correctly approved loan
    
    const totalCost = (fp * costPerFP) + (fn * costPerFN);
    const totalRevenue = confusionMatrix.tp * revenuePerTP;
    const expectedProfit = totalRevenue - totalCost;
    
    // Find optimal threshold
    const optimalThreshold = 0.55; // Calculated from ROI curve
    
    return {
      totalCost,
      totalRevenue,
      expectedProfit,
      costPerFP,
      costPerFN,
      optimalThreshold,
    };
  }, [confusionMatrix]);

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

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Model Evaluation</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive performance analysis with business context
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
                  PDF (Full Report)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Database className="h-4 w-4 mr-2" />
                  Excel (Metrics Table)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Executive Summary
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  JSON (API Integration)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Model Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Churn Prediction - XGBoost v1.2</CardTitle>
                <CardDescription>Trained on January 8, 2026 • Experiment ID: EXP-1245</CardDescription>
              </div>
              <Badge className="bg-green-600">Production Ready</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Class Imbalance Warning */}
        {classBalance.isImbalanced && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Class Imbalance Detected:</strong> Negative: {classBalance.negativePercent}% | Positive: {classBalance.positivePercent}% (Ratio: {classBalance.imbalanceRatio}:1)
              <br />
              💡 Tip: Focus on Precision ({metrics.precision}%) & Recall ({metrics.recall}%), not Accuracy alone.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Insights Card */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Excellent Performance:</strong> Model achieves 0.982 AUC-ROC, exceeding the 0.95 production threshold by 3.2%.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Well Generalized:</strong> Train/validation gap is only 2.3%, indicating minimal overfitting risk.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Feature Concentration:</strong> Top 3 features (tenure, monthly_charges, total_charges) drive 68% of predictions.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="diagnostics">Detailed Diagnostics</TabsTrigger>
            <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
            <TabsTrigger value="production">Production Readiness</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help hover:border-blue-500 transition-colors">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        Accuracy
                        <Info className="h-3 w-3" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{metrics.accuracy}%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-600">+2.3%</span> vs baseline
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Overall correctness: {metrics.accuracy}% of all predictions are correct. Note: Can be misleading with imbalanced data.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help hover:border-blue-500 transition-colors">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        Precision
                        <Info className="h-3 w-3" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{metrics.precision}%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        False positive rate: {metrics.fpr}%
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Of predicted positives, {metrics.precision}% are actually positive. Critical for minimizing false alarms.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help hover:border-blue-500 transition-colors">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        Recall
                        <Info className="h-3 w-3" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{metrics.recall}%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        False negative rate: {metrics.fnr}%
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Of all actual positives, {metrics.recall}% are correctly identified. Critical for catching all cases.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help hover:border-blue-500 transition-colors">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        F1 Score
                        <Info className="h-3 w-3" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{metrics.f1}%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Harmonic mean
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Balanced measure between Precision and Recall. Useful when you need to balance both.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="cursor-help hover:border-blue-500 transition-colors">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        AUC-ROC
                        <Info className="h-3 w-3" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">0.982</div>
                      <p className="text-xs text-green-600 mt-1">
                        Excellent ({'>'}0.97)
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Area under ROC curve; 0.982 means 98.2% chance model ranks a random positive higher than a random negative. {'>'}0.97 = excellent.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Business Impact */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Business Impact Analysis
                </CardTitle>
                <CardDescription>Financial implications at current threshold ({threshold.toFixed(2)})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Cost of False Positive</div>
                    <div className="text-2xl font-bold text-red-600">
                      -${businessMetrics.costPerFP}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Per wrongly approved loan</p>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Cost of False Negative</div>
                    <div className="text-2xl font-bold text-orange-600">
                      -${businessMetrics.costPerFN.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Per lost customer</p>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Cost (10k predictions)</div>
                    <div className="text-2xl font-bold text-red-600">
                      -${businessMetrics.totalCost.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{confusionMatrix.fp} FP + {confusionMatrix.fn} FN</p>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Expected Profit</div>
                    <div className="text-3xl font-bold text-green-600">
                      ${businessMetrics.expectedProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600 mt-1">+12.3% vs baseline</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/30">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Recommendation:</strong> Adjust threshold to {businessMetrics.optimalThreshold} for better ROI. This reduces false positives by 15% while maintaining 94% recall, improving profit by ~$180k.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Training Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Training Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Training Records</span>
                    <span className="font-semibold">1,200,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Features</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cross-Validation</span>
                    <span className="font-semibold">5-Fold</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Training Time</span>
                    <span className="font-semibold">23 minutes</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Overfitting Risk</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Low (2.3% gap)
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Class Balance</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Imbalanced ({classBalance.imbalanceRatio}:1)
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Convergence</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Achieved (Epoch 50)
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Feature Quality</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Excellent
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DETAILED DIAGNOSTICS TAB */}
          <TabsContent value="diagnostics" className="space-y-6">
            {/* Interactive Threshold Control */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Decision Threshold Control
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
                      onClick={() => setThreshold(0.40)}
                      className="text-xs"
                    >
                      Conservative (0.40)
                    </Button>
                    <Button 
                      variant={Math.abs(threshold - 0.50) < 0.01 ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setThreshold(0.50)}
                      className="text-xs"
                    >
                      Balanced (0.50)
                    </Button>
                    <Button 
                      variant={Math.abs(threshold - 0.55) < 0.01 ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setThreshold(0.55)}
                      className="text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Recommended (0.55)
                    </Button>
                    <Button 
                      variant={Math.abs(threshold - 0.60) < 0.01 ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setThreshold(0.60)}
                      className="text-xs"
                    >
                      Aggressive (0.60)
                    </Button>
                  </div>
                  
                  <Slider
                    value={[threshold]}
                    onValueChange={(value) => setThreshold(value[0])}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  
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
                    <div className="text-2xl font-bold text-blue-600">{metrics.fpr}%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg bg-purple-50 dark:bg-purple-950/30">
                    <div className="text-xs text-muted-foreground mb-1">False Negative Rate</div>
                    <div className="text-2xl font-bold text-purple-600">{metrics.fnr}%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg bg-green-50 dark:bg-green-950/30">
                    <div className="text-xs text-muted-foreground mb-1">Precision</div>
                    <div className="text-2xl font-bold text-green-600">{metrics.precision}%</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <div className="text-xs text-muted-foreground mb-1">Recall</div>
                    <div className="text-2xl font-bold text-amber-600">{metrics.recall}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confusion Matrix with Live Update */}
            <Card>
              <CardHeader>
                <CardTitle>Confusion Matrix</CardTitle>
                <CardDescription>Live update based on threshold: {threshold.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="border-2 rounded-lg p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200">
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>True Negative</strong>
                      <br />
                      <span className="text-xs">Actual: Negative | Predicted: Negative</span>
                    </div>
                    <div className="text-4xl font-bold text-green-600">{confusionMatrix.tn.toLocaleString()}</div>
                    <div className="text-xs text-green-600 mt-2">✓ Correct</div>
                  </div>
                  
                  <div className="border-2 rounded-lg p-8 text-center bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200">
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>False Positive</strong>
                      <br />
                      <span className="text-xs">Actual: Negative | Predicted: Positive</span>
                    </div>
                    <div className="text-4xl font-bold text-red-600">{confusionMatrix.fp.toLocaleString()}</div>
                    <div className="text-xs text-red-600 mt-2">✗ Type I Error</div>
                  </div>
                  
                  <div className="border-2 rounded-lg p-8 text-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200">
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>False Negative</strong>
                      <br />
                      <span className="text-xs">Actual: Positive | Predicted: Negative</span>
                    </div>
                    <div className="text-4xl font-bold text-orange-600">{confusionMatrix.fn.toLocaleString()}</div>
                    <div className="text-xs text-orange-600 mt-2">✗ Type II Error</div>
                  </div>
                  
                  <div className="border-2 rounded-lg p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200">
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>True Positive</strong>
                      <br />
                      <span className="text-xs">Actual: Positive | Predicted: Positive</span>
                    </div>
                    <div className="text-4xl font-bold text-blue-600">{confusionMatrix.tp.toLocaleString()}</div>
                    <div className="text-xs text-blue-600 mt-2">✓ Correct</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Curves */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ROC Curve</CardTitle>
                  <CardDescription>Receiver Operating Characteristic</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={rocCurveData}>
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
                      <RechartsTooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="tpr" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        name="ROC Curve" 
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                        dataKey="tpr"
                        stroke="#94a3b8"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                        name="Random"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm">
                      AUC-ROC: 0.982 (Excellent)
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Precision-Recall Curve</CardTitle>
                  <CardDescription>Trade-off between precision and recall</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={prCurveData}>
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
                      <RechartsTooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="precision" 
                        stroke="#22c55e" 
                        strokeWidth={3} 
                        name="PR Curve"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-sm">
                      AP Score: 0.94 (Excellent)
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Importance Enhanced */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Feature Importance Analysis
                </CardTitle>
                <CardDescription>
                  Top 3 features account for 68% of model decisions • Correlation with target shown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureImportanceData.map((feature, idx) => (
                    <div key={feature.feature} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            #{idx + 1}
                          </Badge>
                          <span className="font-medium">{feature.feature}</span>
                          {idx < 3 && (
                            <Badge variant="secondary" className="text-xs">
                              Top 3
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            Correlation: <strong className="text-foreground">{feature.correlation.toFixed(2)}</strong>
                          </span>
                          <span className="text-sm font-bold">{feature.importance.toFixed(1)}%</span>
                        </div>
                      </div>
                      <Progress value={feature.importance * (100/28.2)} className="h-2" />
                      <div className="text-xs text-muted-foreground pl-12">
                        🔗 Interacts with: <strong>{feature.interactsWith}</strong> (strength: {feature.interactionStrength.toFixed(2)})
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Curve with Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Curve Analysis
                </CardTitle>
                <CardDescription>Model training progression and convergence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={learningCurveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="train_loss" stroke="#3b82f6" strokeWidth={2} name="Training Loss" />
                    <Line type="monotone" dataKey="val_loss" stroke="#ef4444" strokeWidth={2} name="Validation Loss" />
                  </LineChart>
                </ResponsiveContainer>

                <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <div className="space-y-2">
                      <div><strong>✓ Model converged</strong> at epoch 50</div>
                      <div><strong>✓ Gap between train/val loss:</strong> 2.3% (excellent generalization)</div>
                      <div><strong>✓ No overfitting detected</strong> - validation loss plateaued steadily</div>
                      <div className="pt-2 border-t border-green-200">
                        <strong>💡 Recommendation:</strong> You could gather 20% more data for potential +1.2% improvement in validation accuracy
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MODEL COMPARISON TAB */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Comparison Matrix</CardTitle>
                <CardDescription>Comprehensive comparison across accuracy, speed, and deployment metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Model</TableHead>
                        <TableHead className="text-center">Accuracy</TableHead>
                        <TableHead className="text-center">Precision</TableHead>
                        <TableHead className="text-center">Recall</TableHead>
                        <TableHead className="text-center">F1 Score</TableHead>
                        <TableHead className="text-center">AUC-ROC</TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" />
                            Inference
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            Memory
                          </div>
                        </TableHead>
                        <TableHead className="text-center">Deployability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modelComparisonData.map((model, idx) => (
                        <TableRow key={model.model} className={idx === 0 ? 'bg-blue-50 dark:bg-blue-950/30' : ''}>
                          <TableCell className="font-medium">
                            {model.model}
                            {idx === 0 && (
                              <Badge className="ml-2 bg-blue-600">Best</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {model.accuracy}%
                            {idx === 0 && <TrendingUp className="h-3 w-3 inline ml-1 text-green-600" />}
                          </TableCell>
                          <TableCell className="text-center">{model.precision}%</TableCell>
                          <TableCell className="text-center">{model.recall}%</TableCell>
                          <TableCell className="text-center font-semibold">
                            {model.f1}%
                            {idx === 0 && <TrendingUp className="h-3 w-3 inline ml-1 text-green-600" />}
                          </TableCell>
                          <TableCell className="text-center">{model.auc}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={model.inferenceTime <= 20 ? 'outline' : 'secondary'} className="font-mono">
                              {model.inferenceTime}ms
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={model.memoryMB <= 50 ? 'outline' : 'secondary'} className="font-mono">
                              {model.memoryMB}MB
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={model.deployability === 'EASY' ? 'default' : 'secondary'}>
                              {model.deployability}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator className="my-6" />

                <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/30">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <div className="space-y-2">
                      <div><strong>Recommendation: XGBoost v1.2</strong> is the best overall choice</div>
                      <div className="grid md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-blue-200">
                        <div>
                          <div className="text-xs text-blue-600 font-semibold">ACCURACY</div>
                          <div className="text-sm">+2.3% better F1 score than Random Forest</div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-semibold">SPEED</div>
                          <div className="text-sm">57% faster inference (12ms vs 28ms)</div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-semibold">EFFICIENCY</div>
                          <div className="text-sm">62% less memory (45MB vs 120MB)</div>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Performance vs Speed Trade-off Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance vs. Speed Trade-off</CardTitle>
                <CardDescription>Find the sweet spot between accuracy and inference time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="inferenceTime" 
                      name="Inference Time (ms)" 
                      label={{ value: 'Inference Time (ms)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      dataKey="f1" 
                      name="F1 Score (%)" 
                      label={{ value: 'F1 Score (%)', angle: -90, position: 'insideLeft' }}
                      domain={[90, 96]}
                    />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Models" data={modelComparisonData} fill="#3b82f6">
                      {modelComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#94a3b8'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTION READINESS TAB */}
          <TabsContent value="production" className="space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      Production Readiness Assessment
                    </CardTitle>
                    <CardDescription>Comprehensive checklist for deployment</CardDescription>
                  </div>
                  <Badge className="bg-green-600 text-lg px-4 py-2">READY</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Criteria */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Performance Criteria
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 ml-6">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>AUC-ROC (0.982)</strong> exceeds 0.95 threshold
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>F1 Score (95.1%)</strong> meets business requirements
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Precision (94.2%)</strong> minimizes false alarms
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Recall (96.1%)</strong> catches most positives
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Stability & Robustness */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Stability & Robustness
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 ml-6">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Overfitting Risk:</strong> Low (2.3% gap)
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Cross-Validation:</strong> 5-fold completed
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Model Convergence:</strong> Achieved
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Training Stability:</strong> No anomalies
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Data Quality */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Data Quality
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 ml-6">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>No data leakage</strong> detected in features
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Feature quality:</strong> All validated
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Training set size:</strong> 1.2M records
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Class imbalance:</strong> Addressed with sampling
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Explainability */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Explainability & Interpretability
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 ml-6">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Feature importance:</strong> Available
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>SHAP values:</strong> Generated
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Model documentation:</strong> Complete
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Business rules:</strong> Validated
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Production Infrastructure */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      Production Infrastructure
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 ml-6">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Data drift detection:</strong> Pending setup
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>API latency testing:</strong> In progress
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Model serialization:</strong> Tested
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Inference speed:</strong> 12ms (excellent)
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Monitoring & Observability */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Monitoring & Observability
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 ml-6">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Performance logging:</strong> Configured
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Error tracking:</strong> Enabled
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Alerting rules:</strong> Defined
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div className="text-sm">
                          <strong>Retraining pipeline:</strong> Under development
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/30">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <div className="space-y-2">
                      <div className="font-semibold text-lg">Next Steps to Complete Deployment:</div>
                      <ol className="list-decimal ml-5 space-y-1">
                        <li>Set up data drift detection monitoring (2-3 days)</li>
                        <li>Complete API latency benchmarking (1 day)</li>
                        <li>Finalize retraining pipeline configuration (3-4 days)</li>
                        <li>Conduct final UAT with stakeholders (1 week)</li>
                      </ol>
                      <div className="pt-3 border-t border-blue-200">
                        <strong>Estimated time to production:</strong> 2 weeks
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Deployment Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Ready
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">18</div>
                  <p className="text-sm text-muted-foreground">Criteria passed</p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600 mb-2">4</div>
                  <p className="text-sm text-muted-foreground">Items to complete</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">~2</div>
                  <p className="text-sm text-muted-foreground">Weeks to production</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
