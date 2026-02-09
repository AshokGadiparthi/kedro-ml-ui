/**
 * Model Registry Component
 * Centralized model repository with versioning
 */
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Brain,
  Search,
  GitBranch,
  TrendingUp,
  Clock,
  Tag,
  Star,
  Play,
  Pause,
  Archive,
  ExternalLink,
} from 'lucide-react';

interface Model {
  id: string;
  name: string;
  version: string;
  algorithm: string;
  stage: 'development' | 'staging' | 'production' | 'archived';
  accuracy: number;
  framework: string;
  owner: string;
  tags: string[];
  createdAt: string;
  deployments: number;
  predictions: number;
}

export function ModelRegistry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Mock models
  const models: Model[] = [
    {
      id: 'model-1',
      name: 'Customer Churn Predictor',
      version: 'v2.3.1',
      algorithm: 'XGBoost',
      stage: 'production',
      accuracy: 93.5,
      framework: 'scikit-learn',
      owner: 'jane@mlplatform.io',
      tags: ['classification', 'churn', 'production'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      deployments: 3,
      predictions: 45632,
    },
    {
      id: 'model-2',
      name: 'Sales Forecasting Model',
      version: 'v1.5.0',
      algorithm: 'LSTM',
      stage: 'staging',
      accuracy: 87.2,
      framework: 'tensorflow',
      owner: 'john@mlplatform.io',
      tags: ['regression', 'forecasting', 'time-series'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      deployments: 1,
      predictions: 1234,
    },
    {
      id: 'model-3',
      name: 'Credit Risk Scorer',
      version: 'v3.0.2',
      algorithm: 'Random Forest',
      stage: 'production',
      accuracy: 91.8,
      framework: 'scikit-learn',
      owner: 'bob@mlplatform.io',
      tags: ['classification', 'risk', 'finance'],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      deployments: 5,
      predictions: 78901,
    },
    {
      id: 'model-4',
      name: 'Product Recommender',
      version: 'v1.2.3',
      algorithm: 'Neural Collaborative Filtering',
      stage: 'development',
      accuracy: 76.5,
      framework: 'pytorch',
      owner: 'alice@mlplatform.io',
      tags: ['recommendation', 'ecommerce', 'deep-learning'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      deployments: 0,
      predictions: 0,
    },
    {
      id: 'model-5',
      name: 'Sentiment Analyzer',
      version: 'v2.1.0',
      algorithm: 'BERT',
      stage: 'archived',
      accuracy: 89.3,
      framework: 'transformers',
      owner: 'charlie@mlplatform.io',
      tags: ['nlp', 'sentiment', 'classification'],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      deployments: 2,
      predictions: 23456,
    },
  ];

  const stageConfig = {
    development: { label: 'Development', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400', icon: GitBranch },
    staging: { label: 'Staging', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400', icon: Clock },
    production: { label: 'Production', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400', icon: Play },
    archived: { label: 'Archived', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Archive },
  };

  const filteredModels = models.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = stageFilter === 'all' || model.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const stats = {
    total: models.length,
    production: models.filter(m => m.stage === 'production').length,
    staging: models.filter(m => m.stage === 'staging').length,
    development: models.filter(m => m.stage === 'development').length,
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8" />
            Model Registry
          </h1>
          <p className="text-muted-foreground mt-1">
            Centralized repository for ML models and versions
          </p>
        </div>
        <Button className="gap-2">
          <Brain className="h-4 w-4" />
          Register Model
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Models</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Production</div>
          <div className="text-3xl font-bold text-green-600">{stats.production}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Staging</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.staging}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Development</div>
          <div className="text-3xl font-bold text-blue-600">{stats.development}</div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, algorithm, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">All Stages</option>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModels.map((model) => {
          const StageIcon = stageConfig[model.stage].icon;

          return (
            <Card key={model.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{model.name}</h3>
                    <Badge variant="outline" className="font-mono text-xs">
                      {model.version}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{model.algorithm}</span>
                    <span>•</span>
                    <span>{model.framework}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge className={stageConfig[model.stage].color}>
                  <StageIcon className="h-3 w-3 mr-1" />
                  {stageConfig[model.stage].label}
                </Badge>
                {model.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
                  <div className="font-semibold text-green-600">{model.accuracy}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Deployments</div>
                  <div className="font-semibold">{model.deployments}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Predictions</div>
                  <div className="font-semibold">{formatNumber(model.predictions)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  by {model.owner}
                </div>
                <div className="flex gap-2">
                  {model.stage === 'production' && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <TrendingUp className="h-3 w-3" />
                      Monitor
                    </Button>
                  )}
                  {model.stage === 'staging' && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Play className="h-3 w-3" />
                      Promote
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredModels.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No models found</p>
          </div>
        </Card>
      )}
    </div>
  );
}
