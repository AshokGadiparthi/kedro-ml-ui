/**
 * BigQuery-Style Dataset Tree View
 * Left sidebar with tree structure, right panel with details
 */

import { useState, useEffect } from 'react';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { datasetService } from '@/services';
import { SchemaTab } from './dataset-details/SchemaTab';
import { PreviewTab } from './dataset-details/PreviewTab';
import { QualityTab } from './dataset-details/QualityTab';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Layers,
  Table as TableIcon,
  Database,
  BarChart3,
  Eye,
  Info,
  Grid,
  Link2,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { Dataset, DatasetCollection } from '@/types/datasetCollection';

interface DatasetTreeViewProps {
  datasets: any[];
  multiTableCollections: DatasetCollection[];
  projectName: string;
  onDatasetSelect: (dataset: any) => void;
  onMultiTableSelect: (collection: DatasetCollection) => void;
}

export function DatasetTreeView({
  datasets,
  multiTableCollections,
  projectName,
  onDatasetSelect,
  onMultiTableSelect,
}: DatasetTreeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMultiTables, setExpandedMultiTables] = useState<Set<string>>(new Set());
  const [expandedSection, setExpandedSection] = useState({ multiTable: true, individual: true });
  const [selectedItem, setSelectedItem] = useState<{ type: 'dataset' | 'multitable' | 'table'; id: string } | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<any | null>(null);
  const [selectedMultiTable, setSelectedMultiTable] = useState<DatasetCollection | null>(null);
  const [detailsTab, setDetailsTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const toggleMultiTable = (id: string) => {
    const newExpanded = new Set(expandedMultiTables);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedMultiTables(newExpanded);
  };

  const handleDatasetClick = (dataset: any) => {
    setSelectedItem({ type: 'dataset', id: dataset.id });
    setSelectedDataset(dataset);
    setSelectedMultiTable(null);
    setDetailsTab('overview'); // Reset to overview
    onDatasetSelect(dataset);
  };

  const handleMultiTableClick = (collection: DatasetCollection) => {
    setSelectedItem({ type: 'multitable', id: collection.id });
    setSelectedMultiTable(collection);
    setSelectedDataset(null);
    setDetailsTab('overview'); // Reset to overview when switching to collection
    onMultiTableSelect(collection);
  };

  const handleTableInCollectionClick = async (table: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collection from toggling
    
    console.log('🖱️ Table clicked:', table);
    console.log('📋 Available datasets:', datasets.map(d => ({ id: d.id, name: d.name })));
    
    // Fetch the full dataset details
    if (table.datasetId) {
      console.log('✅ Table has datasetId:', table.datasetId);
      setLoading(true);
      try {
        const fullDataset = datasets.find(d => d.id === table.datasetId);
        console.log('🔍 Found dataset:', fullDataset);
        console.log('📊 Dataset details - rowCount:', fullDataset?.rowCount, 'columnCount:', fullDataset?.columnCount, 'fileSize:', fullDataset?.fileSize);
        if (fullDataset) {
          setSelectedItem({ type: 'dataset', id: table.datasetId });
          setSelectedDataset(fullDataset);
          setSelectedMultiTable(null);
          setDetailsTab('overview'); // Reset to overview
          onDatasetSelect(fullDataset);
        } else {
          console.error('❌ Dataset not found in datasets list for datasetId:', table.datasetId);
        }
      } catch (error) {
        console.error('Failed to load table dataset:', error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error('❌ Table missing datasetId:', table);
    }
  };

  // Filter datasets and collections by search
  const filteredDatasets = datasets.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCollections = multiTableCollections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get dataset IDs that belong to multi-table collections (to exclude from individual datasets list)
  const collectionDatasetIds = new Set<string>();
  multiTableCollections.forEach((collection) => {
    (collection.tables || []).forEach((table) => {
      if (table.datasetId) {
        collectionDatasetIds.add(table.datasetId);
      }
    });
  });

  // Filter out datasets that belong to collections
  const standaloneDatasets = filteredDatasets.filter(
    (dataset) => !collectionDatasetIds.has(dataset.id)
  );

  const formatNumber = (num: number) => num.toLocaleString();
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-240px)]">
      {/* Left Sidebar - Tree View */}
      <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-auto p-2">
          {/* Project Root */}
          <div className="mb-2">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground">
              <Database className="h-4 w-4" />
              {projectName}
            </div>
          </div>

          {/* Multi-Table Section */}
          {filteredCollections.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setExpandedSection({ ...expandedSection, multiTable: !expandedSection.multiTable })}
                className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium hover:bg-muted rounded w-full"
              >
                {expandedSection.multiTable ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Layers className="h-4 w-4 text-purple-500" />
                <span>Multi-Table ({filteredCollections.length})</span>
              </button>

              {expandedSection.multiTable && (
                <div className="ml-2 mt-1 space-y-0.5">
                  {filteredCollections.map((collection) => {
                    const isExpanded = expandedMultiTables.has(collection.id);
                    const isSelected = selectedItem?.type === 'multitable' && selectedItem.id === collection.id;
                    const statusConfig: Record<string, { icon: any; color: string }> = {
                      draft: { icon: Settings, color: 'text-gray-500' },
                      configured: { icon: CheckCircle, color: 'text-blue-500' },
                      processing: { icon: Loader2, color: 'text-blue-500' },
                      processed: { icon: CheckCircle, color: 'text-green-500' },
                      ready: { icon: CheckCircle, color: 'text-green-500' },
                      failed: { icon: AlertCircle, color: 'text-red-500' },
                    };
                    const status = statusConfig[collection.status] || statusConfig.draft; // Fallback to draft
                    const StatusIcon = status.icon;

                    return (
                      <div key={collection.id}>
                        <div
                          className={`flex items-center gap-1 px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-muted ${
                            isSelected ? 'bg-primary/10 text-primary font-medium' : ''
                          }`}
                        >
                          <button
                            onClick={() => toggleMultiTable(collection.id)}
                            className="p-0 hover:bg-transparent"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>
                          <div
                            onClick={() => handleMultiTableClick(collection)}
                            className="flex items-center gap-1.5 flex-1"
                          >
                            <Layers className="h-3.5 w-3.5 text-purple-500" />
                            <span className="truncate flex-1">{collection.name}</span>
                            <StatusIcon className={`h-3 w-3 ${status.color}`} />
                          </div>
                        </div>

                        {/* Nested Tables */}
                        {isExpanded && (
                          <div className="ml-6 mt-0.5 space-y-0.5">
                            {/* Regular tables (non-derived) */}
                            {(collection.tables || []).filter(table => table.role !== 'derived').map((table, tableIdx) => {
                              const tableIsSelected = selectedItem?.type === 'dataset' && selectedItem.id === table.datasetId;
                              
                              return (
                                <div
                                  key={table.id || `table-${tableIdx}`}
                                  onClick={(e) => handleTableInCollectionClick(table, e)}
                                  className={`flex items-center gap-1.5 px-2 py-1 text-sm rounded hover:bg-muted cursor-pointer ${
                                    tableIsSelected ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                                  }`}
                                >
                                  <FileText className="h-3 w-3" />
                                  <span className="truncate">{table.fileName || table.name}</span>
                                </div>
                              );
                            })}
                            
                            {/* Merged Dataset (derived) */}
                            {(collection.tables || []).filter(table => table.role === 'derived').map((table, tableIdx) => {
                              const tableIsSelected = selectedItem?.type === 'dataset' && selectedItem.id === table.datasetId;
                              
                              return (
                                <div
                                  key={table.id || `derived-${tableIdx}`}
                                  onClick={(e) => handleTableInCollectionClick(table, e)}
                                  className={`flex items-center gap-1.5 px-2 py-1 text-sm rounded hover:bg-muted cursor-pointer ${
                                    tableIsSelected ? 'bg-gradient-to-r from-amber-500/10 to-emerald-500/10 text-primary font-medium shadow-sm' : 'text-muted-foreground'
                                  }`}
                                >
                                  <Sparkles className="h-3 w-3 text-amber-500" />
                                  <span className="truncate flex-1">Merged Dataset</span>
                                  <Badge variant="outline" className="text-[10px] h-4 px-1 bg-gradient-to-r from-amber-500/10 to-emerald-500/10">
                                    Final
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Individual Datasets Section */}
          {standaloneDatasets.length > 0 && (
            <div>
              <button
                onClick={() => setExpandedSection({ ...expandedSection, individual: !expandedSection.individual })}
                className="flex items-center gap-1 px-2 py-1.5 text-sm font-medium hover:bg-muted rounded w-full"
              >
                {expandedSection.individual ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <TableIcon className="h-4 w-4 text-primary" />
                <span>Datasets ({standaloneDatasets.length})</span>
              </button>

              {expandedSection.individual && (
                <div className="ml-2 mt-1 space-y-0.5">
                  {standaloneDatasets.map((dataset) => {
                    const isSelected = selectedItem?.type === 'dataset' && selectedItem.id === dataset.id;

                    return (
                      <div
                        key={dataset.id}
                        onClick={() => handleDatasetClick(dataset)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-muted ${
                          isSelected ? 'bg-primary/10 text-primary font-medium' : ''
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="truncate flex-1">{dataset.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Right Panel - Details */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selectedDataset || selectedMultiTable ? (
          <>
            {/* Details Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                {selectedMultiTable ? (
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TableIcon className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    {selectedMultiTable?.name || selectedDataset?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedMultiTable
                      ? `${(selectedMultiTable.tables || []).length} tables • ${(selectedMultiTable.relationships || []).length} joins`
                      : `${selectedDataset?.rowCount ? formatNumber(selectedDataset.rowCount) : 'N/A'} rows • ${selectedDataset?.columnCount || 'N/A'} columns`}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Tabs */}
            <Tabs value={detailsTab} onValueChange={setDetailsTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-4 mt-4">
                <TabsTrigger value="overview" className="gap-2">
                  <Info className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                {selectedDataset && (
                  <>
                    <TabsTrigger value="schema" className="gap-2">
                      <Grid className="h-4 w-4" />
                      Schema
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="quality" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Quality
                    </TabsTrigger>
                  </>
                )}
                {selectedMultiTable && (
                  <>
                    <TabsTrigger value="tables" className="gap-2">
                      <TableIcon className="h-4 w-4" />
                      Tables
                    </TabsTrigger>
                    <TabsTrigger value="relationships" className="gap-2">
                      <Link2 className="h-4 w-4" />
                      Relationships
                    </TabsTrigger>
                    <TabsTrigger value="aggregations" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Aggregations
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="flex-1 overflow-auto p-4">
                {selectedDataset && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Rows</div>
                        <div className="text-2xl font-bold">
                          {selectedDataset.rowCount ? formatNumber(selectedDataset.rowCount) : 'N/A'}
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Columns</div>
                        <div className="text-2xl font-bold">{selectedDataset.columnCount || 'N/A'}</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Size</div>
                        <div className="text-2xl font-bold">
                          {selectedDataset.fileSize != null && selectedDataset.fileSize > 0
                            ? formatFileSize(selectedDataset.fileSize)
                            : 'N/A'}
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Quality</div>
                        <div className="text-2xl font-bold">
                          {selectedDataset.qualityScore ? `${Math.round(selectedDataset.qualityScore * 100)}%` : 'N/A'}
                        </div>
                      </Card>
                    </div>
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Dataset Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">File Name:</span>
                          <span className="font-medium">{selectedDataset.fileName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge>{selectedDataset.status || 'ACTIVE'}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uploaded:</span>
                          <span className="font-medium">{selectedDataset.createdAtLabel || 'Recently'}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
                {selectedMultiTable && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Tables</div>
                        <div className="text-2xl font-bold">{(selectedMultiTable.tables || []).length}</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Joins</div>
                        <div className="text-2xl font-bold">{(selectedMultiTable.relationships || []).length}</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">Aggregations</div>
                        <div className="text-2xl font-bold">{(selectedMultiTable.aggregations || []).length}</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-1">
                          {selectedMultiTable.mergedDataset ? 'Final Rows' : 'Total Rows'}
                        </div>
                        <div className="text-2xl font-bold">
                          {selectedMultiTable.mergedDataset 
                            ? formatNumber(selectedMultiTable.mergedDataset.rowCount)
                            : formatNumber((selectedMultiTable.tables || []).reduce((sum, t) => sum + (t.rowCount || 0), 0))}
                        </div>
                      </Card>
                    </div>
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Configuration</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Primary Table:</span>
                          <Badge>{selectedMultiTable.primaryTable || 'N/A'}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Target Column:</span>
                          <span className="font-medium">{selectedMultiTable.targetColumn || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={selectedMultiTable.status === 'ready' ? 'default' : 'secondary'}>
                            {selectedMultiTable.status || 'draft'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Tables Tab (Multi-Table only) */}
              {selectedMultiTable && (
                <TabsContent value="tables" className="flex-1 overflow-auto p-4">
                  <div className="space-y-3">
                    {(selectedMultiTable.tables || []).length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <TableIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No tables found</p>
                      </div>
                    ) : (
                      (selectedMultiTable.tables || []).map((table) => (
                        <Card
                          key={table.id}
                          className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={(e) => handleTableInCollectionClick(table, e)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{table.name}</span>
                                {table.isPrimary && (
                                  <Badge variant="default">Primary</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {table.rowCount ? formatNumber(table.rowCount) + ' rows' : 'N/A'} • {table.columns.length} columns
                                {table.fileSize && ` • ${formatFileSize(table.fileSize)}`}
                              </p>
                            </div>
                          </div>
                          {table.columns.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {table.columns.slice(0, 10).map((col, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {col.name}
                                  {col.isPrimaryKey && ' 🔑'}
                                </Badge>
                              ))}
                              {table.columns.length > 10 && (
                                <Badge variant="outline" className="text-xs">
                                  +{table.columns.length - 10} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              )}

              {/* Relationships Tab (Multi-Table only) */}
              {selectedMultiTable && (
                <TabsContent value="relationships" className="flex-1 overflow-auto p-4">
                  <div className="space-y-3">
                    {(selectedMultiTable.relationships || []).length > 0 ? (
                      (selectedMultiTable.relationships || []).map((rel, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{rel.leftTable}</Badge>
                            <span className="text-muted-foreground text-sm">{rel.joinType}</span>
                            <Badge variant="outline">{rel.rightTable}</Badge>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            ON {rel.leftKey} = {rel.rightKey}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-12">
                        <Link2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No relationships configured yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* Aggregations Tab (Multi-Table only) */}
              {selectedMultiTable && (
                <TabsContent value="aggregations" className="flex-1 overflow-auto p-4">
                  <div className="space-y-3">
                    {(selectedMultiTable.aggregations || []).length > 0 ? (
                      (selectedMultiTable.aggregations || []).map((agg, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{agg.sourceTable}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Group by {agg.groupByColumn}</span>
                          </div>
                          {agg.features && agg.features.length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm text-muted-foreground mb-1">Aggregations:</div>
                              <div className="flex flex-wrap gap-1">
                                {agg.features.map((feature, fIdx) => (
                                  <Badge key={fIdx} variant="outline" className="text-xs">
                                    {feature.column}: {feature.functions.join(', ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-12">
                        <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No aggregations configured yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* Schema Tab */}
              <TabsContent value="schema" className="flex-1 overflow-auto p-4">
                {selectedDataset ? (
                  <SchemaTab datasetId={selectedDataset.id} />
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    Select a dataset to view schema
                  </div>
                )}
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="flex-1 overflow-auto p-4">
                {selectedDataset ? (
                  <PreviewTab datasetId={selectedDataset.id} />
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    Select a dataset to view preview
                  </div>
                )}
              </TabsContent>

              {/* Quality Tab */}
              <TabsContent value="quality" className="flex-1 overflow-auto p-4">
                {selectedDataset ? (
                  <QualityTab datasetId={selectedDataset.id} />
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    Select a dataset to view quality metrics
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Dataset Selected</h3>
              <p className="text-muted-foreground">
                Select a dataset from the tree view to see its details
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}