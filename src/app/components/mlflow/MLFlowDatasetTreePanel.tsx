/**
 * 🌟 ML FLOW DATASET TREE PANEL
 * Shows merged datasets from collections and single datasets for ML training
 * Matches the clean design from EDA with Training Data header
 */

import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import {
  Search,
  ChevronRight,
  ChevronDown,
  FileText,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import type { Dataset } from '@/services';
import type { DatasetCollection } from '@/types/datasetCollection';

interface MergedDataset {
  id: string;
  name: string;
  collectionName: string;
  rowCount?: number;
  columnCount?: number;
  isMerged: true;
}

interface MLFlowDatasetTreePanelProps {
  datasets: Dataset[];
  mergedDatasets: MergedDataset[];
  selectedDatasetId: string | null;
  onDatasetSelect: (datasetId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function MLFlowDatasetTreePanel({
  datasets,
  mergedDatasets,
  selectedDatasetId,
  onDatasetSelect,
  isCollapsed,
  onToggleCollapse,
}: MLFlowDatasetTreePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    merged: true,
    single: true,
  });

  const toggleSection = (section: 'merged' | 'single') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter datasets by search query
  const filteredMergedDatasets = mergedDatasets.filter(dataset =>
    dataset.collectionName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSingleDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <div className="w-12 h-full border-r bg-card flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="mb-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-[280px] h-full border-r bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b">
        <h2 className="text-base font-semibold">Training Data</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {/* Merged Datasets Section */}
          {filteredMergedDatasets.length > 0 && (
            <div className="mb-2">
              <button
                onClick={() => toggleSection('merged')}
                className="flex items-center gap-1.5 w-full px-1.5 py-1.5 rounded-md hover:bg-muted/50 transition-colors group"
              >
                {expandedSections.merged ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  MERGED DATASETS
                </span>
                <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">
                  {filteredMergedDatasets.length}
                </Badge>
              </button>

              {expandedSections.merged && (
                <div className="mt-0.5 space-y-0.5">
                  {filteredMergedDatasets.map((dataset) => (
                    <button
                      key={dataset.id}
                      onClick={() => onDatasetSelect(dataset.id)}
                      className={`flex items-center gap-2 w-full px-2 py-2 rounded-md transition-all group ${
                        selectedDatasetId === dataset.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <div className="flex-1 text-left overflow-hidden">
                        <div className={`text-sm font-medium truncate ${
                          selectedDatasetId === dataset.id ? 'text-primary' : ''
                        }`}>
                          {dataset.collectionName}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 px-1.5 shrink-0 border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/5"
                      >
                        Final
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Single Datasets Section */}
          {filteredSingleDatasets.length > 0 && (
            <div className="mb-2">
              <button
                onClick={() => toggleSection('single')}
                className="flex items-center gap-1.5 w-full px-1.5 py-1.5 rounded-md hover:bg-muted/50 transition-colors group"
              >
                {expandedSections.single ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  SINGLE DATASETS
                </span>
                <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">
                  {filteredSingleDatasets.length}
                </Badge>
              </button>

              {expandedSections.single && (
                <div className="mt-0.5 space-y-0.5">
                  {filteredSingleDatasets.map((dataset) => (
                    <button
                      key={dataset.id}
                      onClick={() => onDatasetSelect(dataset.id)}
                      className={`flex items-center gap-2 w-full px-2 py-2 rounded-md transition-all group ${
                        selectedDatasetId === dataset.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 text-left overflow-hidden">
                        <div className={`text-sm font-medium truncate ${
                          selectedDatasetId === dataset.id ? 'text-primary' : ''
                        }`}>
                          {dataset.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredMergedDatasets.length === 0 && filteredSingleDatasets.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="text-sm text-muted-foreground">
                {searchQuery ? 'No datasets found' : 'No datasets available'}
              </div>
              {searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}