/**
 * Multi-Table Dataset Card - Beautiful UX for displaying multi-table datasets
 * Shows overview with expandable details including tables, relationships, aggregations
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { 
  Layers, 
  Eye, 
  Trash2, 
  Edit, 
  ChevronDown, 
  ChevronUp,
  Database,
  Table as TableIcon,
  Link2,
  Settings,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { DatasetCollection } from '../../../types/datasetCollection';
import { formatRelativeTime, formatNumber, formatFileSize } from '../../../utils/formatters';

interface MultiTableDatasetCardProps {
  collection: DatasetCollection;
  onViewDetails: (collection: DatasetCollection) => void;
  onEdit?: (collection: DatasetCollection) => void;
  onDelete: (collectionId: string) => void;
}

export function MultiTableDatasetCard({
  collection,
  onViewDetails,
  onEdit,
  onDelete,
}: MultiTableDatasetCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    processing: {
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      label: 'Processing',
    },
    ready: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      label: 'Ready',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Failed',
    },
  };

  const status = statusConfig[collection.status];
  const StatusIcon = status.icon;

  const handleDelete = () => {
    onDelete(collection.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-all">
        {/* Main Card Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold truncate">{collection.name}</h3>
                <Badge variant="secondary" className="gap-1">
                  <Layers className="h-3 w-3" />
                  Multi-Table
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {collection.description || 'No description'}
              </p>
            </div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${status.bg}`}>
              <StatusIcon className={`h-4 w-4 ${status.color}`} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <TableIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tables</p>
                <p className="font-semibold">{collection.tables.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Joins</p>
                <p className="font-semibold">{collection.relationships.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Aggregations</p>
                <p className="font-semibold">{collection.aggregations.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Rows</p>
                <p className="font-semibold">
                  {collection.mergedDataset ? formatNumber(collection.mergedDataset.rowCount) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Table Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Primary Table:</span>
            <Badge variant="outline">{collection.primaryTable}</Badge>
            {collection.targetColumn && (
              <>
                <span className="text-sm text-muted-foreground">• Target:</span>
                <Badge variant="outline">{collection.targetColumn}</Badge>
              </>
            )}
          </div>

          {/* Expandable Details */}
          {expanded && (
            <div className="space-y-4 mb-4 pt-4 border-t">
              {/* Tables List */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Tables ({collection.tables.length})
                </h4>
                <div className="space-y-2">
                  {collection.tables.map((table) => (
                    <div
                      key={table.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{table.name}</span>
                          {table.isPrimary && (
                            <Badge variant="default" className="h-5 text-xs">Primary</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {table.rowCount ? formatNumber(table.rowCount) + ' rows' : 'N/A'} • {table.columns.length} columns
                        </p>
                      </div>
                      {table.fileSize && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(table.fileSize)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationships */}
              {collection.relationships.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Relationships ({collection.relationships.length})
                  </h4>
                  <div className="space-y-2">
                    {collection.relationships.map((rel) => (
                      <div
                        key={rel.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/20"
                      >
                        <Link2 className="h-3 w-3 text-green-500" />
                        <span className="text-sm flex-1">
                          <span className="font-medium">{rel.leftTable}</span>
                          <span className="text-muted-foreground"> ({rel.leftKey}) </span>
                          <span className="text-muted-foreground">→ </span>
                          <span className="font-medium">{rel.rightTable}</span>
                          <span className="text-muted-foreground"> ({rel.rightKey})</span>
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {rel.joinType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aggregations */}
              {collection.aggregations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Aggregations ({collection.aggregations.length})
                  </h4>
                  <div className="space-y-2">
                    {collection.aggregations.map((agg) => (
                      <div
                        key={agg.id}
                        className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/20"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <TableIcon className="h-3 w-3 text-purple-500" />
                          <span className="text-sm font-medium">{agg.tableName}</span>
                          <Badge variant="outline" className="text-xs">
                            Group by: {agg.groupByColumn}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground pl-5">
                          {agg.features.length} features with prefix "{agg.prefix}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-xs text-muted-foreground">
              Created {formatRelativeTime(collection.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="gap-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    More
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(collection)}
                className="gap-1"
              >
                <Eye className="h-4 w-4" />
                Details
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(collection)}
                  className="gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multi-Table Dataset?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{collection.name}"? This will remove all {collection.tables.length} tables,
              relationships, and aggregations. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
