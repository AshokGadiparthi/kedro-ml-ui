/**
 * ML Flow Wizard Component (Simplified - No Job History)
 * Three-step wizard: Data Loading → Feature Engineering → Model Selection
 */

import { useState, useCallback } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useDatasets } from '../../../hooks/useDatasets';
import { useDataSources } from '../../../hooks/useDataSources';
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
  Zap,
  Brain,
  Settings2,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Check,
  Sliders,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { MLFlowProgressModal } from './MLFlowProgressModal';
import { MLFlowResultsModal } from './MLFlowResultsModal';
import * as datasetService from '../../../services/datasets/datasetService';
import * as deploymentService from '../../../services/deployment/deploymentService';
import * as pipelineService from '../../../services/pipeline/pipelineService';
import type { ProblemType, ColumnInfo } from '../../../services/api/types';

type WizardStep = 'data-loading' | 'feature-engineering' | 'model-selection';

export function MLFlowWizard() {
  const { currentProject, refreshCurrentProject } = useProject();
  const { datasets, loading: datasetsLoading } = useDatasets(currentProject?.id);
  const { dataSources, loading: dataSourcesLoading } = useDataSources(currentProject?.id);

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
  const [datasetFilePath, setDatasetFilePath] = useState<string>('');
  
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

  // Load columns when dataset is selected
  const handleDatasetChange = async (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setTargetColumn('');
    setAvailableColumns([]);
    setDataLoaded(false);

    if (!datasetId) return;

    const isDataset = datasets.some((d) => d.id === datasetId);
    const isDataSource = dataSources.some((ds) => ds.id === datasetId);

    if (!isDataset && !isDataSource) {
      console.warn('Selected ID is neither a dataset nor a data source:', datasetId);
      return;
    }

    if (isDataset) {
      try {
        setLoadingColumns(true);
        const response = await datasetService.getDatasetColumns(datasetId);
        const columns = Array.isArray(response) ? response : (response as any).columns || [];
        setAvailableColumns(columns);
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

      console.log('🚀 Starting ML Flow pipeline...');
      
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

      console.log('✅ ML Flow pipeline response:', response);
      
      toast.success('ML Flow pipeline started successfully!');
      
      // Set active job ID from response and show progress modal
      if (response.job_id) {
        console.log('📊 Opening progress modal for job:', response.job_id);
        setActiveJobId(response.job_id);
        setShowProgressModal(true);
      } else {
        console.warn('⚠️ No job_id in response:', response);
      }
    } catch (error: any) {
      console.error('❌ ML Flow pipeline error:', error);
      toast.error(error.message || 'Failed to start ML Flow pipeline');
    } finally {
      setStarting(false);
    }
  };

  // Handle job completion
  const handleJobComplete = useCallback((jobId: string) => {
    console.log('✅ Job completed:', jobId);
    setActiveJobId(jobId);
    setShowProgressModal(false);
    setShowResultsModal(true);
    refreshCurrentProject();
  }, [refreshCurrentProject]);

  // Stop ML Flow job
  const handleStopJob = async (jobId: string) => {
    try {
      // TODO: Add stop job API endpoint
      toast.success('ML Flow job stopped');
      setShowProgressModal(false);
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to deploy model');
    }
  };

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const canProceedFromDataLoading = selectedDatasetId && targetColumn && dataLoaded;
  const canProceedFromFeatureEngineering = featureEngineeringCompleted;
  const canStart = selectedDatasetId && targetColumn && !starting;

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
                    
                    {datasets.length === 0 && (
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
              </div>
            </div>

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
