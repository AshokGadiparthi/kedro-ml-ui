/**
 * Multi-Table Dataset Upload Wizard
 * Step-by-step wizard for uploading and configuring multi-table datasets
 */

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
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
} from 'lucide-react';
import { RelationshipDiagram } from './RelationshipDiagram';
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

const STEPS: { id: WizardStep; label: string; icon: any }[] = [
  { id: 'upload', label: 'Upload Files', icon: Upload },
  { id: 'identify', label: 'Identify Tables', icon: Database },
  { id: 'relationships', label: 'Relationships', icon: Link2 },
  { id: 'aggregations', label: 'Aggregations', icon: Settings },
  { id: 'review', label: 'Review', icon: Check },
];

export function MultiTableWizard({ open, onClose, onComplete, projectId }: MultiTableWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [processing, setProcessing] = useState(false);

  // Collection data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tables, setTables] = useState<TableFile[]>([]);
  const [primaryTable, setPrimaryTable] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [relationships, setRelationships] = useState<TableRelationship[]>([]);
  const [aggregations, setAggregations] = useState<AggregationConfig[]>([]);

  // File upload handlers
  const handleFilesSelected = useCallback((files: FileList | null) => {
    if (!files) return;

    const newTables: TableFile[] = Array.from(files).map((file) => ({
      id: `${Date.now()}_${file.name}`,
      name: file.name.replace(/\.(csv|xlsx|xls)$/i, ''),
      filename: file.name,
      file,
    }));

    setTables((prev) => [...prev, ...newTables]);
    toast.success(`${newTables.length} file${newTables.length > 1 ? 's' : ''} added`);
  }, []);

  const removeTable = (tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    if (tables.find(t => t.id === tableId)?.name === primaryTable) {
      setPrimaryTable('');
      setTargetColumn('');
    }
  };

  // Step navigation
  const getCurrentStepIndex = () => STEPS.findIndex((s) => s.id === currentStep);
  
  const canGoNext = () => {
    switch (currentStep) {
      case 'upload':
        return tables.length > 0 && name.trim().length > 0;
      case 'identify':
        return primaryTable.length > 0;
      case 'relationships':
        return true; // Optional step
      case 'aggregations':
        return true; // Optional step
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const stepIndex = getCurrentStepIndex();
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].id);
    } else {
      // Final step - complete wizard
      await handleComplete();
    }
  };

  const handleBack = () => {
    const stepIndex = getCurrentStepIndex();
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id);
    }
  };

  const handleComplete = async () => {
    try {
      setProcessing(true);

      const collection: Partial<DatasetCollection> = {
        name,
        description,
        projectId,
        tables,
        primaryTable,
        targetColumn,
        relationships,
        aggregations,
        status: 'draft',
      };

      await onComplete(collection);
      
      // Reset wizard
      setCurrentStep('upload');
      setTables([]);
      setName('');
      setDescription('');
      setPrimaryTable('');
      setTargetColumn('');
      setRelationships([]);
      setAggregations([]);
      
      toast.success('Multi-table dataset created successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create dataset collection');
    } finally {
      setProcessing(false);
    }
  };

  const handleRelationshipAdd = (relationship: Omit<TableRelationship, 'id'>) => {
    const newRelationship: TableRelationship = {
      ...relationship,
      id: `rel_${Date.now()}`,
    };
    setRelationships((prev) => [...prev, newRelationship]);
  };

  const handleRelationshipRemove = (relationshipId: string) => {
    setRelationships((prev) => prev.filter((r) => r.id !== relationshipId));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Collection Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Home Credit Default Risk"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this multi-table dataset..."
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Upload Files *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                  id="multi-file-upload"
                />
                <label htmlFor="multi-file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">CSV, XLSX files (multiple files allowed)</p>
                </label>
              </div>

              {tables.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Uploaded Files ({tables.length})</Label>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {tables.map((table) => (
                      <Card key={table.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium text-sm">{table.filename}</div>
                              <div className="text-xs text-muted-foreground">
                                Table name: {table.name}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTable(table.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'identify':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Primary Table *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select the main table that contains your target variable
              </p>
              <Select value={primaryTable} onValueChange={(value) => {
                setPrimaryTable(value);
                const table = tables.find(t => t.name === value);
                if (table) {
                  table.isPrimary = true;
                }
                tables.filter(t => t.name !== value).forEach(t => t.isPrimary = false);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary table..." />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.id} value={table.name}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {primaryTable && (
              <div className="space-y-2">
                <Label>Target Column (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  The column you want to predict (e.g., TARGET, default, churn)
                </p>
                <Input
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  placeholder="e.g., TARGET"
                />
              </div>
            )}

            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-sm">What is a primary table?</div>
                  <p className="text-xs text-muted-foreground">
                    The primary table is your main dataset (usually one row per customer/loan/transaction).
                    All other tables will be aggregated and joined back to this table.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Label>All Tables</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tables.map((table) => (
                  <Card
                    key={table.id}
                    className={`p-4 ${
                      table.isPrimary ? 'border-2 border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TableIcon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{table.name}</div>
                        <div className="text-xs text-muted-foreground">{table.filename}</div>
                      </div>
                      {table.isPrimary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'relationships':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Define Table Relationships</h3>
              <p className="text-sm text-muted-foreground">
                Specify how tables are connected. This is optional but recommended for better feature engineering.
              </p>
            </div>

            <RelationshipDiagram
              tables={tables}
              relationships={relationships}
              onRelationshipAdd={handleRelationshipAdd}
              onRelationshipRemove={handleRelationshipRemove}
            />

            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <Link2 className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-sm">Pro Tip</div>
                  <p className="text-xs text-muted-foreground">
                    Drag connections between tables to define relationships. Common join keys are ID columns
                    like SK_ID_CURR, customer_id, or loan_id.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'aggregations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Configure Aggregations</h3>
              <p className="text-sm text-muted-foreground">
                Define how to aggregate detail tables (many rows per customer) back to the primary table (one row per customer).
              </p>
            </div>

            <AggregationBuilder
              tables={tables}
              primaryTable={primaryTable}
              aggregations={aggregations}
              onAggregationsChange={setAggregations}
            />

            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-sm">Example</div>
                  <p className="text-xs text-muted-foreground">
                    If the "bureau" table has 5 records per customer with AMT_CREDIT_SUM, you can create features like:
                    BUREAU_AMT_CREDIT_SUM_sum, BUREAU_AMT_CREDIT_SUM_mean, BUREAU_AMT_CREDIT_SUM_max
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Review your multi-table dataset configuration before creating
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{name}</div>
                  </div>
                  {description && (
                    <div>
                      <div className="text-sm text-muted-foreground">Description</div>
                      <div className="text-sm">{description}</div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <div className="font-medium mb-3">Tables ({tables.length})</div>
                <div className="space-y-2">
                  {tables.map((table) => (
                    <div key={table.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TableIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{table.name}</span>
                      </div>
                      {table.isPrimary && <Badge variant="default">Primary</Badge>}
                    </div>
                  ))}
                </div>
              </Card>

              {targetColumn && (
                <Card className="p-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Target Column</div>
                    <div className="font-medium">{targetColumn}</div>
                  </div>
                </Card>
              )}

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Relationships</div>
                  <Badge variant="outline">{relationships.length}</Badge>
                </div>
                {relationships.length > 0 ? (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {relationships.map((rel) => (
                      <div key={rel.id}>
                        {rel.leftTable}.{rel.leftKey} → {rel.rightTable}.{rel.rightKey} ({rel.joinType})
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No relationships defined</p>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Aggregations</div>
                  <Badge variant="outline">{aggregations.length} table{aggregations.length !== 1 ? 's' : ''}</Badge>
                </div>
                {aggregations.length > 0 ? (
                  <div className="space-y-2">
                    {aggregations.map((agg) => (
                      <div key={agg.id} className="text-sm">
                        <div className="font-medium">{agg.tableName}</div>
                        <div className="text-muted-foreground">
                          {agg.features.length} feature{agg.features.length !== 1 ? 's' : ''} • Group by {agg.groupByColumn}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No aggregations configured</p>
                )}
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Multi-Table Dataset</DialogTitle>
          <DialogDescription>
            Upload and configure multiple related tables for advanced ML workflows
          </DialogDescription>
        </DialogHeader>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isComplete = getCurrentStepIndex() > index;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isComplete
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-[2px] mx-4 bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: isComplete ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={getCurrentStepIndex() === 0 || processing}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canGoNext() || processing}
            >
              {processing ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : currentStep === 'review' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Collection
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
