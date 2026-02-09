/**
 * PREDICTIONS DASHBOARD - 100% REAL API INTEGRATION
 * NO MOCK DATA - All data from FastAPI backend
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Zap,
  Upload,
  History as HistoryIcon,
  Activity,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Target,
  Sparkles,
  Info,
  Loader2,
  ArrowRight,
  BarChart3,
  Database,
  RefreshCw,
} from 'lucide-react';
import {
  predictionService,
  DeployedModel,
  PredictionResponse,
  BatchJobResponse,
  HistoryItem,
  MonitoringStats,
} from '@/services/predictionService';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface PredictionsDashboardProps {
  deployedModels: DeployedModel[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PredictionsDashboard({
  deployedModels,
  selectedModelId,
  onModelChange,
}: PredictionsDashboardProps) {
  const [activeTab, setActiveTab] = useState('single');
  
  // Single Prediction State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [predicting, setPredicting] = useState(false);
  
  // Batch Prediction State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [batchJob, setBatchJob] = useState<BatchJobResponse | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // History State
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'single' | 'batch'>('all');
  
  // Monitoring State
  const [monitoringData, setMonitoringData] = useState<MonitoringStats | null>(null);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  const selectedModel = deployedModels.find(m => m.id === selectedModelId);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initialize form with default values when model changes
   */
  useEffect(() => {
    if (selectedModel) {
      const defaultData: Record<string, any> = {};
      selectedModel.inputFeatures.forEach(feature => {
        if (feature.defaultValue !== undefined) {
          defaultData[feature.name] = feature.defaultValue;
        }
      });
      setFormData(defaultData);
      setPredictionResult(null);
    }
  }, [selectedModel]);

  /**
   * Load history when tab changes
   */
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, historyPage, historyFilter]);

  /**
   * Load monitoring when tab changes
   */
  useEffect(() => {
    if (activeTab === 'monitoring') {
      loadMonitoring();
    }
  }, [activeTab, selectedModelId]);

  /**
   * Cleanup batch polling on unmount
   */
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // ============================================================================
  // SINGLE PREDICTION HANDLERS
  // ============================================================================

  const handleInputChange = (featureName: string, value: any) => {
    setFormData(prev => ({ ...prev, [featureName]: value }));
  };

  const handlePredict = async () => {
    if (!selectedModel) return;

    // Validate all required fields
    const missingFields = selectedModel.inputFeatures
      .filter(f => f.required && !formData[f.name])
      .map(f => f.displayName || f.name);

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    setPredicting(true);
    try {
      const result = await predictionService.predict(selectedModelId, formData, 0.5);
      setPredictionResult(result);
      toast.success('Prediction completed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Prediction failed');
      console.error('Prediction error:', error);
    } finally {
      setPredicting(false);
    }
  };

  const handleReset = () => {
    setPredictionResult(null);
    // Reset to default values
    const defaultData: Record<string, any> = {};
    selectedModel?.inputFeatures.forEach(feature => {
      if (feature.defaultValue !== undefined) {
        defaultData[feature.name] = feature.defaultValue;
      }
    });
    setFormData(defaultData);
  };

  // ============================================================================
  // BATCH PREDICTION HANDLERS
  // ============================================================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setUploadedFile(file);
      setBatchJob(null);
      toast.info(`Selected: ${file.name}`);
    }
  };

  const handleBatchUpload = async () => {
    if (!uploadedFile || !selectedModel) return;

    setBatchProcessing(true);
    try {
      const result = await predictionService.startBatchJob(uploadedFile, selectedModelId);
      setBatchJob(result);
      toast.success('Batch job started!');

      // Start polling if not completed
      if (result.status !== 'completed' && result.status !== 'failed') {
        startBatchPolling(result.jobId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Batch upload failed');
      console.error('Batch upload error:', error);
      setBatchProcessing(false);
    }
  };

  const startBatchPolling = (jobId: string) => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const status = await predictionService.getBatchJobStatus(jobId);
        setBatchJob(status);

        if (status.status === 'completed') {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setBatchProcessing(false);
          toast.success('Batch job completed!');
        } else if (status.status === 'failed') {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setBatchProcessing(false);
          toast.error('Batch job failed');
        }
      } catch (error) {
        console.error('Batch polling error:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleDownloadResults = async () => {
    if (!batchJob?.jobId) return;

    try {
      await predictionService.downloadBatchResults(batchJob.jobId);
      toast.success('Download started');
    } catch (error: any) {
      toast.error(error.message || 'Download failed');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await predictionService.downloadCSVTemplate();
      toast.success('Template downloaded');
    } catch (error: any) {
      toast.error(error.message || 'Template download failed');
    }
  };

  const handleResetBatch = () => {
    setUploadedFile(null);
    setBatchJob(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================================
  // HISTORY HANDLERS
  // ============================================================================

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const result = await predictionService.getHistory(
        historyPage,
        20,
        historyFilter,
        selectedModelId
      );
      setHistoryData(result.predictions);
      setHistoryTotal(result.pagination.totalItems);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load history');
      console.error('History load error:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ============================================================================
  // MONITORING HANDLERS
  // ============================================================================

  const loadMonitoring = async () => {
    setMonitoringLoading(true);
    try {
      const result = await predictionService.getMonitoringStats(selectedModelId);
      setMonitoringData(result);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load monitoring data');
      console.error('Monitoring load error:', error);
    } finally {
      setMonitoringLoading(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (!selectedModel) {
    return <div>No model selected</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predictions</h1>
          <p className="text-muted-foreground mt-2">
            Make predictions using deployed ML models
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedModelId} onValueChange={onModelChange}>
            <SelectTrigger className="w-[350px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {deployedModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>{model.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {model.version}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Model Info Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Model</div>
              <div className="font-semibold truncate">{selectedModel.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Algorithm</div>
              <div className="font-semibold">{selectedModel.algorithm}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <div className="font-semibold text-green-600">
                {(selectedModel.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant="default" className={selectedModel.status === 'active' ? 'bg-green-600' : ''}>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {selectedModel.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single" className="gap-2">
            <Zap className="h-4 w-4" />
            Single Prediction
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-2">
            <Upload className="h-4 w-4" />
            Batch Prediction
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <HistoryIcon className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* TAB 1: SINGLE PREDICTION */}
        {/* ================================================================ */}
        <TabsContent value="single" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Input Features
                </CardTitle>
                <CardDescription>
                  Enter feature values for prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {selectedModel.inputFeatures.map(feature => (
                  <div key={feature.name} className="space-y-2">
                    <Label htmlFor={feature.name} className="flex items-center gap-2">
                      {feature.displayName || feature.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {feature.required && <span className="text-red-500">*</span>}
                      {feature.description && (
                        <span className="text-xs text-muted-foreground font-normal">
                          ({feature.description})
                        </span>
                      )}
                    </Label>
                    
                    {feature.type === 'numeric' ? (
                      <Input
                        id={feature.name}
                        type="number"
                        min={feature.min}
                        max={feature.max}
                        step={feature.step || 1}
                        placeholder={`Enter ${feature.displayName || feature.name}`}
                        value={formData[feature.name] || ''}
                        onChange={e => handleInputChange(feature.name, e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    ) : (
                      <Select
                        value={formData[feature.name] || ''}
                        onValueChange={value => handleInputChange(feature.name, value)}
                      >
                        <SelectTrigger id={feature.name}>
                          <SelectValue placeholder={`Select ${feature.displayName || feature.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {feature.options?.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {feature.typicalRange && (
                      <div className="text-xs text-muted-foreground">
                        Typical: {feature.typicalRange}
                      </div>
                    )}
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handlePredict}
                    disabled={predicting}
                  >
                    {predicting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Prediction
                      </>
                    )}
                  </Button>
                  {predictionResult && (
                    <Button variant="outline" size="lg" onClick={handleReset}>
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prediction Result */}
            <Card className={predictionResult ? 'border-2 border-green-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Prediction Result
                </CardTitle>
                <CardDescription>
                  Model output and confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!predictionResult ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center min-h-[500px]">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Sparkles className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter input values and click "Get Prediction" to see results
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Main Prediction */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border-2 border-green-200 dark:border-green-800">
                      <div className="text-sm text-muted-foreground mb-2">Prediction</div>
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {predictionResult.output.predictionLabel}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={predictionResult.output.probability * 100} className="h-2 flex-1" />
                        <span className="text-lg font-semibold">
                          {(predictionResult.output.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className={getConfidenceBadgeColor(predictionResult.output.confidence)}>
                          {predictionResult.output.confidence} confidence
                        </Badge>
                        <Badge variant="outline">
                          Threshold: {predictionResult.output.threshold.toFixed(2)}
                        </Badge>
                      </div>
                    </div>

                    {/* Class Probabilities */}
                    <div className="space-y-3">
                      <div className="text-sm font-semibold">Class Probabilities</div>
                      {Object.entries(predictionResult.output.probabilities).map(([className, prob]) => (
                        <div key={className} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{className}</span>
                            <span className="font-medium">{(prob * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={prob * 100} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Feature Contributions */}
                    {predictionResult.explanation && (
                      <>
                        <div className="space-y-3">
                          <div className="text-sm font-semibold flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Feature Contributions
                          </div>
                          {predictionResult.explanation.topFeatures.slice(0, 5).map((feature, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  {feature.feature}
                                  {feature.value !== '' && (
                                    <Badge variant="outline" className="text-xs">
                                      {feature.value}
                                    </Badge>
                                  )}
                                </span>
                                <span
                                  className={`font-medium ${
                                    feature.direction === 'positive' ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {feature.direction === 'positive' ? '+' : ''}
                                  {feature.impact.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={Math.abs(feature.impact)}
                                  className={`h-2 flex-1 ${
                                    feature.direction === 'negative' ? '[&>div]:bg-red-500' : ''
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {predictionResult.explanation.explanation && (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              {predictionResult.explanation.explanation}
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Processing: {predictionResult.metadata.processingTimeMs.toFixed(1)}ms
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        Model: {predictionResult.metadata.modelVersion}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* TAB 2: BATCH PREDICTION */}
        {/* ================================================================ */}
        <TabsContent value="batch" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Upload a CSV file with multiple records for batch prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-4"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select CSV File
                  </Button>
                  {uploadedFile && (
                    <div className="text-sm font-medium text-green-600">
                      ✓ {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                  {!uploadedFile && (
                    <p className="text-xs text-muted-foreground mt-2">
                      CSV file up to 50MB
                    </p>
                  )}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>CSV Format Requirements:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                      <li>First row must contain column headers</li>
                      <li>Column names must match feature names</li>
                      <li>Required columns: {selectedModel.inputFeatures.slice(0, 3).map(f => f.name).join(', ')}...</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={handleDownloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={handleBatchUpload}
                    disabled={!uploadedFile || batchProcessing}
                  >
                    {batchProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Start Batch Job
                      </>
                    )}
                  </Button>
                </div>

                {batchJob && (
                  <Button variant="outline" size="sm" className="w-full" onClick={handleResetBatch}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Start New Batch
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Job Status */}
            <Card className={batchJob?.status === 'completed' ? 'border-2 border-green-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Job Status
                </CardTitle>
                <CardDescription>
                  Current batch prediction job
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!batchJob ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center min-h-[500px]">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No active batch job. Upload a CSV file to start.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge
                        variant={batchJob.status === 'completed' ? 'default' : 'secondary'}
                        className={
                          batchJob.status === 'completed'
                            ? 'bg-green-600'
                            : batchJob.status === 'processing'
                            ? 'bg-blue-600'
                            : batchJob.status === 'failed'
                            ? 'bg-red-600'
                            : ''
                        }
                      >
                        {batchJob.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {batchJob.status === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {batchJob.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {batchJob.status}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{batchJob.progress}%</span>
                      </div>
                      <Progress value={batchJob.progress} className="h-3" />
                      <div className="text-xs text-muted-foreground">
                        {batchJob.processedRecords.toLocaleString()} / {batchJob.totalRecords.toLocaleString()} records processed
                      </div>
                    </div>

                    <Separator />

                    {/* Job Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="text-xs text-muted-foreground">Successful</div>
                        <div className="text-lg font-bold text-blue-600">
                          {batchJob.successfulRecords.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <div className="text-xs text-muted-foreground">Failed</div>
                        <div className="text-lg font-bold text-red-600">
                          {batchJob.failedRecords.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    {batchJob.status === 'completed' && batchJob.summary && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="text-sm font-semibold">Prediction Summary</div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                              <div className="text-xs text-muted-foreground">Approved</div>
                              <div className="text-lg font-bold text-green-600">
                                {batchJob.summary.approved}
                              </div>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                              <div className="text-xs text-muted-foreground">Rejected</div>
                              <div className="text-lg font-bold text-red-600">
                                {batchJob.summary.rejected}
                              </div>
                            </div>
                          </div>

                          <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                              Average confidence: {batchJob.summary.avgConfidence.toFixed(1)}%
                              <br />
                              Processing time: {batchJob.summary.processingTime}
                            </AlertDescription>
                          </Alert>
                        </div>

                        <Button className="w-full" size="lg" onClick={handleDownloadResults}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Results ({batchJob.outputFile?.name})
                        </Button>
                      </>
                    )}

                    {/* Errors */}
                    {batchJob.errors.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-red-600">Errors</div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {batchJob.errors.map((error, idx) => (
                              <div key={idx} className="text-xs text-muted-foreground">
                                Row {error.row}: {error.error}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Metadata */}
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {batchJob.durationSeconds ? `${Math.floor(batchJob.durationSeconds / 60)}m ${batchJob.durationSeconds % 60}s` : 'In progress...'}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {batchJob.inputFile.name}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================ */}
        {/* TAB 3: PREDICTION HISTORY */}
        {/* ================================================================ */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HistoryIcon className="h-5 w-5" />
                    Prediction History
                  </CardTitle>
                  <CardDescription>
                    Recent single and batch predictions
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={historyFilter}
                    onValueChange={(value: any) => {
                      setHistoryFilter(value);
                      setHistoryPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="single">Single Only</SelectItem>
                      <SelectItem value="batch">Batch Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={loadHistory} disabled={historyLoading}>
                    {historyLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading && historyData.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : historyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <HistoryIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No prediction history yet. Make some predictions to see them here.
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs">{item.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.type === 'single' ? (
                                <Zap className="h-3 w-3 mr-1" />
                              ) : (
                                <Upload className="h-3 w-3 mr-1" />
                              )}
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{item.modelName || item.model}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTimestamp(item.timestamp)}
                          </TableCell>
                          <TableCell>
                            {item.type === 'single' && item.prediction ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.predictedLabel || item.prediction}</span>
                                {item.confidence !== null && (
                                  <Badge variant="secondary" className="text-xs">
                                    {(item.confidence * 100).toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {item.recordsProcessed} records
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={item.status === 'success' ? 'default' : 'destructive'}
                              className={item.status === 'success' ? 'bg-green-600' : ''}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {historyData.length} of {historyTotal} predictions
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                        disabled={historyPage === 1 || historyLoading}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryPage(p => p + 1)}
                        disabled={historyData.length < 20 || historyLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================ */}
        {/* TAB 4: MONITORING */}
        {/* ================================================================ */}
        <TabsContent value="monitoring" className="space-y-6">
          {monitoringLoading && !monitoringData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !monitoringData ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No monitoring data available yet.
              </p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {monitoringData.stats.totalPredictions.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg Latency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {monitoringData.stats.averageLatencyMs.toFixed(1)}ms
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Response time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Error Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {(monitoringData.stats.errorRate * 100).toFixed(2)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Success: {(100 - monitoringData.stats.errorRate * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Throughput
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {monitoringData.stats.throughput.toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Predictions/hour</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Prediction Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Prediction Distribution
                    </CardTitle>
                    <CardDescription>Class distribution over last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(monitoringData.predictionDistribution).map(([name, value]) => ({
                            name,
                            value,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(monitoringData.predictionDistribution).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#10b981'} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Confidence Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Confidence Distribution
                    </CardTitle>
                    <CardDescription>Prediction confidence levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monitoringData.confidenceDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Hourly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Hourly Prediction Trend
                  </CardTitle>
                  <CardDescription>Predictions and average confidence over last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monitoringData.hourlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="predictions"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Predictions"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgConfidence"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Avg Confidence"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Alerts */}
              {monitoringData.alerts.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-5 w-5" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {monitoringData.alerts.map((alert) => (
                      <Alert key={alert.id} className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{alert.message}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(alert.timestamp)}
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PredictionsDashboard;
