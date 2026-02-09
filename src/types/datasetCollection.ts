// types/datasetCollection.ts
// Complete TypeScript types for multi-table dataset collections

// ─── AGGREGATION ────────────────────────────────────────────────

export type AggregationFunction =
  | 'sum' | 'mean' | 'median' | 'max' | 'min'
  | 'count' | 'nunique' | 'std' | 'var';

export interface AggregationFeature {
  column: string;
  functions: AggregationFunction[];
}

export interface AggregationConfig {
  id: string;
  tableName: string;           // ← API returns source_table_name
  groupByColumn: string;       // ← API returns group_by_column
  prefix: string;              // ← API returns column_prefix
  features: AggregationFeature[];
  // Optional enrichment from API
  _sourceTableId?: string;
  _createdColumns?: string[];
  _outputColumnCount?: number;
}

// ─── TABLE COLUMN ───────────────────────────────────────────────

export interface TableColumn {
  name: string;
  type: string;                // "INTEGER" | "FLOAT" | "VARCHAR" | "DATE" | "BOOLEAN"
  isPrimaryKey: boolean;       // ← API returns is_potential_key
  // Optional enrichment from API
  dtype?: string;              // Raw pandas dtype
  uniqueCount?: number;
  nullCount?: number;
  nullPercentage?: number;
  sampleValues?: any[];
}

// ─── TABLE FILE ─────────────────────────────────────────────────

export interface TableFile {
  id: string;
  name: string;                // ← API returns table_name
  filename: string;            // ← API returns file_name
  file?: File | null;          // Only exists during upload
  role?: 'primary' | 'detail' | 'derived'; // ← API returns role
  isPrimary?: boolean;         // ← Derived from API role === "primary"
  rowCount?: number;           // ← API returns row_count
  columnCount?: number;        // ← API returns column_count
  fileSize?: number;           // ← API returns file_size_bytes
  columns: TableColumn[];      // ← Populated from GET /columns endpoint
  datasetId?: string;          // ← API returns dataset_id
}

// ─── RELATIONSHIP ───────────────────────────────────────────────

export interface TableRelationship {
  id: string;
  leftTable: string;           // ← API returns left_table_name (NAME not ID)
  rightTable: string;          // ← API returns right_table_name
  leftKey: string;             // ← API returns left_column
  rightKey: string;            // ← API returns right_column
  joinType: 'left' | 'right' | 'inner' | 'full';
  relationshipType?: string;   // "1:1" | "1:N" | "N:1" | "N:N"
  // Optional enrichment from API
  _leftTableId?: string;
  _rightTableId?: string;
  _validation?: {
    is_validated: boolean;
    relationship_type: string;
    match_count: number;
    match_percentage: number;
    orphan_left_count: number;
    orphan_right_count: number;
    warnings: string[];
  };
  _previewSql?: string;
}

// ─── MERGED DATASET ─────────────────────────────────────────────

export interface MergedDataset {
  rowCount: number;
  columnCount: number;
  fileSize: number;
  datasetId?: string;          // For linking to EDA/pipelines
}

// ─── COLLECTION ─────────────────────────────────────────────────

export type CollectionStatus = 'draft' | 'configured' | 'processing' | 'processed' | 'ready' | 'failed';

export interface DatasetCollection {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  status: CollectionStatus;
  tables: TableFile[];
  primaryTable: string;        // TABLE NAME (not ID)
  targetColumn?: string;
  relationships: TableRelationship[];
  aggregations: AggregationConfig[];
  mergedDataset?: MergedDataset;
  createdAt: string;           // ISO string
  updatedAt?: string;
  // Internal API fields
  _primaryTableId?: string;
  _mergedDatasetId?: string;
  _currentStep?: number;
  _totalTables?: number;
  _totalRelationships?: number;
  _totalAggregations?: number;
}

// ─── API SUGGESTION TYPE ────────────────────────────────────────

export interface RelationshipSuggestion {
  leftTableId: string;
  leftTableName: string;
  rightTableId: string;
  rightTableName: string;
  leftColumn: string;
  rightColumn: string;
  confidence: number;          // 0.0 - 1.0
  reason: string;
}

// ─── REVIEW SUMMARY ─────────────────────────────────────────────

export interface ReviewSummary {
  collection: DatasetCollection;
  primaryTable: TableFile;
  targetColumn?: string;
  tables: TableFile[];
  relationships: TableRelationship[];
  aggregations: AggregationConfig[];
  totalInputRows: number;
  totalInputColumns: number;
  estimatedOutputColumns: number;
  warnings: string[];
  readyToProcess: boolean;
}

// ─── PROCESS RESULT ─────────────────────────────────────────────

export interface ProcessResult {
  status: string;
  collectionId: string;
  mergedDatasetId: string;
  mergedFilePath: string;
  rowsBefore: number;
  rowsAfter: number;
  columnsAfter: number;
  tablesJoined: number;
  durationSeconds: number;
  outputColumns: string[];
}

// ─── PREVIEW DATA ───────────────────────────────────────────────

export interface PreviewData {
  collectionId: string;
  totalRows: number;
  totalColumns: number;
  previewRows: number;
  columns: TableColumn[];
  rows: Record<string, any>[];
}

// ─── DERIVED DATASET ────────────────────────────────────────────

export interface DerivedDatasetBuildResult {
  status: string;
  collectionId: string;
  mergedDatasetId: string;
  mergedFilePath: string;
  rowsBefore: number;
  rowsAfter: number;
  columnsBefore: number;
  columnsAfter: number;
  columnsAdded: number;
  tablesJoined: number;
  durationSeconds: number;
  warnings: string[];
  outputColumns: string[];
  mergedFileSizeBytes: number;
}

export interface DerivedDatasetStatus {
  collectionId: string;
  status: 'draft' | 'configured' | 'processing' | 'processed' | 'ready' | 'failed';
  mergedDatasetId?: string;
  mergedFilePath?: string;
  rowsBefore?: number;
  rowsAfter?: number;
  columnsAfter?: number;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  processingDurationSeconds?: number;
  processingError?: string | null;
  engine?: string;
  mergedFileSizeBytes?: number;
}

export interface DerivedDatasetPreview {
  collectionId: string;
  mergedDatasetId: string;
  totalRows: number;
  totalColumns: number;
  previewRows: number;
  columns: {
    name: string;
    dtype: string;
    displayType: string;
    nullable: boolean;
  }[];
  rows: Record<string, any>[];
}