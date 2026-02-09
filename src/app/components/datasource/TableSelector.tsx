import React, { useState } from 'react';
import { Table2, Star, Search, Database, Check } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import type { TableInfo } from './DataSourceWizard';

interface TableSelectorProps {
  availableTables: TableInfo[];
  selectedTables: string[];
  mainTable: string;
  onTablesChange: (tables: string[], mainTable: string) => void;
}

export const TableSelector: React.FC<TableSelectorProps> = ({
  availableTables,
  selectedTables,
  mainTable,
  onTablesChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTables = availableTables.filter((table) =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTableToggle = (tableId: string) => {
    const newTables = selectedTables.includes(tableId)
      ? selectedTables.filter((id) => id !== tableId)
      : [...selectedTables, tableId];

    // If unchecking the main table, reset it
    let newMainTable = mainTable;
    if (mainTable === tableId && !newTables.includes(tableId)) {
      newMainTable = newTables.length > 0 ? newTables[0] : '';
    }

    // If selecting first table, make it main automatically
    if (newTables.length === 1 && !mainTable) {
      newMainTable = newTables[0];
    }

    onTablesChange(newTables, newMainTable);
  };

  const handleMainTableChange = (tableId: string) => {
    onTablesChange(selectedTables, tableId);
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Select Tables for Your Data Source
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Choose one or more tables to combine. The main table will be used as the base for joins.
              {selectedTables.length > 1 && ' You can configure relationships in the next step.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Summary */}
      {selectedTables.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Badge variant="secondary" className="font-semibold">
            {selectedTables.length} {selectedTables.length === 1 ? 'table' : 'tables'} selected
          </Badge>
          {mainTable && (
            <>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                <span className="text-sm">
                  <span className="font-medium">
                    {availableTables.find((t) => t.id === mainTable)?.name}
                  </span>
                  <span className="text-muted-foreground"> as main table</span>
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tables Grid */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTables.map((table) => {
            const isSelected = selectedTables.includes(table.id);
            const isMain = mainTable === table.id;

            return (
              <Card
                key={table.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleTableToggle(table.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleTableToggle(table.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Table2 className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold">{table.name}</h3>
                        {isMain && (
                          <Badge variant="default" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Main
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 ml-7">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{table.columns.length} columns</span>
                    <span>•</span>
                    <span>{table.rowCount.toLocaleString()} rows</span>
                  </div>

                  {/* Column Preview */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {table.columns.slice(0, 5).map((col) => (
                      <Badge key={col.name} variant="outline" className="text-xs">
                        {col.name}
                      </Badge>
                    ))}
                    {table.columns.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{table.columns.length - 5} more
                      </Badge>
                    )}
                  </div>

                  {/* Set as Main Table */}
                  {isSelected && selectedTables.length > 1 && (
                    <div
                      className="mt-3 pt-3 border-t"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RadioGroup
                        value={mainTable}
                        onValueChange={handleMainTableChange}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={table.id} id={`main-${table.id}`} />
                          <Label
                            htmlFor={`main-${table.id}`}
                            className="text-sm cursor-pointer"
                          >
                            Set as main table
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tables found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? `No tables match "${searchQuery}"`
                : 'No tables available'}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
