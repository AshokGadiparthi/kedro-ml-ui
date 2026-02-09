import React, { useState } from 'react';
import {
  FunctionSquare,
  Plus,
  Trash2,
  Table2,
  BarChart3,
  Calculator,
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import type { TableInfo, AggregationConfig } from './DataSourceWizard';

interface AggregationBuilderProps {
  tables: TableInfo[];
  aggregations: AggregationConfig[];
  onAggregationsChange: (aggregations: AggregationConfig[]) => void;
}

const aggregationFunctions = [
  {
    value: 'SUM',
    label: 'Sum',
    icon: Plus,
    description: 'Calculate total sum of values',
    numericOnly: true,
  },
  {
    value: 'AVG',
    label: 'Average',
    icon: BarChart3,
    description: 'Calculate mean value',
    numericOnly: true,
  },
  {
    value: 'COUNT',
    label: 'Count',
    icon: Calculator,
    description: 'Count number of rows',
    numericOnly: false,
  },
  {
    value: 'COUNT_DISTINCT',
    label: 'Count Distinct',
    icon: Calculator,
    description: 'Count unique values',
    numericOnly: false,
  },
  {
    value: 'MIN',
    label: 'Minimum',
    icon: BarChart3,
    description: 'Find minimum value',
    numericOnly: true,
  },
  {
    value: 'MAX',
    label: 'Maximum',
    icon: BarChart3,
    description: 'Find maximum value',
    numericOnly: true,
  },
] as const;

export const AggregationBuilder: React.FC<AggregationBuilderProps> = ({
  tables,
  aggregations,
  onAggregationsChange,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>(
    tables[0]?.id || ''
  );

  const handleAddAggregation = () => {
    const table = tables.find((t) => t.id === selectedTableId);
    if (!table || table.columns.length === 0) return;

    const newAggregation: AggregationConfig = {
      table: selectedTableId,
      column: table.columns[0].name,
      function: 'COUNT',
      alias: `${table.columns[0].name}_count`,
    };

    onAggregationsChange([...aggregations, newAggregation]);
  };

  const handleUpdateAggregation = (
    index: number,
    updates: Partial<AggregationConfig>
  ) => {
    const updatedAggregations = aggregations.map((agg, i) => {
      if (i !== index) return agg;

      const newAgg = { ...agg, ...updates };

      // Auto-generate alias if function or column changes
      if (updates.function || updates.column) {
        const col = updates.column || agg.column;
        const func = (updates.function || agg.function).toLowerCase();
        newAgg.alias = `${col}_${func}`;
      }

      return newAgg;
    });

    onAggregationsChange(updatedAggregations);
  };

  const handleDeleteAggregation = (index: number) => {
    onAggregationsChange(aggregations.filter((_, i) => i !== index));
  };

  const getTableColumns = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    return table?.columns || [];
  };

  const getNumericColumns = (tableId: string) => {
    return getTableColumns(tableId).filter(
      (col) =>
        col.type.includes('int') ||
        col.type.includes('float') ||
        col.type.includes('double') ||
        col.type.includes('decimal') ||
        col.type.includes('numeric')
    );
  };

  const aggregationsByTable = tables.map((table) => ({
    table,
    aggregations: aggregations.filter((agg) => agg.table === table.id),
  }));

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card className="p-4 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
            <FunctionSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
              Configure Aggregations (Optional)
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Add aggregation functions to compute summary statistics. This step is optional
              and can be skipped if you don't need aggregations.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Add */}
      <Card className="p-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label className="text-sm mb-2 block">Select Table to Add Aggregation</Label>
            <Select value={selectedTableId} onValueChange={setSelectedTableId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddAggregation}>
            <Plus className="w-4 h-4 mr-2" />
            Add Aggregation
          </Button>
        </div>
      </Card>

      {/* Aggregations by Table */}
      <div className="space-y-4">
        {aggregationsByTable.map(({ table, aggregations: tableAggs }) => (
          <Card key={table.id} className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Table2 className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">{table.name}</h3>
              <Badge variant="secondary">{tableAggs.length} aggregations</Badge>
            </div>

            {tableAggs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No aggregations configured for this table
              </div>
            ) : (
              <div className="space-y-4">
                {tableAggs.map((agg, localIndex) => {
                  const globalIndex = aggregations.findIndex(
                    (a) =>
                      a.table === agg.table &&
                      a.column === agg.column &&
                      a.function === agg.function &&
                      a.alias === agg.alias
                  );

                  const funcInfo = aggregationFunctions.find(
                    (f) => f.value === agg.function
                  );
                  const FuncIcon = funcInfo?.icon || Calculator;

                  return (
                    <Card
                      key={globalIndex}
                      className="p-4 bg-muted/50 border-muted-foreground/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FuncIcon className="w-4 h-4 text-primary" />
                          <Badge variant="outline">{agg.function}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteAggregation(globalIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Function */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Function
                          </Label>
                          <Select
                            value={agg.function}
                            onValueChange={(value) =>
                              handleUpdateAggregation(globalIndex, {
                                function: value as any,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {aggregationFunctions.map((func) => (
                                <SelectItem key={func.value} value={func.value}>
                                  <div className="flex items-center gap-2">
                                    <func.icon className="w-4 h-4" />
                                    <div>
                                      <div className="font-medium">{func.label}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {func.description}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Column */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Column
                          </Label>
                          <Select
                            value={agg.column}
                            onValueChange={(value) =>
                              handleUpdateAggregation(globalIndex, {
                                column: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(funcInfo?.numericOnly
                                ? getNumericColumns(agg.table)
                                : getTableColumns(agg.table)
                              ).map((col) => (
                                <SelectItem key={col.name} value={col.name}>
                                  {col.name}
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({col.type})
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Alias */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Output Name (Alias)
                          </Label>
                          <Input
                            value={agg.alias}
                            onChange={(e) =>
                              handleUpdateAggregation(globalIndex, {
                                alias: e.target.value,
                              })
                            }
                            placeholder="e.g., total_amount"
                          />
                        </div>
                      </div>

                      {/* SQL Preview */}
                      <div className="mt-4 pt-4 border-t">
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          SQL Preview
                        </Label>
                        <code className="text-xs bg-background p-2 rounded border block">
                          {agg.function}({agg.column}) AS {agg.alias}
                        </code>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      {aggregations.length > 0 && (
        <Card className="p-4 bg-muted">
          <div className="flex items-center gap-3 mb-3">
            <FunctionSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Aggregation Summary</h3>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Aggregations</div>
                <div className="text-2xl font-bold">{aggregations.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tables Used</div>
                <div className="text-2xl font-bold">
                  {new Set(aggregations.map((a) => a.table)).size}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Functions Used</div>
                <div className="text-2xl font-bold">
                  {new Set(aggregations.map((a) => a.function)).size}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Output Columns</div>
                <div className="text-2xl font-bold">{aggregations.length}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
