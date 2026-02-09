/**
 * Data Management Component - API Integrated!
 * Shows datasets and data sources with real backend data
 */

import { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useDatasets } from '../../hooks/useDatasets';
import { useDataSources } from '../../hooks/useDataSources';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import {
  Upload,
  Database,
  Plus,
  Link2,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  RefreshCw,
  ChevronRight,
  Table as TableIcon,
  BarChart3,
  FileText,
  Server,
  Cloud,
} from 'lucide-react';
import type { Dataset, DataSource } from '../../services/api/types';

export function DataManagement() {
  const { currentProject } = useProject();
  const { datasets, loading: datasetsLoading, refetch: refetchDatasets } = useDatasets(currentProject?.id);
  const { dataSources, loading: dataSourcesLoading, refetch: refetchDataSources } = useDataSources(currentProject?.id);
  const [selectedTab, setSelectedTab] = useState('datasets');

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Project Selected</h3>
          <p className="text-muted-foreground">
            Select a project to manage datasets and data sources
          </p>
        </div>
      </div>
    );
  }

  // Dataset status badge configuration
  const datasetStatusConfig = {
    ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400', icon: CheckCircle },
    PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400', icon: RefreshCw },
    UPLOADING: { label: 'Uploading', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400', icon: Upload },
    ERROR: { label: 'Error', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400', icon: AlertCircle },
    DELETED: { label: 'Deleted', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Trash2 },
  };

  // Data source status configuration
  const sourceStatusConfig = {
    CONNECTED: { label: 'Connected', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400', icon: CheckCircle },
    DISCONNECTED: { label: 'Disconnected', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: AlertCircle },
    ERROR: { label: 'Error', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400', icon: AlertCircle },
    TESTING: { label: 'Testing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400', icon: RefreshCw },
  };

  // Data source type icons
  const sourceTypeIcons = {
    POSTGRESQL: { icon: Database, color: 'text-blue-500' },
    MYSQL: { icon: Database, color: 'text-orange-500' },
    SQLITE: { icon: Database, color: 'text-gray-500' },
    BIGQUERY: { icon: Cloud, color: 'text-blue-600' },
    AWS_S3: { icon: Cloud, color: 'text-orange-600' },
    GCS: { icon: Cloud, color: 'text-blue-500' },
    API: { icon: Server, color: 'text-purple-500' },
    CSV_FILE: { icon: FileText, color: 'text-green-500' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage datasets and data source connections for {currentProject.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            refetchDatasets();
            refetchDataSources();
            toast.success('Data refreshed');
          }}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {selectedTab === 'datasets' && (
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Dataset
            </Button>
          )}
          {selectedTab === 'sources' && (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Data Source
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="datasets" className="gap-2">
            <TableIcon className="h-4 w-4" />
            Datasets ({datasets.length})
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-2">
            <Link2 className="h-4 w-4" />
            Data Sources ({dataSources.length})
          </TabsTrigger>
        </TabsList>

        {/* Datasets Tab */}
        <TabsContent value="datasets" className="space-y-4 mt-6">
          {datasetsLoading ? (
            <Card className="p-8">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading datasets...</p>
              </div>
            </Card>
          ) : datasets.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <TableIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Datasets Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first dataset to start training models
                </p>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Dataset
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {datasets.map((dataset) => {
                const statusInfo = datasetStatusConfig[dataset.status] || datasetStatusConfig.ACTIVE;
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={dataset.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TableIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg truncate">{dataset.name}</h3>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          {dataset.description && (
                            <p className="text-sm text-muted-foreground mb-3">{dataset.description}</p>
                          )}
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">File</div>
                              <div className="font-medium">{dataset.fileName}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Size</div>
                              <div className="font-medium">{dataset.fileSize}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Rows</div>
                              <div className="font-medium">{dataset.rowCount.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Columns</div>
                              <div className="font-medium">{dataset.columnCount}</div>
                            </div>
                          </div>
                          {dataset.qualityScore !== null && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Data Quality</span>
                                <span className="font-medium">{(dataset.qualityScore * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    dataset.qualityScore >= 0.9
                                      ? 'bg-green-500'
                                      : dataset.qualityScore >= 0.7
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${dataset.qualityScore * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="mt-3 text-xs text-muted-foreground">
                            Uploaded {dataset.createdAtLabel || 'recently'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Quality
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-4 mt-6">
          {dataSourcesLoading ? (
            <Card className="p-8">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading data sources...</p>
              </div>
            </Card>
          ) : dataSources.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Link2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Data Sources Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Connect to databases or cloud storage to import data
                </p>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Data Source
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataSources.map((source) => {
                const statusInfo = sourceStatusConfig[source.status] || sourceStatusConfig.DISCONNECTED;
                const StatusIcon = statusInfo.icon;
                const typeInfo = sourceTypeIcons[source.sourceType] || sourceTypeIcons.API;
                const TypeIcon = typeInfo.icon;

                return (
                  <Card key={source.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon className={`h-6 w-6 ${typeInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{source.name}</h3>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        {source.description && (
                          <p className="text-sm text-muted-foreground mb-2">{source.description}</p>
                        )}
                        <div className="text-sm space-y-1">
                          <div className="text-muted-foreground">
                            <span className="font-medium">Type:</span> {source.sourceType}
                          </div>
                          {source.host && (
                            <div className="text-muted-foreground">
                              <span className="font-medium">Host:</span> {source.host}:{source.port}
                            </div>
                          )}
                          {source.databaseName && (
                            <div className="text-muted-foreground">
                              <span className="font-medium">Database:</span> {source.databaseName}
                            </div>
                          )}
                          {source.bucketName && (
                            <div className="text-muted-foreground">
                              <span className="font-medium">Bucket:</span> {source.bucketName}
                            </div>
                          )}
                          {source.lastTestedAt && (
                            <div className="text-xs text-muted-foreground mt-2">
                              Last tested {new Date(source.lastTestedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="gap-2 flex-1">
                        <RefreshCw className="h-4 w-4" />
                        Test
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 flex-1">
                        <TableIcon className="h-4 w-4" />
                        Browse
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
