import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Table2,
  GitMerge,
  FunctionSquare,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { TableSelector } from './TableSelector';
import { JoinConfigurator } from './JoinConfigurator';
import { AggregationBuilder } from './AggregationBuilder';
import { DataPreview } from './DataPreview';

export interface TableInfo {
  id: string;
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  unique: boolean;
}

export interface JoinConfig {
  leftTable: string;
  rightTable: string;
  leftColumn: string;
  rightColumn: string;
  joinType: 'INNER' | 'LEFT' | 'RIGHT' | 'OUTER';
}

export interface AggregationConfig {
  table: string;
  column: string;
  function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'COUNT_DISTINCT';
  alias: string;
}

export interface DataSourceConfig {
  name: string;
  description: string;
  tables: string[];
  joins: JoinConfig[];
  aggregations: AggregationConfig[];
  mainTable: string;
}

interface DataSourceWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: DataSourceConfig) => void;
  availableTables: TableInfo[];
}

const steps = [
  {
    id: 'select',
    title: 'Select Tables',
    description: 'Choose tables to include in your data source',
    icon: Table2,
  },
  {
    id: 'join',
    title: 'Configure Joins',
    description: 'Define relationships between tables',
    icon: GitMerge,
  },
  {
    id: 'aggregate',
    title: 'Set Aggregations',
    description: 'Configure aggregation functions',
    icon: FunctionSquare,
  },
  {
    id: 'preview',
    title: 'Preview & Save',
    description: 'Review and save your configuration',
    icon: Eye,
  },
];

export const DataSourceWizard: React.FC<DataSourceWizardProps> = ({
  open,
  onClose,
  onSave,
  availableTables,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<Partial<DataSourceConfig>>({
    name: '',
    description: '',
    tables: [],
    joins: [],
    aggregations: [],
    mainTable: '',
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    if (config.name && config.tables && config.tables.length > 0 && config.mainTable) {
      onSave(config as DataSourceConfig);
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setConfig({
      name: '',
      description: '',
      tables: [],
      joins: [],
      aggregations: [],
      mainTable: '',
    });
    onClose();
  };

  const updateConfig = (updates: Partial<DataSourceConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return config.tables && config.tables.length > 0 && config.mainTable;
      case 1:
        return config.tables && config.tables.length === 1 || (config.joins && config.joins.length >= (config.tables?.length || 0) - 1);
      case 2:
        return true; // Aggregations are optional
      case 3:
        return config.name && config.name.trim() !== '';
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Create Data Source</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress */}
        <div className="px-6 py-4 border-b bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isActive
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all ${
                        index < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <TableSelector
                  availableTables={availableTables}
                  selectedTables={config.tables || []}
                  mainTable={config.mainTable || ''}
                  onTablesChange={(tables, mainTable) =>
                    updateConfig({ tables, mainTable })
                  }
                />
              )}

              {currentStep === 1 && (
                <JoinConfigurator
                  tables={
                    config.tables?.map((tableId) =>
                      availableTables.find((t) => t.id === tableId)
                    ).filter(Boolean) as TableInfo[]
                  }
                  joins={config.joins || []}
                  mainTable={config.mainTable || ''}
                  onJoinsChange={(joins) => updateConfig({ joins })}
                />
              )}

              {currentStep === 2 && (
                <AggregationBuilder
                  tables={
                    config.tables?.map((tableId) =>
                      availableTables.find((t) => t.id === tableId)
                    ).filter(Boolean) as TableInfo[]
                  }
                  aggregations={config.aggregations || []}
                  onAggregationsChange={(aggregations) =>
                    updateConfig({ aggregations })
                  }
                />
              )}

              {currentStep === 3 && (
                <DataPreview
                  config={config as DataSourceConfig}
                  tables={
                    config.tables?.map((tableId) =>
                      availableTables.find((t) => t.id === tableId)
                    ).filter(Boolean) as TableInfo[]
                  }
                  onNameChange={(name) => updateConfig({ name })}
                  onDescriptionChange={(description) =>
                    updateConfig({ description })
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={!canProceed()}>
              <Check className="w-4 h-4 mr-2" />
              Save Data Source
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
