/**
 * Step 1: Data Loading
 * Select and load dataset for ML workflow - with real API integration
 */
import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import {
  Database,
  Upload,
  CheckCircle2,
  FileText,
  Search,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useDatasets } from '@/hooks/useDatasets';

interface DataLoadingStepProps {
  selectedDataset: string;
  onSelectDataset: (dataset: string) => void;
}

export function DataLoadingStep({
  selectedDataset,
  onSelectDataset,
}: DataLoadingStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch real datasets from API
  const { datasets: apiDatasets, isLoading, error } = useDatasets();

  // Mock datasets as fallback
  const mockDatasets = [
    {
      id: 'customer-churn',
      name: 'Customer Churn Dataset',
      description: 'Customer behavior and churn prediction data',
      rows: 10000,
      columns: 21,
      size: '2.4 MB',
      lastModified: '2026-02-05',
    },
    {
      id: 'sales-forecast',
      name: 'Sales Forecast Data',
      description: 'Historical sales data for forecasting',
      rows: 50000,
      columns: 15,
      size: '8.7 MB',
      lastModified: '2026-02-04',
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection Dataset',
      description: 'Transaction data for fraud detection',
      rows: 284807,
      columns: 31,
      size: '143.8 MB',
      lastModified: '2026-02-03',
    },
    {
      id: 'credit-risk',
      name: 'Credit Risk Assessment',
      description: 'Credit application and risk assessment data',
      rows: 30000,
      columns: 24,
      size: '5.2 MB',
      lastModified: '2026-02-02',
    },
  ];

  // Transform API datasets to match UI format
  const transformedApiDatasets = apiDatasets?.map(dataset => ({
    id: dataset.id,
    name: dataset.name,
    description: dataset.description || 'No description available',
    rows: dataset.row_count || 0,
    columns: dataset.column_count || 0,
    size: `${((dataset.size_bytes || 0) / 1024 / 1024).toFixed(1)} MB`,
    lastModified: new Date(dataset.updated_at).toLocaleDateString(),
  })) || [];

  // Use API datasets if available, otherwise use mock data
  const datasets = transformedApiDatasets.length > 0 ? transformedApiDatasets : mockDatasets;

  const filteredDatasets = datasets.filter(
    (dataset) =>
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Upload */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload New
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading datasets...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="p-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-yellow-900 dark:text-yellow-100">
                Using Mock Data
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                Could not fetch datasets from API. Showing example datasets instead.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Available Datasets */}
      {!isLoading && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Available Datasets ({filteredDatasets.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDatasets.map((dataset) => {
              const isSelected = selectedDataset === dataset.id;
              
              return (
                <Card
                  key={dataset.id}
                  className={`p-6 cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectDataset(dataset.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{dataset.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dataset.description}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {dataset.rows.toLocaleString()} rows
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {dataset.columns} columns
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{dataset.size}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {dataset.lastModified}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Dataset Preview */}
      {selectedDataset && (
        <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-semibold text-green-900 dark:text-green-100">
                Dataset Selected
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                {datasets.find((d) => d.id === selectedDataset)?.name} is ready
                for feature engineering
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}