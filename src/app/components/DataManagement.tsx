/**
 * Data Management Component - API Integrated!
 * Shows datasets and data sources with real backend data
 */

import { useState, useEffect, useRef } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { datasetService, datasourceService, collectionService } from '@/services';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { MultiTableWizard } from './dataset-collection/MultiTableWizardFullScreen';
import { MultiTableDetailsModal } from './dataset-collection/MultiTableDetailsModal';
import { DatasetTreeView } from './DatasetTreeView';
import { UploadDatasetDialog } from './UploadDatasetDialog';
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
  ChevronDown,
  Table as TableIcon,
  BarChart3,
  FileText,
  Server,
  Cloud,
  X,
  Layers,
  Edit,
  Settings,
  Search,
  Folder,
  FolderOpen,
} from 'lucide-react';
import type { Dataset, DataSource, DataSourceType } from '@/services';
import type { DatasetCollection } from '@/types/datasetCollection';

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatPercentage(value: number, decimals: number = 0, multiply100: boolean = false): string {
  const val = multiply100 ? value : value * 100;
  return val.toFixed(decimals) + '%';
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

export function DataManagement() {
  const { currentProject } = useProject();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedTab, setSelectedTab] = useState('datasets');

  // Multi-Table Datasets State
  const [multiTableCollections, setMultiTableCollections] = useState<DatasetCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<DatasetCollection | null>(null);
  const [showCollectionDetails, setShowCollectionDetails] = useState(false);

  // Tree View State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMultiTables, setExpandedMultiTables] = useState<Set<string>>(new Set());
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedMultiTable, setSelectedMultiTable] = useState<DatasetCollection | null>(null);
  const [detailsTab, setDetailsTab] = useState('overview');

  // Multi-Table Wizard State
  const [showMultiTableWizard, setShowMultiTableWizard] = useState(false);

  // Upload Dialog State
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Fetch datasets
  const refetchDatasets = async () => {
    if (currentProject?.id) {
      try {
        const response = await datasetService.getDatasets(currentProject.id);
        setDatasets(response);
      } catch (error: any) {
        console.error('Failed to fetch datasets:', error);
        toast.error(error.message || 'Failed to fetch datasets');
      }
    }
  };

  // Fetch data sources
  const refetchDataSources = async () => {
    if (currentProject?.id) {
      try {
        const response = await datasourceService.getDataSources(currentProject.id);
        setDataSources(response);
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch data sources');
      }
    }
  };

  // Fetch multi-table collections
  const refetchCollections = async () => {
    if (currentProject?.id) {
      try {
        console.log('📦 Fetching multi-table collections...');
        const response = await collectionService.list(currentProject.id);
        console.log('✅ Collections loaded:', response);
        console.log('📊 First collection structure:', response[0]);
        console.log('📋 First collection tables:', response[0]?.tables);
        setMultiTableCollections(response);

        // Extract all unique dataset IDs from collection tables
        const collectionDatasetIds = new Set<string>();
        response.forEach((collection) => {
          (collection.tables || []).forEach((table) => {
            if (table.datasetId) {
              collectionDatasetIds.add(table.datasetId);
            }
          });
        });

        // Fetch datasets for each table in collections
        if (collectionDatasetIds.size > 0) {
          console.log('🔍 Fetching datasets for collection tables:', Array.from(collectionDatasetIds));
          const collectionDatasets = await Promise.all(
            Array.from(collectionDatasetIds).map(async (datasetId) => {
              try {
                return await datasetService.getDatasetById(datasetId);
              } catch (error) {
                console.warn(`⚠️ Failed to fetch dataset ${datasetId}:`, error);
                return null;
              }
            })
          );

          // Add collection datasets to the main datasets list
          setDatasets((prev) => {
            const existingIds = new Set(prev.map(d => d.id));
            const newDatasets = collectionDatasets.filter(d => d && !existingIds.has(d.id));
            console.log('📊 Adding collection datasets:', newDatasets.length);
            return [...prev, ...newDatasets];
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch collections:', error);
        // Don't show error toast, just use empty array
        setMultiTableCollections([]);
      }
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch datasets first
      await refetchDatasets();
      // Then fetch data sources in parallel with collections
      await Promise.all([
        refetchDataSources(),
        refetchCollections()
      ]);
    };
    
    fetchAllData();
  }, [currentProject?.id]);

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

  // Data source status configuration
  const sourceStatusConfig = {
    CONNECTED: { label: 'Connected', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400', icon: CheckCircle },
    DISCONNECTED: { label: 'Disconnected', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: AlertCircle },
    ERROR: { label: 'Error', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400', icon: AlertCircle },
    TESTING: { label: 'Testing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400', icon: RefreshCw },
  };

  // Data source type icons
  const sourceTypeIcons = {
    POSTGRESQL: { icon: Database, color: 'text-blue-500', label: 'PostgreSQL' },
    MYSQL: { icon: Database, color: 'text-orange-500', label: 'MySQL' },
    SQLITE: { icon: Database, color: 'text-gray-500', label: 'SQLite' },
    BIGQUERY: { icon: Cloud, color: 'text-blue-600', label: 'BigQuery' },
    AWS_S3: { icon: Cloud, color: 'text-orange-600', label: 'AWS S3' },
    GCS: { icon: Cloud, color: 'text-blue-500', label: 'Google Cloud Storage' },
    API: { icon: Server, color: 'text-purple-500', label: 'API' },
    CSV_FILE: { icon: FileText, color: 'text-green-500', label: 'CSV File' },
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
            <>
              <Button variant="outline" className="gap-2" onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4" />
                Upload Dataset
              </Button>
              <Button className="gap-2" onClick={() => setShowMultiTableWizard(true)}>
                <Layers className="h-4 w-4" />
                Multi-Table Wizard
              </Button>
            </>
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
        <TabsContent value="datasets" className="mt-6">
          {datasets.length === 0 && multiTableCollections.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <TableIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Datasets Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first dataset to start training models
                </p>
              </div>
            </Card>
          ) : (
            <DatasetTreeView
              datasets={datasets}
              multiTableCollections={multiTableCollections}
              projectName={currentProject?.name || 'Project'}
              onDatasetSelect={(dataset) => {
                setSelectedDataset(dataset);
                setSelectedMultiTable(null);
              }}
              onMultiTableSelect={(collection) => {
                setSelectedMultiTable(collection);
                setSelectedDataset(null);
              }}
            />
          )}
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="sources" className="space-y-4 mt-6">
          {dataSources.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Link2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Data Sources Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Connect to databases or cloud storage to import data
                </p>
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
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                            {typeInfo.label}
                          </Badge>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        {source.description && (
                          <p className="text-sm text-muted-foreground mb-2">{source.description}</p>
                        )}
                        <div className="text-sm text-muted-foreground">
                          Last synced: {source.lastSyncedLabel || 'Never'}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MultiTableWizard
        open={showMultiTableWizard}
        onClose={() => setShowMultiTableWizard(false)}
        onComplete={async (collection) => {
          try {
            console.log('🚀 Creating multi-table collection:', collection);
            
            // Extract files from tables
            const files = collection.tables
              ?.map(t => t.file)
              .filter((f): f is File => f instanceof File) || [];
            
            if (files.length === 0) {
              throw new Error('No files provided');
            }
            
            if (!currentProject?.id) {
              throw new Error('No project selected');
            }

            // Step 1: Create collection and upload files
            console.log('📤 Step 1: Creating collection and uploading files...');
            const created = await collectionService.create(
              collection.name || 'Untitled Collection',
              currentProject.id,
              files,
              collection.description
            );
            
            console.log('✅ Collection created:', created.id);

            // Step 2: Set primary table
            if (collection.primaryTable) {
              console.log('🎯 Step 2: Setting primary table:', collection.primaryTable);
              const primaryTableId = created.tables.find(t => t.name === collection.primaryTable)?.id;
              if (primaryTableId) {
                await collectionService.setPrimary(
                  created.id,
                  primaryTableId,
                  collection.targetColumn
                );
              }
            }

            // Step 3: Add relationships
            if (collection.relationships && collection.relationships.length > 0) {
              console.log('🔗 Step 3: Adding relationships:', collection.relationships.length);
              for (const rel of collection.relationships) {
                // Find table IDs by name
                const leftTableId = created.tables.find(t => t.name === rel.leftTable)?.id;
                const rightTableId = created.tables.find(t => t.name === rel.rightTable)?.id;
                
                if (leftTableId && rightTableId) {
                  await collectionService.createRelationship(
                    created.id,
                    rel,  // Pass the whole relationship object
                    created.tables
                  );
                }
              }
            }

            // Step 4: Add aggregations
            if (collection.aggregations && collection.aggregations.length > 0) {
              console.log('📊 Step 4: Adding aggregations:', collection.aggregations.length);
              
              // Filter out aggregations with no features (validation requirement)
              const validAggregations = collection.aggregations.filter(agg => 
                agg.features && agg.features.length > 0
              );
              
              if (validAggregations.length === 0) {
                console.log('⚠️ No valid aggregations (all have empty features), skipping...');
              } else {
                console.log(`✅ Processing ${validAggregations.length} valid aggregations`);
                for (const agg of validAggregations) {
                  // AggregationConfig uses 'tableName' field
                  const sourceTableId = created.tables.find(t => t.name === agg.tableName)?.id;
                  if (sourceTableId) {
                    await collectionService.createAggregation(
                      created.id,
                      agg,
                      created.tables
                    );
                  }
                }
              }
            }

            // Step 5: Build derived dataset
            console.log('⚡ Step 5: Building derived dataset...');
            await collectionService.buildDerivedDataset(created.id);

            // Refresh datasets list FIRST to ensure all datasets are available
            console.log('🔄 Refreshing datasets list...');
            await refetchDatasets();
            
            // Then refresh the collections list
            console.log('🔄 Refreshing collections list...');
            const updatedCollections = await collectionService.list(currentProject.id);
            console.log('✅ Updated collections:', updatedCollections);
            
            // Extract all dataset IDs from the updated collections
            const collectionDatasetIds = new Set<string>();
            updatedCollections.forEach((collection) => {
              (collection.tables || []).forEach((table) => {
                if (table.datasetId) {
                  console.log(`📋 Found table "${table.name}" with datasetId: ${table.datasetId}`);
                  collectionDatasetIds.add(table.datasetId);
                }
              });
            });
            
            // Fetch any missing datasets from collections
            if (collectionDatasetIds.size > 0) {
              console.log('🔍 Fetching datasets for collection tables:', Array.from(collectionDatasetIds));
              const collectionDatasets = await Promise.all(
                Array.from(collectionDatasetIds).map(async (datasetId) => {
                  try {
                    const dataset = await datasetService.getDatasetById(datasetId);
                    console.log(`✅ Fetched dataset ${datasetId}:`, dataset?.name);
                    return dataset;
                  } catch (error) {
                    console.warn(`⚠️ Failed to fetch dataset ${datasetId}:`, error);
                    return null;
                  }
                })
              );
              
              // Update datasets state with collection datasets
              setDatasets((prev) => {
                const existingIds = new Set(prev.map(d => d.id));
                const newDatasets = collectionDatasets.filter((d): d is Dataset => d !== null && !existingIds.has(d.id));
                console.log('📊 Adding collection datasets:', newDatasets.map(d => ({ id: d.id, name: d.name })));
                const updated = [...prev, ...newDatasets];
                console.log('📊 Total datasets after merge:', updated.length);
                return updated;
              });
            }
            
            setMultiTableCollections(updatedCollections);
            
            setShowMultiTableWizard(false);
            
            // Switch to datasets tab to show the new dataset
            setSelectedTab('datasets');
            
            toast.success('Derived dataset created successfully! Check your datasets list.');
          } catch (error: any) {
            console.error('❌ Failed to create collection:', error);
            toast.error(error.message || 'Failed to create multi-table dataset');
          }
        }}
        projectId={currentProject.id}
      />

      {/* Multi-Table Details Modal */}
      <MultiTableDetailsModal
        open={showCollectionDetails}
        onClose={() => setShowCollectionDetails(false)}
        collection={selectedCollection}
      />

      {/* Upload Dataset Dialog */}
      <UploadDatasetDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadSuccess={() => {
          refetchDatasets();
          setShowUploadDialog(false);
        }}
      />
    </div>
  );
}