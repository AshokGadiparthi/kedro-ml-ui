/**
 * Aggregation Builder Component
 * Visual builder for creating aggregations on detail tables
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Plus, Trash2, Function, Table as TableIcon, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import type { AggregationConfig, AggregationFunction, TableFile } from '../../../types/datasetCollection';

interface AggregationBuilderProps {
  tables: TableFile[];
  aggregations: AggregationConfig[];
  onAggregationsChange: (aggregations: AggregationConfig[]) => void;
}

const AGGREGATION_FUNCTIONS: { value: AggregationFunction; label: string; description: string }[] = [
  { value: 'sum', label: 'Sum', description: 'Total of all values' },
  { value: 'mean', label: 'Mean', description: 'Average value' },
  { value: 'median', label: 'Median', description: 'Middle value' },
  { value: 'max', label: 'Max', description: 'Maximum value' },
  { value: 'min', label: 'Min', description: 'Minimum value' },
  { value: 'count', label: 'Count', description: 'Number of records' },
  { value: 'nunique', label: 'Unique Count', description: 'Number of unique values' },
  { value: 'std', label: 'Std Dev', description: 'Standard deviation' },
  { value: 'var', label: 'Variance', description: 'Statistical variance' },
];

export function AggregationBuilder({
  tables,
  aggregations,
  onAggregationsChange,
}: AggregationBuilderProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  // All passed tables are detail tables (wizard filters out primary table)
  const detailTables = tables;

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const getAggregationForTable = (tableName: string) => {
    return aggregations.find(a => a.tableName === tableName);
  };

  const addAggregation = (tableName: string) => {
    const table = tables.find(t => t.name === tableName);
    if (!table) return;

    const newAgg: AggregationConfig = {
      id: `agg_${Date.now()}`,
      tableName,
      groupByColumn: getColumnName(table.columns?.[0]) || 'id',
      prefix: `${tableName.toUpperCase()}_`,
      features: [],
    };

    onAggregationsChange([...aggregations, newAgg]);
    setExpandedTables(new Set([...expandedTables, tableName]));
  };

  const removeAggregation = (tableName: string) => {
    onAggregationsChange(aggregations.filter(a => a.tableName !== tableName));
  };

  const updateAggregation = (tableName: string, updates: Partial<AggregationConfig>) => {
    onAggregationsChange(
      aggregations.map(a => a.tableName === tableName ? { ...a, ...updates } : a)
    );
  };

  const addFeature = (tableName: string, column: string) => {
    const agg = getAggregationForTable(tableName);
    if (!agg) return;

    const newFeature = {
      column,
      functions: ['sum'] as AggregationFunction[],
    };

    updateAggregation(tableName, {
      features: [...agg.features, newFeature],
    });
  };

  const removeFeature = (tableName: string, columnIndex: number) => {
    const agg = getAggregationForTable(tableName);
    if (!agg) return;

    updateAggregation(tableName, {
      features: agg.features.filter((_, idx) => idx !== columnIndex),
    });
  };

  const toggleFunction = (tableName: string, featureIndex: number, func: AggregationFunction) => {
    const agg = getAggregationForTable(tableName);
    if (!agg) return;

    const feature = agg.features[featureIndex];
    const newFunctions = feature.functions.includes(func)
      ? feature.functions.filter(f => f !== func)
      : [...feature.functions, func];

    updateAggregation(tableName, {
      features: agg.features.map((f, idx) =>
        idx === featureIndex ? { ...f, functions: newFunctions } : f
      ),
    });
  };

  // Helper to get column name (handles both string and object)
  const getColumnName = (col: any): string => {
    return typeof col === 'string' ? col : col.name;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Aggregations</h3>
          <p className="text-sm text-muted-foreground">
            Configure how to aggregate detail tables to match the primary table
          </p>
        </div>
        <Badge variant="outline">
          {aggregations.length} table{aggregations.length !== 1 ? 's' : ''} configured
        </Badge>
      </div>

      {detailTables.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No detail tables to aggregate</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {detailTables.map((table) => {
            const agg = getAggregationForTable(table.name);
            const isExpanded = expandedTables.has(table.name);

            return (
              <Card key={table.name} className="overflow-hidden">
                {/* Table Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleTable(table.name)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <TableIcon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{table.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {table.rowCount?.toLocaleString() || '—'} rows • {table.columnCount || '—'} columns
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {agg ? (
                      <>
                        {agg.features.length === 0 ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            No features
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {agg.features.length} feature{agg.features.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAggregation(table.name);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          addAggregation(table.name);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Aggregation
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Configuration */}
                {isExpanded && agg && (
                  <div className="border-t p-4 space-y-4 bg-muted/20">
                    {/* Group By & Prefix */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Group By Column</Label>
                        <Select
                          value={agg.groupByColumn}
                          onValueChange={(value) => updateAggregation(table.name, { groupByColumn: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {table.columns?.map((col) => (
                              <SelectItem key={getColumnName(col)} value={getColumnName(col)}>
                                {getColumnName(col)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Column Prefix</Label>
                        <Input
                          value={agg.prefix || ''}
                          onChange={(e) => updateAggregation(table.name, { prefix: e.target.value })}
                          placeholder="e.g., BUREAU_"
                        />
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Features to Aggregate</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const unusedColumn = table.columns?.find(
                              col => !agg.features.some(f => f.column === getColumnName(col))
                            );
                            if (unusedColumn) {
                              addFeature(table.name, getColumnName(unusedColumn));
                            }
                          }}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          Add Feature
                        </Button>
                      </div>

                      {agg.features.length === 0 ? (
                        <Card className="p-6 text-center border-dashed">
                          <p className="text-sm text-muted-foreground">
                            No features added yet. Click "Add Feature" to start.
                          </p>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {agg.features.map((feature, featureIdx) => (
                            <Card key={featureIdx} className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="flex-1 space-y-3">
                                  {/* Column Selection */}
                                  <div className="space-y-2">
                                    <Label className="text-xs">Column</Label>
                                    <Select
                                      value={feature.column}
                                      onValueChange={(value) => {
                                        const newFeatures = [...agg.features];
                                        newFeatures[featureIdx] = { ...feature, column: value };
                                        updateAggregation(table.name, { features: newFeatures });
                                      }}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {table.columns?.map((col) => (
                                          <SelectItem key={getColumnName(col)} value={getColumnName(col)}>
                                            {getColumnName(col)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Functions */}
                                  <div className="space-y-2">
                                    <Label className="text-xs">Functions</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                      {AGGREGATION_FUNCTIONS.map((func) => (
                                        <div key={func.value} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`${table.name}-${featureIdx}-${func.value}`}
                                            checked={feature.functions.includes(func.value)}
                                            onCheckedChange={() => toggleFunction(table.name, featureIdx, func.value)}
                                          />
                                          <label
                                            htmlFor={`${table.name}-${featureIdx}-${func.value}`}
                                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                          >
                                            {func.label}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Preview */}
                                  {feature.functions.length > 0 && (
                                    <div className="text-xs text-muted-foreground pt-2 border-t">
                                      <span className="font-medium">Will create:</span>{' '}
                                      {feature.functions.map(f => `${agg.prefix}${feature.column}_${f}`).join(', ')}
                                    </div>
                                  )}
                                </div>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFeature(table.name, featureIdx)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}