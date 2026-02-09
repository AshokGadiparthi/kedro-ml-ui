/**
 * Collection Transformers
 * Transforms API responses to/from frontend data structures
 */

import type {
  TableFile,
  TableColumn,
  TableRelationship,
  AggregationConfig,
  DatasetCollection,
  CollectionStatus,
} from '@/types/datasetCollection';

// ─── STATUS MAPPING ────────────────────────────────────────────
const STATUS_MAP: Record<string, CollectionStatus> = {
  draft: 'draft',
  configured: 'configured',
  processing: 'processing',
  processed: 'ready',
  ready: 'ready',
  failed: 'failed',
};

// ─── API → FRONTEND ────────────────────────────────────────────

export function transformColumn(apiColumn: any): TableColumn {
  return {
    name: apiColumn.name,
    type: apiColumn.display_type || apiColumn.dtype,
    isPrimaryKey: apiColumn.is_potential_key || false,
    dtype: apiColumn.dtype,
    uniqueCount: apiColumn.unique_count,
    nullCount: apiColumn.null_count,
    nullPercentage: apiColumn.null_percentage,
    sampleValues: apiColumn.sample_values,
  };
}

export function transformTable(apiTable: any): TableFile {
  // Parse columns from API
  const rawColumns = apiTable.columns || [];
  const columns = rawColumns.map(transformColumn);

  return {
    id: apiTable.id,
    name: apiTable.table_name,
    filename: apiTable.file_name || `${apiTable.table_name}.csv`,
    file: null,  // File object only exists during upload
    role: apiTable.role,  // 'primary', 'detail', or 'derived'
    isPrimary: apiTable.role === 'primary',
    rowCount: apiTable.row_count,
    columnCount: apiTable.column_count,
    fileSize: apiTable.file_size_bytes,
    columns,
    datasetId: apiTable.dataset_id,
  };
}

export function transformRelationship(apiRel: any): TableRelationship {
  return {
    id: apiRel.id,
    leftTable: apiRel.left_table_name,     // NAME (what frontend expects)
    rightTable: apiRel.right_table_name,
    leftKey: apiRel.left_column,           // map left_column → leftKey
    rightKey: apiRel.right_column,         // map right_column → rightKey
    joinType: apiRel.join_type,
    relationshipType: apiRel.validation?.relationship_type || '1:N',
    // Store IDs for API calls
    _leftTableId: apiRel.left_table_id,
    _rightTableId: apiRel.right_table_id,
    _validation: apiRel.validation,
    _previewSql: apiRel.preview_sql,
  };
}

export function transformAggregation(apiAgg: any): AggregationConfig {
  return {
    id: apiAgg.id,
    tableName: apiAgg.source_table_name,    // map source_table_name → tableName
    groupByColumn: apiAgg.group_by_column,
    prefix: apiAgg.column_prefix,           // map column_prefix → prefix
    features: apiAgg.features || [],        // Same shape: [{column, functions}]
    // Store IDs for API calls
    _sourceTableId: apiAgg.source_table_id,
    _createdColumns: apiAgg.created_columns || [],
    _outputColumnCount: apiAgg.output_column_count || 0,
  };
}

export function transformCollection(apiCol: any): DatasetCollection {
  const tables = (apiCol.tables || []).map(transformTable);
  const primaryTable = tables.find((t: any) => t.isPrimary);

  return {
    id: apiCol.id,
    name: apiCol.name,
    description: apiCol.description,
    projectId: apiCol.project_id,
    status: STATUS_MAP[apiCol.status] || 'draft',
    tables,
    primaryTable: primaryTable?.name || '',
    targetColumn: apiCol.target_column || '',
    relationships: (apiCol.relationships || []).map(transformRelationship),
    aggregations: (apiCol.aggregations || []).map(transformAggregation),
    mergedDataset: apiCol.rows_after_merge ? {
      rowCount: apiCol.rows_after_merge,
      columnCount: apiCol.columns_after_merge,
      fileSize: 0,  // TODO: wire up from API
      datasetId: apiCol.merged_dataset_id,
    } : undefined,
    createdAt: apiCol.created_at || new Date().toISOString(),
    updatedAt: apiCol.updated_at,
    // Extra API fields
    _primaryTableId: apiCol.primary_table_id,
    _mergedDatasetId: apiCol.merged_dataset_id,
    _currentStep: apiCol.current_step,
    _totalTables: apiCol.total_tables,
    _totalRelationships: apiCol.total_relationships,
    _totalAggregations: apiCol.total_aggregations,
  };
}

// ─── FRONTEND → API (for create/update calls) ──────────────────

export function relationshipToApi(
  rel: Partial<TableRelationship>,
  tables: TableFile[]
) {
  const leftTable = tables.find(t => t.name === rel.leftTable);
  const rightTable = tables.find(t => t.name === rel.rightTable);

  return {
    left_table_id: leftTable?.id,
    right_table_id: rightTable?.id,
    left_column: rel.leftKey || (rel as any).leftColumn,  // Support both property names
    right_column: rel.rightKey || (rel as any).rightColumn,
    join_type: rel.joinType,
  };
}

export function aggregationToApi(
  agg: AggregationConfig,
  tables: TableFile[]
) {
  const sourceTable = tables.find(t => t.name === agg.tableName);

  return {
    source_table_id: sourceTable?.id,
    group_by_column: agg.groupByColumn,
    column_prefix: agg.prefix,
    features: agg.features.map(f => ({
      column: f.column,
      functions: f.functions,  // "nunique"/"var" pass through after API fix
    })),
  };
}