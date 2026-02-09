/**
 * Step 3: Model Selection
 * Choose between manual algorithm selection or AutoML
 */
import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  Zap,
  Settings2,
  TrendingUp,
  Target,
} from 'lucide-react';

interface ModelSelectionStepProps {
  config: any;
  onConfigChange: (config: any) => void;
}

export function ModelSelectionStep({
  config,
  onConfigChange,
}: ModelSelectionStepProps) {
  const [mode, setMode] = useState<'manual' | 'automl' | null>(null);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([
    'logistic_regression',
    'xgboost',
  ]);

  const algorithms = [
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      description: 'Fast, interpretable linear classifier',
      complexity: 'Low',
      speed: 'Very Fast',
      accuracy: 'Medium',
      icon: TrendingUp,
      default: true,
    },
    {
      id: 'xgboost',
      name: 'XGBoost',
      description: 'Powerful gradient boosting algorithm',
      complexity: 'High',
      speed: 'Medium',
      accuracy: 'Very High',
      icon: Zap,
      default: true,
    },
    {
      id: 'random_forest',
      name: 'Random Forest',
      description: 'Ensemble of decision trees',
      complexity: 'Medium',
      speed: 'Medium',
      accuracy: 'High',
      icon: Brain,
      default: false,
    },
    {
      id: 'svm',
      name: 'Support Vector Machine',
      description: 'Effective for high-dimensional spaces',
      complexity: 'High',
      speed: 'Slow',
      accuracy: 'High',
      icon: Target,
      default: false,
    },
    {
      id: 'neural_network',
      name: 'Neural Network',
      description: 'Deep learning for complex patterns',
      complexity: 'Very High',
      speed: 'Slow',
      accuracy: 'Very High',
      icon: Brain,
      default: false,
    },
  ];

  const handleModeSelect = (selectedMode: 'manual' | 'automl') => {
    setMode(selectedMode);
    if (selectedMode === 'manual') {
      onConfigChange({
        mode: 'manual',
        algorithms: selectedAlgorithms,
      });
    } else {
      onConfigChange({
        mode: 'automl',
        maxTime: 30,
        maxModels: 10,
      });
    }
  };

  const handleAlgorithmToggle = (algorithmId: string) => {
    const newSelected = selectedAlgorithms.includes(algorithmId)
      ? selectedAlgorithms.filter((id) => id !== algorithmId)
      : [...selectedAlgorithms, algorithmId];
    
    setSelectedAlgorithms(newSelected);
    onConfigChange({
      mode: 'manual',
      algorithms: newSelected,
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Training Approach</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manual Selection Card */}
          <Card
            className={`p-6 cursor-pointer transition-all ${
              mode === 'manual'
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleModeSelect('manual')}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    mode === 'manual'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Settings2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Manual Selection</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose specific algorithms
                  </p>
                </div>
              </div>
              {mode === 'manual' && (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Full control over algorithms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Faster training time</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Requires ML knowledge</span>
              </div>
            </div>

            <Badge variant="outline" className="mt-4">
              Recommended for experts
            </Badge>
          </Card>

          {/* AutoML Card */}
          <Card
            className={`p-6 cursor-pointer transition-all ${
              mode === 'automl'
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleModeSelect('automl')}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    mode === 'automl'
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">AutoML</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatic optimization
                  </p>
                </div>
              </div>
              {mode === 'automl' && (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Tries multiple algorithms</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Automatic hyperparameter tuning</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Finds best model automatically</span>
              </div>
            </div>

            <Badge className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
              Recommended for beginners
            </Badge>
          </Card>
        </div>
      </div>

      {/* Manual Algorithm Selection */}
      {mode === 'manual' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Algorithms</h3>
          <div className="grid grid-cols-1 gap-3">
            {algorithms.map((algorithm) => {
              const Icon = algorithm.icon;
              const isSelected = selectedAlgorithms.includes(algorithm.id);
              const isDefault = algorithm.default;

              return (
                <Card
                  key={algorithm.id}
                  className={`p-4 transition-all ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={algorithm.id}
                      checked={isSelected}
                      onCheckedChange={() => handleAlgorithmToggle(algorithm.id)}
                    />
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label
                          htmlFor={algorithm.id}
                          className="font-semibold cursor-pointer"
                        >
                          {algorithm.name}
                        </Label>
                        {isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {algorithm.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Complexity
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {algorithm.complexity}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Speed
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {algorithm.speed}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Accuracy
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {algorithm.accuracy}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Selection Summary */}
          {selectedAlgorithms.length > 0 && (
            <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 mt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="text-sm">
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    {selectedAlgorithms.length} algorithm
                    {selectedAlgorithms.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="text-green-700 dark:text-green-300 ml-2">
                    Ready to train
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* AutoML Configuration */}
      {mode === 'automl' && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-900">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                AutoML Configuration
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <div>• Will automatically try multiple algorithms</div>
                <div>• Performs hyperparameter optimization</div>
                <div>• Compares models and selects the best one</div>
                <div>• Estimated time: 5-30 minutes depending on data size</div>
              </div>
              <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg">
                <div className="text-sm font-semibold mb-2">
                  AutoML will evaluate:
                </div>
                <div className="flex flex-wrap gap-2">
                  {algorithms.map((algo) => (
                    <Badge key={algo.id} variant="secondary">
                      {algo.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
