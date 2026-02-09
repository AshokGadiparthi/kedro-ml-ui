/**
 * 🌟 WORLD-CLASS DATASET TREE PANEL
 * Collapsible sidebar for navigating datasets and multi-table collections
 * Inspired by: BigQuery, Databricks, Snowflake
 */

import { useState, useEffect } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  Search,
  ChevronRight,
  ChevronDown,
  FileText,
  Layers,
  Database,
  ChevronLeft,
  Key,
  Sparkles,
  CheckCircle,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { Dataset, DatasetCollection } from '@/types/datasetCollection';

interface DatasetTreePanelProps {
  datasets: Dataset[];
  multiTableCollections: DatasetCollection[];
  selectedDatasetId: string | null;
  onDatasetSelect: (datasetId: string) => void;
  projectName?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DatasetTreePanel({
  datasets,
  multiTableCollections,
  selectedDatasetId,
  onDatasetSelect,
  projectName = 'Current Project',
  isCollapsed,
  onToggleCollapse,
}: DatasetTreePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState({
    multiTable: true,
    individual: true,
  });

  // Auto-expand collection if a file in it is selected
  useEffect(() => {
    if (selectedDatasetId) {
      multiTableCollections.forEach(collection => {
        const hasSelectedFile = collection.tables?.some(table => table.datasetId === selectedDatasetId);
        if (hasSelectedFile) {
          setExpandedCollections(prev => new Set(prev).add(collection.id));
        }
      });
    }
  }, [selectedDatasetId, multiTableCollections]);

  const toggleCollection = (id: string) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSection = (section: 'multiTable' | 'individual') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get dataset IDs that belong to multi-table collections
  const collectionDatasetIds = new Set<string>();
  multiTableCollections.forEach(collection => {
    collection.tables?.forEach(table => {
      if (table.datasetId) {
        collectionDatasetIds.add(table.datasetId);
      }
    });
  });

  // Filter standalone datasets (not part of collections)
  const standaloneDatasets = datasets.filter(
    dataset => !collectionDatasetIds.has(dataset.id)
  );

  // Apply search filter
  const filteredCollections = multiTableCollections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredStandalone = standaloneDatasets.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status configuration for collections
  const statusConfig: Record<string, { icon: any; color: string }> = {
    draft: { icon: Settings, color: 'text-gray-500' },
    configured: { icon: CheckCircle, color: 'text-blue-500' },
    processing: { icon: Loader2, color: 'text-blue-500' },
    processed: { icon: CheckCircle, color: 'text-green-500' },
    ready: { icon: CheckCircle, color: 'text-green-500' },
    failed: { icon: AlertCircle, color: 'text-red-500' },
  };

  const formatRowCount = (count?: number) => {
    if (!count) return '';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Collapsed state - just show toggle button
  if (isCollapsed) {
    return (
      <div className="w-10 bg-card border-r flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
          title="Expand Dataset Tree"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          {filteredCollections.length > 0 && (
            <Layers className="h-4 w-4 text-purple-500" />
          )}
          {filteredStandalone.length > 0 && (
            <FileText className="h-4 w-4 text-primary" />
          )}
        </div>
      </div>
    );
  }

  // Expanded state - full tree
  return (
    <div className="w-[260px] bg-card border-r flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Datasets</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-6 w-6 p-0"
            title="Collapse Panel"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
      </div>

      {/* Tree Content */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-1 space-y-0.5">
          {/* Multi-Table Collections Section */}
          {filteredCollections.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('multiTable')}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent rounded w-full transition-colors"
              >
                {expandedSections.multiTable ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <Layers className="h-3 w-3 text-purple-500" />
                <span>Multi-Table Collections</span>
                <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">
                  {filteredCollections.length}
                </Badge>
              </button>

              {expandedSections.multiTable && (
                <div className="mt-1 space-y-0.5">
                  {filteredCollections.map(collection => {
                    const isExpanded = expandedCollections.has(collection.id);
                    const status = statusConfig[collection.status] || statusConfig.draft;
                    const StatusIcon = status.icon;

                    return (
                      <div key={collection.id}>
                        {/* Collection Header */}
                        <div
                          className="flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors group"
                        >
                          <button
                            onClick={() => toggleCollection(collection.id)}
                            className="p-0 hover:bg-transparent"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>
                          <Layers className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                          <span className="truncate flex-1 text-sm">{collection.name}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              {collection.tables?.length || 0}
                            </Badge>
                            <StatusIcon className={`h-3 w-3 ${status.color} flex-shrink-0`} />
                          </div>
                        </div>

                        {/* Collection Tables */}
                        {isExpanded && (
                          <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                            {/* Regular source tables (primary and detail) */}
                            {collection.tables?.filter(table => table.role !== 'derived').map((table, idx) => {
                              const isSelected = selectedDatasetId === table.datasetId;
                              const tableDataset = datasets.find(d => d.id === table.datasetId);

                              return (
                                <button
                                  key={table.id || idx}
                                  onClick={() => table.datasetId && onDatasetSelect(table.datasetId)}
                                  className={`flex items-center gap-1.5 px-2 py-1.5 text-sm rounded w-full text-left transition-all ${
                                    isSelected
                                      ? 'bg-primary/10 text-primary font-medium shadow-sm'
                                      : 'hover:bg-accent text-muted-foreground'
                                  }`}
                                  disabled={!table.datasetId}
                                >
                                  <FileText className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate flex-1">{table.name}</span>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {table.isPrimary && (
                                      <Key className="h-2.5 w-2.5 text-amber-500" title="Primary Table" />
                                    )}
                                    {tableDataset?.rowCount && (
                                      <span className="text-[10px] text-muted-foreground">
                                        {formatRowCount(tableDataset.rowCount)}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                            
                            {/* Merged Dataset - Show from tables array if role is 'derived' */}
                            {collection.tables?.filter(table => table.role === 'derived').map((table, idx) => {
                              const isSelected = selectedDatasetId === table.datasetId;
                              const tableDataset = datasets.find(d => d.id === table.datasetId);

                              return (
                                <button
                                  key={table.id || `derived-${idx}`}
                                  onClick={() => table.datasetId && onDatasetSelect(table.datasetId)}
                                  className={`flex items-center gap-1.5 px-2 py-1.5 text-sm rounded w-full text-left transition-all ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-amber-500/10 to-emerald-500/10 text-primary font-medium shadow-sm'
                                      : 'hover:bg-accent text-muted-foreground'
                                  }`}
                                  disabled={!table.datasetId}
                                >
                                  <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                  <span className="truncate flex-1">Merged Dataset</span>
                                  <Badge variant="outline" className="text-[10px] h-4 px-1 bg-gradient-to-r from-amber-500/10 to-emerald-500/10">
                                    Final
                                  </Badge>
                                </button>
                              );
                            })}
                            
                            {/* Fallback: Show mergedDataset if no derived table in tables array */}
                            {!collection.tables?.some(t => t.role === 'derived') && collection.mergedDataset && (
                              <button
                                onClick={() => onDatasetSelect(collection.mergedDataset!.id)}
                                className={`flex items-center gap-1.5 px-2 py-1.5 text-sm rounded w-full text-left transition-all ${
                                  selectedDatasetId === collection.mergedDataset.id
                                    ? 'bg-gradient-to-r from-amber-500/10 to-emerald-500/10 text-primary font-medium shadow-sm'
                                    : 'hover:bg-accent text-muted-foreground'
                                }`}
                              >
                                <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                <span className="truncate flex-1">Merged Dataset</span>
                                <Badge variant="outline" className="text-[10px] h-4 px-1 bg-gradient-to-r from-amber-500/10 to-emerald-500/10">
                                  Final
                                </Badge>
                              </button>
                            )}
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
          {filteredStandalone.length > 0 && (
            <div className="mt-1">
              <button
                onClick={() => toggleSection('individual')}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent rounded w-full transition-colors"
              >
                {expandedSections.individual ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <FileText className="h-3 w-3 text-primary" />
                <span>Single Datasets</span>
                <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">
                  {filteredStandalone.length}
                </Badge>
              </button>

              {expandedSections.individual && (
                <div className="mt-1 space-y-0.5">
                  {filteredStandalone.map(dataset => {
                    const isSelected = selectedDatasetId === dataset.id;

                    return (
                      <button
                        key={dataset.id}
                        onClick={() => onDatasetSelect(dataset.id)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 text-sm rounded w-full text-left transition-all ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-medium shadow-sm'
                            : 'hover:bg-accent text-muted-foreground'
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate flex-1">{dataset.name}</span>
                        {dataset.rowCount && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {formatRowCount(dataset.rowCount)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredCollections.length === 0 && filteredStandalone.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                {searchQuery ? 'No datasets found' : 'No datasets available'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="px-2 py-1.5 border-t bg-muted/30">
        <div className="text-[10px] text-muted-foreground space-y-0.5">
          <div className="flex justify-between">
            <span>Collections:</span>
            <span className="font-medium">{multiTableCollections.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Datasets:</span>
            <span className="font-medium">{datasets.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}