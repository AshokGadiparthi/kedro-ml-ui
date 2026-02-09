/**
 * ML Flow Engine Component
 * Comprehensive ML Flow with dataset selection, job tracking, and results
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
import { SimpleCombobox, ComboboxGroup } from '../ui/simple-combobox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
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
  InfoIcon,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { AutoMLProgressModal } from '../AutoMLProgressModal';
import { AutoMLResultsModal } from '../AutoMLResultsModal';
import { AutoMLJobCard } from '../AutoMLJobCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import * as automlService from '../../../services/automl/automlService';
import * as datasetService from '../../../services/datasets/datasetService';
import * as deploymentService from '../../../services/deployment/deploymentService';
import type { ProblemType, ColumnInfo } from '../../../services/api/types';

export function MLFlowEngine() {
  const { currentProject, refreshCurrentProject } = useProject();
  const { datasets, loading: datasetsLoading } = useDatasets(currentProject?.id);
  const { dataSources, loading: dataSourcesLoading } = useDataSources(currentProject?.id);
  const { jobs, loading: jobsLoading, refetch: refetchJobs } = useAutoMLJobs(currentProject?.id);

  // Configuration state
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [jobName, setJobName] = useState<string>('');
  const [problemType, setProblemType] = useState<ProblemType>('classification');
  const [maxTime, setMaxTime] = useState(60);
  const [accuracySpeed, setAccuracySpeed] = useState<'low' | 'medium' | 'high'>('high');
  const [interpretability, setInterpretability] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Advanced configuration
  const [enableFeatureEngineering, setEnableFeatureEngineering] = useState(true);
  const [scalingMethod, setScalingMethod] = useState<'standard' | 'minmax' | 'robust' | 'none'>('standard');
  const [cvFolds, setCvFolds] = useState(5);
  const [enableHyperparameterTuning, setEnableHyperparameterTuning] = useState(true);
  
  // Collapsible state - START COLLAPSED
  const [mlFlowConfigOpen, setMLFlowConfigOpen] = useState(false);
  const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);

  // Columns for selected dataset
  const [availableColumns, setAvailableColumns] = useState<ColumnInfo[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);

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

    if (!datasetId) return;

    // Check if this is a dataset or data source
    const isDataset = datasets.some((d) => d.id === datasetId);
    const isDataSource = dataSources.some((ds) => ds.id === datasetId);

    if (!isDataset && !isDataSource) {
      console.warn('Selected ID is neither a dataset nor a data source:', datasetId);
      return;
    }

    // Only load columns for datasets
    // Data sources don't have a columns endpoint - they would need table/query selection first
    if (isDataset) {
      try {
        setLoadingColumns(true);
        const columns = await datasetService.getDatasetColumns(datasetId);
        setAvailableColumns(columns);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load columns');
      } finally {
        setLoadingColumns(false);
      }
    } else {
      // For data sources, show a message
      toast.info('Data sources require table/query selection. This feature is coming soon!');
      setSelectedDatasetId(''); // Clear selection for now
    }
  };

  // Prepare grouped data for combobox (datasets + data sources)
  // Combine all training data into a single list with type prefixes
  const allTrainingData = [
    ...datasets.map((dataset) => ({
      id: dataset.id,
      name: dataset.name || 'Unnamed Dataset',
      type: 'dataset' as const,
      metadata: dataset.rowCountLabel || (dataset.rowCount ? `${dataset.rowCount.toLocaleString()} rows` : 'Unknown'),
    })),
    ...dataSources.map((source) => ({
      id: source.id,
      name: source.name || 'Unnamed Source',
      type: 'datasource' as const,
      metadata: source.status === 'connected' ? 'Connected' : (source.status || 'Unknown'),
    })),
  ];

  const trainingDataGroups: ComboboxGroup[] = [
    {
      label: 'Datasets',
      options: datasets.map((dataset) => ({
        label: dataset.name || 'Unnamed Dataset',
        value: dataset.id,
        metadata: dataset.rowCountLabel || (dataset.rowCount ? `${dataset.rowCount.toLocaleString()} rows` : 'Unknown'),
      })),
    },
    {
      label: 'Data Sources',
      options: dataSources.map((source) => ({
        label: source.name || 'Unnamed Source',
        value: source.id,
        metadata: source.status === 'connected' ? 'Connected' : (source.status || 'Unknown'),
      })),
    },
  ];

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
      
      // Close results modal if it's open from a previous job
      setShowResultsModal(false);

      // Determine if this is a collection (multi-table) or regular dataset
      const selectedItem = allTrainingData.find((item) => item.id === selectedDatasetId);
      
      // Check if dataset name matches collection pattern (e.g., "m1", "m2", "m3")
      const isCollection = selectedItem?.name ? /^m\d+/.test(selectedItem.name) : false;
      
      // Build dataset metadata for Kedro source code generation
      let collection_id: string | undefined;
      let dataset_path: string | undefined;
      
      if (isCollection) {
        // Multi-table dataset (collection)
        collection_id = selectedDatasetId; // This is the collection UUID
        // Extract collection name from the dataset name (e.g., "m1", "m2", "m3")
        const collectionName = selectedItem?.name?.match(/^(m\d+)/)?.[1] || 'm1';
        dataset_path = `${collectionName}/`;
        console.log('📦 Starting AutoML with multi-table dataset:', {
          collection_id,
          dataset_path,
          collectionName,
          datasetName: selectedItem?.name,
        });
      } else {
        // Single dataset
        collection_id = undefined; // Don't send for single datasets
        // Extract filename from dataset name or use default
        const fileName = selectedItem?.name 
          ? `${selectedItem.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`
          : 'data.csv';
        dataset_path = fileName;
        console.log('📦 Starting AutoML with single dataset:', {
          dataset_path,
          fileName,
          datasetName: selectedItem?.name,
        });
      }

      const response = await automlService.startAutoMLJob({
        projectId: currentProject?.id,
        datasetId: selectedDatasetId,
        name: jobName || `ML Flow Run - ${new Date().toLocaleString()}`,
        targetColumn,
        problemType,
        maxTrainingTimeMinutes: maxTime,
        accuracyVsSpeed: accuracySpeed,
        interpretability,
        config: {
          enableFeatureEngineering,
          scalingMethod,
          cvFolds,
          enableExplainability: interpretability !== 'low',
          enableHyperparameterTuning,
          tuningMethod: 'grid',
        },
        // Add dataset metadata for Kedro source code
        collection_id,
        dataset_path,
      });

      toast.success('ML Flow job started successfully!');
      setActiveJobId(response.jobId);
      setShowProgressModal(true);
      refetchJobs();

      // Reset form
      setSelectedDatasetId('');
      setTargetColumn('');
      setJobName('');
      setAvailableColumns([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start ML Flow');
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

  // Handle job completion - auto-open results
  const handleJobComplete = useCallback((jobId: string) => {
    setActiveJobId(jobId);
    setShowProgressModal(false);
    setShowResultsModal(true);
    refetchJobs();
    refreshCurrentProject(); // ← Refresh project stats after ML Flow completes
  }, []); // ← EMPTY DEPENDENCIES - these are all stable setter functions

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
        name: undefined, // Auto-generated by backend
        description: 'ML Flow deployment',
      });
      
      toast.success(`Model deployed successfully as ${response.versionLabel}!`);
      setShowResultsModal(false);
      refetchJobs(); // Refresh to show deployment status
    } catch (error: any) {
      toast.error(error.message || 'Failed to deploy model');
    }
  };

  // Activate a deployed version
  const handleActivate = async (deploymentId: string) => {
    try {
      await deploymentService.activateDeployment(deploymentId);
      toast.success('Deployment activated successfully!');
      refetchJobs(); // Refresh to show updated active status
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate deployment');
    }
  };

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const canStart = selectedDatasetId && targetColumn && !starting;

  // Group jobs by dataset/data source
  const groupedJobs = jobs.reduce((acc, job) => {
    // Try to find the dataset/datasource for this job using datasetId
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

  // Convert to array and sort by most recent job
  const groupedJobsArray = Object.values(groupedJobs).sort((a, b) => {
    const aLatest = Math.max(...a.jobs.map(j => new Date(j.createdAt).getTime()));
    const bLatest = Math.max(...b.jobs.map(j => new Date(j.createdAt).getTime()));
    return bLatest - aLatest;
  });

  // Filter jobs based on selected filter
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

      {/* Training Data Setup */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Training Data</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dataset/Data Source Selection with Search */}
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
                {/* Datasets Group */}
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
                
                {/* Data Sources Group */}
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
                
                {/* Empty State */}
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

          {/* Target Column */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Column *</Label>
            <Select
              value={targetColumn}
              onValueChange={setTargetColumn}
              disabled={!selectedDatasetId || loadingColumns}
            >
              <SelectTrigger id="target">
                <SelectValue placeholder={loadingColumns ? 'Loading...' : 'Select target'} />
              </SelectTrigger>
              <SelectContent>
                {availableColumns.map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name} ({col.dataType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>
      </Card>

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

      {/* Advanced Configuration - COLLAPSIBLE */}
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
                  {enableFeatureEngineering ? 'Feature Engineering' : 'No Feature Engineering'} • {scalingMethod} scaling • {cvFolds}-fold CV
                </span>
              )}
              <Badge variant="outline">For Power Users</Badge>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Engineering */}
              <div>
                <label className="text-sm font-medium mb-2 block">Feature Engineering</label>
                <div className="flex gap-2">
                  {(['true', 'false'] as const).map((value) => (
                    <Button
                      key={value}
                      variant={enableFeatureEngineering === (value === 'true') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEnableFeatureEngineering(value === 'true')}
                      className="flex-1"
                    >
                      {value === 'true' ? 'Enabled' : 'Disabled'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Scaling Method */}
              <div>
                <label className="text-sm font-medium mb-2 block">Scaling Method</label>
                <div className="flex gap-2">
                  {(['standard', 'minmax', 'robust', 'none'] as const).map((method) => (
                    <Button
                      key={method}
                      variant={scalingMethod === method ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScalingMethod(method)}
                      className="flex-1"
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

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

      {/* ML Flow Job History */}
      {jobs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-lg">ML Flow History</h3>
            <div className="flex items-center gap-3">
              {/* Filter Dropdown */}
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
                  {dataSources.length > 0 && (
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
            <>
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

              {/* View All Button - Show if more than 3 groups */}
              {filteredGroups.length > 3 && (
                <Card className="p-4 bg-gradient-to-br from-slate-50/30 to-gray-50/30 dark:from-slate-900/30 dark:to-gray-900/30">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => toast.info('Full history view coming soon! For now, use the filter above to view specific datasets.')}
                  >
                    <ChevronRight className="h-4 w-4" />
                    View All {groupedJobsArray.length} Data Sources ({jobs.length} total jobs)
                  </Button>
                </Card>
              )}
            </>
          )}
        </div>
      ) : (
        <Card className="p-8 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/50 dark:to-gray-900/50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 mb-4">
              <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Training Jobs Yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Configure your training data and settings above, then click "Start ML Flow" to train your first model.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
                </div>
                <span>Select dataset</span>
              </div>
              <ChevronRight className="h-4 w-4" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">2</span>
                </div>
                <span>Choose target</span>
              </div>
              <ChevronRight className="h-4 w-4" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-semibold">3</span>
                </div>
                <span>Start training</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Algorithm Selection</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Intelligently tests multiple algorithms and selects the best performer
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Feature Engineering</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Automatically creates powerful features to boost model performance
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Hyperparameter Tuning</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Optimizes model parameters for maximum accuracy and generalization
          </p>
        </Card>
      </div>

      {/* Progress Modal */}
      <AutoMLProgressModal
        open={showProgressModal}
        onOpenChange={setShowProgressModal}
        jobId={activeJobId}
        jobName={jobName}
        onStop={handleStopJob}
        onComplete={handleJobComplete}
      />

      {/* Results Modal */}
      <AutoMLResultsModal
        open={showResultsModal}
        onOpenChange={setShowResultsModal}
        jobId={activeJobId}
        onDeploy={handleDeploy}
      />
    </div>
  );
}