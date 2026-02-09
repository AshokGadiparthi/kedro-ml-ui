/**
 * Model Details Modal - Real API Version
 * Shows real data from backend APIs
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  Trophy,
  GitBranch,
  Rocket,
  Clock,
  TrendingUp,
  Archive,
  Download,
  Trash2,
  CheckCircle2,
  FileCode,
  Database,
  Settings,
  BarChart3,
  History,
  ChevronRight,
  Package,
  Calendar,
  User,
  Tag,
  Loader2,
  Network,
  Zap,
  Code,
  Box,
  Activity,
  Server,
} from 'lucide-react';
import { toast } from 'sonner';
import * as modelRegistryService from '../../../services/registry/modelRegistryService';
import type { 
  RegisteredModel, 
  ModelVersion, 
  ModelArtifact 
} from '../../../services/registry/modelRegistryService';

interface ModelDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelId: string | null;
  onDeploy?: (modelId: string, version: string) => void;
  onArchive?: (modelId: string) => void;
  onDelete?: (modelId: string) => void;
  onRefresh?: () => void;
}

export function ModelDetailsModal({
  open,
  onOpenChange,
  modelId,
  onDeploy,
  onArchive,
  onDelete,
  onRefresh,
}: ModelDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [modelData, setModelData] = useState<RegisteredModel | null>(null);
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [artifacts, setArtifacts] = useState<ModelArtifact[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [artifactsLoading, setArtifactsLoading] = useState(false);

  // Fetch model details when modal opens
  useEffect(() => {
    if (open && modelId) {
      setLoading(true);
      modelRegistryService.getModelById(modelId)
        .then(data => {
          console.log('📦 Model details loaded:', data);
          setModelData(data);
          // Set versions from initial data if available
          if (data.versions && data.versions.length > 0) {
            setVersions(data.versions);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to load model details:', error);
          toast.error(`Failed to load model details: ${error.message}`);
          setLoading(false);
        });
    } else {
      setModelData(null);
      setVersions([]);
      setArtifacts([]);
      setActiveTab('overview');
    }
  }, [open, modelId]);

  // Fetch versions when Versions tab is clicked
  useEffect(() => {
    if (activeTab === 'versions' && modelId && versions.length === 0) {
      console.log('📋 Fetching versions for model:', modelId);
      setVersionsLoading(true);
      modelRegistryService.getModelVersions(modelId)
        .then(data => {
          console.log('✅ Versions loaded:', data);
          setVersions(data.versions);
          setVersionsLoading(false);
        })
        .catch(error => {
          console.error('Failed to load versions:', error);
          toast.error(`Failed to load versions: ${error.message}`);
          setVersionsLoading(false);
        });
    }
  }, [activeTab, modelId, versions.length]);

  // Fetch artifacts when Artifacts tab is clicked
  useEffect(() => {
    if (activeTab === 'artifacts' && modelId && artifacts.length === 0) {
      console.log('📦 Fetching artifacts for model:', modelId);
      setArtifactsLoading(true);
      modelRegistryService.getModelArtifacts(modelId)
        .then(data => {
          console.log('✅ Artifacts loaded:', data);
          setArtifacts(data.artifacts);
          setArtifactsLoading(false);
        })
        .catch(error => {
          console.error('Failed to load artifacts:', error);
          toast.error(`Failed to load artifacts: ${error.message}`);
          setArtifactsLoading(false);
        });
    }
  }, [activeTab, modelId, artifacts.length]);

  // Handle deploy
  const handleDeploy = async () => {
    if (!modelData) return;
    
    try {
      await modelRegistryService.deployModel(modelData.id, {
        environment: 'production',
        notes: 'Deployed from Model Registry UI',
      });
      toast.success('Model deployed successfully!');
      if (onRefresh) onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Deployment failed: ${error.message}`);
    }
  };

  // Handle archive
  const handleArchive = async () => {
    if (!modelData) return;
    
    try {
      await modelRegistryService.archiveModel(modelData.id);
      toast.success('Model archived successfully!');
      if (onRefresh) onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Archive failed: ${error.message}`);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!modelData) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete "${modelData.name}"? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
      await modelRegistryService.deleteModel(modelData.id);
      toast.success('Model deleted successfully!');
      if (onRefresh) onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  if (loading || !modelData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Loading Model Details</DialogTitle>
            <DialogDescription>Please wait while we load the model information...</DialogDescription>
          </DialogHeader>
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading model details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const statusConfig = {
    production: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    staging: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  };

  // Get the first version for current metrics
  const currentVersion = versions.find(v => v.is_current) || versions[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            {modelData.name}
            <Badge className={statusConfig[modelData.status as keyof typeof statusConfig]}>
              {modelData.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {modelData.description || 'No description provided'}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="versions">Versions ({modelData.total_versions})</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <div className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Accuracy</div>
                  </div>
                  <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                    {modelData.best_accuracy ? (modelData.best_accuracy * 100).toFixed(1) + '%' : 'N/A'}
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Versions</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {modelData.total_versions}
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="h-5 w-5 text-green-600" />
                    <div className="text-sm font-medium text-green-900 dark:text-green-100">Deployed</div>
                  </div>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {modelData.is_deployed ? 'Yes' : 'No'}
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Algorithm</div>
                  </div>
                  <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {modelData.best_algorithm || 'N/A'}
                  </div>
                </Card>
              </div>

              {/* Metadata */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-600" />
                  Model Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-muted-foreground">Created By</div>
                        <div className="font-medium">{modelData.created_by}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-muted-foreground">Created At</div>
                        <div className="font-medium">{new Date(modelData.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-muted-foreground">Problem Type</div>
                        <div className="font-medium capitalize">{modelData.problem_type || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-muted-foreground">Updated At</div>
                        <div className="font-medium">{new Date(modelData.updated_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-muted-foreground">Current Version</div>
                        <div className="font-medium font-mono">{modelData.current_version}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Database className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="text-muted-foreground">Source Dataset</div>
                        <div className="font-medium">{modelData.source_dataset_name || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {modelData.tags && modelData.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {modelData.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Versions Tab */}
            <TabsContent value="versions" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                  Version History ({versions.length} versions)
                </h3>
                
                {versionsLoading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading versions...</p>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No versions found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versions.map((version, idx) => (
                      <Card key={idx} className={`p-4 ${version.is_current ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold font-mono text-lg">{version.version}</span>
                              {version.is_current && (
                                <Badge className="bg-blue-600 text-white">Current</Badge>
                              )}
                              <Badge className={statusConfig[version.status as keyof typeof statusConfig]}>
                                {version.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Algorithm</div>
                                <div className="font-medium">{version.algorithm}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Accuracy</div>
                                <div className="font-bold text-green-600">{(version.accuracy * 100).toFixed(2)}%</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Size</div>
                                <div className="font-medium">{version.model_size_mb?.toFixed(2) || 'N/A'} MB</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">ROC-AUC</div>
                                <div className="font-medium">{version.roc_auc?.toFixed(4) || 'N/A'}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Created {new Date(version.created_at).toLocaleString()} by {version.created_by}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Artifacts Tab */}
            <TabsContent value="artifacts" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-orange-600" />
                  Model Artifacts & Files
                </h3>
                
                {artifactsLoading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading artifacts...</p>
                  </div>
                ) : artifacts.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No artifacts found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {artifacts.map((artifact, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <FileCode className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{artifact.artifact_name}</div>
                            <div className="text-xs text-muted-foreground font-mono truncate">{artifact.file_path}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <Badge variant="outline" className="mr-2 capitalize">{artifact.artifact_type}</Badge>
                              {(artifact.file_size_bytes / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Features Tab - PLACEHOLDER */}
            <TabsContent value="features" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-600" />
                  Feature Information
                </h3>
                <div className="py-12 text-center">
                  <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">Feature Data Not Available</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This tab will display model features, feature importance scores, and input schema once the backend API is ready.
                  </p>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left max-w-md mx-auto">
                    <p className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">📋 Expected API Endpoint:</p>
                    <code className="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded block mb-3">
                      GET /api/v1/models/registry/{"{modelId}"}/features
                    </code>
                    <p className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">📦 Expected Response:</p>
                    <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded overflow-auto">
{`{
  "model_id": "model-123",
  "features": [
    {
      "name": "age",
      "type": "numeric",
      "importance": 0.234,
      "mean": 35.5,
      "std": 12.3,
      "min": 18,
      "max": 90
    },
    {
      "name": "income",
      "type": "numeric",
      "importance": 0.456,
      "mean": 50000,
      "std": 15000,
      "min": 20000,
      "max": 150000
    },
    {
      "name": "category",
      "type": "categorical",
      "importance": 0.123,
      "unique_values": 5,
      "top_value": "A"
    }
  ],
  "total_features": 3
}`}
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Deployment Tab - PLACEHOLDER */}
            <TabsContent value="deployment" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-600" />
                  Deployment History & Status
                </h3>
                <div className="py-12 text-center">
                  <Server className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">Deployment Data Not Available</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This tab will show deployment history, endpoints, performance metrics, and health status once the backend API is ready.
                  </p>
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-left max-w-md mx-auto">
                    <p className="text-sm font-semibold mb-2 text-green-900 dark:text-green-100">📋 Expected API Endpoint:</p>
                    <code className="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded block mb-3">
                      GET /api/v1/models/registry/{"{modelId}"}/deployments
                    </code>
                    <p className="text-sm font-semibold mb-2 text-green-900 dark:text-green-100">📦 Expected Response:</p>
                    <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded overflow-auto">
{`{
  "model_id": "model-123",
  "deployments": [
    {
      "id": "deploy-456",
      "environment": "production",
      "endpoint": "https://api.example.com/predict",
      "version": "v1.2.0",
      "status": "active",
      "deployed_at": "2024-02-01T10:30:00Z",
      "deployed_by": "john.doe@company.com",
      "health_status": "healthy",
      "requests_per_minute": 125,
      "avg_latency_ms": 45,
      "error_rate": 0.002
    },
    {
      "id": "deploy-789",
      "environment": "staging",
      "endpoint": "https://staging-api.example.com/predict",
      "version": "v1.2.1",
      "status": "active",
      "deployed_at": "2024-02-05T14:20:00Z",
      "deployed_by": "jane.smith@company.com",
      "health_status": "healthy",
      "requests_per_minute": 15,
      "avg_latency_ms": 42,
      "error_rate": 0.001
    }
  ],
  "total_deployments": 2
}`}
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Lineage Tab - PLACEHOLDER */}
            <TabsContent value="lineage" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-600" />
                  Model Lineage & Dependencies
                </h3>
                <div className="py-12 text-center">
                  <Network className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">Lineage Data Not Available</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This tab will visualize the model's data lineage, parent datasets, training pipeline, and downstream dependencies once the backend API is ready.
                  </p>
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg text-left max-w-md mx-auto">
                    <p className="text-sm font-semibold mb-2 text-purple-900 dark:text-purple-100">📋 Expected API Endpoint:</p>
                    <code className="text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded block mb-3">
                      GET /api/v1/models/registry/{"{modelId}"}/lineage
                    </code>
                    <p className="text-sm font-semibold mb-2 text-purple-900 dark:text-purple-100">📦 Expected Response:</p>
                    <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded overflow-auto">
{`{
  "model_id": "model-123",
  "lineage": {
    "datasets": [
      {
        "id": "dataset-001",
        "name": "customer_data_v2.csv",
        "type": "source",
        "rows": 50000,
        "created_at": "2024-01-15T08:00:00Z"
      }
    ],
    "transformations": [
      {
        "id": "transform-001",
        "name": "data_preprocessing",
        "type": "pipeline",
        "operations": ["clean", "normalize", "encode"],
        "executed_at": "2024-01-20T10:00:00Z"
      }
    ],
    "parent_models": [],
    "child_models": [],
    "training_pipeline": {
      "id": "pipeline-456",
      "name": "AutoML Training Pipeline",
      "executed_at": "2024-01-25T14:30:00Z",
      "duration_seconds": 3600
    },
    "dependencies": [
      {
        "name": "scikit-learn",
        "version": "1.3.0",
        "type": "library"
      },
      {
        "name": "pandas",
        "version": "2.0.0",
        "type": "library"
      }
    ]
  }
}`}
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            {modelData.status !== 'archived' && (
              <Button variant="outline" onClick={handleArchive} className="gap-2">
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
            <Button variant="outline" onClick={handleDelete} className="gap-2 text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {!modelData.is_deployed && (
              <Button onClick={handleDeploy} className="gap-2">
                <Rocket className="h-4 w-4" />
                Deploy to Production
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}