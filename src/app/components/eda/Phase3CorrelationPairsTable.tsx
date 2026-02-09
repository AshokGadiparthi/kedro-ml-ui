/**
 * Phase 3 Correlation Pairs Table Component
 * World-class sortable and paginated correlation pairs table
 */

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Phase3EnhancedCorrelationsResponse } from '@/services/edaApi';
import { getCorrelationValueColor, formatCorrelation, getCorrelationStrengthText } from '@/services/edaApi';
import { Button } from '@/app/components/ui/button';

interface Props {
  data: Phase3EnhancedCorrelationsResponse;
  pageSize?: number;
}

type SortField = 'feature1' | 'feature2' | 'correlation' | 'p_value' | 'strength';
type SortDirection = 'asc' | 'desc';

export function Phase3CorrelationPairsTable({ data, pageSize = 20 }: Props) {
  const [sortField, setSortField] = useState<SortField>('correlation');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedPairs = useMemo(() => {
    const pairs = [...data.correlation_pairs];
    
    pairs.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // For correlation, sort by absolute value
      if (sortField === 'correlation') {
        aVal = Math.abs(a.correlation);
        bVal = Math.abs(b.correlation);
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return pairs;
  }, [data.correlation_pairs, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedPairs.length / pageSize);
  const paginatedPairs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedPairs.slice(start, end);
  }, [sortedPairs, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStrengthBadgeColor = (strength: string) => {
    if (strength.includes('strong')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (strength.includes('moderate')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Correlation Pairs</h3>
          <p className="text-sm text-muted-foreground">
            {sortedPairs.length} feature pairs • Sorted by {sortField} ({sortDirection})
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Total Pairs</div>
          <div className="text-xl font-bold">{data.statistics.total_correlations}</div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-700 dark:text-green-300 font-medium">High Positive</div>
          <div className="text-xl font-bold text-green-700 dark:text-green-300">
            {data.statistics.high_positive_count}
          </div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-xs text-red-700 dark:text-red-300 font-medium">High Negative</div>
          <div className="text-xl font-bold text-red-700 dark:text-red-300">
            {data.statistics.high_negative_count}
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Avg Correlation</div>
          <div className="text-xl font-bold">{(data.statistics?.avg_correlation || 0).toFixed(3)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold w-12">#</th>
                <th
                  className="text-left px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort('feature1')}
                >
                  <div className="flex items-center gap-2">
                    Feature 1
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort('feature2')}
                >
                  <div className="flex items-center gap-2">
                    Feature 2
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th
                  className="text-center px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort('correlation')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Correlation
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th
                  className="text-center px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort('p_value')}
                >
                  <div className="flex items-center justify-center gap-2">
                    P-Value
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
                <th
                  className="text-center px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort('strength')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Strength
                    <ArrowUpDown className="w-4 h-4 opacity-50" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedPairs.map((pair, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index + 1;
                return (
                  <tr key={`${pair.feature1}-${pair.feature2}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{globalIndex}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{pair.feature1}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{pair.feature2}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <div
                          className="px-3 py-1 rounded-full text-white font-bold text-sm shadow-sm"
                          style={{ backgroundColor: getCorrelationValueColor(pair.correlation) }}
                        >
                          {formatCorrelation(pair.correlation)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-mono">
                        {pair.p_value < 0.001 ? '<0.001' : pair.p_value.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStrengthBadgeColor(pair.strength)}`}>
                          {pair.strength.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedPairs.length)} of{' '}
            {sortedPairs.length} pairs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}