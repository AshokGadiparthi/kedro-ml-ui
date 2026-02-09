/**
 * Schema Tab Component
 * Displays dataset schema information from /api/datasets/{id}/info
 */

import { useState, useEffect } from 'react';
import { datasetService } from '@/services';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Loader2, Hash, Type, Calendar, Tag } from 'lucide-react';

interface SchemaTabProps {
  datasetId: string;
}

export function SchemaTab({ datasetId }: SchemaTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);

  useEffect(() => {
    fetchSchema();
  }, [datasetId]);

  const fetchSchema = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await datasetService.getDatasetInfo(datasetId);
      setSchemaInfo(info);
    } catch (err: any) {
      console.error('Failed to fetch schema:', err);
      setError(err.message || 'Failed to load schema information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!schemaInfo || !schemaInfo.columns) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No schema information available
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    if (type === 'numeric') return Hash;
    if (type === 'datetime') return Calendar;
    return Type;
  };

  const getTypeColor = (type: string) => {
    if (type === 'numeric') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (type === 'datetime') return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="space-y-4">
      {/* Statistics Overview */}
      {schemaInfo.statistics && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Dataset Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
              <div className="text-xl font-bold">{schemaInfo.statistics.rows?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Columns</div>
              <div className="text-xl font-bold">{schemaInfo.statistics.columns || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Memory</div>
              <div className="text-xl font-bold">{schemaInfo.statistics.memory_mb?.toFixed(2) || 0} MB</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Missing Values</div>
              <div className="text-xl font-bold">{schemaInfo.statistics.missing_values || 0}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <div className="text-sm text-muted-foreground">Numeric Columns</div>
              <div className="text-lg font-bold">{schemaInfo.statistics.numeric_cols || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Categorical Columns</div>
              <div className="text-lg font-bold">{schemaInfo.statistics.categorical_cols || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Datetime Columns</div>
              <div className="text-lg font-bold">{schemaInfo.statistics.datetime_cols || 0}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Column Details */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Columns ({schemaInfo.columns.length})</h3>
        <div className="space-y-2">
          {schemaInfo.columns.map((column: any, index: number) => {
            const TypeIcon = getTypeIcon(column.type);
            const typeColor = getTypeColor(column.type);

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <TypeIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{column.name}</div>
                    <div className="text-sm text-muted-foreground">{column.dtype}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {column.unique_values !== null && column.unique_values !== undefined && (
                    <div className="text-sm text-muted-foreground">
                      {column.unique_values} unique
                    </div>
                  )}
                  {column.missing > 0 && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {column.missing} missing
                    </Badge>
                  )}
                  <Badge variant="outline" className={typeColor}>
                    {column.type}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
