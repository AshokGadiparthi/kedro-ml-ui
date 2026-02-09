/**
 * PREPROCESSING PREVIEW COMPONENT
 * Before and After data preview tables
 */

import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import type { PreprocessingJobResponse } from '@/services/preprocessingApi';

interface PreprocessingPreviewProps {
  datasetId: string;
  jobStatus: PreprocessingJobResponse | null;
}

export function PreprocessingPreview({ datasetId, jobStatus }: PreprocessingPreviewProps) {
  // Mock data - replace with actual API calls
  const beforeData = [
    { id: 1, age: 25, income: 50000, credit_score: 720, loan_approved: 1, missing_col: null },
    { id: 2, age: null, income: 75000, credit_score: 650, loan_approved: 0, missing_col: 'value' },
    { id: 3, age: 45, income: 120000, credit_score: 800, loan_approved: 1, missing_col: null },
    { id: 4, age: 32, income: null, credit_score: 690, loan_approved: 1, missing_col: 'value' },
    { id: 5, age: 28, income: 60000, credit_score: 710, loan_approved: 0, missing_col: null },
  ];

  const afterData = [
    { id: 1, age: 25, income: 50000, credit_score: 720, loan_approved: 1 },
    { id: 2, age: 32.5, income: 75000, credit_score: 650, loan_approved: 0 },
    { id: 3, age: 45, income: 120000, credit_score: 800, loan_approved: 1 },
    { id: 4, age: 32, income: 76250, credit_score: 690, loan_approved: 1 },
    { id: 5, age: 28, income: 60000, credit_score: 710, loan_approved: 0 },
  ];

  const DataTable = ({
    title,
    data,
    variant,
  }: {
    title: string;
    data: any[];
    variant: 'before' | 'after';
  }) => {
    if (data.length === 0) {
      return (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">{title}</h3>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        </Card>
      );
    }

    const columns = Object.keys(data[0]);

    return (
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant={variant === 'before' ? 'outline' : 'default'}>
            {data.length} rows × {columns.length} columns
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col) => {
                    const value = row[col];
                    const isNull = value === null || value === undefined;
                    const isChanged =
                      variant === 'after' &&
                      beforeData[idx] &&
                      beforeData[idx][col] !== value;

                    return (
                      <td
                        key={col}
                        className={`px-4 py-3 text-sm ${
                          isNull
                            ? 'text-red-500 italic'
                            : isChanged
                            ? 'bg-green-50 dark:bg-green-950/20 font-medium'
                            : ''
                        }`}
                      >
                        {isNull ? (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            null
                          </span>
                        ) : typeof value === 'number' ? (
                          <span className="font-mono">{value.toLocaleString()}</span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-muted/20 text-xs text-muted-foreground">
          Showing first 5 rows
        </div>
      </Card>
    );
  };

  if (!jobStatus || jobStatus.status !== 'completed') {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">No Preview Available</h3>
          <p className="text-sm text-muted-foreground">
            Run preprocessing to see before and after data comparison
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-950/20 border border-green-200 dark:border-green-800" />
            <span className="text-muted-foreground">Modified values</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-muted-foreground">Missing values</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-1 bg-background rounded border">123</span>
            <span className="text-muted-foreground">Numeric values</span>
          </div>
        </div>
      </Card>

      {/* Before Processing */}
      <DataTable title="Before Processing" data={beforeData} variant="before" />

      {/* After Processing */}
      <DataTable title="After Processing" data={afterData} variant="after" />

      {/* Changes Summary */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Changes Applied
        </h4>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Filled 2 missing values in 'age' column with mean (32.5)</li>
          <li>• Filled 1 missing value in 'income' column with median (76,250)</li>
          <li>• Removed 'missing_col' column (60% missing values)</li>
          <li>• Capped 0 outliers</li>
        </ul>
      </Card>
    </div>
  );
}
