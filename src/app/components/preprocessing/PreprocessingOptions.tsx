/**
 * PREPROCESSING OPTIONS COMPONENT
 * Collapsible panels for all preprocessing configuration
 */

import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PreprocessingOptionsProps {
  config: any;
  setConfig: (config: any) => void;
}

export function PreprocessingOptions({ config, setConfig }: PreprocessingOptionsProps) {
  const [expandedSections, setExpandedSections] = useState({
    missingValues: true,
    outliers: true,
    dataTypes: false,
    scaling: false,
    sampling: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const CollapsibleSection = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <Card className="overflow-hidden">
      <button
        onClick={() => toggleSection(section)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <h3 className="font-semibold">{title}</h3>
        {expandedSections[section] ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {expandedSections[section] && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Missing Values Handling */}
      <CollapsibleSection title="Missing Values Handling" section="missingValues">
        <div className="space-y-4">
          <div>
            <Label htmlFor="missing-strategy">Strategy</Label>
            <Select
              value={config.missingValues.strategy}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  missingValues: { ...config.missingValues, strategy: value },
                })
              }
            >
              <SelectTrigger id="missing-strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drop">Drop Rows/Columns</SelectItem>
                <SelectItem value="mean">Fill with Mean</SelectItem>
                <SelectItem value="median">Fill with Median</SelectItem>
                <SelectItem value="mode">Fill with Mode</SelectItem>
                <SelectItem value="interpolate">Interpolate</SelectItem>
                <SelectItem value="forward_fill">Forward Fill</SelectItem>
                <SelectItem value="backward_fill">Backward Fill</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Choose how to handle missing values in your dataset
            </p>
          </div>

          <div>
            <Label htmlFor="missing-threshold">
              Threshold ({config.missingValues.threshold}%)
            </Label>
            <Input
              id="missing-threshold"
              type="range"
              min="0"
              max="100"
              value={config.missingValues.threshold}
              onChange={(e) =>
                setConfig({
                  ...config,
                  missingValues: {
                    ...config.missingValues,
                    threshold: parseInt(e.target.value),
                  },
                })
              }
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Drop columns with more than {config.missingValues.threshold}% missing values
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Outlier Detection & Handling */}
      <CollapsibleSection title="Outlier Detection & Handling" section="outliers">
        <div className="space-y-4">
          <div>
            <Label htmlFor="outlier-method">Detection Method</Label>
            <Select
              value={config.outliers.method}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  outliers: { ...config.outliers, method: value },
                })
              }
            >
              <SelectTrigger id="outlier-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iqr">IQR (Interquartile Range)</SelectItem>
                <SelectItem value="zscore">Z-Score</SelectItem>
                <SelectItem value="isolation_forest">Isolation Forest</SelectItem>
                <SelectItem value="lof">Local Outlier Factor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="outlier-severity">Severity</Label>
            <Select
              value={config.outliers.severity}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  outliers: { ...config.outliers, severity: value },
                })
              }
            >
              <SelectTrigger id="outlier-severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (1.5 × IQR)</SelectItem>
                <SelectItem value="medium">Medium (2.0 × IQR)</SelectItem>
                <SelectItem value="high">High (3.0 × IQR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="outlier-action">Action</Label>
            <Select
              value={config.outliers.action}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  outliers: { ...config.outliers, action: value },
                })
              }
            >
              <SelectTrigger id="outlier-action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remove">Remove Outliers</SelectItem>
                <SelectItem value="cap">Cap at Boundaries</SelectItem>
                <SelectItem value="keep">Keep (Mark Only)</SelectItem>
                <SelectItem value="transform">Log Transform</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Data Type Conversion */}
      <CollapsibleSection title="Data Type Conversion" section="dataTypes">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-detect">Auto-detect Data Types</Label>
              <p className="text-xs text-muted-foreground">
                Automatically infer optimal data types
              </p>
            </div>
            <Switch
              id="auto-detect"
              checked={config.dataTypes.autoDetect}
              onCheckedChange={(checked) =>
                setConfig({
                  ...config,
                  dataTypes: { ...config.dataTypes, autoDetect: checked },
                })
              }
            />
          </div>

          {!config.dataTypes.autoDetect && (
            <div>
              <Label>Manual Overrides</Label>
              <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                Click "Configure" to set column types manually
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                Configure Column Types
              </Button>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Data Scaling/Normalization */}
      <CollapsibleSection title="Data Scaling / Normalization" section="scaling">
        <div className="space-y-4">
          <div>
            <Label htmlFor="scaling-method">Scaling Method</Label>
            <Select
              value={config.scaling.method}
              onValueChange={(value) =>
                setConfig({
                  ...config,
                  scaling: { method: value },
                })
              }
            >
              <SelectTrigger id="scaling-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (No Scaling)</SelectItem>
                <SelectItem value="standard">StandardScaler (Mean=0, Std=1)</SelectItem>
                <SelectItem value="minmax">MinMaxScaler (Range 0-1)</SelectItem>
                <SelectItem value="robust">RobustScaler (Robust to Outliers)</SelectItem>
                <SelectItem value="maxabs">MaxAbsScaler (Range -1 to 1)</SelectItem>
                <SelectItem value="normalize">Normalizer (Unit Norm)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Standardize features for better model performance
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Sampling/Filtering */}
      <CollapsibleSection title="Sampling / Filtering" section="sampling">
        <div className="space-y-4">
          <div>
            <Label htmlFor="sample-size">Sample Size (Optional)</Label>
            <Input
              id="sample-size"
              type="number"
              placeholder="Leave empty for full dataset"
              value={config.sampling.sampleSize || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  sampling: {
                    ...config.sampling,
                    sampleSize: e.target.value ? parseInt(e.target.value) : null,
                  },
                })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Take a random sample of rows for faster processing
            </p>
          </div>

          <div>
            <Label htmlFor="filter-condition">Filter Condition (SQL-like)</Label>
            <Input
              id="filter-condition"
              type="text"
              placeholder="e.g., age > 18 AND income > 50000"
              value={config.sampling.filterCondition}
              onChange={(e) =>
                setConfig({
                  ...config,
                  sampling: {
                    ...config.sampling,
                    filterCondition: e.target.value,
                  },
                })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Filter rows based on custom conditions
            </p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
