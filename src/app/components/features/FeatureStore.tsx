/**
 * Feature Store Component
 * Centralized repository for ML features with versioning and lineage
 * Enterprise-grade feature management like H2O.ai
 */
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Database,
  Search,
  Plus,
  GitBranch,
  Clock,
  TrendingUp,
  Tag,
  Filter,
  Download,
  Upload,
  Star,
  Code,
  FileCode,
} from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  description: string;
  type: 'numerical' | 'categorical' | 'boolean' | 'text' | 'datetime';
  category: string;
  version: string;
  status: 'active' | 'deprecated' | 'experimental';
  createdBy: string;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  projects: string[];
  tags: string[];
  transformation: string;
  dependencies: string[];
  dataType: string;
  nullable: boolean;
  statistics: {
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    missing_pct?: number;
    unique_count?: number;
  };
}

export function FeatureStore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const mockFeatures: Feature[] = [
    {
      id: 'feat-1',
      name: 'customer_lifetime_value',
      description: 'Calculated lifetime value of customer based on historical purchases',
      type: 'numerical',
      category: 'Customer Metrics',
      version: 'v2.1',
      status: 'active',
      createdBy: 'jane@mlplatform.io',
      createdAt: '2025-11-15',
      lastUsed: '2 hours ago',
      usageCount: 247,
      projects: ['Customer Churn', 'Sales Forecast'],
      tags: ['revenue', 'customer', 'aggregation'],
      transformation: 'SUM(purchase_amount) OVER (PARTITION BY customer_id)',
      dependencies: ['purchase_amount', 'customer_id'],
      dataType: 'FLOAT64',
      nullable: false,
      statistics: {
        mean: 1247.50,
        std: 523.20,
        min: 0,
        max: 15000,
        missing_pct: 0,
      },
    },
    {
      id: 'feat-2',
      name: 'days_since_last_purchase',
      description: 'Number of days since customer\'s last purchase',
      type: 'numerical',
      category: 'Customer Behavior',
      version: 'v1.5',
      status: 'active',
      createdBy: 'john@mlplatform.io',
      createdAt: '2025-10-20',
      lastUsed: '1 day ago',
      usageCount: 189,
      projects: ['Customer Churn', 'Marketing Campaign'],
      tags: ['recency', 'customer', 'time-based'],
      transformation: 'DATEDIFF(CURRENT_DATE, MAX(purchase_date))',
      dependencies: ['purchase_date'],
      dataType: 'INT64',
      nullable: false,
      statistics: {
        mean: 45.3,
        std: 67.8,
        min: 0,
        max: 730,
        missing_pct: 0,
      },
    },
    {
      id: 'feat-3',
      name: 'purchase_frequency_30d',
      description: 'Number of purchases in the last 30 days',
      type: 'numerical',
      category: 'Customer Behavior',
      version: 'v1.0',
      status: 'active',
      createdBy: 'bob@mlplatform.io',
      createdAt: '2025-12-01',
      lastUsed: '5 hours ago',
      usageCount: 156,
      projects: ['Customer Churn'],
      tags: ['frequency', 'rolling-window', 'customer'],
      transformation: 'COUNT(*) OVER (PARTITION BY customer_id ORDER BY date ROWS BETWEEN 30 PRECEDING AND CURRENT ROW)',
      dependencies: ['customer_id', 'date'],
      dataType: 'INT64',
      nullable: false,
      statistics: {
        mean: 2.8,
        std: 1.9,
        min: 0,
        max: 45,
        missing_pct: 0,
      },
    },
    {
      id: 'feat-4',
      name: 'avg_basket_size',
      description: 'Average number of items per transaction',
      type: 'numerical',
      category: 'Transaction Metrics',
      version: 'v1.2',
      status: 'active',
      createdBy: 'alice@mlplatform.io',
      createdAt: '2025-11-28',
      lastUsed: '3 days ago',
      usageCount: 134,
      projects: ['Sales Forecast', 'Product Recommendation'],
      tags: ['basket', 'aggregation', 'transaction'],
      transformation: 'AVG(item_count) OVER (PARTITION BY customer_id)',
      dependencies: ['item_count', 'customer_id'],
      dataType: 'FLOAT64',
      nullable: false,
      statistics: {
        mean: 5.6,
        std: 3.2,
        min: 1,
        max: 50,
        missing_pct: 0,
      },
    },
    {
      id: 'feat-5',
      name: 'preferred_category',
      description: 'Customer\'s most frequently purchased product category',
      type: 'categorical',
      category: 'Customer Preferences',
      version: 'v1.0',
      status: 'active',
      createdBy: 'jane@mlplatform.io',
      createdAt: '2025-12-05',
      lastUsed: '1 hour ago',
      usageCount: 98,
      projects: ['Product Recommendation', 'Marketing Campaign'],
      tags: ['category', 'preference', 'mode'],
      transformation: 'MODE(product_category) OVER (PARTITION BY customer_id)',
      dependencies: ['product_category', 'customer_id'],
      dataType: 'STRING',
      nullable: true,
      statistics: {
        unique_count: 12,
        missing_pct: 5.2,
      },
    },
    {
      id: 'feat-6',
      name: 'churn_risk_score',
      description: 'ML-derived score indicating churn probability (0-1)',
      type: 'numerical',
      category: 'Derived Scores',
      version: 'v3.0',
      status: 'active',
      createdBy: 'john@mlplatform.io',
      createdAt: '2025-12-10',
      lastUsed: '30 minutes ago',
      usageCount: 312,
      projects: ['Customer Churn', 'Customer Retention'],
      tags: ['ml-derived', 'prediction', 'risk'],
      transformation: 'PREDICT(churn_model_v2, customer_features)',
      dependencies: ['customer_lifetime_value', 'days_since_last_purchase', 'purchase_frequency_30d'],
      dataType: 'FLOAT64',
      nullable: false,
      statistics: {
        mean: 0.23,
        std: 0.18,
        min: 0,
        max: 0.98,
        missing_pct: 0,
      },
    },
  ];

  const categories = ['all', ...Array.from(new Set(mockFeatures.map(f => f.category)))];
  const types = ['all', 'numerical', 'categorical', 'boolean', 'text', 'datetime'];

  const filteredFeatures = mockFeatures.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    const matchesType = selectedType === 'all' || feature.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const statusColors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    deprecated: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    experimental: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  };

  const typeColors = {
    numerical: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    categorical: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    boolean: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    text: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    datetime: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-500" />
            Feature Store
          </h1>
          <p className="text-muted-foreground mt-2">
            Centralized repository of ML features with versioning and lineage tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import Features
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Feature
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Features</div>
          <div className="text-2xl font-bold">{mockFeatures.length}</div>
          <div className="text-xs text-green-600 mt-1">+3 this week</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Active Projects</div>
          <div className="text-2xl font-bold">4</div>
          <div className="text-xs text-muted-foreground mt-1">Using features</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg. Usage</div>
          <div className="text-2xl font-bold">189</div>
          <div className="text-xs text-muted-foreground mt-1">Uses per feature</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Categories</div>
          <div className="text-2xl font-bold">{categories.length - 1}</div>
          <div className="text-xs text-muted-foreground mt-1">Feature groups</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features by name, description, or tags..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Features List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredFeatures.map(feature => (
          <Card
            key={feature.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedFeature(feature)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{feature.name}</h3>
                  <Badge className={typeColors[feature.type]} variant="outline">
                    {feature.type}
                  </Badge>
                  <Badge className={statusColors[feature.status]} variant="outline">
                    {feature.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {feature.description}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Star className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {feature.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {feature.version}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {feature.usageCount} uses
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {feature.lastUsed}
                </div>
              </div>
              <div className="flex gap-1">
                {feature.projects.slice(0, 2).map(proj => (
                  <Badge key={proj} variant="outline" className="text-xs">
                    {proj}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFeature(null)}>
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedFeature.name}</h2>
                  <p className="text-muted-foreground">{selectedFeature.description}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedFeature(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Metadata */}
                <div>
                  <h3 className="font-semibold mb-3">Metadata</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Type</div>
                      <Badge className={typeColors[selectedFeature.type]}>{selectedFeature.type}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <Badge className={statusColors[selectedFeature.status]}>{selectedFeature.status}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Version</div>
                      <div className="font-mono">{selectedFeature.version}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Data Type</div>
                      <div className="font-mono">{selectedFeature.dataType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Created By</div>
                      <div>{selectedFeature.createdBy}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Created At</div>
                      <div>{selectedFeature.createdAt}</div>
                    </div>
                  </div>
                </div>

                {/* Transformation */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Transformation Logic
                  </h3>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    {selectedFeature.transformation}
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <h3 className="font-semibold mb-3">Dependencies</h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedFeature.dependencies.map(dep => (
                      <Badge key={dep} variant="outline">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="font-semibold mb-3">Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(selectedFeature.statistics).map(([key, value]) => (
                      <div key={key} className="p-3 bg-muted rounded-lg">
                        <div className="text-xs text-muted-foreground">{key.replace('_', ' ')}</div>
                        <div className="text-lg font-semibold">{typeof value === 'number' ? value.toFixed(2) : value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects Using */}
                <div>
                  <h3 className="font-semibold mb-3">Projects Using This Feature</h3>
                  <div className="flex gap-2">
                    {selectedFeature.projects.map(proj => (
                      <Badge key={proj} variant="outline" className="px-3 py-1">
                        {proj}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Use in Project
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <FileCode className="h-4 w-4" />
                    View Code
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <GitBranch className="h-4 w-4" />
                    Version History
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
