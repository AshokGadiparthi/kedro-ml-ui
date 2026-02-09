/**
 * Preview Tab Component
 * Displays dataset preview from /api/datasets/{id}/preview
 */

import { useState, useEffect } from 'react';
import { datasetService } from '@/services';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';

interface PreviewTabProps {
  datasetId: string;
}

export function PreviewTab({ datasetId }: PreviewTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [rowLimit, setRowLimit] = useState(10);

  useEffect(() => {
    fetchPreview();
  }, [datasetId, rowLimit]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await datasetService.getDatasetPreview(datasetId, rowLimit);
      setPreview(data);
    } catch (err: any) {
      console.error('Failed to fetch preview:', err);
      setError(err.message || 'Failed to load preview data');
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
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchPreview} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!preview || !preview.rows || preview.rows.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No preview data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            Showing {preview.rows.length} of {preview.totalRows?.toLocaleString() || 'N/A'} rows
          </Badge>
          <Badge variant="outline">
            {preview.columns.length} columns
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={rowLimit}
            onChange={(e) => setRowLimit(Number(e.target.value))}
            className="px-3 py-1.5 border rounded-md text-sm bg-background"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
          <Button onClick={fetchPreview} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg overflow-auto max-h-[600px]">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-medium border-b w-12">#</th>
              {preview.columns.map((column: string, index: number) => (
                <th key={index} className="px-4 py-2 text-left font-medium border-b whitespace-nowrap">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row: any[], rowIndex: number) => (
              <tr key={rowIndex} className="hover:bg-muted/30 border-b">
                <td className="px-4 py-2 text-muted-foreground">{rowIndex + 1}</td>
                {row.map((cell: any, cellIndex: number) => (
                  <td key={cellIndex} className="px-4 py-2 whitespace-nowrap">
                    {cell === null || cell === undefined ? (
                      <span className="text-muted-foreground italic">null</span>
                    ) : typeof cell === 'number' ? (
                      <span className="font-mono">{cell}</span>
                    ) : typeof cell === 'boolean' ? (
                      <Badge variant={cell ? 'default' : 'secondary'}>
                        {cell ? 'true' : 'false'}
                      </Badge>
                    ) : (
                      <span>{String(cell)}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
