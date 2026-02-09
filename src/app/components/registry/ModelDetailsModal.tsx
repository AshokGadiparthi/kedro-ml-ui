/**
 * Model Details Modal
 * Comprehensive model information with tabs: Overview, Versions, Features, Source Files, Deployment, Lineage
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
  AlertCircle,
  FileCode,
  Database,
  Settings,
  BarChart3,
  History,
  GitMerge,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronRight,
  Package,
  Calendar,
  User,
  Tag,
  Zap,
  Loader2,
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
  onRollback?: (modelId: string, version: string) => void;
  onArchive?: (modelId: string) => void;
  onDelete?: (modelId: string) => void;
}

export function ModelDetailsModal({
  open,
  onOpenChange,
  modelId,
  onDeploy,
  onRollback,
  onArchive,
  onDelete,
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
    }
  }, [open, modelId]);

  // Fetch versions when Versions tab is clicked
  useEffect(() => {
    if (activeTab === 'versions' && modelId && versions.length === 0) {
      setVersionsLoading(true);
      modelRegistryService.getModelVersions(modelId)
        .then(data => {
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
      setArtifactsLoading(true);
      modelRegistryService.getModelArtifacts(modelId)
        .then(data => {
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

  if (loading || !modelData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Loading Model Details</DialogTitle>
            <DialogDescription>Please wait while we load the model information...</DialogDescription>
          </DialogHeader>
          <div className="py-12 text-center">
            <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
    deprecated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

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
            {modelData.description}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
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
                    {(modelData.best_accuracy * 100).toFixed(1)}%
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
                    <Database className="h-5 w-5 text-green-600" />
                    <div className="text-sm font-medium text-green-900 dark:text-green-100">Features</div>
                  </div>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {modelData.metrics.feature_count}
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div className="text-sm font-medium text-purple-900 dark:text-purple-100">Samples</div>
                  </div>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {modelData.metrics.sample_count.toLocaleString()}
                  </div>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Train Score</span>
                        <span className="text-sm font-bold">{(modelData.metrics.train_score * 100).toFixed(2)}%</span>
                      </div>
                      <Progress value={modelData.metrics.train_score * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Test Score</span>
                        <span className="text-sm font-bold text-green-600">{(modelData.metrics.test_score * 100).toFixed(2)}%</span>
                      </div>
                      <Progress value={modelData.metrics.test_score * 100} className="h-2" />
                    </div>
                    {modelData.metrics.validation_score && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Validation Score</span>
                          <span className="text-sm font-bold">{(modelData.metrics.validation_score * 100).toFixed(2)}%</span>
                        </div>
                        <Progress value={modelData.metrics.validation_score * 100} className="h-2" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {modelData.metrics.roc_auc && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <span className="text-sm font-medium">ROC-AUC</span>
                        <span className="text-lg font-bold text-blue-600">{modelData.metrics.roc_auc.toFixed(4)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-sm font-medium">Overfitting Gap</span>
                      <span className="text-lg font-bold">
                        {((modelData.metrics.train_score - modelData.metrics.test_score) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Training Configuration */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Training Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dataset:</span>
                      <span className="font-medium">{modelData.training_config.dataset_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target Column:</span>
                      <span className="font-medium font-mono">{modelData.training_config.target_column}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Train/Test Split:</span>
                      <span className="font-medium">{(modelData.training_config.train_test_split * 100).toFixed(0)}% / {((1 - modelData.training_config.train_test_split) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {modelData.training_config.cross_validation_folds && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CV Folds:</span>
                        <span className="font-medium">{modelData.training_config.cross_validation_folds}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Random Seed:</span>
                      <span className="font-medium font-mono">{modelData.training_config.random_seed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Algorithm:</span>
                      <span className="font-medium">{modelData.best_algorithm}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Metadata */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-600" />
                  Metadata
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created By:</span>
                      <span className="font-medium">{modelData.created_by}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{new Date(modelData.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="font-medium">{new Date(modelData.updated_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Job ID:</span>
                      <span className="font-medium font-mono text-xs">{modelData.training_job_id}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Versions Tab */}
            <TabsContent value="versions" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                  Version History ({modelData.versions.length} versions)
                </h3>
                <div className="space-y-3">
                  {modelData.versions.map((version, idx) => (
                    <Card key={idx} className={`p-4 ${version.is_current ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold font-mono text-lg">{version.version}</span>
                            {version.is_current && (
                              <Badge className="bg-blue-600 text-white">Current</Badge>
                            )}
                            <Badge className={statusConfig[version.status]}>
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
                              <div className="font-medium">{version.model_size_mb?.toFixed(1)} MB</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Training Time</div>
                              <div className="font-medium">{version.training_time_seconds?.toFixed(1)}s</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Created {new Date(version.created_at).toLocaleString()} by {version.created_by}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!version.is_current && version.status !== 'archived' && onDeploy && (
                            <Button size="sm" variant="outline" onClick={() => onDeploy(modelData.id, version.version)}>
                              <Rocket className="h-4 w-4 mr-1" />
                              Deploy
                            </Button>
                          )}
                          {version.is_current && modelData.versions.length > 1 && onRollback && (
                            <Button size="sm" variant="outline" onClick={() => onRollback(modelData.id, modelData.versions[idx + 1]?.version)}>
                              <ArrowDownCircle className="h-4 w-4 mr-1" />
                              Rollback
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4 mt-0">
              {/* Features List */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  Input Features ({modelData.features.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {modelData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <ChevronRight className="h-4 w-4 text-blue-600" />
                      <span className="font-mono text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Feature Importance */}
              {modelData.feature_importance && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Feature Importance
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(modelData.feature_importance)
                      .sort(([, a], [, b]) => b - a)
                      .map(([feature, importance], idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-mono">{feature}</span>
                            <span className="text-sm font-bold">{(importance * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={importance * 100} className="h-2" />
                        </div>
                      ))}
                  </div>
                </Card>
              )}

              {/* Hyperparameters */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Hyperparameters
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(modelData.hyperparameters).map(([key, value], idx) => (
                    <div key={idx} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                      <span className="text-sm text-muted-foreground">{key}:</span>
                      <span className="text-sm font-mono font-medium">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Artifacts Tab */}
            <TabsContent value="artifacts" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-orange-600" />
                  Model Artifacts & Files
                </h3>
                <div className="space-y-3">
                  {Object.entries(modelData.artifacts).map(([key, path], idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileCode className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium capitalize">{key.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-muted-foreground font-mono">{path}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Deployment Tab */}
            <TabsContent value="deployment" className="space-y-4 mt-0">
              {/* Current Deployment Status */}
              {modelData.is_deployed && (
                <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">
                        Currently Deployed
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Version {modelData.deployed_version} deployed at {new Date(modelData.deployed_at!).toLocaleString()}
                      </p>
                      <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded font-mono text-xs">
                        {modelData.deployment_url}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Deployment History */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600" />
                  Deployment History
                </h3>
                <div className="space-y-3">
                  {modelData.deployment_history.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="flex-shrink-0">
                        {event.action === 'deployed' && <Rocket className="h-5 w-5 text-green-600" />}
                        {event.action === 'rolled_back' && <ArrowDownCircle className="h-5 w-5 text-orange-600" />}
                        {event.action === 'promoted' && <ArrowUpCircle className="h-5 w-5 text-blue-600" />}
                        {event.action === 'archived' && <Archive className="h-5 w-5 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold capitalize">{event.action.replace('_', ' ')}</span>
                          <Badge variant="outline" className="font-mono">{event.version}</Badge>
                          <Badge variant="secondary" className="capitalize">{event.environment}</Badge>
                        </div>
                        {event.notes && (
                          <p className="text-sm text-muted-foreground">{event.notes}</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleString()} by {event.deployed_by}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Lineage Tab */}
            <TabsContent value="lineage" className="space-y-4 mt-0">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GitMerge className="h-5 w-5 text-purple-600" />
                  Model Lineage & Provenance
                </h3>
                <div className="space-y-6">
                  {/* Flow Diagram */}
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                        <Database className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold text-sm">Source Data</div>
                        <div className="text-xs text-muted-foreground mt-1">{modelData.lineage.source_data}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-8 w-8 text-gray-400 mx-2" />
                    <div className="text-center flex-1">
                      <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                        <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-semibold text-sm">Preprocessing</div>
                        <div className="text-xs text-muted-foreground mt-1">{modelData.lineage.preprocessing_pipeline}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-8 w-8 text-gray-400 mx-2" />
                    <div className="text-center flex-1">
                      <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-green-300 dark:border-green-700">
                        <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="font-semibold text-sm">Training</div>
                        <div className="text-xs text-muted-foreground mt-1">{modelData.lineage.training_job}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-8 w-8 text-gray-400 mx-2" />
                    <div className="text-center flex-1">
                      <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
                        <Rocket className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                        <div className="font-semibold text-sm">Model</div>
                        <div className="text-xs text-muted-foreground mt-1">{modelData.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Source Dataset</div>
                      <div className="font-semibold">{modelData.training_config.dataset_name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">{modelData.training_config.dataset_id}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Training Job</div>
                      <div className="font-semibold">ML Flow Pipeline</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">{modelData.training_job_id}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            {onArchive && modelData.status !== 'archived' && (
              <Button variant="outline" onClick={() => onArchive(modelData.id)} className="gap-2">
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" onClick={() => onDelete(modelData.id)} className="gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {!modelData.is_deployed && onDeploy && (
              <Button onClick={() => onDeploy(modelData.id, modelData.current_version)} className="gap-2">
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