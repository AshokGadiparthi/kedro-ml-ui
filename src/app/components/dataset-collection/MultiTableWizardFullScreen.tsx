/**
 * Multi-Table Dataset Upload Wizard - WORLD-CLASS FULL-SCREEN VERSION
 * Beautiful, spacious, professional wizard for multi-table datasets
 * Inspired by Notion, Figma, Linear - top-tier UX
 */

import { useState, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Upload, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Table as TableIcon,
  Target,
  Link2,
  Settings,
  X,
  Database,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
} from 'lucide-react';
import { RelationshipDiagram } from './RelationshipDiagram';
import { RelationshipDiagram as RelationshipDiagramV2 } from './RelationshipDiagramV2';
import { AggregationBuilder } from './AggregationBuilder';
import type { TableFile, TableRelationship, AggregationConfig, DatasetCollection } from '../../../types/datasetCollection';
import { toast } from 'sonner';

interface MultiTableWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (collection: Partial<DatasetCollection>) => Promise<void>;
  projectId: string;
}

type WizardStep = 'upload' | 'identify' | 'relationships' | 'aggregations' | 'review';

const STEPS: { id: WizardStep; label: string; description: string; icon: any }[] = [
  { id: 'upload', label: 'Upload Files', description: 'Upload your CSV files', icon: Upload },
  { id: 'identify', label: 'Identify Tables', description: 'Select primary table', icon: Database },
  { id: 'relationships', label: 'Define Relationships', description: 'Connect your tables', icon: Link2 },
  { id: 'aggregations', label: 'Configure Aggregations', description: 'Create features', icon: Settings },
  { id: 'review', label: 'Review & Process', description: 'Finalize configuration', icon: Check },
];

export function MultiTableWizard({ open, onClose, onComplete, projectId }: MultiTableWizardProps) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [processing, setProcessing] = useState(false);

  // Collection data
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [tables, setTables] = useState<TableFile[]>([]);
  const [primaryTable, setPrimaryTable] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState('');
  const [relationships, setRelationships] = useState<TableRelationship[]>([]);
  const [aggregations, setAggregations] = useState<AggregationConfig[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

  // Validation
  const canProceedFromUpload = collectionName.trim() !== '' && tables.length > 0;
  const canProceedFromIdentify = primaryTable !== '';
  const canProceed = {
    upload: canProceedFromUpload,
    identify: canProceedFromIdentify,
    relationships: true, // Optional step
    aggregations: true, // Optional step
    review: true,
  }[currentStep];

  // File handling
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Read each file to extract column names
    const newTablesPromises = files.map(async (file, index) => {
      let columnNames: string[] = [];
      
      try {
        // Read first line of CSV to get headers
        const text = await file.slice(0, 10000).text(); // Read first 10KB
        const firstLine = text.split('\n')[0];
        columnNames = firstLine.split(',').map(col => col.trim().replace(/['"]/g, ''));
      } catch (error) {
        console.error('Failed to read file headers:', error);
        // Fallback to generic columns
        columnNames = ['id', 'column1', 'column2'];
      }
      
      // Convert column names to column objects with type info
      const columns = columnNames.map(name => ({
        name,
        type: 'VARCHAR', // Default type since we can't infer from CSV headers
        isPrimaryKey: false,
      }));
      
      return {
        id: `table-${Date.now()}-${index}`,
        name: file.name.replace(/\.(csv|xlsx)$/i, ''),
        filename: file.name,
        file,
        isPrimary: tables.length === 0 && index === 0,
        columns, // Array of column objects with name, type, isPrimaryKey
      };
    });
    
    const newTables = await Promise.all(newTablesPromises);
    setTables([...tables, ...newTables]);
  }, [tables]);

  const removeTable = useCallback((id: string) => {
    setTables(tables.filter(t => t.id !== id));
    if (tables.find(t => t.id === id)?.name === primaryTable) {
      setPrimaryTable('');
    }
  }, [tables, primaryTable]);

  // Navigation
  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const goToStep = (stepId: WizardStep) => {
    setCurrentStep(stepId);
  };

  // Handle primary table selection
  const handlePrimaryTableChange = (tableName: string) => {
    setPrimaryTable(tableName);
    setTables(tables.map(t => ({
      ...t,
      isPrimary: t.name === tableName
    })));
  };

  // Complete wizard
  const handleComplete = async () => {
    setProcessing(true);
    try {
      const collection: Partial<DatasetCollection> = {
        name: collectionName,
        description: collectionDescription,
        projectId,
        tables,
        primaryTable,
        targetColumn,
        relationships,
        aggregations,
        status: 'processing', // Backend will process immediately
      };

      await onComplete(collection);
      
      // Reset wizard
      setCollectionName('');
      setCollectionDescription('');
      setTables([]);
      setPrimaryTable('');
      setTargetColumn('');
      setRelationships([]);
      setAggregations([]);
      setCurrentStep('upload');
      
      toast.success('Collection created! Processing data...');
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (tables.length > 0) {
      if (confirm('Are you sure? Your progress will be lost.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Multi-Table Dataset Wizard</h1>
                <p className="text-sm text-muted-foreground">
                  {STEPS[currentStepIndex].description}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Step Indicator */}
          <div className="mt-6 flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    disabled={index > currentStepIndex}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : isCompleted
                        ? 'text-muted-foreground hover:bg-accent'
                        : 'text-muted-foreground/50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{step.label}</div>
                      <div className="text-xs text-muted-foreground">
                        Step {index + 1}
                      </div>
                    </div>
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-8 py-8 h-[calc(100vh-280px)] overflow-y-auto">
        {currentStep === 'upload' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Collection Information</h2>
              <p className="text-muted-foreground">
                Give your multi-table dataset a name and upload all related CSV files
              </p>
            </div>

            <div className="grid gap-6 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Collection Name *</Label>
                <Input
                  id="name"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g., Home Credit Default Risk"
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  placeholder="Describe this dataset collection..."
                  className="min-h-24 text-base"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Upload Files</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload multiple CSV files that are related (e.g., customers, transactions, etc.)
                  </p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Files
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />

              {tables.length === 0 ? (
                <Card
                  className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload CSV Files</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: .csv, .xlsx
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {tables.map((table) => (
                    <Card key={table.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                          <FileText className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{table.name}</h4>
                            {table.isPrimary && (
                              <Badge variant="default">Primary</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{table.filename}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTable(table.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {tables.length > 0 && (
                <div className="flex items-center gap-2 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {tables.length} file{tables.length !== 1 ? 's' : ''} uploaded successfully
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'identify' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Identify Primary Table</h2>
              <p className="text-muted-foreground">
                Select which table contains your target variable and represents the grain of your final dataset
              </p>
            </div>

            <div className="grid gap-6 max-w-2xl">
              <div className="space-y-2">
                <Label className="text-base">Primary Table *</Label>
                <Select value={primaryTable} onValueChange={handlePrimaryTableChange}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select the main table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.name}>
                        <div className="flex items-center gap-2">
                          <TableIcon className="h-4 w-4" />
                          {table.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  This table should have one row per entity (e.g., per customer, per loan application)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target" className="text-base">Target Column (Optional)</Label>
                <Input
                  id="target"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  placeholder="e.g., TARGET, label, outcome"
                  className="h-12 text-base"
                />
                <p className="text-sm text-muted-foreground">
                  The column you want to predict (for supervised learning)
                </p>
              </div>
            </div>

            <Card className="p-6 bg-amber-500/5 border-amber-500/20">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">What is a Primary Table?</h4>
                  <p className="text-sm text-muted-foreground">
                    The primary table is your main dataset that contains one row per entity. Other tables (like transaction history, 
                    previous applications, etc.) will be aggregated and joined to this table. For example, in Home Credit dataset, 
                    "application_train" is the primary table with one row per loan application.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Your Tables</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {tables.map((table) => (
                  <Card
                    key={table.id}
                    className={`p-4 cursor-pointer transition-all ${
                      table.name === primaryTable
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/30'
                    }`}
                    onClick={() => handlePrimaryTableChange(table.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        table.name === primaryTable
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <TableIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{table.name}</h4>
                          {table.name === primaryTable && (
                            <Badge variant="default" className="gap-1">
                              <Target className="h-3 w-3" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{table.filename}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'relationships' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Define Table Relationships</h2>
              <p className="text-muted-foreground">
                Drag from the colored dots to create connections • Click lines to edit
              </p>
            </div>

            <div className="h-[calc(100vh-280px)] border rounded-lg overflow-hidden">
              <RelationshipDiagramV2
                tables={tables}
                relationships={relationships}
                onRelationshipAdd={(rel) => setRelationships([...relationships, rel])}
                onRelationshipRemove={(id) => setRelationships(relationships.filter(r => r.id !== id))}
              />
            </div>

            {relationships.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  {relationships.length} relationship{relationships.length !== 1 ? 's' : ''} defined
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 'aggregations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Configure Aggregations</h2>
              <p className="text-muted-foreground">
                Define how to aggregate detail tables to the primary table grain (optional - you can skip this step)
              </p>
            </div>

            <Card className="p-6 bg-purple-500/5 border-purple-500/20">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Feature Engineering Made Easy</h4>
                  <p className="text-sm text-muted-foreground">
                    Transform detail tables (with multiple rows per customer) into aggregated features. 
                    For example, sum all credit amounts from the bureau table, or count previous applications per customer.
                  </p>
                </div>
              </div>
            </Card>

            <AggregationBuilder
              tables={tables.filter(t => !t.isPrimary)}
              aggregations={aggregations}
              onAggregationsChange={setAggregations}
            />

            {aggregations.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  {aggregations.length} table{aggregations.length !== 1 ? 's' : ''} configured for aggregation
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Review Configuration</h2>
              <p className="text-muted-foreground">
                Review your multi-table dataset configuration before processing
              </p>
            </div>

            <div className="grid gap-6">
              {/* Collection Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Collection Information
                </h3>
                <dl className="grid gap-3">
                  <div>
                    <dt className="text-sm text-muted-foreground">Name</dt>
                    <dd className="text-base font-medium">{collectionName}</dd>
                  </div>
                  {collectionDescription && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Description</dt>
                      <dd className="text-base">{collectionDescription}</dd>
                    </div>
                  )}
                </dl>
              </Card>

              {/* Tables */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TableIcon className="h-5 w-5 text-blue-500" />
                  Tables ({tables.length})
                </h3>
                <div className="grid gap-2">
                  {tables.map((table) => (
                    <div key={table.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{table.name}</span>
                          {table.isPrimary && (
                            <Badge variant="default" className="gap-1">
                              <Target className="h-3 w-3" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{table.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {targetColumn && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/5">
                    <p className="text-sm text-muted-foreground">Target Column</p>
                    <p className="font-medium">{targetColumn}</p>
                  </div>
                )}
              </Card>

              {/* Relationships */}
              {relationships.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-green-500" />
                    Relationships ({relationships.length})
                  </h3>
                  <div className="grid gap-2">
                    {relationships.map((rel) => (
                      <div key={rel.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {rel.leftTable} → {rel.rightTable}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {rel.leftKey} = {rel.rightKey} ({rel.joinType} join)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Aggregations */}
              {aggregations.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-500" />
                    Aggregations ({aggregations.length} tables)
                  </h3>
                  <div className="grid gap-4">
                    {aggregations.map((agg) => (
                      <div key={agg.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <TableIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{agg.tableName}</span>
                          <Badge variant="outline">Group by: {agg.groupByColumn}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Prefix: <code className="bg-muted px-1 rounded">{agg.prefix}</code>
                        </p>
                        <div className="space-y-1">
                          {agg.features.map((feature, idx) => (
                            <p key={idx} className="text-sm">
                              <span className="font-medium">{feature.column}:</span>{' '}
                              {feature.functions.join(', ')}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Processing Info */}
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Ready to Create Derived Dataset</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your derived dataset will be built immediately and appear in your datasets list:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Apply aggregations to detail tables
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Execute joins based on relationships
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Create merged dataset ready for EDA & ML
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStepIndex > 0 && (
                <Button variant="outline" onClick={goToPreviousStep} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {currentStep === 'review' ? (
                <Button
                  onClick={handleComplete}
                  disabled={processing}
                  size="lg"
                  className="gap-2 min-w-40"
                >
                  {processing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Create Derived Dataset
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceed}
                  size="lg"
                  className="gap-2 min-w-32"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}