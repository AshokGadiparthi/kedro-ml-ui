/**
 * Data Catalog Component - GOVERNANCE & DISCOVERY ONLY
 * NOT for operations - just for browsing, searching, understanding data across ALL projects
 * Unique Innovation: Organization-wide data discovery with AI-powered insights
 */
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Database,
  Search,
  Tag,
  Users,
  Clock,
  TrendingUp,
  Shield,
  Eye,
  BookOpen,
  Sparkles,
  GitBranch,
  Star,
  FileText,
  BarChart3,
  Download,
} from 'lucide-react';

interface Dataset {
  id: string;
  name: string;
  description: string;
  source: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  rows: number;
  columns: number;
  size: string;
  owner: string;
  tags: string[];
  qualityScore: number;
  lastUpdated: string;
  createdAt: string;
  hasPII: boolean;
}

export function DataCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  // Mock datasets
  const datasets: Dataset[] = [
    {
      id: 'ds-1',
      name: 'Customer Transactions',
      description: 'E-commerce customer purchase history with demographic information',
      source: 'BigQuery: customers.transactions',
      classification: 'confidential',
      rows: 1245678,
      columns: 24,
      size: '2.4 GB',
      owner: 'jane@mlplatform.io',
      tags: ['sales', 'customer', 'ecommerce', 'pii'],
      qualityScore: 92,
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      hasPII: true,
    },
    {
      id: 'ds-2',
      name: 'Product Catalog',
      description: 'Complete product inventory with pricing and metadata',
      source: 'MySQL: products.catalog',
      classification: 'internal',
      rows: 45621,
      columns: 18,
      size: '180 MB',
      owner: 'john@mlplatform.io',
      tags: ['products', 'inventory', 'pricing'],
      qualityScore: 98,
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      hasPII: false,
    },
    {
      id: 'ds-3',
      name: 'User Activity Logs',
      description: 'Website user activity and behavioral data',
      source: 'S3: logs/user-activity/',
      classification: 'internal',
      rows: 5678912,
      columns: 32,
      size: '8.7 GB',
      owner: 'bob@mlplatform.io',
      tags: ['analytics', 'behavior', 'logs'],
      qualityScore: 85,
      lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      hasPII: true,
    },
    {
      id: 'ds-4',
      name: 'Marketing Campaigns',
      description: 'Campaign performance metrics and ROI data',
      source: 'Snowflake: marketing.campaigns',
      classification: 'internal',
      rows: 12456,
      columns: 28,
      size: '45 MB',
      owner: 'alice@mlplatform.io',
      tags: ['marketing', 'campaigns', 'roi'],
      qualityScore: 94,
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      hasPII: false,
    },
  ];

  const classificationConfig = {
    public: { label: 'Public', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
    internal: { label: 'Internal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
    confidential: { label: 'Confidential', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
    restricted: { label: 'Restricted', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
  };

  const filteredDatasets = datasets.filter((ds) => {
    const matchesSearch = ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ds.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ds.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClassification = classificationFilter === 'all' || ds.classification === classificationFilter;
    return matchesSearch && matchesClassification;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="h-8 w-8" />
            Data Catalog
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover, explore, and manage your data assets
          </p>
        </div>
        <Button className="gap-2">
          <Database className="h-4 w-4" />
          Register Dataset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Datasets</div>
          <div className="text-3xl font-bold">{datasets.length}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Rows</div>
          <div className="text-3xl font-bold">
            {formatNumber(datasets.reduce((sum, ds) => sum + ds.rows, 0))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">With PII</div>
          <div className="text-3xl font-bold text-orange-600">
            {datasets.filter(ds => ds.hasPII).length}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Avg Quality</div>
          <div className="text-3xl font-bold text-green-600">
            {Math.round(datasets.reduce((sum, ds) => sum + ds.qualityScore, 0) / datasets.length)}%
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">All Classifications</option>
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="confidential">Confidential</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>
      </Card>

      {/* Datasets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDatasets.map((dataset) => (
          <Card
            key={dataset.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedDataset(dataset)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{dataset.name}</h3>
                  {dataset.hasPII && (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                      <Shield className="h-3 w-3 mr-1" />
                      PII
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {dataset.description}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge className={classificationConfig[dataset.classification].color}>
                {classificationConfig[dataset.classification].label}
              </Badge>
              {dataset.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Rows</div>
                <div className="font-semibold">{formatNumber(dataset.rows)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Columns</div>
                <div className="font-semibold">{dataset.columns}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Size</div>
                <div className="font-semibold">{dataset.size}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Quality</div>
                <div className="font-semibold text-green-600">{dataset.qualityScore}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{dataset.source}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated {formatDate(dataset.lastUpdated)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No datasets found</p>
          </div>
        </Card>
      )}

      {/* Dataset Detail Modal (simplified) */}
      {selectedDataset && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDataset(null)}
        >
          <Card
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedDataset.name}</h2>
                <p className="text-muted-foreground">{selectedDataset.description}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedDataset(null)}>
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Source</div>
                    <div className="font-medium">{selectedDataset.source}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Owner</div>
                    <div className="font-medium">{selectedDataset.owner}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Classification</div>
                    <Badge className={classificationConfig[selectedDataset.classification].color}>
                      {classificationConfig[selectedDataset.classification].label}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Quality Score</div>
                    <div className="font-medium text-green-600">{selectedDataset.qualityScore}%</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDataset.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Data
                </Button>
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Statistics
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}