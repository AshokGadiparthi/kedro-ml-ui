/**
 * ML Flow Wizard Component - Complete with All Features
 * Three-step wizard: Data Loading → Feature Engineering → Model Selection
 * Matches AutoML screen functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useAuth } from '../../../contexts/AuthContext';
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
import { Slider } from '../ui/slider';
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
  Info,
  TrendingUp,
} from 'lucide-react';
import { MLFlowProgressModal } from './MLFlowProgressModal';
import { MLFlowResultsModal } from './MLFlowResultsModal';
import { MLFlowDatasetTreePanel } from './MLFlowDatasetTreePanel';
import * as datasetService from '../../../services/datasets/datasetService';
import * as deploymentService from '../../../services/deployment/deploymentService';
import * as pipelineService from '../../../services/pipeline/pipelineService';
import * as modelRegistryService from '../../../services/registry/modelRegistryService';
import { collectionService } from '@/services';
import type { ProblemType, ColumnInfo } from '../../../services/api/types';
import type { DatasetCollection } from '@/types/datasetCollection';

type WizardStep = 'data-loading' | 'feature-engineering' | 'model-selection';

interface MLFlowWizardProps {
  onNavigateToRegistry?: () => void;
}

export function MLFlowWizard({ onNavigateToRegistry }: MLFlowWizardProps = {}) {
  const { currentProject } = useProject();
  const { user } = useAuth();
  const { datasets, loading: datasetsLoading } = useDatasets(currentProject?.id);
  const { dataSources, loading: dataSourcesLoading } = useDataSources(currentProject?.id);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('data-loading');

  // Configuration state
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [jobName, setJobName] = useState<string>('');
  const [jobNameManuallyEdited, setJobNameManuallyEdited] = useState(false); // Track if user edited name
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
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['logistic_regression', 'xgboost']);
  
  // Collapsible state
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

  // NEW: State for tracking phase 4 job
  const [phase4JobId, setPhase4JobId] = useState<string | null>(null);
  const [pipelineRequest, setPipelineRequest] = useState<any>(null);
  
  // NEW: State for storing baseline (phase3) results
  const [baselineResults, setBaselineResults] = useState<{
    bestScore: number;
    bestAlgorithm: string;
    algorithmsCount: number;
    timeSeconds: number;
    algorithms?: Array<{
      name: string;
      score: number;
    }>;
  } | null>(null);
  
  // Multi-Table Collections State
  const [multiTableCollections, setMultiTableCollections] = useState<DatasetCollection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  
  // Tree panel state
  const [treePanelCollapsed, setTreePanelCollapsed] = useState(false);
  
  // Dataset metadata for Kedro source code generation
  const [datasetCollectionId, setDatasetCollectionId] = useState<string>('');
  const [datasetPath, setDatasetPath] = useState<string>('');
  
  // Fetch multi-table collections
  useEffect(() => {
    const fetchCollections = async () => {
      if (currentProject?.id) {
        setCollectionsLoading(true);
        try {
          const collections = await collectionService.list(currentProject.id);
          console.log('📦 ML Flow: Loaded collections:', collections);
          setMultiTableCollections(collections);
        } catch (error) {
          console.error('❌ Failed to fetch collections:', error);
          // Don't show error toast, just fail silently
        } finally {
          setCollectionsLoading(false);
        }
      }
    };
    
    fetchCollections();
  }, [currentProject?.id]);
  
  // Get merged/derived datasets from collections
  const mergedDatasets = multiTableCollections
    .map(collection => {
      // Find the derived dataset in the tables array
      const derivedTable = collection.tables?.find(table => table.role === 'derived');
      if (derivedTable && derivedTable.datasetId) {
        return {
          id: derivedTable.datasetId,
          name: `${collection.name} - Merged Dataset`,
          collectionName: collection.name,
          rowCount: derivedTable.rowCount,
          columnCount: derivedTable.columnCount,
          isMerged: true,
        };
      }
      return null;
    })
    .filter((dataset): dataset is NonNullable<typeof dataset> => dataset !== null);

  // 🎯 AUTO-GENERATE MODEL NAME: {datasetName}__{targetColumn}
  useEffect(() => {
    // Only auto-generate if user hasn't manually edited the name
    if (jobNameManuallyEdited || !selectedDatasetId || !targetColumn) {
      return;
    }

    // Find dataset name from either regular datasets or merged datasets
    let datasetName = '';
    
    // Check merged datasets first
    const mergedDataset = mergedDatasets.find(ds => ds.id === selectedDatasetId);
    if (mergedDataset) {
      datasetName = mergedDataset.collectionName; // Use collection name (e.g., "m4")
    } else {
      // Check regular datasets
      const regularDataset = datasets.find(d => d.id === selectedDatasetId);
      if (regularDataset) {
        // Remove file extension if present
        datasetName = regularDataset.name.replace(/\.(csv|xlsx|xls|json)$/i, '');
      }
    }

    if (datasetName && targetColumn) {
      // Generate smart model name: {dataset}__{target}
      const smartModelName = `${datasetName}__${targetColumn}`;
      console.log('🎯 Auto-generated model name:', smartModelName);
      setJobName(smartModelName);
    }
  }, [selectedDatasetId, targetColumn, datasets, mergedDatasets, jobNameManuallyEdited]);

  // Available algorithms
  const algorithms = {
    classification: [
      { id: 'logistic_regression', name: 'Logistic Regression', description: 'Fast, interpretable' },
      { id: 'random_forest', name: 'Random Forest', description: 'Robust, handles non-linear' },
      { id: 'xgboost', name: 'XGBoost', description: 'High accuracy, powerful' },
      { id: 'lightgbm', name: 'LightGBM', description: 'Fast gradient boosting' },
      { id: 'svm', name: 'Support Vector Machine', description: 'Good for small datasets' },
      { id: 'naive_bayes', name: 'Naive Bayes', description: 'Fast, probabilistic' },
    ],
    regression: [
      { id: 'linear_regression', name: 'Linear Regression', description: 'Fast, interpretable' },
      { id: 'random_forest', name: 'Random Forest', description: 'Robust, handles non-linear' },
      { id: 'xgboost', name: 'XGBoost', description: 'High accuracy, powerful' },
      { id: 'lightgbm', name: 'LightGBM', description: 'Fast gradient boosting' },
      { id: 'svr', name: 'Support Vector Regression', description: 'Good for small datasets' },
    ],
  };

  // Load columns when dataset changes
  const loadColumns = async (datasetId: string) => {
    setSelectedDatasetId(datasetId); // ✅ Update selected ID immediately
    setLoadingColumns(true);
    setAvailableColumns([]);
    setTargetColumn('');
    setDatasetFilePath(''); // Reset file path
    setJobNameManuallyEdited(false); // 🎯 Reset manual edit flag so auto-generation works again
    
    // Check if this is a merged dataset (from multi-table collections)
    const mergedDataset = mergedDatasets.find(ds => ds.id === datasetId);
    const isMergedDataset = !!mergedDataset;
    
    if (isMergedDataset) {
      try {
        // 🔥 Load columns from merged dataset (collection)
        console.log('📊 Loading columns from merged dataset/collection:', datasetId);
        
        // Find which collection this merged dataset belongs to
        const collection = multiTableCollections.find(c => {
          const derivedTable = c.tables?.find(t => t.role === 'derived');
          return derivedTable?.datasetId === datasetId;
        });
        
        if (!collection) {
          console.error('❌ Could not find collection for merged dataset:', datasetId);
          toast.error('Failed to load columns from merged dataset');
          setLoadingColumns(false);
          return;
        }
        
        console.log('📦 Found collection:', collection.name, 'ID:', collection.id);
        
        // Get the status which includes the file path
        const status = await collectionService.getDerivedDatasetStatus(collection.id);
        console.log('✅ Merged dataset status:', status);
        
        if (!status.mergedFilePath) {
          console.error('❌ No merged file path in status response');
          toast.error('Merged dataset file path not found');
          setLoadingColumns(false);
          return;
        }
        
        // Get the preview which includes column metadata
        const preview = await collectionService.getDerivedDatasetPreview(collection.id, 5);
        console.log('✅ Merged dataset preview:', preview);
        
        const columns = preview.columns.map((col: any) => ({
          name: col.name,
          dtype: col.dtype,
          displayType: col.displayType,
        }));
        
        setAvailableColumns(columns);
        console.log('📋 Set available columns:', columns.length);
        
        // Use the actual file path from status
        setDatasetFilePath(status.mergedFilePath);
        console.log('📁 Set datasetFilePath to:', status.mergedFilePath);
        
        // Store collection ID and path for Kedro source code generation
        setDatasetCollectionId(collection.id);
        setDatasetPath(status.mergedFilePath);
      } catch (error: any) {
        console.error('❌ Failed to load columns from merged dataset:', error);
        toast.error(error.message || 'Failed to load columns from merged dataset');
      } finally {
        setLoadingColumns(false);
      }
      return;
    }
    
    // Check if it's a regular dataset or data source
    const isDataset = datasets.some((d) => d.id === datasetId);
    const isDataSource = dataSources.some((ds) => ds.id === datasetId);

    if (!isDataset && !isDataSource) {
      console.warn('Selected ID is neither a dataset nor a data source:', datasetId);
      setLoadingColumns(false);
      return;
    }

    if (isDataset) {
      try {
        // 🔥 Load columns from regular dataset
        const response = await datasetService.getDatasetColumns(datasetId);
        console.log('📋 Columns API response:', response); // 🔍 DEBUG
        console.log('📋 file_path in response:', response.file_path); // 🔍 DEBUG
        
        const columns = Array.isArray(response) ? response : (response.columns || []);
        setAvailableColumns(columns);
        
        const filePath = response.file_path;
        if (filePath) {
          console.log('✅ Setting datasetFilePath to:', filePath); // 🔍 DEBUG
          setDatasetFilePath(filePath);
          
          // Store dataset metadata for Kedro source code generation (single file case)
          setDatasetCollectionId(''); // Empty string for single files
          setDatasetPath(filePath);
        } else {
          console.warn('⚠️ No file_path in columns response'); // 🔍 DEBUG
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load columns');
      } finally {
        setLoadingColumns(false);
      }
    } else {
      toast.info('Data sources require table/query selection. This feature is coming soon!');
      setSelectedDatasetId('');
      setLoadingColumns(false);
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
      
      // 🔍 DEBUG: Log all available data
      console.log('🔍 Debug - selectedDatasetId:', selectedDatasetId);
      console.log('🔍 Debug - selectedDataset:', JSON.stringify(selectedDataset, null, 2));
      console.log('🔍 Debug - datasetFilePath state:', datasetFilePath);
      console.log('🔍 Debug - selectedDataset?.filePath:', selectedDataset?.filePath);
      console.log('🔍 Debug - selectedDataset?.file_path:', (selectedDataset as any)?.file_path);
      console.log('🔍 Debug - selectedDataset?.fileName:', selectedDataset?.fileName);
      
      const response = await pipelineService.runDataLoadingPipeline({
        project_id: currentProject?.id || '',
        parameters: {
          data_loading: {
            dataset_id: selectedDatasetId,
            target_column: targetColumn,
            filepath: datasetFilePath || selectedDataset?.filePath || '', // ✅ Use full file path, not fileName
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
            scaling_method: scalingMethod,
            handle_missing_values: handleMissingValues,
            handle_outliers: handleOutliers,
            encode_categories: encodeCategories,
            create_polynomial_features: createPolynomialFeatures,
            create_interactions: createInteractions,
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

    if (selectedAlgorithms.length === 0) {
      toast.error('Please select at least one algorithm');
      return;
    }

    try {
      setStarting(true);
      
      // Close results modal if it's open from a previous job
      setShowResultsModal(false);

      console.log('🚀 Starting ML Flow Phase 3 (Baseline) pipeline...');
      
      // 🔍 DEBUG: Log all available data
      console.log('🔍 Debug - selectedDatasetId:', selectedDatasetId);
      console.log('🔍 Debug - selectedDataset:', JSON.stringify(selectedDataset, null, 2));
      console.log('🔍 Debug - datasetFilePath state:', datasetFilePath);
      console.log('🔍 Debug - selectedDataset?.filePath:', selectedDataset?.filePath);
      console.log('🔍 Debug - selectedDataset?.file_path:', (selectedDataset as any)?.file_path);
      
      // Build request parameters
      const requestParams = {
        project_id: currentProject?.id || '',
        parameters: {
          data_loading: {
            dataset_id: selectedDatasetId,
            target_column: targetColumn,
            filepath: datasetFilePath || selectedDataset?.filePath || '', // ✅ Use full file path, not fileName
          },
        },
      };
      
      console.log('🔍 Debug - Final filepath value:', requestParams.parameters.data_loading.filepath);
      console.log('📤 Sending request:', JSON.stringify(requestParams, null, 2));
      
      // Store request for phase 4
      setPipelineRequest(requestParams);
      
      // STEP 1: Call phase3_pipeline API (Baseline)
      const response = await pipelineService.runPhase3Pipeline(requestParams);

      console.log('✅ Phase 3 (Baseline) pipeline response:', response);
      
      toast.success('Phase 3 (Baseline) started successfully!');
      
      // Backend returns 'id' not 'job_id'
      const jobId = response.id || response.job_id;
      if (jobId) {
        console.log('📊 Opening progress modal for Phase 3 job:', jobId);
        setActiveJobId(jobId);
        setShowProgressModal(true);
      } else {
        console.warn('⚠️ No id in response:', response);
      }
    } catch (error: any) {
      console.error('❌ Phase 3 pipeline error:', error);
      toast.error(error.message || 'Failed to start Phase 3 pipeline');
    } finally {
      setStarting(false);
    }
  };

  // NEW: Handle Phase 3 completion - start Phase 4
  const handlePhase3Complete = useCallback(async (phase3JobId: string) => {
    console.log('✅ Phase 3 (Baseline) completed:', phase3JobId);
    console.log('🚀 Starting Phase 4 (Comprehensive) pipeline...');
    
    if (!pipelineRequest) {
      console.error('❌ No pipeline request stored!');
      return;
    }
    
    try {
      // STEP 2: Call phase4_pipeline API (Comprehensive)
      const response = await pipelineService.runPhase4Pipeline(pipelineRequest);
      
      console.log('✅ Phase 4 (Comprehensive) pipeline response:', response);
      toast.success('Phase 4 (Comprehensive) started successfully!');
      
      // Backend returns 'id' not 'job_id'
      const jobId = response.id || response.job_id;
      if (jobId) {
        console.log('📊 Switching to Phase 4 job:', jobId);
        setPhase4JobId(jobId);
      } else {
        console.warn('⚠️ No id in Phase 4 response:', response);
      }
    } catch (error: any) {
      console.error('❌ Phase 4 pipeline error:', error);
      toast.error(error.message || 'Failed to start Phase 4 pipeline');
    }
  }, [pipelineRequest]);

  // Handle job completion
  const handleJobComplete = useCallback(async (jobId: string, baselineResults?: { bestScore: number; bestAlgorithm: string; algorithmsCount: number; timeSeconds: number; algorithms?: Array<{ name: string; score: number }> }) => {
    console.log('✅ Job completed:', jobId);
    console.log('📊 Baseline results:', baselineResults);
    setActiveJobId(jobId);
    setShowProgressModal(false);
    
    // Store baseline results
    if (baselineResults) {
      setBaselineResults(baselineResults);
    }
    
    // Auto-register model to registry
    if (currentProject?.id && user?.email) {
      try {
        console.log('📝 Auto-registering model to registry...');
        console.log('📝 Project ID:', currentProject.id);
        console.log('📝 User email:', user.email);
        console.log('📝 Collection ID:', datasetCollectionId);
        console.log('📝 Dataset Path:', datasetPath);
        
        const modelName = jobName || `ML Flow Model - ${new Date().toLocaleDateString()}`;
        console.log('📝 Model name:', modelName);
        
        const registeredModel = await modelRegistryService.autoRegisterFromMLFlow(
          currentProject.id,
          modelName,
          user.email || 'system',
          datasetCollectionId, // Collection UUID for multi-table, undefined for single
          datasetPath // File path for both cases
        );
        
        console.log('✅ Model registered successfully:', registeredModel);
        toast.success(`Model \"${modelName}\" registered to Model Registry!`, {
          description: 'Navigate back to Model Registry to see your new model',
        });
      } catch (error: any) {
        console.error('❌ Failed to register model:', error);
        console.error('❌ Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        // Don't block showing results modal if registration fails
        toast.warning('Training completed but model registration failed', {
          description: error.message || 'Check console for details',
        });
      }
    } else {
      console.warn('⚠️ Cannot auto-register model - missing project or user:', {
        hasProject: !!currentProject?.id,
        hasUser: !!user?.email,
      });
    }
    
    setShowResultsModal(true);
  }, [currentProject, jobName, user, datasetCollectionId, datasetPath]);

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
      if (onNavigateToRegistry) {
        onNavigateToRegistry();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to deploy model');
    }
  };

  // Handle results modal close - redirect to registry
  const handleResultsModalClose = (open: boolean) => {
    setShowResultsModal(open);
    if (!open && onNavigateToRegistry) {
      // User closed the modal, navigate to registry
      setTimeout(() => {
        onNavigateToRegistry();
      }, 300);
    }
  };

  // Toggle algorithm selection
  const toggleAlgorithm = (algorithmId: string) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algorithmId)
        ? prev.filter(id => id !== algorithmId)
        : [...prev, algorithmId]
    );
  };

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const canProceedFromDataLoading = selectedDatasetId && targetColumn && dataLoaded;
  const canProceedFromFeatureEngineering = featureEngineeringCompleted;
  const canStart = selectedDatasetId && targetColumn && selectedAlgorithms.length > 0 && !starting;

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
  const currentAlgorithms = algorithms[problemType] || algorithms.classification;

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0">
      {/* Left: Dataset Tree Panel */}
      <MLFlowDatasetTreePanel
        datasets={datasets}
        mergedDatasets={mergedDatasets}
        selectedDatasetId={selectedDatasetId}
        onDatasetSelect={loadColumns}
        isCollapsed={treePanelCollapsed}
        onToggleCollapse={() => setTreePanelCollapsed(!treePanelCollapsed)}
      />

      {/* Right: Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-card">
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
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
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
                    {/* Dataset Selection - Now shown as text */}
                    <div className="space-y-2">
                      <Label>Training Data Source *</Label>
                      <div className="w-full px-3 py-2 border border-border rounded-md bg-muted/50 text-sm min-h-[40px] flex items-center">
                        {selectedDatasetId ? (
                          <div className="flex items-center gap-2">
                            {mergedDatasets.find(ds => ds.id === selectedDatasetId) ? (
                              <>
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                <span className="font-medium">
                                  {mergedDatasets.find(ds => ds.id === selectedDatasetId)?.collectionName}
                                </span>
                                <Badge variant="outline" className="text-[10px] h-4 px-1 ml-1 bg-gradient-to-r from-amber-500/10 to-emerald-500/10">
                                  Merged
                                </Badge>
                              </>
                            ) : (
                              <>
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium">
                                  {datasets.find(d => d.id === selectedDatasetId)?.name}
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Select from left panel</span>
                        )}
                      </div>
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

                  {/* Feature Engineering Options */}
                  <div className="space-y-6">
                    {/* Enable Feature Engineering */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="enable-fe"
                          checked={enableFeatureEngineering}
                          onCheckedChange={(checked) => setEnableFeatureEngineering(checked as boolean)}
                        />
                        <div>
                          <Label htmlFor="enable-fe" className="font-semibold cursor-pointer">
                            Enable Automated Feature Engineering
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically create, transform, and select features
                          </p>
                        </div>
                      </div>
                    </div>

                    {enableFeatureEngineering && (
                      <div className="space-y-4 pl-8 border-l-2 border-primary/20">
                        {/* Scaling Method */}
                        <div className="space-y-2">
                          <Label>Scaling Method</Label>
                          <Select value={scalingMethod} onValueChange={(value: any) => setScalingMethod(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard Scaler (Zero mean, unit variance)</SelectItem>
                              <SelectItem value="minmax">Min-Max Scaler (0 to 1 range)</SelectItem>
                              <SelectItem value="robust">Robust Scaler (Resistant to outliers)</SelectItem>
                              <SelectItem value="none">No Scaling</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Preprocessing Options */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Preprocessing Options</Label>
                          
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="missing-values"
                              checked={handleMissingValues}
                              onCheckedChange={(checked) => setHandleMissingValues(checked as boolean)}
                            />
                            <Label htmlFor="missing-values" className="cursor-pointer">
                              Handle Missing Values (Automatic imputation)
                            </Label>
                          </div>

                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="outliers"
                              checked={handleOutliers}
                              onCheckedChange={(checked) => setHandleOutliers(checked as boolean)}
                            />
                            <Label htmlFor="outliers" className="cursor-pointer">
                              Handle Outliers (IQR-based detection)
                            </Label>
                          </div>

                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="encode"
                              checked={encodeCategories}
                              onCheckedChange={(checked) => setEncodeCategories(checked as boolean)}
                            />
                            <Label htmlFor="encode" className="cursor-pointer">
                              Encode Categorical Variables (One-hot encoding)
                            </Label>
                          </div>
                        </div>

                        {/* Advanced Feature Creation */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Advanced Feature Creation</Label>
                          
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="polynomial"
                              checked={createPolynomialFeatures}
                              onCheckedChange={(checked) => setCreatePolynomialFeatures(checked as boolean)}
                            />
                            <Label htmlFor="polynomial" className="cursor-pointer">
                              Create Polynomial Features (Degree 2)
                            </Label>
                          </div>

                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="interactions"
                              checked={createInteractions}
                              onCheckedChange={(checked) => setCreateInteractions(checked as boolean)}
                            />
                            <Label htmlFor="interactions" className="cursor-pointer">
                              Create Interaction Features
                            </Label>
                          </div>
                        </div>
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
                      {starting ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5" />
                          Start ML Flow
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Job Name */}
                    <div className="space-y-2">
                      <Label htmlFor="jobName">Job Name (Optional)</Label>
                      <Input
                        id="jobName"
                        value={jobName}
                        onChange={(e) => {
                          setJobName(e.target.value);
                          setJobNameManuallyEdited(true);
                        }}
                        placeholder="e.g., sample_data__loan_approved"
                      />
                      <p className="text-xs text-muted-foreground">
                        Auto-generated as: {selectedDatasetId && targetColumn ? 'dataset__target' : 'dataset_name__target_column'}
                      </p>
                    </div>

                    {/* Problem Type */}
                    <div className="space-y-2">
                      <Label>Problem Type *</Label>
                      <Select value={problemType} onValueChange={(value: ProblemType) => {
                        setProblemType(value);
                        // Reset algorithm selection when problem type changes
                        setSelectedAlgorithms(value === 'classification' ? ['logistic_regression', 'xgboost'] : ['linear_regression', 'xgboost']);
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classification">Classification (Predict categories)</SelectItem>
                          <SelectItem value="regression">Regression (Predict numbers)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Algorithm Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Select Algorithms *</Label>
                        <Badge variant="outline">{selectedAlgorithms.length} selected</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Choose at least 2 algorithms to compare performance
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentAlgorithms.map((algo) => (
                          <Card
                            key={algo.id}
                            className={`p-4 cursor-pointer transition-all ${
                              selectedAlgorithms.includes(algo.id)
                                ? 'border-primary bg-primary/5'
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => toggleAlgorithm(algo.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedAlgorithms.includes(algo.id)}
                                onCheckedChange={() => toggleAlgorithm(algo.id)}
                              />
                              <div className="flex-1">
                                <div className="font-semibold">{algo.name}</div>
                                <div className="text-xs text-muted-foreground">{algo.description}</div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Training Time */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Max Training Time</Label>
                        <Badge variant="outline">{maxTime} minutes</Badge>
                      </div>
                      <Slider
                        value={[maxTime]}
                        onValueChange={(value) => setMaxTime(value[0])}
                        min={5}
                        max={180}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 min (Quick)</span>
                        <span>180 min (Thorough)</span>
                      </div>
                    </div>

                    {/* Advanced Configuration */}
                    <Collapsible open={advancedConfigOpen} onOpenChange={setAdvancedConfigOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4" />
                            Advanced Configuration
                          </span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${advancedConfigOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        {/* Accuracy vs Speed */}
                        <div className="space-y-2">
                          <Label>Accuracy vs Speed Trade-off</Label>
                          <Select value={accuracySpeed} onValueChange={(value: any) => setAccuracySpeed(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Prioritize Speed (Faster, lower accuracy)</SelectItem>
                              <SelectItem value="medium">Balanced</SelectItem>
                              <SelectItem value="high">Prioritize Accuracy (Slower, higher accuracy)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Cross-Validation Folds */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Cross-Validation Folds</Label>
                            <Badge variant="outline">{cvFolds} folds</Badge>
                          </div>
                          <Slider
                            value={[cvFolds]}
                            onValueChange={(value) => setCvFolds(value[0])}
                            min={3}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Hyperparameter Tuning */}
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="hyperparameter-tuning"
                            checked={enableHyperparameterTuning}
                            onCheckedChange={(checked) => setEnableHyperparameterTuning(checked as boolean)}
                          />
                          <Label htmlFor="hyperparameter-tuning" className="cursor-pointer">
                            Enable Hyperparameter Tuning (Increases training time)
                          </Label>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
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
              onPhase3Complete={handlePhase3Complete}
              pipelineRequest={pipelineRequest}
              phase4JobId={phase4JobId}
            />

            {/* Results Modal */}
            <MLFlowResultsModal
              open={showResultsModal}
              onOpenChange={handleResultsModalClose}
              jobId={activeJobId}
              onDeploy={handleDeploy}
              baselineResults={baselineResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
}