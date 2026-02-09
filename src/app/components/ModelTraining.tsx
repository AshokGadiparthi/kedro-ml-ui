import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Play, Pause, StopCircle, Settings, Zap, Brain, GitBranch, AlertCircle, Loader2, RefreshCw, Database, ChevronDown, ChevronRight, Save, History, Trash2 } from 'lucide-react';
import { Separator } from "./ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { toast } from "sonner";
import { useProject } from '../../contexts/ProjectContext';
import { useTrainingJobs, useAlgorithms } from '../../hooks/useTraining';
import { useDatasets } from '../../hooks/useDatasets';
import { useDataSources } from '../../hooks/useDataSources';
import * as trainingService from '../../services/training/trainingService';
import { CreateTrainingJobRequest, RecommendedSettings } from '../../services/api/types';
import { TrainingProgressModal } from './TrainingProgressModal';
import { TrainingResultsModal } from './TrainingResultsModal';
import { SaveConfigModal } from './SaveConfigModal';
import { LoadConfigDropdown } from './LoadConfigDropdown';
import { trainingConfigService } from '../../services/training/trainingConfigService';
import { SaveConfigRequest, ConfigResponse } from '../../services/training/configTypes';
import * as deploymentService from '../../services/deployment/deploymentService';
import { TrainingJobCard } from './TrainingJobCard';

// Saved configuration type
interface SavedConfiguration {
  id: string;
  name: string;
  projectId?: string;
  datasetId: string;
  algorithm: string;
  targetVariable: string;
  problemType: 'CLASSIFICATION' | 'REGRESSION';
  trainTestSplit: number;
  crossValidationFolds: number;
  maxDepth: number;
  learningRate: number;
  nEstimators: number;
  useGpu: boolean;
  autoTune: boolean;
  earlyStopping: boolean;
  patience: number;
  batchSize: string;
  evaluationMetric: string;
  createdAt: string;
}

export function ModelTraining() {
  const { currentProject, refreshCurrentProject } = useProject();
  
  // Hooks for API data
  const { jobs, loading: jobsLoading, error: jobsError, refetch: refetchJobs } = useTrainingJobs();
  const { algorithms, loading: algorithmsLoading } = useAlgorithms();
  const { datasets, loading: datasetsLoading } = useDatasets(currentProject?.id);
  const { dataSources, loading: dataSourcesLoading } = useDataSources(currentProject?.id);

  // Form state
  const [experimentName, setExperimentName] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('xgboost');
  const [targetVariable, setTargetVariable] = useState('');
  const [problemType, setProblemType] = useState<'CLASSIFICATION' | 'REGRESSION'>('CLASSIFICATION');
  const [trainTestSplit, setTrainTestSplit] = useState([80]);
  const [crossValidationFolds, setCrossValidationFolds] = useState([5]);
  const [maxDepth, setMaxDepth] = useState([6]);
  const [learningRate, setLearningRate] = useState([0.1]);
  const [nEstimators, setNEstimators] = useState(100);
  const [useGpu, setUseGpu] = useState(false);
  const [autoTune, setAutoTune] = useState(false);
  const [earlyStopping, setEarlyStopping] = useState(true);
  const [patience, setPatience] = useState(10);
  const [batchSize, setBatchSize] = useState('32');
  const [evaluationMetric, setEvaluationMetric] = useState('accuracy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recommended settings state
  const [recommendedSettings, setRecommendedSettings] = useState<RecommendedSettings | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Configuration modal state
  const [showSaveConfigModal, setShowSaveConfigModal] = useState(false);

  // Get target columns from selected dataset
  const selectedDatasetObj = datasets?.find(d => d.id === selectedDataset);
  const targetColumns = selectedDatasetObj ? ['churn', 'loan_approved', 'fraud', 'revenue'] : [];

  // Get algorithms for selected problem type
  const availableAlgorithms = algorithms 
    ? problemType === 'CLASSIFICATION' 
      ? algorithms.classification 
      : algorithms.regression
    : [];

  // Get selected algorithm details
  const selectedAlgorithmInfo = availableAlgorithms.find(a => a.id === selectedAlgorithm);

  // Calculate dynamic compute resources based on complexity and dataset size (MEMOIZED)
  const computeResources = useMemo(() => {
    if (!selectedAlgorithmInfo || !selectedDatasetObj) {
      return { label: 'Not configured', description: 'Select dataset and algorithm', instanceCount: 1 };
    }

    const complexity = selectedAlgorithmInfo.complexity;
    const datasetSize = selectedDatasetObj.rowCount;

    // Determine instance count based on complexity and dataset size
    let cpuCount = 2;
    let gpuCount = 1;

    // Scale based on complexity
    if (complexity === 'low') {
      cpuCount = Math.ceil(datasetSize / 50000) * 2; // 2 CPUs per 50k rows
      gpuCount = 1;
    } else if (complexity === 'medium') {
      cpuCount = Math.ceil(datasetSize / 30000) * 4; // 4 CPUs per 30k rows
      gpuCount = Math.ceil(datasetSize / 100000) * 2; // 2 GPUs per 100k rows
    } else if (complexity === 'high') {
      cpuCount = Math.ceil(datasetSize / 20000) * 8; // 8 CPUs per 20k rows
      gpuCount = Math.ceil(datasetSize / 50000) * 4; // 4 GPUs per 50k rows
    }

    // Cap the instance counts
    cpuCount = Math.min(cpuCount, 32);
    gpuCount = Math.min(gpuCount, 8);

    if (useGpu) {
      return {
        label: `${gpuCount}x GPU`,
        description: 'High performance mode',
        instanceCount: gpuCount,
      };
    } else {
      return {
        label: `${cpuCount}x CPU`,
        description: 'Standard mode',
        instanceCount: cpuCount,
      };
    }
  }, [selectedAlgorithmInfo, selectedDatasetObj, useGpu]);

  // Calculate cost estimate based on GPU, time, complexity, and dataset size (MEMOIZED)
  const costEstimate = useMemo(() => {
    if (!selectedAlgorithmInfo || !selectedAlgorithmInfo.estimatedTime) {
      return { cost: '$0.00', breakdown: 'Configure settings to see estimate' };
    }
    
    const instanceCount = computeResources.instanceCount;
    
    // Base rate per instance per hour
    const baseRatePerInstance = useGpu ? 0.50 : 0.10;
    
    // Parse estimated time to minutes
    const timeMatch = selectedAlgorithmInfo.estimatedTime.match(/~?(\d+)\s*(min|hour|minutes|hours)/i);
    if (!timeMatch) {
      return { cost: '$0.00', breakdown: 'Unable to parse time' };
    }
    
    const timeValue = parseInt(timeMatch[1]);
    const timeUnit = timeMatch[2].toLowerCase();
    const hours = timeUnit.startsWith('hour') ? timeValue : timeValue / 60;
    
    // Adjust by complexity
    const complexityMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.3,
    }[selectedAlgorithmInfo.complexity] || 1.0;
    
    // Calculate total cost: instances × rate × hours × complexity
    const totalCost = instanceCount * baseRatePerInstance * hours * complexityMultiplier;
    
    return {
      cost: `$${totalCost.toFixed(2)}`,
      breakdown: `${instanceCount}× ${useGpu ? '$0.50' : '$0.10'}/hr × ${hours.toFixed(1)}hr × ${complexityMultiplier}x`,
    };
  }, [selectedAlgorithmInfo, computeResources, useGpu]);

  // Fetch recommended settings when dataset, problem type, or target variable changes
  useEffect(() => {
    if (selectedDataset && targetVariable && problemType) {
      const fetchRecommendations = async () => {
        setLoadingRecommendations(true);
        try {
          const recommendations = await trainingService.getRecommendedSettings(
            selectedDataset,
            problemType,
            targetVariable
          );
          setRecommendedSettings(recommendations);
          
          // Auto-apply recommended hyperparameters
          if (recommendations.hyperparameters) {
            if (recommendations.hyperparameters.max_depth !== undefined) {
              setMaxDepth([recommendations.hyperparameters.max_depth]);
            }
            if (recommendations.hyperparameters.learning_rate !== undefined) {
              setLearningRate([recommendations.hyperparameters.learning_rate]);
            }
            if (recommendations.hyperparameters.n_estimators !== undefined) {
              setNEstimators(recommendations.hyperparameters.n_estimators);
            }
          }
          
          // Auto-select recommended algorithm if available
          if (recommendations.algorithm) {
            setSelectedAlgorithm(recommendations.algorithm);
          }
        } catch (error) {
          console.error('Failed to fetch recommendations:', error);
          setRecommendedSettings(null);
        } finally {
          setLoadingRecommendations(false);
        }
      };
      
      fetchRecommendations();
    }
  }, [selectedDataset, targetVariable, problemType]);

  // Handle form submission
  const handleStartTraining = async () => {
    // Validation
    if (!experimentName) {
      toast.error('Please enter an experiment name');
      return;
    }
    if (!selectedDataset) {
      toast.error('Please select a dataset');
      return;
    }
    if (!targetVariable) {
      toast.error('Please select a target variable');
      return;
    }

    setIsSubmitting(true);

    try {
      const request: CreateTrainingJobRequest = {
        experimentName,
        projectId: currentProject?.id, // ← FIX: Include projectId from current project
        datasetId: selectedDataset,
        algorithm: selectedAlgorithm,
        targetVariable,
        problemType,
        trainTestSplit: trainTestSplit[0] / 100,
        crossValidationFolds: crossValidationFolds[0],
        hyperparameters: {
          max_depth: maxDepth[0],
          learning_rate: learningRate[0],
          n_estimators: nEstimators,
        },
        gpuAcceleration: useGpu,
        autoHyperparameterTuning: autoTune,
        earlyStopping,
        earlyStoppingPatience: patience,
        batchSize: parseInt(batchSize),
        evaluationMetric,
      };

      const job = await trainingService.startTrainingJob(request);
      
      toast.success('Training job started successfully!', {
        description: `Job ID: ${job.id}`,
      });

      // Refresh jobs list
      refetchJobs();

      // Show progress modal immediately
      setActiveJobId(job.id);
      setShowProgressModal(true);

      // Reset form (optional)
      // setExperimentName('');
    } catch (error: any) {
      console.error('Failed to start training:', error);
      toast.error('Failed to start training', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle job actions
  const handlePauseJob = async (jobId: string) => {
    try {
      await trainingService.pauseTrainingJob(jobId);
      toast.success('Job paused');
      refetchJobs();
    } catch (error: any) {
      toast.error('Failed to pause job', {
        description: error.message,
      });
    }
  };

  const handleResumeJob = async (jobId: string) => {
    try {
      await trainingService.resumeTrainingJob(jobId);
      toast.success('Job resumed');
      refetchJobs();
    } catch (error: any) {
      toast.error('Failed to resume job', {
        description: error.message,
      });
    }
  };

  const handleStopJob = async (jobId: string) => {
    try {
      await trainingService.stopTrainingJob(jobId);
      toast.success('Job stopped');
      refetchJobs();
    } catch (error: any) {
      toast.error('Failed to stop job', {
        description: error.message,
      });
    }
  };

  // Activate a deployed version (Rollback)
  const handleActivate = async (deploymentId: string) => {
    try {
      await deploymentService.activateDeployment(deploymentId);
      toast.success('Deployment activated successfully!');
      refetchJobs(); // Refresh to show updated active status
      refreshCurrentProject(); // Refresh project stats
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate deployment');
    }
  };

  // Auto-refresh jobs every 3 seconds if there are running jobs
  useEffect(() => {
    const hasRunningJobs = jobs?.some(j => 
      j.status === 'running' || j.status === 'queued' || j.status === 'starting'
    );

    if (hasRunningJobs) {
      const interval = setInterval(() => {
        refetchJobs();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [jobs, refetchJobs]);

  // Group jobs by dataset/data source (like AutoML)
  const groupedJobs = useMemo(() => {
    if (!jobs) return {};
    
    return jobs.reduce((acc, job) => {
      // Try to find the dataset/datasource for this job using datasetId
      const dataset = datasets?.find(d => d.id === job.datasetId);
      const dataSource = dataSources?.find(ds => ds.id === job.datasetId);
      
      const groupKey = dataset?.id || dataSource?.id || job.datasetId || 'unknown';
      const groupName = dataset?.name || dataSource?.name || job.datasetName || 'Unknown Dataset';
      const groupType = dataset ? 'dataset' : dataSource ? 'datasource' : 'unknown';
      
      if (!acc[groupKey]) {
        acc[groupKey] = {
          id: groupKey,
          name: groupName,
          type: groupType,
          jobs: []
        };
      }
      
      acc[groupKey].jobs.push(job);
      return acc;
    }, {} as Record<string, { id: string; name: string; type: string; jobs: typeof jobs }>);
  }, [jobs, datasets, dataSources]);

  // Convert to array and sort by most recent job
  const groupedJobsArray = useMemo(() => {
    return Object.values(groupedJobs).sort((a, b) => {
      const aLatest = Math.max(...a.jobs.map(j => new Date(j.createdAt || Date.now()).getTime()));
      const bLatest = Math.max(...b.jobs.map(j => new Date(j.createdAt || Date.now()).getTime()));
      return bLatest - aLatest;
    });
  }, [groupedJobs]);

  // History filter state
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  // Filter jobs based on selected filter
  const filteredGroups = useMemo(() => {
    return historyFilter === 'all' 
      ? groupedJobsArray 
      : groupedJobsArray.filter(group => group.id === historyFilter);
  }, [groupedJobsArray, historyFilter]);

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'training':
        return <Badge className="bg-blue-600">{status}</Badge>;
      case 'queued':
      case 'starting':
        return <Badge className="bg-yellow-600">{status}</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">{status}</Badge>;
      case 'failed':
        return <Badge className="bg-red-600">{status}</Badge>;
      case 'paused':
        return <Badge className="bg-gray-600">{status}</Badge>;
      case 'cancelled':
      case 'stopped':
        return <Badge className="bg-orange-600">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Training</h1>
          <p className="text-muted-foreground mt-2">
            Configure and train machine learning models
          </p>
        </div>
        <Button 
          className="gap-2" 
          onClick={handleStartTraining}
          disabled={isSubmitting || !selectedDataset || !targetVariable}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start New Training
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Configuration</CardTitle>
              <CardDescription>Configure your model training parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="optimization">Optimization</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Experiment Name</Label>
                    <Input 
                      placeholder="e.g., Customer Churn Prediction v1"
                      value={experimentName}
                      onChange={(e) => setExperimentName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dataset</Label>
                    {datasetsLoading || dataSourcesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading data sources...
                      </div>
                    ) : (
                      <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dataset or data source" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Datasets Group */}
                          {datasets && datasets.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                DATASETS
                              </div>
                              {datasets.map((dataset) => (
                                <SelectItem key={dataset.id} value={dataset.id}>
                                  {dataset.name}
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {dataset.rowCount?.toLocaleString()} records
                                  </span>
                                </SelectItem>
                              ))}
                            </>
                          )}
                          
                          {/* Data Sources Group */}
                          {dataSources && dataSources.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                                DATA SOURCES
                              </div>
                              {dataSources.map((source) => (
                                <SelectItem key={source.id} value={source.id}>
                                  {source.name}
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {source.status}
                                  </span>
                                </SelectItem>
                              ))}
                            </>
                          )}
                          
                          {/* Empty State */}
                          {(!datasets || datasets.length === 0) && (!dataSources || dataSources.length === 0) && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No data sources found. Upload a dataset or connect a data source first.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Problem Type</Label>
                    <Select value={problemType} onValueChange={(v) => setProblemType(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLASSIFICATION">Classification</SelectItem>
                        <SelectItem value="REGRESSION">Regression</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Algorithm</Label>
                    {algorithmsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading algorithms...
                      </div>
                    ) : (
                      <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAlgorithms.map((algo) => (
                            <SelectItem key={algo.id} value={algo.id}>
                              {algo.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Target Variable</Label>
                    <Select value={targetVariable} onValueChange={setTargetVariable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target column" />
                      </SelectTrigger>
                      <SelectContent>
                        {targetColumns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Train/Test Split: {trainTestSplit[0]}% / {100 - trainTestSplit[0]}%</Label>
                    </div>
                    <Slider
                      value={trainTestSplit}
                      onValueChange={setTrainTestSplit}
                      min={50}
                      max={90}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Cross-Validation Folds: {crossValidationFolds[0]}</Label>
                    </div>
                    <Slider
                      value={crossValidationFolds}
                      onValueChange={setCrossValidationFolds}
                      min={2}
                      max={10}
                      step={1}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Max Depth: {maxDepth[0]}</Label>
                    </div>
                    <Slider
                      value={maxDepth}
                      onValueChange={setMaxDepth}
                      min={1}
                      max={20}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Learning Rate: {learningRate[0]}</Label>
                    </div>
                    <Slider
                      value={learningRate}
                      onValueChange={setLearningRate}
                      min={0.001}
                      max={1}
                      step={0.001}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Number of Estimators</Label>
                    <Input 
                      type="number" 
                      value={nEstimators}
                      onChange={(e) => setNEstimators(parseInt(e.target.value) || 100)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Samples Split</Label>
                    <Input type="number" defaultValue="2" />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Samples Leaf</Label>
                    <Input type="number" defaultValue="1" />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Features</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="sqrt">Square Root</SelectItem>
                        <SelectItem value="log2">Log2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Random State (Seed)</Label>
                    <Input type="number" defaultValue="42" />
                  </div>
                </TabsContent>

                <TabsContent value="optimization" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>GPU Acceleration</Label>
                      <p className="text-sm text-muted-foreground">
                        Use GPU for faster training
                      </p>
                    </div>
                    <Switch checked={useGpu} onCheckedChange={setUseGpu} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Hyperparameter Tuning</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically find optimal parameters
                      </p>
                    </div>
                    <Switch checked={autoTune} onCheckedChange={setAutoTune} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Early Stopping</Label>
                      <p className="text-sm text-muted-foreground">
                        Stop training when no improvement
                      </p>
                    </div>
                    <Switch checked={earlyStopping} onCheckedChange={setEarlyStopping} />
                  </div>

                  <div className="space-y-2">
                    <Label>Patience (epochs)</Label>
                    <Input 
                      type="number" 
                      value={patience}
                      onChange={(e) => setPatience(parseInt(e.target.value) || 10)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Batch Size</Label>
                    <Select value={batchSize} onValueChange={setBatchSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16">16</SelectItem>
                        <SelectItem value="32">32</SelectItem>
                        <SelectItem value="64">64</SelectItem>
                        <SelectItem value="128">128</SelectItem>
                        <SelectItem value="256">256</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Evaluation Metric</Label>
                    <Select value={evaluationMetric} onValueChange={setEvaluationMetric}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accuracy">Accuracy</SelectItem>
                        <SelectItem value="precision">Precision</SelectItem>
                        <SelectItem value="recall">Recall</SelectItem>
                        <SelectItem value="f1">F1 Score</SelectItem>
                        <SelectItem value="auc">AUC-ROC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 gap-2"
                  onClick={handleStartTraining}
                  disabled={isSubmitting || !selectedDataset || !targetVariable}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting Training...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Training
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowSaveConfigModal(true)}
                  disabled={!selectedDataset || !targetVariable}
                >
                  <Save className="h-4 w-4" />
                  Save Config
                </Button>
                <LoadConfigDropdown
                  projectId={currentProject?.id}
                  datasetId={selectedDataset}
                  onLoad={async (configId) => {
                    try {
                      const config = await trainingConfigService.get(configId);
                      await trainingConfigService.recordUsage(configId);
                      
                      // Load all settings from config
                      setExperimentName(config.name);
                      if (config.datasetId) setSelectedDataset(config.datasetId);
                      if (config.algorithm) setSelectedAlgorithm(config.algorithm);
                      if (config.targetVariable) setTargetVariable(config.targetVariable);
                      if (config.problemType) setProblemType(config.problemType);
                      setTrainTestSplit([config.trainTestSplit * 100]);
                      setCrossValidationFolds([config.crossValidationFolds]);
                      if (config.hyperparameters?.max_depth) setMaxDepth([config.hyperparameters.max_depth]);
                      if (config.hyperparameters?.learning_rate) setLearningRate([config.hyperparameters.learning_rate]);
                      if (config.hyperparameters?.n_estimators) setNEstimators(config.hyperparameters.n_estimators);
                      setUseGpu(config.gpuAcceleration);
                      setAutoTune(config.autoHyperparameterTuning);
                      setEarlyStopping(config.earlyStopping);
                      setPatience(config.earlyStoppingPatience);
                      setBatchSize(config.batchSize.toString());
                      setEvaluationMetric(config.evaluationMetric);
                      
                      toast.success('Configuration loaded successfully!', {
                        description: `Loaded "${config.name}"`,
                      });
                    } catch (error: any) {
                      console.error('Failed to load configuration:', error);
                      toast.error('Failed to load configuration', {
                        description: error.message || 'Please try again',
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {algorithmsLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading stats...
                </div>
              ) : (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Selected Algorithm</div>
                    <div className="text-lg font-medium">
                      {selectedAlgorithmInfo?.displayName || 'Not selected'}
                    </div>
                    {selectedAlgorithmInfo?.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedAlgorithmInfo.description}
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Est. Training Time</div>
                    <div className="text-lg font-medium">
                      {selectedAlgorithmInfo?.estimatedTime || 'N/A'}
                    </div>
                    {selectedAlgorithmInfo?.complexity && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Complexity: {selectedAlgorithmInfo.complexity}
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Compute Resources</div>
                    <div className="text-lg font-medium">{computeResources.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {computeResources.description}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground">Cost Estimate</div>
                    <div className="text-lg font-medium">{costEstimate.cost}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {costEstimate.breakdown}
                    </div>
                  </div>
                  {selectedDatasetObj && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-muted-foreground">Dataset Size</div>
                        <div className="text-lg font-medium">
                          {selectedDatasetObj.rowCount.toLocaleString()} rows
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {selectedDatasetObj.columnCount} columns
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recommended Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {loadingRecommendations ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching recommendations...
                </div>
              ) : recommendedSettings ? (
                <>
                  <p className="text-muted-foreground">
                    For {selectedAlgorithmInfo?.displayName || selectedAlgorithm} on {problemType.toLowerCase()} tasks:
                  </p>
                  {recommendedSettings.reason && (
                    <p className="text-sm font-medium mb-2">
                      💡 {recommendedSettings.reason}
                    </p>
                  )}
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {recommendedSettings.hyperparameters?.max_depth !== undefined && (
                      <li>Max depth: {recommendedSettings.hyperparameters.max_depth}</li>
                    )}
                    {recommendedSettings.hyperparameters?.learning_rate !== undefined && (
                      <li>Learning rate: {recommendedSettings.hyperparameters.learning_rate}</li>
                    )}
                    {recommendedSettings.hyperparameters?.n_estimators !== undefined && (
                      <li>Estimators: {recommendedSettings.hyperparameters.n_estimators}</li>
                    )}
                    {!useGpu && selectedAlgorithmInfo?.complexity === 'high' && (
                      <li>💡 Consider GPU acceleration for better performance</li>
                    )}
                  </ul>
                  {recommendedSettings.expectedAccuracy !== undefined && (
                    <div className="mt-3 p-2 bg-muted rounded-md">
                      <div className="text-xs text-muted-foreground">Expected Accuracy</div>
                      <div className="text-base font-semibold">
                        {(recommendedSettings.expectedAccuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {recommendedSettings.estimatedTrainingTime !== undefined && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Est. training time: {Math.round(recommendedSettings.estimatedTrainingTime / 60)} minutes
                    </div>
                  )}
                </>
              ) : selectedDataset && targetVariable ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  No recommendations available for this dataset
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a dataset and target variable to get AI-powered recommendations
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Training Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Training Jobs
              </CardTitle>
              <CardDescription>Monitor active and recent training jobs</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Filter Dropdown */}
              {jobs && jobs.length > 0 && (
                <Select value={historyFilter} onValueChange={setHistoryFilter}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Filter by dataset or data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ({jobs.length} jobs)</SelectItem>
                    {datasets && datasets.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          DATASETS
                        </div>
                        {datasets.map((dataset) => {
                          const jobCount = jobs.filter(j => j.datasetId === dataset.id).length;
                          if (jobCount === 0) return null;
                          return (
                            <SelectItem key={dataset.id} value={dataset.id}>
                              {dataset.name} ({jobCount} {jobCount === 1 ? 'job' : 'jobs'})
                            </SelectItem>
                          );
                        })}
                      </>
                    )}
                    {dataSources && dataSources.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                          DATA SOURCES
                        </div>
                        {dataSources.map((source) => {
                          const jobCount = jobs.filter(j => j.datasetId === source.id).length;
                          if (jobCount === 0) return null;
                          return (
                            <SelectItem key={source.id} value={source.id}>
                              {source.name} ({jobCount} {jobCount === 1 ? 'job' : 'jobs'})
                            </SelectItem>
                          );
                        })}
                      </>
                    )}
                  </SelectContent>
                </Select>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={refetchJobs}
                disabled={jobsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${jobsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {jobsLoading && !jobs ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading training jobs...
            </div>
          ) : jobsError ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              {jobsError}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg p-4">
                <Accordion type="multiple" defaultValue={[]} className="space-y-4">
                  {filteredGroups.slice(0, 5).map((group) => (
                    <AccordionItem 
                      key={group.id} 
                      value={group.id} 
                      className="border-2 rounded-xl px-5 py-1 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-sm ${
                            group.type === 'dataset' 
                              ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900' 
                              : 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900'
                          }`}>
                            <Database className={`h-6 w-6 ${
                              group.type === 'dataset'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-purple-600 dark:text-purple-400'
                            }`} />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-base">{group.name}</div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {group.type === 'dataset' ? 'Dataset' : 'Data Source'} • {group.jobs.length} {group.jobs.length === 1 ? 'training run' : 'training runs'}
                            </div>
                          </div>
                          <Badge variant="secondary" className="h-7 px-3 font-medium">
                            {group.jobs.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          {group.jobs
                            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                            .map((job) => (
                              <TrainingJobCard
                                key={job.id}
                                job={job}
                                onViewProgress={(jobId) => {
                                  setActiveJobId(jobId);
                                  setShowProgressModal(true);
                                }}
                                onViewResults={(jobId) => {
                                  setActiveJobId(jobId);
                                  setShowResultsModal(true);
                                }}
                                onActivate={handleActivate}
                                onStop={handleStopJob}
                                onResume={handleResumeJob}
                              />
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* View All Button - Show if more than 5 groups */}
              {filteredGroups.length > 5 && (
                <div className="p-4 bg-gradient-to-br from-slate-50/30 to-gray-50/30 dark:from-slate-900/30 dark:to-gray-900/30 rounded-lg">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => toast.info('Full history view coming soon! For now, use the filter above to view specific datasets.')}
                  >
                    <ChevronRight className="h-4 w-4" />
                    View All {groupedJobsArray.length} Datasets ({jobs.length} total jobs)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No training jobs yet</p>
              <p className="text-sm">Start your first training job to see it here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Progress Modal */}
      {showProgressModal && activeJobId && (
        <TrainingProgressModal 
          open={showProgressModal}
          onOpenChange={setShowProgressModal}
          jobId={activeJobId}
          jobName={jobs?.find(j => j.id === activeJobId)?.jobName}
          onStop={handleStopJob}
          onComplete={(jobId) => {
            setShowProgressModal(false);
            setShowResultsModal(true); // ← CHANGED: Open results modal instead of toast
            refetchJobs();
            refreshCurrentProject(); // ← Refresh project stats after training completes
          }}
        />
      )}

      {/* Training Results Modal */}
      <TrainingResultsModal
        open={showResultsModal}
        onOpenChange={setShowResultsModal}
        jobId={activeJobId}
        onDeploy={(jobId) => {
          // Modal handles deployment internally and stays open
          // Just refresh jobs list to show deployment status
          refetchJobs();
          refreshCurrentProject();
        }}
      />

      {/* Save Configuration Modal */}
      <SaveConfigModal
        open={showSaveConfigModal}
        onOpenChange={setShowSaveConfigModal}
        currentConfig={{
          algorithm: selectedAlgorithm,
          algorithmDisplayName: selectedAlgorithmInfo?.displayName,
          targetVariable,
          problemType,
          trainTestSplit: trainTestSplit[0] / 100,
          crossValidationFolds: crossValidationFolds[0],
          hyperparameters: {
            max_depth: maxDepth[0],
            learning_rate: learningRate[0],
            n_estimators: nEstimators,
          },
          gpuAcceleration: useGpu,
          autoHyperparameterTuning: autoTune,
          earlyStopping,
          earlyStoppingPatience: patience,
          batchSize: parseInt(batchSize),
          evaluationMetric,
        }}
        onSave={async (request) => {
          await trainingConfigService.save(request);
        }}
        projectId={currentProject?.id}
        datasetId={selectedDataset}
        datasetName={selectedDatasetObj?.name}
      />
    </div>
  );
}