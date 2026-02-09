/**
 * Dataset Transformers
 * Transform data between backend API format and frontend format
 */

import type {
  Dataset,
  DatasetPreview,
  DatasetQuality,
  DatasetSchema,
  DatasetStatus,
} from '../api/types';

/**
 * Helper to format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Transform backend dataset to frontend format
 */
export function transformDataset(backendDataset: any): Dataset {
  console.log('🔄 Transforming dataset:', backendDataset);
  console.log('📊 Statistics object:', backendDataset.statistics);
  console.log('💾 file_size_bytes:', backendDataset.file_size_bytes);
  console.log('💾 memory_mb:', backendDataset.statistics?.memory_mb);
  console.log('📁 file_path from backend:', backendDataset.file_path); // 🔍 DEBUG
  
  // Extract filename from file_path if file_name is not provided
  let fileName = backendDataset.file_name;
  if (!fileName && backendDataset.file_path) {
    // Extract filename from path: "data/01_raw/.../application_train.csv" -> "application_train.csv"
    fileName = backendDataset.file_path.split('/').pop();
  }

  // Calculate file size - prioritize statistics.memory_mb if file_size_bytes is 0
  const fileSizeBytes = backendDataset.file_size_bytes && backendDataset.file_size_bytes > 0
    ? backendDataset.file_size_bytes
    : (backendDataset.statistics?.memory_mb ? Math.round(backendDataset.statistics.memory_mb * 1024 * 1024) : 0);
  
  console.log('💾 Calculated fileSizeBytes:', fileSizeBytes);

  const transformed = {
    id: backendDataset.id || backendDataset.dataset_id,
    name: backendDataset.name || backendDataset.dataset_name,
    description: backendDataset.description || '',
    projectId: backendDataset.project_id || backendDataset.projectId || '',
    fileName: fileName || '',
    filePath: backendDataset.file_path || '', // ✅ Include full file path from backend
    fileSize: formatFileSize(fileSizeBytes), // ✅ Format as string
    fileSizeBytes: fileSizeBytes, // Keep bytes for sorting/calculations
    rowCount: backendDataset.row_count || backendDataset.statistics?.rows || 0,
    columnCount: backendDataset.column_count || backendDataset.statistics?.columns || 0,
    qualityScore: backendDataset.quality_score || 
                  (backendDataset.statistics?.missing_percentage != null 
                    ? (100 - backendDataset.statistics.missing_percentage) / 100 
                    : null),
    status: (backendDataset.status?.toUpperCase() || 'ACTIVE') as DatasetStatus,
    createdAt: backendDataset.created_at || backendDataset.createdAt,
    updatedAt: backendDataset.updated_at || backendDataset.updatedAt,
  };
  
  console.log('✅ Transformed result:', transformed);
  return transformed;
}

/**
 * Transform backend preview response to frontend format
 */
export function transformPreview(backendPreview: any): DatasetPreview {
  // Handle empty/null response
  if (!backendPreview) {
    console.warn('⚠️ Null or undefined preview response');
    return {
      id: undefined,
      name: undefined,
      columns: [],
      rows: [],
      previewRows: 0,
      totalRows: 0,
      totalColumns: 0,
    };
  }

  // Handle array response format (backend returns array of objects directly)
  if (Array.isArray(backendPreview)) {
    if (backendPreview.length === 0) {
      return {
        id: undefined,
        name: undefined,
        columns: [],
        rows: [],
        previewRows: 0,
        totalRows: 0,
        totalColumns: 0,
      };
    }
    
    // Extract column names from first object's keys
    const columns = Object.keys(backendPreview[0]);
    
    // Transform array of objects to array of arrays
    const rows = backendPreview.map((row: any) => {
      return columns.map((col: string) => row[col]);
    });
    
    return {
      id: undefined,
      name: undefined,
      columns: columns,
      rows: rows,
      previewRows: rows.length,
      totalRows: rows.length,
      totalColumns: columns.length,
    };
  }
  
  // Backend returns data as array of objects: [{col1: val1, col2: val2}, ...]
  // Frontend expects rows as array of arrays: [[val1, val2], ...]
  
  let columns = backendPreview.columns || [];
  
  // Extract columns from column objects if needed
  if (columns.length > 0 && typeof columns[0] === 'object') {
    columns = columns.map((col: any) => col.name || col.column_name || String(col));
  }
  
  let rows: any[][] = [];

  if (backendPreview.data && Array.isArray(backendPreview.data)) {
    // Transform array of objects to array of arrays
    rows = backendPreview.data.map((row: any) => {
      return columns.map((col: string) => row[col]);
    });
  } else if (backendPreview.rows && Array.isArray(backendPreview.rows) && backendPreview.rows.length > 0) {
    // Check if rows are already in array format [[val1, val2], ...]
    if (Array.isArray(backendPreview.rows[0])) {
      rows = backendPreview.rows;
    } else if (typeof backendPreview.rows[0] === 'object') {
      // Rows are objects [{col1: val1, col2: val2}, ...], need to transform
      rows = backendPreview.rows.map((row: any) => {
        return columns.map((col: string) => row[col]);
      });
    }
  }

  // Backend sends "rows" as a number (count), not the actual rows array
  const previewRowCount = typeof backendPreview.rows === 'number' ? backendPreview.rows : rows.length;

  const result = {
    id: backendPreview.id,
    name: backendPreview.name,
    columns: columns,
    rows: rows,
    previewRows: previewRowCount,
    totalRows: backendPreview.total_rows ?? backendPreview.totalRows ?? rows.length,
    totalColumns: backendPreview.total_columns ?? backendPreview.totalColumns ?? columns.length,
  };
  
  return result;
}

/**
 * Transform backend quality report to frontend format
 */
export function transformQuality(backendQuality: any): DatasetQuality {
  return {
    datasetId: backendQuality.dataset_id,
    totalRows: backendQuality.total_rows,
    totalColumns: backendQuality.total_columns,
    completeness: backendQuality.completeness,
    duplicateRows: backendQuality.duplicate_rows,
    duplicateRowsPercentage: backendQuality.duplicate_rows_percentage,
    columns: (backendQuality.columns || []).map((col: any) => ({
      name: col.name,
      dataType: col.data_type,
      originalType: col.original_type,
      uniqueValues: col.unique_values,
      missingCount: col.missing_count,
      missingPct: col.missing_pct,
      min: col.min,
      max: col.max,
      mean: col.mean,
      median: col.median,
      std: col.std,
      sampleValues: col.sample_values,
    })),
  };
}

/**
 * Transform backend schema to frontend format
 */
export function transformSchema(backendSchema: any): DatasetSchema {
  return {
    datasetId: backendSchema.dataset_id,
    columns: (backendSchema.columns || []).map((col: any) => ({
      name: col.name,
      dataType: col.data_type,
      originalType: col.original_type,
      uniqueValues: col.unique_values,
      missingPct: col.missing_pct,
      min: col.min,
      max: col.max,
    })),
  };
}