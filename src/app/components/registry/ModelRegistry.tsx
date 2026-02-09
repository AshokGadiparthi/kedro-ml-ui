/**
 * Model Registry Page
 * World-class model marketplace with versioning, deployment, and complete history
 */

import { useState, useEffect } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useModelRegistry } from '../../../hooks/useModelRegistry';
import type { RegisteredModel } from '../../../services/registry/modelRegistryService';
import * as kedroService from '../../../services/kedro/kedroService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { ModelDetailsModal } from './ModelDetailsModalSimple';
import {
  Layers,
  Plus,
  Search,
  Grid3x3,
  List,
  Rocket,
  TrendingUp,
  Clock,
  Archive,
  Trash2,
  MoreVertical,
  ExternalLink,
  GitBranch,
  PackageCheck,
  RefreshCw,
  Filter,
  Download,
} from 'lucide-react';
import { ModelCard } from './ModelCard';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'production' | 'staging' | 'draft' | 'archived';

interface ModelRegistryProps {
  onNavigateToMLFlow?: () => void;
}

export function ModelRegistry({ onNavigateToMLFlow }: ModelRegistryProps = {}) {
  const { currentProject } = useProject();
  const { models, stats, loading, error, refresh } = useModelRegistry(currentProject?.id);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Auto-refresh when component becomes visible (e.g., returning from ML Flow)
  useEffect(() => {
    console.log('🔄 Model Registry mounted/visible - refreshing data...');
    refresh();
  }, []); // Empty deps means it runs on mount

  // Filter models
  const filteredModels = models.filter((model) => {
    const matchesSearch =
      searchQuery === '' ||
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.best_algorithm.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || model.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleViewDetails = (modelId: string) => {
    setSelectedModelId(modelId);
    setShowDetailsModal(true);
  };

  const handleDeploy = (modelId: string, version?: string) => {
    toast.success(`Deploying model ${modelId} ${version ? `(${version})` : ''}...`);
    // TODO: Implement deployment logic
  };

  const handleRollback = (modelId: string, version: string) => {
    toast.success(`Rolling back to version ${version}...`);
    // TODO: Implement rollback logic
  };

  const handleArchive = (modelId: string) => {
    toast.success(`Archiving model ${modelId}...`);
    // TODO: Implement archive logic
  };

  const handleDelete = (modelId: string) => {
    toast.error(`Deleting model ${modelId}...`);
    // TODO: Implement delete logic
  };

  // Download Kedro source code for a model
  const handleDownloadSource = async (modelId: string) => {
    if (!currentProject?.id) {
      toast.error('No project selected');
      return;
    }

    try {
      const model = models.find((m) => m.id === modelId);
      if (!model) {
        toast.error('Model not found');
        return;
      }

      toast.loading('Downloading Kedro source code...', { id: 'download-source' });

      // Use the collection_id and dataset_path directly from the model object
      const downloadParams: kedroService.DownloadKedroSourceParams = {
        projectId: currentProject.id,
        filePath: model.dataset_path || '', // Use the dataset_path from backend
        collectionId: model.collection_id || undefined, // Use collection_id if available, otherwise undefined
        modelName: model.name, // Pass the model name for Kedro source code generation
      };
      
      console.log('📦 Downloading Kedro source code:', {
        modelId,
        modelName: model.name,
        collectionId: model.collection_id,
        datasetPath: model.dataset_path,
        params: downloadParams,
      });

      await kedroService.downloadKedroSource(downloadParams);
      
      toast.success('Kedro source code downloaded successfully!', { id: 'download-source' });
    } catch (error: any) {
      console.error('❌ Failed to download source code:', error);
      toast.error(error.message || 'Failed to download Kedro source code', { id: 'download-source' });
    }
  };

  // Navigate to ML Flow to train new model
  const handleRegisterNewModel = () => {
    if (onNavigateToMLFlow) {
      onNavigateToMLFlow();
      toast.info('Navigate to ML Flow to train a new model');
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <PackageCheck className="h-8 w-8 text-blue-600" />
                Model Registry
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage and deploy your trained machine learning models
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={refresh} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button className="gap-2" onClick={handleRegisterNewModel}>
                <Plus className="h-4 w-4" />
                Register New Model
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 bg-white dark:bg-gray-950">
              <div className="flex items-center gap-3">
                <PackageCheck className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats?.total_models || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Models</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-gray-950">
              <div className="flex items-center gap-3">
                <Rocket className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats?.deployed || 0}</div>
                  <div className="text-sm text-muted-foreground">Deployed</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-gray-950">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats?.production || 0}</div>
                  <div className="text-sm text-muted-foreground">Production</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white dark:bg-gray-950">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats?.staging || 0}</div>
                  <div className="text-sm text-muted-foreground">Staging</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b bg-white dark:bg-gray-950 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search models, algorithms, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter by Status */}
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>

          {/* Export */}
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Active Filters */}
        {(searchQuery || filterStatus !== 'all') && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-600">
                  ×
                </button>
              </Badge>
            )}
            {filterStatus !== 'all' && (
              <Badge variant="secondary" className="gap-1 capitalize">
                Status: {filterStatus}
                <button onClick={() => setFilterStatus('all')} className="ml-1 hover:text-red-600">
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Models Grid/List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Loading models...</p>
            </div>
          </div>
        ) : filteredModels.length === 0 ? (
          <Card className="p-12 text-center">
            <PackageCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Models Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Get started by training your first model'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button className="gap-2" onClick={handleRegisterNewModel}>
                <Plus className="h-4 w-4" />
                Register New Model
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onViewDetails={handleViewDetails}
                onDeploy={handleDeploy}
                onDownloadSource={handleDownloadSource}
              />
            ))}
          </div>
        )}
      </div>

      {/* Model Details Modal */}
      <ModelDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        modelId={selectedModelId}
        onDeploy={handleDeploy}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onRefresh={refresh}
      />
    </div>
  );
}