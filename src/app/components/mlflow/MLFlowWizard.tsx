/**
 * ML Flow Wizard Component
 * Three-step wizard: Data Loading → Feature Engineering → Model Selection
 */

import { useState, useCallback } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useDatasets } from '../../../hooks/useDatasets';
import { useDataSources } from '../../../hooks/useDataSources';
import { useAutoMLJobs } from '../../../hooks/useAutoML';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import {
  Sparkles,
  Play,
  Database,
  Target,
  Zap,
  Brain,
  TrendingUp,
  Layers,
  Settings2,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Check,
  Sliders,
  ArrowRight,
  FileText,
  Filter,
} from 'lucide-react';
import { AutoMLProgressModal } from '../AutoMLProgressModal';
import { AutoMLResultsModal } from '../AutoMLResultsModal';
import { AutoMLJobCard } from '../AutoMLJobCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import * as automlService from '../../../services/automl/automlService';
import * as datasetService from '../../../services/datasets/datasetService';
import * as deploymentService from '../../../services/deployment/deploymentService';
import * as pipelineService from '../../../services/pipeline/pipelineService';
import type { ProblemType, ColumnInfo } from '../../../services/api/types';
import { MLFlowProgressModal } from './MLFlowProgressModal';
import { MLFlowResultsModal } from './MLFlowResultsModal';

type WizardStep = 'data-loading' | 'feature-engineering' | 'model-selection';

export function MLFlowWizard() {
  const { currentProject, refreshCurrentProject } = useProject();
  const { datasets, loading: datasetsLoading } = useDatasets(currentProject?.id);
  const { dataSources, loading: dataSourcesLoading } = useDataSources(currentProject?.id);
  const { jobs, loading: jobsLoading, refetch: refetchJobs } = useAutoMLJobs(currentProject?.id);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('data-loading');

  // Configuration state
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [jobName, setJobName] = useState<string>('');
  const [problemType, setProblemType] = useState<ProblemType>('classification');
  const [maxTime, setMaxTime] = useState(60);
  const [accuracySpeed, setAccuracySpeed] = useState<'low' | 'medium' | 'high'>('high');
  const [interpretability, setInterpretability] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Feature Engineering Configuration
  const [enableFeatureEngineering, setEnableFeatureEngineering] = useState(true);
  const [scalingMethod, setScalingMethod] = useState<'standard' | 'minmax' | 'robust' | 'none'>('standard');
  const [handleMissingValues, setHandleMissingValues] = useState(true);
  const [handleOutliers, setHandleOutliers] = useState(true);
  const [encodeCategories, setEncodeCategories] = useState(true);
  const [createPolynomialFeatures, setCreatePolynomialFeatures] = useState(false);
  const [createInteractions, setCreateInteractions] = useState(false);
  
  // Advanced configuration
  const [cvFolds, setCvFolds] = useState(5);
  const [enableHyperparameterTuning, setEnableHyperparameterTuning] = useState(true);
  
  // Collapsible state
  const [mlFlowConfigOpen, setMLFlowConfigOpen] = useState(false);
  const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);

  // Columns for selected dataset
  const [availableColumns, setAvailableColumns] = useState<ColumnInfo[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [datasetFilePath, setDatasetFilePath] = useState<string>(''); // Store file_path from columns API
  
  // Data loading state
  const [loadingData, setLoadingData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Feature engineering state
  const [runningFeatureEngineering, setRunningFeatureEngineering] = useState(false);
  const [featureEngineeringCompleted, setFeatureEngineeringCompleted] = useState(false);

  // Modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // History filter state
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  // Load columns when dataset is selected
  const handleDatasetChange = async (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setTargetColumn('');
    setAvailableColumns([]);
    setDataLoaded(false); // Reset data loaded state

    if (!datasetId) return;

    // Check if this is a dataset or data source
    const isDataset = datasets.some((d) => d.id === datasetId);
    const isDataSource = dataSources.some((ds) => ds.id === datasetId);

    if (!isDataset && !isDataSource) {
      console.warn('Selected ID is neither a dataset nor a data source:', datasetId);
      return;
    }

    // Only load columns for datasets
    if (isDataset) {
      try {
        setLoadingColumns(true);
        const response = await datasetService.getDatasetColumns(datasetId);
        // Handle both array response and object response with columns property
        const columns = Array.isArray(response) ? response : (response as any).columns || [];
        setAvailableColumns(columns);
        // Store file_path from columns API
        const filePath = (response as any).file_path;
        if (filePath) {
          setDatasetFilePath(filePath);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load columns');
      } finally {
        setLoadingColumns(false);
      }
    } else {
      toast.info('Data sources require table/query selection. This feature is coming soon!');
      setSelectedDatasetId('');
    }
  };

  // Load data pipeline
  const handleLoadData = async () => {
    if (!selectedDatasetId || !targetColumn) {
      toast.error('Please select both dataset and target column');
      return;
    }

    try {
      setLoadingData(true);

      // Debug: Log the selected dataset to see what properties are available
      console.log('Selected Dataset:', selectedDataset);
      console.log('File Path:', selectedDataset?.filePath);
      console.log('File Name:', selectedDataset?.fileName);

      const response = await pipelineService.runDataLoadingPipeline({
        project_id: currentProject?.id || '',
        parameters: {
          data_loading: {
            dataset_id: selectedDatasetId,
            target_column: targetColumn,
            filepath: datasetFilePath || selectedDataset?.filePath || selectedDataset?.fileName,
          },
        },
      });

      toast.success('Data loaded successfully!');
      setDataLoaded(true);
      
      // You can handle the response here if needed
      console.log('Data loading pipeline response:', response);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
      setDataLoaded(false);
    } finally {
      setLoadingData(false);
    }
  };

  // Run Feature Engineering pipeline
  const handleRunFeatureEngineering = async () => {
    if (!selectedDatasetId) {
      toast.error('Please select a dataset first');
      return;
    }

    try {
      setRunningFeatureEngineering(true);

      const response = await pipelineService.runFeatureEngineeringPipeline({
        project_id: currentProject?.id || '',
        parameters: {
          feature_engineering: {
            dataset_id: selectedDatasetId,
            
            // // ID Column Auto-Detection
            // drop_id_columns: true,
            // id_cardinality_threshold: 0.95,
            // id_keywords: JSON.stringify(['id', 'uid', 'customer', 'user', 'account', 'reference']),
            
            // // Polynomial Features
            // polynomial_degree: 2,
            // include_bias: false,
            // polynomial_features: createPolynomialFeatures,
            // max_polynomial_features: 50,
            // max_output_features: 100,
            
            // // Variance-Based Filtering
            // variance_threshold: 0.01,
            // apply_variance_filter: true,
            
            // // Explosion Safety Validation
            // max_features_allowed: 500,
            // validate_feature_count: true,
            
            // // Categorical Handling
            // encoding_method: 'smart',
            // max_categories_to_onehot: 10,
            // max_categories_to_label: 50,
            // max_features_from_encoding: 100,
            // handle_unknown: 'ignore',
            // min_frequency: 1,
            // drop_first_category: true,
            // encode_categories: encodeCategories,
            
            // // Scaling & Normalization
            // scaling_method: scalingMethod,
            // scale_numeric_only: true,
            
            // // Feature Selection
            // feature_selection_method: 'importance',
            // n_features: 10,
            // test_size: 0.2,
            // correlation_threshold: 0.95,
            // importance_method: 'tree',
            
            // // Problem Type Detection
            // auto_detect_problem_type: true,
            // problem_type_override: null,
            
            // // Additional options from UI
            // handle_missing_values: handleMissingValues,
            // handle_outliers: handleOutliers,
            // create_interactions: createInteractions,
          },
        },
      });

      toast.success('Feature engineering completed successfully!');
      setFeatureEngineeringCompleted(true);
      
      console.log('Feature engineering pipeline response:', response);
    } catch (error: any) {
      toast.error(error.message || 'Failed to run feature engineering');
      setFeatureEngineeringCompleted(false);
    } finally {
      setRunningFeatureEngineering(false);
    }
  };

  // Start ML Flow
  const handleStartMLFlow = async () => {
    if (!selectedDatasetId) {
      toast.error('Please select a dataset');
      return;
    }

    if (!targetColumn) {
      toast.error('Please select a target column');
      return;
    }

    try {
      setStarting(true);

      const response = await pipelineService.runCompletePipeline({
        project_id: currentProject?.id || '',
        parameters: {
          data_loading: {
            dataset_id: selectedDatasetId,
            target_column: targetColumn,
            filepath: datasetFilePath || selectedDataset?.filePath || selectedDataset?.fileName,
          },
          feature_engineering: {
            dataset_id: selectedDatasetId,
            // All parameters commented out for now
          },
          model_selection: {
            dataset_id: selectedDatasetId,
            target_column: targetColumn,
            problem_type: problemType,
            max_training_time_minutes: maxTime,
            accuracy_vs_speed: accuracySpeed,
            interpretability: interpretability,
            cv_folds: cvFolds,
            enable_hyperparameter_tuning: enableHyperparameterTuning,
          },
        },
      });

      toast.success('ML Flow pipeline started successfully!');
      
      // Set active job ID from response
      if (response.job_id) {
        setActiveJobId(response.job_id);
        setShowProgressModal(true);
      }
      
      refetchJobs();

      console.log('Complete pipeline response:', response);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start ML Flow pipeline');
    } finally {
      setStarting(false);
    }
  };

  // View progress for running job
  const handleViewProgress = (jobId: string) => {
    setActiveJobId(jobId);
    setShowProgressModal(true);
  };

  // View results for completed job
  const handleViewResults = (jobId: string) => {
    setActiveJobId(jobId);
    setShowResultsModal(true);
  };

  // Handle job completion
  const handleJobComplete = useCallback((jobId: string) => {
    setActiveJobId(jobId);
    setShowProgressModal(false);
    setShowResultsModal(true);
    refetchJobs();
    refreshCurrentProject();
  }, []);

  // Stop ML Flow job
  const handleStopJob = async (jobId: string) => {
    try {
      await automlService.stopAutoMLJob(jobId);
      toast.success('ML Flow job stopped');
      setShowProgressModal(false);
      refetchJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to stop job');
    }
  };

  // Deploy model
  const handleDeploy = async (jobId: string) => {
    try {
      const response = await deploymentService.deployFromAutoML(jobId, {
        name: undefined,
        description: 'ML Flow deployment',
      });
      
      toast.success(`Model deployed successfully as ${response.versionLabel}!`);
      setShowResultsModal(false);
      refetchJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to deploy model');
    }
  };

  // Activate a deployed version
  const handleActivate = async (deploymentId: string) => {
    try {
      await deploymentService.activateDeployment(deploymentId);
      toast.success('Deployment activated successfully!');
      refetchJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate deployment');
    }
  };

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const canProceedFromDataLoading = selectedDatasetId && targetColumn && dataLoaded; // Require data loaded
  const canProceedFromFeatureEngineering = featureEngineeringCompleted; // Require feature engineering completed
  const canStart = selectedDatasetId && targetColumn && !starting;

  // Group jobs by dataset/data source
  const groupedJobs = jobs.reduce((acc, job) => {
    const dataset = datasets.find(d => d.id === job.datasetId);
    const dataSource = dataSources.find(ds => ds.id === job.datasetId);
    
    const groupKey = dataset?.id || dataSource?.id || job.datasetId || 'unknown';
    const groupName = dataset?.name || dataSource?.name || 'Unknown Source';
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

  const groupedJobsArray = Object.values(groupedJobs).sort((a, b) => {
    const aLatest = Math.max(...a.jobs.map(j => new Date(j.createdAt).getTime()));
    const bLatest = Math.max(...b.jobs.map(j => new Date(j.createdAt).getTime()));
    return bLatest - aLatest;
  });

  const filteredGroups = historyFilter === 'all' 
    ? groupedJobsArray 
    : groupedJobsArray.filter(group => group.id === historyFilter);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Project Selected</h3>
          <p className="text-muted-foreground">Select a project to use ML Flow</p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'data-loading', name: 'Data Loading', icon: Database, description: 'Select and load your data' },
    { id: 'feature-engineering', name: 'Feature Engineering', icon: Sliders, description: 'Configure preprocessing & features' },
    { id: 'model-selection', name: 'Model Selection', icon: Brain, description: 'Configure and train models' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            ML Flow Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete machine learning workflow - from data to deployment
          </p>
        </div>
      </div>

      {/* Wizard Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = index < currentStepIndex;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold text-sm ${isActive ? 'text-primary' : ''}`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                      {step.description}
                    </div>
                  </div>
                </div>
                {!isLast && (
                  <div className="flex-1 max-w-[100px] mb-8">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Data Loading */}
        {currentStep === 'data-loading' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Step 1: Data Loading</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dataset Selection */}
              <div className="space-y-2">
                <Label>Training Data Source *</Label>
                <Select
                  value={selectedDatasetId}
                  onValueChange={handleDatasetChange}
                  disabled={datasetsLoading || dataSourcesLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select dataset or data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          DATASETS
                        </div>
                        {datasets.map((dataset) => (
                          <SelectItem key={dataset.id} value={dataset.id}>
                            {dataset.name}
                            <span className="ml-2 text-xs text-muted-foreground">
                              {dataset.recordCount?.toLocaleString()} records
                            </span>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {dataSources.length > 0 && (
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
                    
                    {datasets.length === 0 && dataSources.length === 0 && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No data sources found.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {selectedDataset && (
                  <p className="text-xs text-muted-foreground">
                    {selectedDataset.columnCount} columns • {selectedDataset.fileSize}
                  </p>
                )}
              </div>

              {/* Target Column with Prepare Button */}
              <div className="space-y-2">
                <Label htmlFor="target">Target Column *</Label>
                <div className="flex gap-2">
                  <Select
                    value={targetColumn}
                    onValueChange={setTargetColumn}
                    disabled={!selectedDatasetId || loadingColumns}
                  >
                    <SelectTrigger id="target" className="flex-1">
                      <SelectValue placeholder={loadingColumns ? 'Loading...' : 'Select target'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((col) => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name} ({(col as any).dtype || col.dataType || 'unknown'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDatasetId && targetColumn && !dataLoaded && (
                    <Button
                      onClick={handleLoadData}
                      disabled={loadingData}
                      className="gap-2 shrink-0"
                      size="default"
                    >
                      {loadingData ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Prepare
                        </>
                      )}
                    </Button>
                  )}
                  {dataLoaded && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-md shrink-0">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Ready</span>
                    </div>
                  )}
                </div>
                {dataLoaded && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Dataset prepared with target: {targetColumn}
                  </p>
                )}
              </div>
            </div>

            {/* Dataset Info */}
            {selectedDataset && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                      Dataset Information
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Records</div>
                        <div className="font-medium">{selectedDataset.recordCount?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Columns</div>
                        <div className="font-medium">{selectedDataset.columnCount}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Size</div>
                        <div className="font-medium">{selectedDataset.fileSize}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => setCurrentStep('feature-engineering')}
                disabled={!canProceedFromDataLoading}
                className="gap-2"
              >
                Next: Feature Engineering
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Feature Engineering */}
        {currentStep === 'feature-engineering' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Step 2: Feature Engineering</h3>
              </div>
              {!featureEngineeringCompleted && (
                <Button
                  onClick={handleRunFeatureEngineering}
                  disabled={runningFeatureEngineering}
                  className="gap-2"
                  size="lg"
                >
                  {runningFeatureEngineering ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Run Feature Engineering
                    </>
                  )}
                </Button>
              )}
              {featureEngineeringCompleted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-md">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">Completed</span>
                </div>
              )}
            </div>

            {/* Preprocessing Options */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Data Preprocessing</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="missing"
                      checked={handleMissingValues}
                      onCheckedChange={(checked) => setHandleMissingValues(checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor="missing" className="font-medium text-sm cursor-pointer">
                        Handle Missing Values
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically impute or remove missing data
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="outliers"
                      checked={handleOutliers}
                      onCheckedChange={(checked) => setHandleOutliers(checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor="outliers" className="font-medium text-sm cursor-pointer">
                        Handle Outliers
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Detect and handle outliers in numerical columns
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="encode"
                      checked={encodeCategories}
                      onCheckedChange={(checked) => setEncodeCategories(checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor="encode" className="font-medium text-sm cursor-pointer">
                        Encode Categorical Features
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Convert categorical variables to numerical format
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="space-y-2 flex-1">
                      <Label>Scaling Method</Label>
                      <Select value={scalingMethod} onValueChange={(v) => setScalingMethod(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Scaling</SelectItem>
                          <SelectItem value="minmax">Min-Max Scaling</SelectItem>
                          <SelectItem value="robust">Robust Scaling</SelectItem>
                          <SelectItem value="none">No Scaling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Feature Creation */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Feature Creation (Advanced)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="polynomial"
                      checked={createPolynomialFeatures}
                      onCheckedChange={(checked) => setCreatePolynomialFeatures(checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor="polynomial" className="font-medium text-sm cursor-pointer">
                        Polynomial Features
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create polynomial and interaction features
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="interactions"
                      checked={createInteractions}
                      onCheckedChange={(checked) => setCreateInteractions(checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor="interactions" className="font-medium text-sm cursor-pointer">
                        Feature Interactions
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically detect and create feature interactions
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Summary */}
            <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
                    Feature Engineering Configuration
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    {[
                      handleMissingValues && 'Missing values',
                      handleOutliers && 'Outliers',
                      encodeCategories && 'Categorical encoding',
                      scalingMethod !== 'none' && `${scalingMethod} scaling`,
                      createPolynomialFeatures && 'Polynomial features',
                      createInteractions && 'Feature interactions',
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                </div>
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('data-loading')} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep('model-selection')} 
                className="gap-2"
                disabled={!canProceedFromFeatureEngineering}
              >
                Next: Model Selection
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Model Selection */}
        {currentStep === 'model-selection' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Step 3: Model Selection & Training</h3>
              </div>
              <Button
                onClick={handleStartMLFlow}
                size="lg"
                className="gap-2"
                disabled={!canStart}
              >
                <Play className="h-5 w-5" />
                Start ML Flow
              </Button>
            </div>

            {/* Job Name */}
            <div className="space-y-2">
              <Label htmlFor="jobName">Job Name (Optional)</Label>
              <Input
                id="jobName"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="ML Flow Run - Today"
              />
            </div>

            {/* ML Flow Configuration - COLLAPSIBLE */}
            <Collapsible open={mlFlowConfigOpen} onOpenChange={setMLFlowConfigOpen}>
              <Card className="p-6">
                <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    {mlFlowConfigOpen ? (
                      <ChevronDown className="h-5 w-5 text-primary transition-transform" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-primary transition-transform" />
                    )}
                    <Settings2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">ML Flow Configuration</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {!mlFlowConfigOpen && (
                      <span className="text-sm text-muted-foreground">
                        {problemType === 'time_series' ? 'Time Series' : problemType.charAt(0).toUpperCase() + problemType.slice(1)} • {maxTime} min • {accuracySpeed} accuracy
                      </span>
                    )}
                    <Badge variant="outline">Optional</Badge>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Problem Type */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Problem Type</label>
                      <div className="flex gap-2">
                        {(['classification', 'regression', 'time_series'] as const).map((type) => (
                          <Button
                            key={type}
                            variant={problemType === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setProblemType(type as ProblemType)}
                            className="flex-1"
                          >
                            {type === 'time_series' ? 'Time Series' : type.charAt(0).toUpperCase() + type.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Max Training Time */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Max Training Time: {maxTime} min
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="180"
                        step="10"
                        value={maxTime}
                        onChange={(e) => setMaxTime(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>10 min</span>
                        <span>180 min</span>
                      </div>
                    </div>

                    {/* Accuracy vs Speed */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Accuracy vs Speed</label>
                      <div className="flex gap-2">
                        {(['low', 'medium', 'high'] as const).map((level) => (
                          <Button
                            key={level}
                            variant={accuracySpeed === level ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAccuracySpeed(level)}
                            className="flex-1"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Interpretability */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Interpretability</label>
                      <div className="flex gap-2">
                        {(['low', 'medium', 'high'] as const).map((level) => (
                          <Button
                            key={level}
                            variant={interpretability === level ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setInterpretability(level)}
                            className="flex-1"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Advanced Configuration */}
            <Collapsible open={advancedConfigOpen} onOpenChange={setAdvancedConfigOpen}>
              <Card className="p-6">
                <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    {advancedConfigOpen ? (
                      <ChevronDown className="h-5 w-5 text-primary transition-transform" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-primary transition-transform" />
                    )}
                    <Settings2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Advanced Configuration</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {!advancedConfigOpen && (
                      <span className="text-sm text-muted-foreground">
                        {cvFolds}-fold CV • {enableHyperparameterTuning ? 'Hyperparameter tuning enabled' : 'No tuning'}
                      </span>
                    )}
                    <Badge variant="outline">For Power Users</Badge>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CV Folds */}
                    <div className="space-y-2">
                      <Label htmlFor="cvFolds">Cross-Validation Folds</Label>
                      <Select value={cvFolds.toString()} onValueChange={(v) => setCvFolds(parseInt(v))}>
                        <SelectTrigger id="cvFolds">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Folds</SelectItem>
                          <SelectItem value="5">5 Folds (Recommended)</SelectItem>
                          <SelectItem value="10">10 Folds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Hyperparameter Tuning */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Hyperparameter Tuning</label>
                      <div className="flex gap-2">
                        {(['true', 'false'] as const).map((value) => (
                          <Button
                            key={value}
                            variant={enableHyperparameterTuning === (value === 'true') ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEnableHyperparameterTuning(value === 'true')}
                            className="flex-1"
                          >
                            {value === 'true' ? 'Enabled' : 'Disabled'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('feature-engineering')} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ML Flow Job History */}
      {jobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-lg">ML Flow History</h3>
            <div className="flex items-center gap-3">
              <Select value={historyFilter} onValueChange={setHistoryFilter}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Filter by dataset or data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({jobs.length} jobs)</SelectItem>
                  {datasets.length > 0 && (
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
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {jobs.length} total {jobs.length === 1 ? 'job' : 'jobs'}
              </Badge>
            </div>
          </div>

          {jobsLoading ? (
            <Card className="p-8">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/50 dark:to-gray-900/50">
              <Accordion type="multiple" defaultValue={[]} className="space-y-4">
                {filteredGroups.slice(0, 3).map((group) => (
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
                            {group.type === 'dataset' ? 'Dataset' : 'Data Source'} • {group.jobs.length} {group.jobs.length === 1 ? 'run' : 'runs'}
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
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((job) => (
                            <AutoMLJobCard
                              key={job.jobId}
                              job={job}
                              onViewProgress={handleViewProgress}
                              onViewResults={handleViewResults}
                              onDeploy={handleDeploy}
                              onActivate={handleActivate}
                            />
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          )}
        </div>
      )}

      {/* Progress Modal */}
      <MLFlowProgressModal
        open={showProgressModal}
        onOpenChange={setShowProgressModal}
        jobId={activeJobId}
        jobName={jobName}
        onStop={handleStopJob}
        onComplete={handleJobComplete}
      />

      {/* Results Modal */}
      <MLFlowResultsModal
        open={showResultsModal}
        onOpenChange={setShowResultsModal}
        jobId={activeJobId}
        onDeploy={handleDeploy}
      />
    </div>
  );
}