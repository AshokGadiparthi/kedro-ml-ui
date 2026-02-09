/**
 * WORLD-CLASS Relationship Diagram Builder V2
 * Premium UX with connection handles, inline editing, and beautiful interactions
 * Inspired by: dbdiagram.io, Airtable, Figma, Notion
 */

import { useCallback, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  MarkerType,
  Panel,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../../styles/reactflow-custom.css';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Table as TableIcon,
  Key,
  Trash2,
  Edit2,
  Link2,
  CheckCircle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Target,
  Plus,
  Settings,
} from 'lucide-react';
import type { TableFile, TableRelationship } from '../../../types/datasetCollection';

interface RelationshipDiagramProps {
  tables: TableFile[];
  relationships: TableRelationship[];
  onRelationshipAdd: (relationship: TableRelationship) => void;
  onRelationshipRemove: (id: string) => void;
}

// Custom Table Node Component
function TableNode({ data }: any) {
  const isPrimary = data.isPrimary;
  const table = data.table;

  return (
    <div className="relative">
      {/* Connection Handles - These allow dragging connections */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!scale-150 transition-transform"
        style={{ right: -6 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!scale-150 transition-transform"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!scale-150 transition-transform"
        style={{ top: -6 }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!scale-150 transition-transform"
        style={{ bottom: -6 }}
      />

      <Card className={`min-w-[280px] shadow-lg ${isPrimary ? 'border-primary border-2 shadow-primary/20' : ''}`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b flex items-center gap-3 ${
          isPrimary 
            ? 'bg-primary/10 border-primary/20' 
            : 'bg-muted/50'
        }`}>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            isPrimary 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted-foreground/20'
          }`}>
            <TableIcon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm flex items-center gap-2">
              {table.name}
              {isPrimary && (
                <Badge variant="default" className="text-xs">
                  Primary
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {table.columns.length || 0} columns
            </div>
          </div>
        </div>

        {/* Columns with Connection Handles */}
        <div className="px-4 py-2 max-h-[300px] overflow-y-auto">
          {table.columns && table.columns.length > 0 ? (
            <div className="space-y-1">
              {table.columns.slice(0, 15).map((column: any, idx: number) => (
                <div
                  key={idx}
                  className="group flex items-center gap-2 py-1.5 px-2 rounded hover:bg-accent/50 transition-colors cursor-pointer"
                  title={`${column.name} (${column.type})`}
                >
                  {/* Connection Handle Indicator */}
                  <div className="h-2 w-2 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary group-hover:bg-primary transition-all" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{column.name}</div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">{column.type}</div>
                  
                  {column.isPrimaryKey && (
                    <Key className="h-3 w-3 text-amber-500 flex-shrink-0" />
                  )}
                </div>
              ))}
              {table.columns.length > 15 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  + {table.columns.length - 15} more columns
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No columns detected
            </div>
          )}
        </div>

        {/* Footer with stats */}
        <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
          {table.filename}
        </div>
      </Card>
    </div>
  );
}

const nodeTypes = {
  tableNode: TableNode,
};

export function RelationshipDiagram({
  tables,
  relationships,
  onRelationshipAdd,
  onRelationshipRemove,
}: RelationshipDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Relationship editing
  const [editingRelationship, setEditingRelationship] = useState<TableRelationship | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [leftKey, setLeftKey] = useState('');
  const [rightKey, setRightKey] = useState('');
  const [joinType, setJoinType] = useState<'left' | 'right' | 'inner' | 'outer'>('left');

  // New relationship being created
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  
  // Popover for viewing relationship details
  const [selectedRelationship, setSelectedRelationship] = useState<TableRelationship | null>(null);
  const [showRelationshipPopover, setShowRelationshipPopover] = useState(false);

  // Initialize nodes from tables
  useEffect(() => {
    const initialNodes: Node[] = tables.map((table, index) => {
      // Create a 3-column grid with better spacing
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 50 + col * 400; // Increased horizontal spacing
      const y = 50 + row * 450; // Increased vertical spacing

      return {
        id: table.id,
        type: 'tableNode',
        position: { x, y },
        data: {
          table,
          isPrimary: table.isPrimary,
          label: table.name,
        },
        draggable: true,
      };
    });

    setNodes(initialNodes);
  }, [tables, setNodes]);

  // Initialize edges from relationships
  useEffect(() => {
    const initialEdges: Edge[] = relationships.map((rel) => {
      // Find the table IDs from table names
      const sourceTable = tables.find(t => t.name === rel.leftTable);
      const targetTable = tables.find(t => t.name === rel.rightTable);
      
      if (!sourceTable || !targetTable) return null;
      
      return {
        id: rel.id,
        source: sourceTable.id,
        target: targetTable.id,
        type: 'default',
        animated: false,
        style: { 
          stroke: '#6366f1', // Indigo-500 for visibility
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#6366f1',
        },
        data: rel,
      };
    }).filter(Boolean) as Edge[];

    setEdges(initialEdges);
  }, [relationships, tables, setEdges]);

  // Handle connection creation
  const onConnect = useCallback(
    (params: Connection) => {
      // Show dialog to configure the relationship
      setPendingConnection(params);
      setShowConnectionDialog(true);
    },
    []
  );

  // Create relationship from dialog
  const handleCreateRelationship = useCallback(() => {
    if (!pendingConnection || !leftKey || !rightKey) return;

    const leftTable = tables.find((t) => t.id === pendingConnection.source);
    const rightTable = tables.find((t) => t.id === pendingConnection.target);

    if (!leftTable || !rightTable) return;

    const relationship: TableRelationship = {
      id: `rel-${Date.now()}`,
      leftTable: leftTable.name,
      rightTable: rightTable.name,
      leftKey,
      rightKey,
      joinType,
      relationshipType: '1:N', // Default relationship type
    };

    onRelationshipAdd(relationship);
    setShowConnectionDialog(false);
    setPendingConnection(null);
    setLeftKey('');
    setRightKey('');
  }, [pendingConnection, leftKey, rightKey, joinType, tables, onRelationshipAdd]);

  // Handle edge click for editing
  const onEdgeClick = useCallback(
    (_: any, edge: Edge) => {
      const rel = edge.data as TableRelationship;
      if (rel) {
        setEditingRelationship(rel);
        setLeftKey(rel.leftKey);
        setRightKey(rel.rightKey);
        setJoinType(rel.joinType);
        setShowEditDialog(true);
      }
    },
    []
  );

  // Update relationship
  const handleUpdateRelationship = useCallback(() => {
    if (!editingRelationship) return;

    // Remove old and add updated
    onRelationshipRemove(editingRelationship.id);
    onRelationshipAdd({
      ...editingRelationship,
      leftKey,
      rightKey,
      joinType,
    });

    setShowEditDialog(false);
    setEditingRelationship(null);
  }, [editingRelationship, leftKey, rightKey, joinType, onRelationshipAdd, onRelationshipRemove]);

  // Delete relationship
  const handleDeleteRelationship = useCallback(
    (relId: string) => {
      onRelationshipRemove(relId);
      setShowEditDialog(false);
      setEditingRelationship(null);
    },
    [onRelationshipRemove]
  );

  // Get columns for a table
  const getTableColumns = (tableName: string) => {
    const table = tables.find((t) => t.name === tableName);
    return table?.columns || [];
  };

  return (
    <div className="relative w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
          style: { 
            stroke: 'hsl(var(--primary))',
            strokeWidth: 2,
          },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls className="bg-background border rounded-lg shadow-lg" />
        <MiniMap
          className="bg-background border rounded-lg shadow-lg"
          nodeStrokeWidth={3}
          zoomable
          pannable
        />

        {/* Top Panel with Instructions and Stats */}
        <Panel position="top-center" className="pointer-events-none">
          <Card className="pointer-events-auto px-6 py-3 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="text-sm text-muted-foreground">
                Drag from the colored dots to create • Click a line to edit
              </div>
            </div>
          </Card>
        </Panel>
      </ReactFlow>

      {/* Create Connection Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Create Relationship
            </DialogTitle>
            <DialogDescription>
              Define how these tables are connected
            </DialogDescription>
          </DialogHeader>

          {pendingConnection && (
            <div className="space-y-6">
              {/* Connection Overview */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 flex-1">
                  <TableIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">
                    {tables.find((t) => t.id === pendingConnection.source)?.name}
                  </span>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex items-center gap-2 flex-1">
                  <TableIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">
                    {tables.find((t) => t.id === pendingConnection.target)?.name}
                  </span>
                </div>
              </div>

              {/* Left Key Selection */}
              <div className="space-y-2">
                <Label>Left Table Key</Label>
                <Select value={leftKey} onValueChange={setLeftKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column from left table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getTableColumns(
                      tables.find((t) => t.id === pendingConnection.source)?.name || ''
                    ).map((col: any) => (
                      <SelectItem key={col.name} value={col.name}>
                        <div className="flex items-center gap-2">
                          {col.isPrimaryKey && <Key className="h-3 w-3 text-amber-500" />}
                          <span>{col.name}</span>
                          <span className="text-muted-foreground text-xs">({col.type})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Right Key Selection */}
              <div className="space-y-2">
                <Label>Right Table Key</Label>
                <Select value={rightKey} onValueChange={setRightKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column from right table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getTableColumns(
                      tables.find((t) => t.id === pendingConnection.target)?.name || ''
                    ).map((col: any) => (
                      <SelectItem key={col.name} value={col.name}>
                        <div className="flex items-center gap-2">
                          {col.isPrimaryKey && <Key className="h-3 w-3 text-amber-500" />}
                          <span>{col.name}</span>
                          <span className="text-muted-foreground text-xs">({col.type})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Join Type Selection */}
              <div className="space-y-2">
                <Label>Join Type</Label>
                <Select value={joinType} onValueChange={(v: any) => setJoinType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">
                      <div className="space-y-1">
                        <div className="font-medium">Left Join</div>
                        <div className="text-xs text-muted-foreground">
                          Keep all rows from left table
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="right">
                      <div className="space-y-1">
                        <div className="font-medium">Right Join</div>
                        <div className="text-xs text-muted-foreground">
                          Keep all rows from right table
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="inner">
                      <div className="space-y-1">
                        <div className="font-medium">Inner Join</div>
                        <div className="text-xs text-muted-foreground">
                          Only matching rows from both
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="outer">
                      <div className="space-y-1">
                        <div className="font-medium">Outer Join</div>
                        <div className="text-xs text-muted-foreground">
                          All rows from both tables
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              {leftKey && rightKey && (
                <Card className="p-3 bg-primary/5 border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Preview</div>
                  <div className="text-sm font-mono">
                    {tables.find((t) => t.id === pendingConnection.source)?.name}.{leftKey} ={' '}
                    {tables.find((t) => t.id === pendingConnection.target)?.name}.{rightKey}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Using {joinType.toUpperCase()} join
                  </div>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConnectionDialog(false);
                setPendingConnection(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRelationship} disabled={!leftKey || !rightKey}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Relationship
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Relationship Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Edit Relationship
            </DialogTitle>
            <DialogDescription>
              Update the relationship configuration
            </DialogDescription>
          </DialogHeader>

          {editingRelationship && (
            <div className="space-y-6">
              {/* Connection Overview */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 flex-1">
                  <TableIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{editingRelationship.leftTable}</span>
                </div>
                <div className="text-muted-foreground">→</div>
                <div className="flex items-center gap-2 flex-1">
                  <TableIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{editingRelationship.rightTable}</span>
                </div>
              </div>

              {/* Left Key */}
              <div className="space-y-2">
                <Label>Left Table Key</Label>
                <Select value={leftKey} onValueChange={setLeftKey}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getTableColumns(editingRelationship.leftTable).map((col: any) => (
                      <SelectItem key={col.name} value={col.name}>
                        <div className="flex items-center gap-2">
                          {col.isPrimaryKey && <Key className="h-3 w-3 text-amber-500" />}
                          <span>{col.name}</span>
                          <span className="text-muted-foreground text-xs">({col.type})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Right Key */}
              <div className="space-y-2">
                <Label>Right Table Key</Label>
                <Select value={rightKey} onValueChange={setRightKey}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getTableColumns(editingRelationship.rightTable).map((col: any) => (
                      <SelectItem key={col.name} value={col.name}>
                        <div className="flex items-center gap-2">
                          {col.isPrimaryKey && <Key className="h-3 w-3 text-amber-500" />}
                          <span>{col.name}</span>
                          <span className="text-muted-foreground text-xs">({col.type})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Join Type */}
              <div className="space-y-2">
                <Label>Join Type</Label>
                <Select value={joinType} onValueChange={(v: any) => setJoinType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left Join</SelectItem>
                    <SelectItem value="right">Right Join</SelectItem>
                    <SelectItem value="inner">Inner Join</SelectItem>
                    <SelectItem value="outer">Outer Join</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => editingRelationship && handleDeleteRelationship(editingRelationship.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRelationship}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}