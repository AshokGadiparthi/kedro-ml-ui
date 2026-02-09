/**
 * Phase 3 Correlation Heatmap Component
 * World-class interactive correlation heatmap with hover tooltips
 */

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { HeatmapDataResponse } from '@/services/edaApi';
import { getCorrelationValueColor, formatCorrelation } from '@/services/edaApi';

interface Props {
  data: HeatmapDataResponse;
}

export function Phase3CorrelationHeatmap({ data }: Props) {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
    feature1: string;
    feature2: string;
    value: number;
  } | null>(null);

  const { numeric_columns, heatmap, min_value, max_value } = data;
  const size = numeric_columns.length;

  // Calculate cell size based on number of features
  const getCellSize = () => {
    if (size <= 10) return 60;
    if (size <= 20) return 40;
    if (size <= 30) return 30;
    return 20;
  };

  const cellSize = getCellSize();
  const fontSize = cellSize > 30 ? 11 : 9;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Correlation Heatmap</h3>
          <p className="text-sm text-muted-foreground">
            Interactive correlation matrix • {size} features • Hover for details
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>Range: {min_value.toFixed(2)} to {max_value.toFixed(2)}</span>
        </div>
      </div>

      {/* Color Scale Legend */}
      <div className="flex items-center justify-center gap-4 p-3 bg-muted/30 rounded-lg">
        <span className="text-xs font-medium">Strong Negative</span>
        <div className="flex items-center gap-0.5">
          {[-1, -0.7, -0.5, -0.3, 0, 0.3, 0.5, 0.7, 1].map((val) => (
            <div
              key={val}
              className="w-8 h-6 border border-white/20"
              style={{ backgroundColor: getCorrelationValueColor(val) }}
              title={val.toString()}
            />
          ))}
        </div>
        <span className="text-xs font-medium">Strong Positive</span>
      </div>

      {/* Heatmap Container - Scrollable for large matrices */}
      <div className="relative border rounded-lg bg-white dark:bg-gray-900 overflow-auto max-h-[600px] shadow-sm">
        <div
          className="relative"
          style={{
            width: cellSize * (size + 1),
            height: cellSize * (size + 1),
          }}
        >
          {/* Column Headers */}
          <div className="absolute top-0 left-0" style={{ marginLeft: cellSize }}>
            {numeric_columns.map((col, i) => (
              <div
                key={`col-header-${i}`}
                className="absolute text-xs font-medium truncate origin-top-left"
                style={{
                  left: i * cellSize + cellSize / 2,
                  top: cellSize / 2,
                  width: cellSize * 1.5,
                  transform: 'rotate(-45deg) translateY(-50%)',
                  fontSize: `${fontSize}px`,
                }}
                title={col}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Row Headers */}
          <div className="absolute top-0 left-0" style={{ marginTop: cellSize }}>
            {numeric_columns.map((row, i) => (
              <div
                key={`row-header-${i}`}
                className="absolute text-xs font-medium truncate text-right pr-2"
                style={{
                  top: i * cellSize,
                  left: 0,
                  width: cellSize,
                  height: cellSize,
                  lineHeight: `${cellSize}px`,
                  fontSize: `${fontSize}px`,
                }}
                title={row}
              >
                {row}
              </div>
            ))}
          </div>

          {/* Heatmap Cells */}
          <div
            className="absolute"
            style={{ top: cellSize, left: cellSize }}
          >
            {heatmap.map((row, i) =>
              row.map((value, j) => {
                const isHovered =
                  hoveredCell?.row === i && hoveredCell?.col === j;
                const isDiagonal = i === j;

                return (
                  <div
                    key={`cell-${i}-${j}`}
                    className={`absolute border border-gray-200 dark:border-gray-700 transition-all duration-150 ${
                      isHovered ? 'ring-2 ring-blue-500 z-10 scale-110' : ''
                    } ${isDiagonal ? 'border-2 border-gray-400 dark:border-gray-500' : ''}`}
                    style={{
                      left: j * cellSize,
                      top: i * cellSize,
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getCorrelationValueColor(value),
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() =>
                      setHoveredCell({
                        row: i,
                        col: j,
                        feature1: numeric_columns[i],
                        feature2: numeric_columns[j],
                        value,
                      })
                    }
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {cellSize > 30 && (
                      <div
                        className="flex items-center justify-center w-full h-full text-white font-semibold drop-shadow-md"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {value.toFixed(2)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredCell && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-50 border border-gray-700">
          <div className="text-sm font-semibold mb-1">
            {hoveredCell.feature1} × {hoveredCell.feature2}
          </div>
          <div className="text-lg font-bold" style={{ color: getCorrelationValueColor(hoveredCell.value) }}>
            {formatCorrelation(hoveredCell.value)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {hoveredCell.value >= 0.7
              ? 'Strong Positive Correlation'
              : hoveredCell.value >= 0.5
              ? 'Moderate Positive Correlation'
              : hoveredCell.value >= 0.3
              ? 'Weak Positive Correlation'
              : hoveredCell.value >= -0.3
              ? 'Very Weak Correlation'
              : hoveredCell.value >= -0.5
              ? 'Weak Negative Correlation'
              : hoveredCell.value >= -0.7
              ? 'Moderate Negative Correlation'
              : 'Strong Negative Correlation'}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Features</div>
          <div className="text-xl font-bold">{size}</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Min Value</div>
          <div className="text-xl font-bold">{min_value.toFixed(3)}</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Max Value</div>
          <div className="text-xl font-bold">{max_value.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
}
