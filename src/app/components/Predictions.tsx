/**
 * Predictions Component - COMPLETE WITH REAL API INTEGRATION
 * Complete prediction workflow with backend integration
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import {
  Zap,
  Upload,
  History,
  Code,
  Brain,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  Target,
  Rocket,
  BarChart3,
  Download,
  Settings,
  Search,
  Database,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useRecentModels } from '../../hooks/useRecentModels';
import { usePredictions } from '../../hooks/usePredictions';
import { useBatchPrediction } from '../../hooks/useBatchPrediction';
import { usePredictionHistory } from '../../hooks/usePredictionHistory';
import { useModelStats } from '../../hooks/useModelStats';
import { useAPIIntegration } from '../../hooks/useAPIIntegration';
import { predictionService } from '../../services/predictionService';
import { toast } from 'sonner';
import { SinglePredictionTab } from './predictions/SinglePredictionTab';
import { BatchPredictionTab } from './predictions/BatchPredictionTab';
import { HistoryTab } from './predictions/HistoryTab';
import { APITab } from './predictions/APITab';

// Types
interface PredictionInput {
  [key: string]: string | number;
}

export function Predictions() {
  const { currentProject } = useProject();
  const { models: recentModels, loading: modelsLoading } = useRecentModels(currentProject?.id, 10);

  // State management
  const [selectedTab, setSelectedTab] = useState<'single' | 'batch' | 'history' | 'api'>('single');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [predictionInputs, setPredictionInputs] = useState<PredictionInput>({});

  // History state (for filtering UI)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'single' | 'batch' | 'api'>('all');
  const [historyDateRange, setHistoryDateRange] = useState('7days');
  const [historyModelFilter, setHistoryModelFilter] = useState('all');
  const [historyResultFilter, setHistoryResultFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // API state
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'curl' | 'java'>('python');

  // Hooks for backend integration
  const {
    isLoading: isPredicting,
    predictionResult,
    makePrediction,
    resetPrediction,
  } = usePredictions(selectedModel, currentProject?.id);

  const {
    uploadedFile,
    setUploadedFile,
    validation: batchValidation,
    isValidating,
    isProcessing: isBatchProcessing,
    progress: batchProgress,
    jobStatus: batchResults,
    handleFileUpload,
    startBatchPrediction,
    downloadResults,
    reset: resetBatch,
  } = useBatchPrediction(selectedModel, currentProject?.id);

  const {
    history: predictionHistory,
    isLoading: isLoadingHistory,
    selectedPrediction: selectedHistoryItem,
    isLoadingDetail,
    fetchPredictionDetail,
    exportHistory,
    updateFilters,
    setSelectedPrediction: setSelectedHistoryItem,
  } = usePredictionHistory(currentProject?.id);

  const { stats: modelStats, isLoading: isLoadingStats } = useModelStats(selectedModel);

  const {
    apiInfo,
    isLoading: isLoadingApiInfo,
    isRegenerating,
    isTesting,
    testResult,
    regenerateApiKey,
    testApi,
  } = useAPIIntegration(selectedModel, currentProject?.id);

  // Get selected model details
  const selectedModelDetails = recentModels?.find(m => m.id === selectedModel);
  const deployedModels = recentModels?.filter(m => m.isDeployed) || [];

  // Group deployed models by dataset
  const groupedModels = useMemo(() => {
    if (!deployedModels || deployedModels.length === 0) return [];

    const groups = deployedModels.reduce((acc, model) => {
      const datasetName = model.datasetName || 'Unknown Dataset';
      if (!acc[datasetName]) {
        acc[datasetName] = [];
      }
      acc[datasetName].push(model);
      return acc;
    }, {} as Record<string, typeof deployedModels>);

    // Convert to array and sort by most recent
    return Object.entries(groups).map(([datasetName, models]) => ({
      datasetName,
      models: models.sort((a, b) => {
        // Sort by deployment date (most recent first)
        const dateA = new Date(a.deployedAt || 0).getTime();
        const dateB = new Date(b.deployedAt || 0).getTime();
        return dateB - dateA;
      }),
      activeModel: models.find(m => m.isActiveDeployment),
      modelCount: models.length,
    }));
  }, [deployedModels]);

  // Model search state
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  // Mock feature schema (in production, this would come from the model metadata API)
  const featureSchema = selectedModelDetails ? [
    { 
      name: 'age', 
      type: 'number', 
      min: 18, 
      max: 100, 
      description: 'Customer age',
      typicalRange: '25-65',
      required: true
    },
    { 
      name: 'annual_income', 
      type: 'number', 
      min: 0, 
      max: 1000000, 
      description: 'Annual income in USD',
      typicalRange: '30000-150000',
      required: true
    },
    { 
      name: 'credit_score', 
      type: 'number', 
      min: 300, 
      max: 850, 
      description: 'Credit score',
      typicalRange: '580-750',
      required: true
    },
    { 
      name: 'loan_amount', 
      type: 'number', 
      min: 1000, 
      max: 1000000, 
      description: 'Requested loan amount',
      typicalRange: '10000-500000',
      required: true
    },
    { 
      name: 'employment_years', 
      type: 'number', 
      min: 0, 
      max: 50, 
      description: 'Years of employment',
      typicalRange: '2-20',
      required: true
    },
    { 
      name: 'existing_loans', 
      type: 'number', 
      min: 0, 
      max: 10, 
      description: 'Number of existing loans',
      typicalRange: '0-3',
      required: false
    },
  ] : [];

  // Overall statistics from history or model stats
  const overallStats = useMemo(() => {
    if (modelStats) {
      return {
        total: modelStats.totalPredictions,
        approved: modelStats.resultCounts['Approved'] || 0,
        rejected: modelStats.resultCounts['Rejected'] || 0,
      };
    }
    return { total: 0, approved: 0, rejected: 0 };
  }, [modelStats]);

  // API usage stats
  const apiUsageStats = useMemo(() => {
    if (apiInfo) {
      return {
        today: apiInfo.usageStats.todayRequests,
        thisMonth: apiInfo.usageStats.monthRequests,
        avgLatency: apiInfo.usageStats.avgLatencyMs,
        rateLimit: apiInfo.rateLimit.limitPerHour,
        currentUsage: apiInfo.rateLimit.usedThisHour,
      };
    }
    return {
      today: 0,
      thisMonth: 0,
      avgLatency: 0,
      rateLimit: 1000,
      currentUsage: 0,
    };
  }, [apiInfo]);

  // Validate single input field
  const validateField = (name: string, value: number) => {
    const field = featureSchema.find(f => f.name === name);
    if (!field) return { valid: true, message: '' };

    if (value < field.min || value > field.max) {
      return { 
        valid: false, 
        message: `Value must be between ${field.min} and ${field.max}`,
        type: 'error' as const
      };
    }

    // Check typical range
    const [minStr, maxStr] = field.typicalRange.split('-');
    const min = parseFloat(minStr.replace(/[^0-9.]/g, ''));
    const max = parseFloat(maxStr.replace(/[^0-9.]/g, ''));
    
    if (value < min || value > max) {
      return {
        valid: true,
        message: `Unusual value. Typical range: ${field.typicalRange}`,
        type: 'warning' as const
      };
    }

    return { valid: true, message: `Valid. Range: ${field.min}-${field.max}`, type: 'success' as const };
  };

  // Handle single prediction
  const handlePredict = async () => {
    if (!selectedModel) {
      toast.error('Please select a model first');
      return;
    }

    // Validate inputs
    const requiredFields = featureSchema.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !predictionInputs[f.name]);
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }

    await makePrediction(predictionInputs);
  };

  // Load sample data
  const loadSampleData = () => {
    const sampleData: PredictionInput = {
      age: 35,
      annual_income: 75000,
      credit_score: 720,
      loan_amount: 250000,
      employment_years: 8,
      existing_loans: 1,
    };
    setPredictionInputs(sampleData);
    toast.success('Sample data loaded');
  };

  // Reset form
  const resetForm = () => {
    setPredictionInputs({});
    resetPrediction();
    toast.info('Form reset');
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Download template CSV
  const downloadTemplate = async () => {
    if (!selectedModel) {
      toast.error('Please select a model first');
      return;
    }

    try {
      await predictionService.downloadTemplate(selectedModel);
    } catch (err: any) {
      toast.error(err.message || 'Failed to download template');
    }
  };

  // Code snippets for API integration
  const codeSnippets = useMemo(() => {
    const endpoint = apiInfo?.endpoint || `https://api.mlplatform.io/api/predictions/v1/models/${selectedModel || 'MODEL_ID'}/predict`;
    
    return {
      python: apiInfo?.codeExamples?.python || `import requests

response = requests.post(
    "${endpoint}",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "features": {
            "age": 35,
            "annual_income": 75000,
            "credit_score": 720,
            "loan_amount": 250000,
            "employment_years": 8,
            "existing_loans": 1
        }
    }
)

result = response.json()
print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['confidence']}")`,

      javascript: apiInfo?.codeExamples?.javascript || `const response = await fetch(
  '${endpoint}',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      features: {
        age: 35,
        annual_income: 75000,
        credit_score: 720,
        loan_amount: 250000,
        employment_years: 8,
        existing_loans: 1
      }
    })
  }
);

const result = await response.json();
console.log('Prediction:', result.prediction);
console.log('Confidence:', result.confidence);`,

      curl: apiInfo?.codeExamples?.curl || `curl -X POST \\
  ${endpoint} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "features": {
      "age": 35,
      "annual_income": 75000,
      "credit_score": 720,
      "loan_amount": 250000,
      "employment_years": 8,
      "existing_loans": 1
    }
  }'`,

      java: apiInfo?.codeExamples?.java || `HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${endpoint}"))
    .header("Authorization", "Bearer YOUR_API_KEY")
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString("""
        {
          "features": {
            "age": 35,
            "annual_income": 75000,
            "credit_score": 720,
            "loan_amount": 250000,
            "employment_years": 8,
            "existing_loans": 1
          }
        }
        """))
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,
    };
  }, [apiInfo, selectedModel]);

  // Filter history (client-side filtering on top of server filtering)
  const filteredHistory = useMemo(() => {
    if (!predictionHistory) return [];
    
    return predictionHistory.predictions.filter(item => {
      // Additional client-side filtering if needed
      return true;
    });
  }, [predictionHistory]);

  // If no project selected
  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Project Selected</h3>
          <p className="text-muted-foreground">
            Please select a project to make predictions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          Predictions
        </h1>
        <p className="text-muted-foreground mt-2">
          Make real-time predictions, process batches, and integrate with your applications
        </p>
      </div>

      {/* Quick Stats Bar */}
      {selectedModelDetails && (
        <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Selected Model:</span>
                  <span className="text-primary">{selectedModelDetails.name}</span>
                  <Badge variant="outline">{selectedModelDetails.accuracyLabel}</Badge>
                  {isLoadingStats && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Total: {overallStats.total}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Approved: {overallStats.approved}
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Rejected: {overallStats.rejected}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={exportHistory}
                  disabled={isLoadingHistory}
                >
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Selection */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Select Model for Predictions
              </CardTitle>
              <CardDescription>
                Choose a deployed model to start making predictions
              </CardDescription>
            </div>
            {deployedModels.length > 3 && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {modelsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Loading models...</span>
            </div>
          ) : deployedModels && deployedModels.length > 0 ? (
            <div className="space-y-4">
              {/* Summary bar */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{deployedModels.length} Deployed Models</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{groupedModels.length} Datasets</span>
                  </div>
                </div>
                {selectedModel && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Model Selected
                  </Badge>
                )}
              </div>

              {/* Grouped Models - Accordion by Dataset */}
              <Accordion type="multiple" defaultValue={groupedModels.map((_, i) => `dataset-${i}`)} className="space-y-3">
                {groupedModels.map((group, index) => (
                  <AccordionItem 
                    key={`dataset-${index}`} 
                    value={`dataset-${index}`}
                    className="border-2 rounded-xl px-5 py-1 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-950 dark:to-purple-900">
                          <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-base flex items-center gap-2">
                            {group.datasetName}
                            {group.activeModel && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">
                                <Rocket className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {group.modelCount} {group.modelCount === 1 ? 'model deployment' : 'model deployments'}
                            {group.activeModel && ` • ${group.activeModel.accuracyLabel} accuracy`}
                          </div>
                        </div>
                        <Badge variant="secondary" className="h-7 px-3 font-medium">
                          {group.modelCount}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                        {group.models
                          .filter(model => 
                            !modelSearchQuery || 
                            model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                            model.algorithmDisplayName.toLowerCase().includes(modelSearchQuery.toLowerCase())
                          )
                          .map((model) => (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`group relative p-4 rounded-lg border-2 transition-all text-left overflow-hidden ${
                              selectedModel === model.id
                                ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]'
                                : 'border-border hover:border-primary/50 hover:bg-muted hover:scale-[1.01]'
                            }`}
                          >
                            {/* Background gradient on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                                  {model.isBest ? (
                                    <Sparkles className="h-5 w-5 text-white" />
                                  ) : (
                                    <Brain className="h-5 w-5 text-white" />
                                  )}
                                </div>
                                {selectedModel === model.id && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-5 w-5 text-primary animate-in zoom-in duration-200" />
                                  </div>
                                )}
                              </div>

                              {/* Model Name */}
                              <div className="font-semibold mb-1 truncate">{model.name}</div>

                              {/* Algorithm */}
                              <div className="text-sm text-muted-foreground mb-3 truncate">
                                {model.algorithmDisplayName}
                              </div>

                              {/* Badges & Metrics */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Accuracy */}
                                <Badge variant="outline" className="text-xs font-medium bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {model.accuracyLabel}
                                </Badge>

                                {/* Active Badge */}
                                {model.isActiveDeployment && (
                                  <Badge className="text-xs bg-green-600 hover:bg-green-600">
                                    <Rocket className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                )}

                                {/* Best Badge */}
                                {model.isBest && !model.isActiveDeployment && (
                                  <Badge variant="outline" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Best
                                  </Badge>
                                )}
                              </div>

                              {/* Deployment info */}
                              {model.deployedAt && (
                                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Deployed {new Date(model.deployedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Rocket className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No deployed models found. Deploy a model first!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single" className="gap-2">
            <Target className="h-4 w-4" />
            Single Prediction
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-2">
            <Upload className="h-4 w-4" />
            Batch Prediction
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Code className="h-4 w-4" />
            API Integration
          </TabsTrigger>
        </TabsList>

        {/* SINGLE PREDICTION TAB */}
        <SinglePredictionTab
          selectedModel={selectedModel}
          featureSchema={featureSchema}
          predictionInputs={predictionInputs}
          setPredictionInputs={setPredictionInputs}
          predictionResult={predictionResult}
          isLoading={isPredicting}
          handlePredict={handlePredict}
          loadSampleData={loadSampleData}
          resetForm={resetForm}
          copyToClipboard={copyToClipboard}
          validateField={validateField}
        />

        {/* BATCH PREDICTION TAB */}
        <BatchPredictionTab
          selectedModel={selectedModel}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          batchValidation={batchValidation}
          handleFileUpload={handleFileUpload}
          handleBatchPredict={startBatchPrediction}
          isLoading={isBatchProcessing || isValidating}
          batchProgress={batchProgress}
          batchResults={batchResults}
          downloadTemplate={downloadTemplate}
        />

        {/* HISTORY TAB */}
        <HistoryTab
          predictionHistory={predictionHistory?.predictions || []}
          filteredHistory={filteredHistory}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
          historyDateRange={historyDateRange}
          setHistoryDateRange={setHistoryDateRange}
          historyModelFilter={historyModelFilter}
          setHistoryModelFilter={setHistoryModelFilter}
          historyResultFilter={historyResultFilter}
          setHistoryResultFilter={setHistoryResultFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedHistoryItem={selectedHistoryItem}
          setSelectedHistoryItem={(item) => {
            if (item) {
              fetchPredictionDetail(item.predictionId);
            } else {
              setSelectedHistoryItem(null);
            }
          }}
          deployedModels={deployedModels}
        />

        {/* API INTEGRATION TAB */}
        <APITab
          selectedModel={selectedModel}
          showApiKey={showApiKey}
          setShowApiKey={setShowApiKey}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          codeSnippets={codeSnippets}
          copyToClipboard={copyToClipboard}
          apiUsageStats={apiUsageStats}
        />
      </Tabs>
    </div>
  );
}