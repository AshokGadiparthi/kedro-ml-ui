/**
 * Visual Relationship Diagram
 * Interactive ER-style diagram for table relationships using React Flow
 */

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Key, Link2, Table as TableIcon, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import type { TableFile, TableRelationship } from '../../../types/datasetCollection';

interface RelationshipDiagramProps {
  tables: TableFile[];
  relationships: TableRelationship[];
  onRelationshipAdd?: (relationship: Omit<TableRelationship, 'id'>) => void;
  onRelationshipRemove?: (relationshipId: string) => void;
  readOnly?: boolean;
}

// Custom node component for tables
function TableNode({ data }: { data: any }) {
  return (
    <Card className={`p-4 min-w-[250px] ${data.isPrimary ? 'border-2 border-primary shadow-lg' : 'border'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          data.isPrimary ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          <TableIcon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">{data.name}</div>
          {data.isPrimary && (
            <Badge variant="default" className="text-xs">Primary Table</Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Database className="h-3 w-3" />
          <span>{data.rowCount?.toLocaleString() || '—'} rows</span>
        </div>
        <div className="flex items-center gap-2">
          <TableIcon className="h-3 w-3" />
          <span>{data.columnCount || '—'} columns</span>
        </div>
      </div>

      {data.columns && data.columns.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs font-medium mb-2">Key Columns</div>
          <div className="space-y-1">
            {data.columns.slice(0, 5).map((col: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Key className="h-3 w-3" />
                <span className="truncate">{col}</span>
              </div>
            ))}
            {data.columns.length > 5 && (
              <div className="text-xs text-muted-foreground italic">
                +{data.columns.length - 5} more columns
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

const nodeTypes = {
  table: TableNode,
};

export function RelationshipDiagram({
  tables,
  relationships,
  onRelationshipAdd,
  onRelationshipRemove,
  readOnly = false,
}: RelationshipDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [leftColumn, setLeftColumn] = useState('');
  const [rightColumn, setRightColumn] = useState('');
  const [joinType, setJoinType] = useState<'left' | 'right' | 'inner' | 'outer'>('left');

  // Convert tables to nodes
  useEffect(() => {
    const newNodes: Node[] = tables.map((table, index) => ({
      id: table.name,
      type: 'table',
      position: {
        x: (index % 3) * 350,
        y: Math.floor(index / 3) * 300,
      },
      data: {
        name: table.name,
        isPrimary: table.isPrimary,
        rowCount: table.rowCount,
        columnCount: table.columnCount,
        columns: table.columns,
      },
    }));
    setNodes(newNodes);
  }, [tables, setNodes]);

  // Convert relationships to edges
  useEffect(() => {
    const newEdges: Edge[] = relationships.map((rel) => ({
      id: rel.id,
      source: rel.leftTable,
      target: rel.rightTable,
      label: `${rel.leftKey} = ${rel.rightKey}`,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
      labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 12 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.9 },
      type: 'smoothstep',
      animated: false,
    }));
    setEdges(newEdges);
  }, [relationships, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly || !onRelationshipAdd) return;
      
      // Open dialog to configure relationship
      if (connection.source && connection.target) {
        setPendingConnection(connection);
        // Auto-select first column from each table as default
        const leftTable = tables.find(t => t.name === connection.source);
        const rightTable = tables.find(t => t.name === connection.target);
        if (leftTable?.columns && leftTable.columns.length > 0) {
          setLeftColumn(leftTable.columns[0]);
        }
        if (rightTable?.columns && rightTable.columns.length > 0) {
          setRightColumn(rightTable.columns[0]);
        }
      }
    },
    [tables, onRelationshipAdd, readOnly]
  );

  const handleConfirmRelationship = () => {
    if (!pendingConnection || !onRelationshipAdd) return;
    
    onRelationshipAdd({
      leftTable: pendingConnection.source!,
      rightTable: pendingConnection.target!,
      leftKey: leftColumn,
      rightKey: rightColumn,
      joinType,
      relationshipType: '1:N',
    });
    
    // Reset dialog state
    setPendingConnection(null);
    setLeftColumn('');
    setRightColumn('');
    setJoinType('left');
  };

  const handleCancelRelationship = () => {
    setPendingConnection(null);
    setLeftColumn('');
    setRightColumn('');
    setJoinType('left');
  };

  // Get columns for each table in the pending connection
  const leftTable = pendingConnection ? tables.find(t => t.name === pendingConnection.source) : null;
  const rightTable = pendingConnection ? tables.find(t => t.name === pendingConnection.target) : null;

  return (
    <div className="h-[600px] w-full border rounded-lg bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { strokeWidth: 2 },
        }}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => node.data.isPrimary ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
          maskColor="hsl(var(--background) / 0.9)"
        />
        <Panel position="top-left" className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4 text-primary" />
            <span className="font-medium">{relationships.length} Relationship{relationships.length !== 1 ? 's' : ''}</span>
          </div>
        </Panel>
        {!readOnly && (
          <Panel position="top-right" className="bg-background border rounded-lg p-3 shadow-lg">
            <div className="text-xs text-muted-foreground">
              Drag from one table to another to create a relationship
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* Relationship Configuration Dialog */}
      {pendingConnection && (
        <Dialog open={true} onOpenChange={handleCancelRelationship}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Configure Relationship</DialogTitle>
              <DialogDescription>
                Set up the relationship between <strong>{pendingConnection.source}</strong> and <strong>{pendingConnection.target}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leftColumn">Left Column</Label>
                <Select value={leftColumn} onValueChange={setLeftColumn}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {leftTable?.columns.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rightColumn">Right Column</Label>
                <Select value={rightColumn} onValueChange={setRightColumn}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {rightTable?.columns.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="joinType">Join Type</Label>
                <Select value={joinType} onValueChange={setJoinType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a join type" />
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancelRelationship}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirmRelationship}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}