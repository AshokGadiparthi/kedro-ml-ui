import React, { useState } from 'react';
import {
  Eye,
  Table2,
  GitMerge,
  FunctionSquare,
  Copy,
  Check,
  FileText,
  Database,
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import type { DataSourceConfig, TableInfo } from './DataSourceWizard';

interface DataPreviewProps {
  config: Partial<DataSourceConfig>;
  tables: TableInfo[];
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
  config,
  tables,
  onNameChange,
  onDescriptionChange,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);

  const mainTable = tables.find((t) => t.id === config.mainTable);

  // Generate SQL preview
  const generateSQL = () => {
    if (!config.tables || config.tables.length === 0) return '';

    let sql = 'SELECT\n';

    // Main table columns
    const mainTableObj = tables.find((t) => t.id === config.mainTable);
    if (mainTableObj) {
      sql += `  ${mainTableObj.name}.*`;
    }

    // Aggregations
    if (config.aggregations && config.aggregations.length > 0) {
      sql += ',\n';
      sql += config.aggregations
        .map((agg) => `  ${agg.function}(${agg.column}) AS ${agg.alias}`)
        .join(',\n');
    }

    // FROM clause
    sql += `\nFROM ${mainTableObj?.name}`;

    // JOIN clauses
    if (config.joins && config.joins.length > 0) {
      config.joins.forEach((join) => {
        const leftTable = tables.find((t) => t.id === join.leftTable);
        const rightTable = tables.find((t) => t.id === join.rightTable);
        sql += `\n${join.joinType} JOIN ${rightTable?.name}\n  ON ${leftTable?.name}.${join.leftColumn} = ${rightTable?.name}.${join.rightColumn}`;
      });
    }

    // GROUP BY if aggregations exist
    if (config.aggregations && config.aggregations.length > 0 && mainTableObj) {
      const groupByColumns = mainTableObj.columns.map(
        (col) => `${mainTableObj.name}.${col.name}`
      );
      sql += `\nGROUP BY\n  ${groupByColumns.join(',\n  ')}`;
    }

    return sql;
  };

  const sqlPreview = generateSQL();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlPreview);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const totalColumns =
    (mainTable?.columns.length || 0) + (config.aggregations?.length || 0);

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card className="p-4 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              Review and Save Your Configuration
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Review your data source configuration, provide a name and description,
              then save to create the data source.
            </p>
          </div>
        </div>
      </Card>

      {/* Name and Description */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Data Source Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={config.name || ''}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Customer Transactions with Bureau Data"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              A descriptive name for this data source
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description || ''}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe what this data source contains and how it should be used..."
              className="mt-2 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional description to help others understand this data source
            </p>
          </div>
        </div>
      </Card>

      {/* Configuration Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Configuration Summary</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Tables</div>
            <div className="text-2xl font-bold">{config.tables?.length || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Joins</div>
            <div className="text-2xl font-bold">{config.joins?.length || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Aggregations</div>
            <div className="text-2xl font-bold">
              {config.aggregations?.length || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Columns</div>
            <div className="text-2xl font-bold">{totalColumns}</div>
          </div>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="tables" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tables">
              <Table2 className="w-4 h-4 mr-2" />
              Tables
            </TabsTrigger>
            <TabsTrigger value="joins">
              <GitMerge className="w-4 h-4 mr-2" />
              Joins
            </TabsTrigger>
            <TabsTrigger value="aggregations">
              <FunctionSquare className="w-4 h-4 mr-2" />
              Aggregations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables" className="mt-4 space-y-3">
            {tables.map((table) => {
              const isMain = table.id === config.mainTable;
              return (
                <Card key={table.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{table.name}</span>
                      {isMain && (
                        <Badge variant="default" className="text-xs">
                          Main Table
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline">{table.columns.length} columns</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6">
                    {table.columns.slice(0, 8).map((col) => (
                      <Badge key={col.name} variant="secondary" className="text-xs">
                        {col.name}
                      </Badge>
                    ))}
                    {table.columns.length > 8 && (
                      <Badge variant="secondary" className="text-xs">
                        +{table.columns.length - 8} more
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="joins" className="mt-4">
            {!config.joins || config.joins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No joins configured
              </div>
            ) : (
              <div className="space-y-3">
                {config.joins.map((join, index) => {
                  const leftTable = tables.find((t) => t.id === join.leftTable);
                  const rightTable = tables.find((t) => t.id === join.rightTable);

                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Join {index + 1}</Badge>
                        <Badge variant="default">{join.joinType}</Badge>
                      </div>
                      <div className="text-sm font-mono bg-muted p-3 rounded">
                        {leftTable?.name}.{join.leftColumn}
                        <br />
                        <span className="text-primary font-semibold">
                          {join.joinType} JOIN
                        </span>
                        <br />
                        {rightTable?.name}.{join.rightColumn}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="aggregations" className="mt-4">
            {!config.aggregations || config.aggregations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No aggregations configured
              </div>
            ) : (
              <div className="space-y-3">
                {config.aggregations.map((agg, index) => {
                  const table = tables.find((t) => t.id === agg.table);
                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FunctionSquare className="w-4 h-4 text-primary" />
                          <Badge variant="default">{agg.function}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {table?.name}
                        </span>
                      </div>
                      <div className="text-sm font-mono bg-muted p-3 rounded">
                        {agg.function}({agg.column}) AS {agg.alias}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* SQL Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Generated SQL Preview</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySQL}
            disabled={!sqlPreview}
          >
            {copiedSql ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy SQL
              </>
            )}
          </Button>
        </div>

        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
            <code>{sqlPreview || '-- No configuration yet'}</code>
          </pre>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          This SQL query will be executed when accessing this data source
        </p>
      </Card>
    </div>
  );
};
