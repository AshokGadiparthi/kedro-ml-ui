import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Trash2, Table2, GitMerge, AlertCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import type { TableInfo, JoinConfig } from './DataSourceWizard';

interface JoinConfiguratorProps {
  tables: TableInfo[];
  joins: JoinConfig[];
  mainTable: string;
  onJoinsChange: (joins: JoinConfig[]) => void;
}

const joinTypeOptions = [
  { value: 'INNER', label: 'Inner Join', description: 'Only matching rows from both tables' },
  { value: 'LEFT', label: 'Left Join', description: 'All rows from left table' },
  { value: 'RIGHT', label: 'Right Join', description: 'All rows from right table' },
  { value: 'OUTER', label: 'Full Outer Join', description: 'All rows from both tables' },
] as const;

export const JoinConfigurator: React.FC<JoinConfiguratorProps> = ({
  tables,
  joins,
  mainTable,
  onJoinsChange,
}) => {
  const [selectedJoinIndex, setSelectedJoinIndex] = useState<number | null>(null);

  // Skip join configuration for single table
  if (tables.length === 1) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Table2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Single Table Selected</h3>
          <p className="text-muted-foreground">
            You've selected only one table. Join configuration is not needed.
            Click Next to continue.
          </p>
        </Card>
      </div>
    );
  }

  // Create nodes for visual diagram
  const createNodes = (): Node[] => {
    const mainTableIndex = tables.findIndex((t) => t.id === mainTable);
    const mainTableObj = tables[mainTableIndex];
    const otherTables = tables.filter((t) => t.id !== mainTable);

    const nodes: Node[] = [];

    // Main table in center
    if (mainTableObj) {
      nodes.push({
        id: mainTableObj.id,
        data: {
          label: (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Table2 className="w-4 h-4" />
                <span className="font-semibold">{mainTableObj.name}</span>
                <Badge variant="default" className="text-xs">Main</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {mainTableObj.columns.length} columns
              </div>
            </div>
          ),
        },
        position: { x: 400, y: 200 },
        style: {
          background: 'hsl(var(--primary) / 0.1)',
          border: '2px solid hsl(var(--primary))',
          borderRadius: '8px',
          width: 200,
        },
      });
    }

    // Other tables arranged in circle
    otherTables.forEach((table, index) => {
      const angle = (index / otherTables.length) * 2 * Math.PI;
      const radius = 250;
      const x = 400 + radius * Math.cos(angle);
      const y = 200 + radius * Math.sin(angle);

      nodes.push({
        id: table.id,
        data: {
          label: (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Table2 className="w-4 h-4" />
                <span className="font-semibold">{table.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {table.columns.length} columns
              </div>
            </div>
          ),
        },
        position: { x, y },
        style: {
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          width: 200,
        },
      });
    });

    return nodes;
  };

  const createEdges = (): Edge[] => {
    return joins.map((join, index) => ({
      id: `join-${index}`,
      source: join.leftTable,
      target: join.rightTable,
      label: join.joinType,
      type: 'smoothstep',
      animated: selectedJoinIndex === index,
      style: {
        stroke: selectedJoinIndex === index ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
        strokeWidth: selectedJoinIndex === index ? 3 : 2,
      },
    }));
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges());

  // Update nodes when tables change
  React.useEffect(() => {
    setNodes(createNodes());
  }, [tables, mainTable]);

  // Update edges when joins change
  React.useEffect(() => {
    setEdges(createEdges());
  }, [joins, selectedJoinIndex]);

  const handleAddJoin = () => {
    const availableTables = tables.filter((t) => t.id !== mainTable);
    if (availableTables.length === 0) return;

    const newJoin: JoinConfig = {
      leftTable: mainTable,
      rightTable: availableTables[0].id,
      leftColumn: tables.find((t) => t.id === mainTable)?.columns[0]?.name || '',
      rightColumn: availableTables[0].columns[0]?.name || '',
      joinType: 'INNER',
    };

    onJoinsChange([...joins, newJoin]);
    setSelectedJoinIndex(joins.length);
  };

  const handleUpdateJoin = (index: number, updates: Partial<JoinConfig>) => {
    const updatedJoins = joins.map((join, i) =>
      i === index ? { ...join, ...updates } : join
    );
    onJoinsChange(updatedJoins);
  };

  const handleDeleteJoin = (index: number) => {
    onJoinsChange(joins.filter((_, i) => i !== index));
    setSelectedJoinIndex(null);
  };

  const getAvailableColumns = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    return table?.columns || [];
  };

  const minimumJoinsRequired = tables.length - 1;
  const hasEnoughJoins = joins.length >= minimumJoinsRequired;

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card className="p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
            <GitMerge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
              Configure Table Relationships
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Define how tables should be joined together. You need at least{' '}
              <strong>{minimumJoinsRequired}</strong> join{minimumJoinsRequired !== 1 ? 's' : ''} to connect all tables.
            </p>
          </div>
        </div>
      </Card>

      {!hasEnoughJoins && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need {minimumJoinsRequired - joins.length} more join
            {minimumJoinsRequired - joins.length !== 1 ? 's' : ''} to connect all tables.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Diagram */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Relationship Diagram</h3>
              <Button onClick={handleAddJoin} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Join
              </Button>
            </div>
            <div className="h-[500px] border rounded-lg overflow-hidden">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
          </Card>
        </div>

        {/* Join Configuration Panel */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Join Configuration</h3>

            {joins.length === 0 ? (
              <div className="text-center py-8">
                <GitMerge className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  No joins configured yet
                </p>
                <Button onClick={handleAddJoin} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Join
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {joins.map((join, index) => {
                  const isSelected = selectedJoinIndex === index;
                  const leftTable = tables.find((t) => t.id === join.leftTable);
                  const rightTable = tables.find((t) => t.id === join.rightTable);

                  return (
                    <Card
                      key={index}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedJoinIndex(index)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="outline">Join {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJoin(index);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {/* Left Table */}
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Left Table
                          </Label>
                          <Select
                            value={join.leftTable}
                            onValueChange={(value) =>
                              handleUpdateJoin(index, { leftTable: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
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

                        {/* Left Column */}
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Left Column
                          </Label>
                          <Select
                            value={join.leftColumn}
                            onValueChange={(value) =>
                              handleUpdateJoin(index, { leftColumn: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableColumns(join.leftTable).map((col) => (
                                <SelectItem key={col.name} value={col.name}>
                                  {col.name} ({col.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Join Type */}
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Join Type
                          </Label>
                          <Select
                            value={join.joinType}
                            onValueChange={(value) =>
                              handleUpdateJoin(index, { joinType: value as any })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {joinTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div>
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {option.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        {/* Right Table */}
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Right Table
                          </Label>
                          <Select
                            value={join.rightTable}
                            onValueChange={(value) =>
                              handleUpdateJoin(index, { rightTable: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {tables
                                .filter((t) => t.id !== join.leftTable)
                                .map((table) => (
                                  <SelectItem key={table.id} value={table.id}>
                                    {table.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Right Column */}
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Right Column
                          </Label>
                          <Select
                            value={join.rightColumn}
                            onValueChange={(value) =>
                              handleUpdateJoin(index, { rightColumn: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableColumns(join.rightTable).map((col) => (
                                <SelectItem key={col.name} value={col.name}>
                                  {col.name} ({col.type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Join Preview */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-mono bg-muted p-2 rounded">
                            {leftTable?.name}.{join.leftColumn}
                            <br />
                            <span className="text-primary font-semibold">
                              {join.joinType} JOIN
                            </span>
                            <br />
                            {rightTable?.name}.{join.rightColumn}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
