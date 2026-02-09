/**
 * Multi-Table Dataset Details Modal - Complete view with preview
 * Shows all details including schema, joins, aggregations, and data preview
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Database,
  Table as TableIcon,
  Link2,
  Settings,
  Eye,
  X,
  FileText,
  TrendingUp,
  Target,
  ChevronRight,
} from 'lucide-react';
import type { DatasetCollection } from '../../../types/datasetCollection';
import { formatNumber, formatFileSize } from '../../../utils/formatters';

interface MultiTableDetailsModalProps {
  open: boolean;
  onClose: () => void;
  collection: DatasetCollection | null;
}

// Mock preview data
const MOCK_PREVIEW_DATA = [
  { SK_ID_CURR: 100002, TARGET: 1, NAME_CONTRACT_TYPE: 'Cash loans', CODE_GENDER: 'M', FLAG_OWN_CAR: 'N', FLAG_OWN_REALTY: 'Y', CNT_CHILDREN: 0, AMT_INCOME_TOTAL: 202500, AMT_CREDIT: 406597.5 },
  { SK_ID_CURR: 100003, TARGET: 0, NAME_CONTRACT_TYPE: 'Cash loans', CODE_GENDER: 'F', FLAG_OWN_CAR: 'N', FLAG_OWN_REALTY: 'N', CNT_CHILDREN: 0, AMT_INCOME_TOTAL: 270000, AMT_CREDIT: 1293502.5 },
  { SK_ID_CURR: 100004, TARGET: 0, NAME_CONTRACT_TYPE: 'Revolving loans', CODE_GENDER: 'M', FLAG_OWN_CAR: 'Y', FLAG_OWN_REALTY: 'Y', CNT_CHILDREN: 0, AMT_INCOME_TOTAL: 67500, AMT_CREDIT: 135000 },
  { SK_ID_CURR: 100006, TARGET: 0, NAME_CONTRACT_TYPE: 'Cash loans', CODE_GENDER: 'F', FLAG_OWN_CAR: 'N', FLAG_OWN_REALTY: 'Y', CNT_CHILDREN: 0, AMT_INCOME_TOTAL: 135000, AMT_CREDIT: 312682.5 },
  { SK_ID_CURR: 100007, TARGET: 0, NAME_CONTRACT_TYPE: 'Cash loans', CODE_GENDER: 'M', FLAG_OWN_CAR: 'N', FLAG_OWN_REALTY: 'Y', CNT_CHILDREN: 0, AMT_INCOME_TOTAL: 121500, AMT_CREDIT: 513000 },
];

export function MultiTableDetailsModal({
  open,
  onClose,
  collection,
}: MultiTableDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!collection) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">{collection.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Multi-table dataset collection
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <Database className="h-4 w-4" />
              Overview
            </TabsTrigger>
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
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="overview" className="space-y-4 m-0">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <TableIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tables</p>
                      <p className="text-2xl font-bold">{collection.tables.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Link2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relationships</p>
                      <p className="text-2xl font-bold">{collection.relationships.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Settings className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aggregations</p>
                      <p className="text-2xl font-bold">{collection.aggregations.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Database className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Final Rows</p>
                      <p className="text-2xl font-bold">
                        {collection.mergedDataset ? formatNumber(collection.mergedDataset.rowCount) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Configuration Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Configuration Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <Target className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Primary Table</p>
                      <p className="font-medium">{collection.primaryTable}</p>
                    </div>
                  </div>
                  {collection.targetColumn && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Target Column</p>
                        <p className="font-medium">{collection.targetColumn}</p>
                      </div>
                    </div>
                  )}
                  {collection.description && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{collection.description}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Merged Dataset Info */}
              {collection.mergedDataset && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Merged Dataset
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Rows</p>
                      <p className="text-xl font-bold">
                        {formatNumber(collection.mergedDataset.rowCount)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Columns</p>
                      <p className="text-xl font-bold">
                        {collection.mergedDataset.columnCount}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Size</p>
                      <p className="text-xl font-bold">
                        {formatFileSize(collection.mergedDataset.fileSize)}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tables" className="space-y-3 m-0">
              {collection.tables.map((table) => (
                <Card key={table.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{table.name}</h4>
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
                  <div className="flex flex-wrap gap-1">
                    {table.columns.map((col, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {col.name}
                        {col.isPrimaryKey && ' 🔑'}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="relationships" className="space-y-3 m-0">
              {collection.relationships.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Link2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No relationships defined</p>
                </div>
              ) : (
                collection.relationships.map((rel) => (
                  <Card key={rel.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                        <Link2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{rel.leftTable}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{rel.rightTable}</span>
                          <Badge variant="secondary">{rel.joinType} join</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <code className="bg-muted px-1 rounded">{rel.leftKey}</code>
                          {' = '}
                          <code className="bg-muted px-1 rounded">{rel.rightKey}</code>
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="aggregations" className="space-y-3 m-0">
              {collection.aggregations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No aggregations configured</p>
                </div>
              ) : (
                collection.aggregations.map((agg) => (
                  <Card key={agg.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{agg.tableName}</h4>
                          <Badge variant="outline">Group by: {agg.groupByColumn}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Prefix: <code className="bg-muted px-1 rounded">{agg.prefix}</code>
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {agg.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                          <span className="text-sm font-medium">{feature.column}</span>
                          <span className="text-sm text-muted-foreground">→</span>
                          <div className="flex gap-1">
                            {feature.functions.map((fn, fnIdx) => (
                              <Badge key={fnIdx} variant="secondary" className="text-xs">
                                {fn}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="preview" className="m-0">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Merged Dataset Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      First 5 rows of the merged dataset
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {MOCK_PREVIEW_DATA.length} of {collection.mergedDataset?.rowCount || 0} rows
                  </Badge>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(MOCK_PREVIEW_DATA[0] || {}).map((key) => (
                          <TableHead key={key} className="font-semibold">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_PREVIEW_DATA.map((row, idx) => (
                        <TableRow key={idx}>
                          {Object.values(row).map((value, cellIdx) => (
                            <TableCell key={cellIdx} className="font-mono text-sm">
                              {String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
