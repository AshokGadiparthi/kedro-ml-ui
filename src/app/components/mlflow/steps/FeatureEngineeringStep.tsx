/**
 * Step 2: Feature Engineering
 * Configure feature transformations and preprocessing
 */
import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import {
  Wand2,
  CheckCircle2,
  Settings2,
  Sparkles,
  TrendingUp,
  Filter,
} from 'lucide-react';

interface FeatureEngineeringStepProps {
  dataset: string;
  config: any;
  onConfigChange: (config: any) => void;
}

export function FeatureEngineeringStep({
  dataset,
  config,
  onConfigChange,
}: FeatureEngineeringStepProps) {
  const [selectedOptions, setSelectedOptions] = useState({
    handleMissing: true,
    scaleFeatures: true,
    encodeCategories: true,
    removeOutliers: false,
    featureSelection: true,
    createInteractions: false,
  });

  const handleToggle = (option: keyof typeof selectedOptions) => {
    const newOptions = {
      ...selectedOptions,
      [option]: !selectedOptions[option],
    };
    setSelectedOptions(newOptions);
    onConfigChange(newOptions);
  };

  const options = [
    {
      id: 'handleMissing' as const,
      name: 'Handle Missing Values',
      description: 'Automatically impute or remove missing data',
      icon: Filter,
      recommended: true,
    },
    {
      id: 'scaleFeatures' as const,
      name: 'Scale Features',
      description: 'Normalize or standardize numerical features',
      icon: TrendingUp,
      recommended: true,
    },
    {
      id: 'encodeCategories' as const,
      name: 'Encode Categorical Variables',
      description: 'Convert categorical features to numerical',
      icon: Wand2,
      recommended: true,
    },
    {
      id: 'removeOutliers' as const,
      name: 'Remove Outliers',
      description: 'Detect and handle statistical outliers',
      icon: Filter,
      recommended: false,
    },
    {
      id: 'featureSelection' as const,
      name: 'Feature Selection',
      description: 'Automatically select most important features',
      icon: Sparkles,
      recommended: true,
    },
    {
      id: 'createInteractions' as const,
      name: 'Create Feature Interactions',
      description: 'Generate polynomial and interaction features',
      icon: Settings2,
      recommended: false,
    },
  ];

  const handleAutoConfig = () => {
    const autoConfig = {
      handleMissing: true,
      scaleFeatures: true,
      encodeCategories: true,
      removeOutliers: false,
      featureSelection: true,
      createInteractions: false,
    };
    setSelectedOptions(autoConfig);
    onConfigChange(autoConfig);
  };

  const handleSkip = () => {
    onConfigChange({ skip: true });
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Feature Engineering Options</h3>
            <p className="text-sm text-muted-foreground">
              Configure automatic feature transformations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSkip} className="gap-2">
              Skip Step
            </Button>
            <Button onClick={handleAutoConfig} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Auto Configure
            </Button>
          </div>
        </div>
      </Card>

      {/* Feature Engineering Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isEnabled = selectedOptions[option.id];

          return (
            <Card
              key={option.id}
              className={`p-6 transition-all ${
                isEnabled ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isEnabled
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{option.name}</h4>
                      {option.recommended && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                        >
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(option.id)}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-3">
          <Settings2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Configuration Summary
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {Object.values(selectedOptions).filter(Boolean).length} features
              enabled • Your data will be automatically preprocessed before
              training
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
