/**
 * WORLD-CLASS Model Comparison Component
 * Side-by-side model comparison - inspired by MLflow, Weights & Biases
 * Features: Multiple models, metrics comparison, visual charts, decision support
 */
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Trophy,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  X,
  Download,
  Play,
  BarChart3,
  Target,
  Sparkles,
} from 'lucide-react';

interface Model {
  id: string;
  name: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTime: string;
  predictions: number;
  createdDate: string;
  status: 'deployed' | 'completed' | 'archived';
  hyperparameters: Record<string, any>;
  features: number;
}

interface ModelComparisonProps {
  models: Model[];
  onClose: () => void;
  onSelectModel: (modelId: string) => void;
}

export function ModelComparison({ models, onClose, onSelectModel }: ModelComparisonProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>(
    models.slice(0, 3).map(m => m.id)
  );

  const toggleModelSelection = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
      }
    } else {
      if (selectedModels.length < 4) {
        setSelectedModels([...selectedModels, modelId]);
      }
    }
  };

  const selectedModelData = models.filter(m => selectedModels.includes(m.id));
  const bestModel = [...selectedModelData].sort((a, b) => b.accuracy - a.accuracy)[0];

  const metrics = [
    { key: 'accuracy', label: 'Accuracy', format: (v: number) => `${v}%` },
    { key: 'precision', label: 'Precision', format: (v: number) => `${v}%` },
    { key: 'recall', label: 'Recall', format: (v: number) => `${v}%` },
    { key: 'f1Score', label: 'F1 Score', format: (v: number) => `${v}%` },
  ];

  const getMetricColor = (value: number, metricKey: string) => {
    const best = Math.max(...selectedModelData.map(m => m[metricKey as keyof Model] as number));
    if (value === best) return 'text-green-600 font-semibold';
    if (value >= best - 2) return 'text-blue-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="max-w-7xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Model Comparison</h2>
              <p className="text-sm text-muted-foreground">
                Compare up to 4 models side-by-side • {selectedModels.length} selected
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Comparison
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Model Selection */}
          <Card className="p-4 mb-6">
            <div className="text-sm font-semibold mb-3">Select Models to Compare (max 4):</div>
            <div className="flex flex-wrap gap-2">
              {models.map(model => (
                <Button
                  key={model.id}
                  variant={selectedModels.includes(model.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleModelSelection(model.id)}
                  className="gap-2"
                >
                  {selectedModels.includes(model.id) && <CheckCircle className="h-4 w-4" />}
                  {model.name}
                </Button>
              ))}
            </div>
          </Card>

          {/* Best Model Highlight */}
          {bestModel && (
            <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl border-2 border-yellow-300 dark:border-yellow-900">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-yellow-400 rounded-xl flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">🏆 Best Model</h3>
                    <Badge className="bg-yellow-500 text-white">Recommended</Badge>
                  </div>
                  <div className="text-lg font-semibold mb-1">{bestModel.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {bestModel.algorithm} • {bestModel.accuracy}% accuracy • Trained {bestModel.createdDate}
                  </div>
                </div>
                <Button className="gap-2">
                  <Play className="h-4 w-4" />
                  Deploy This Model
                </Button>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Metric</th>
                  {selectedModelData.map(model => (
                    <th key={model.id} className="text-center p-4">
                      <div className="space-y-2">
                        <div className="font-semibold">{model.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {model.algorithm}
                        </Badge>
                        {model.id === bestModel?.id && (
                          <div>
                            <Badge className="bg-yellow-500 text-white text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              Best
                            </Badge>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Performance Metrics */}
                <tr className="border-b border-border bg-muted/30">
                  <td colSpan={selectedModelData.length + 1} className="p-3 font-semibold text-sm">
                    📊 Performance Metrics
                  </td>
                </tr>
                {metrics.map(metric => (
                  <tr key={metric.key} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4 font-medium">{metric.label}</td>
                    {selectedModelData.map(model => {
                      const value = model[metric.key as keyof Model] as number;
                      return (
                        <td key={model.id} className="p-4 text-center">
                          <div className={`text-lg ${getMetricColor(value, metric.key)}`}>
                            {metric.format(value)}
                          </div>
                          {/* Mini bar */}
                          <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Training Details */}
                <tr className="border-b border-border bg-muted/30">
                  <td colSpan={selectedModelData.length + 1} className="p-3 font-semibold text-sm">
                    ⚙️ Training Details
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="p-4 font-medium">Training Time</td>
                  {selectedModelData.map(model => (
                    <td key={model.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{model.trainingTime}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="p-4 font-medium">Features Used</td>
                  {selectedModelData.map(model => (
                    <td key={model.id} className="p-4 text-center">
                      {model.features} features
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="p-4 font-medium">Total Predictions</td>
                  {selectedModelData.map(model => (
                    <td key={model.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span>{model.predictions.toLocaleString()}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="p-4 font-medium">Status</td>
                  {selectedModelData.map(model => (
                    <td key={model.id} className="p-4 text-center">
                      <Badge
                        className={
                          model.status === 'deployed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }
                      >
                        {model.status}
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="p-4 font-medium">Created Date</td>
                  {selectedModelData.map(model => (
                    <td key={model.id} className="p-4 text-center text-sm text-muted-foreground">
                      {model.createdDate}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual Comparison */}
          <Card className="p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-lg">Visual Comparison</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map(metric => (
                <div key={metric.key}>
                  <div className="text-sm font-semibold mb-3">{metric.label}</div>
                  <div className="space-y-2">
                    {selectedModelData.map(model => {
                      const value = model[metric.key as keyof Model] as number;
                      const isBest = value === Math.max(...selectedModelData.map(m => m[metric.key as keyof Model] as number));
                      return (
                        <div key={model.id} className="flex items-center gap-3">
                          <div className="w-32 text-sm truncate">{model.name}</div>
                          <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                            <div
                              className={`h-full flex items-center justify-end pr-2 text-white text-xs font-semibold ${
                                isBest ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${value}%` }}
                            >
                              {metric.format(value)}
                            </div>
                          </div>
                          {isBest && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Smart Recommendations */}
          <Card className="p-6 mt-6 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">💡 AI Recommendation</h3>
                <p className="text-muted-foreground mb-4">
                  Based on the comparison, we recommend deploying <strong>{bestModel?.name}</strong> because:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Highest accuracy ({bestModel?.accuracy}%) among all models</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Good balance between precision and recall</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Reasonable training time ({bestModel?.trainingTime})</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              className="flex-1 gap-2"
              onClick={() => {
                if (bestModel) {
                  onSelectModel(bestModel.id);
                  onClose();
                }
              }}
            >
              <Play className="h-4 w-4" />
              Deploy Best Model ({bestModel?.name})
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Target className="h-4 w-4" />
              View Detailed Analysis
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
