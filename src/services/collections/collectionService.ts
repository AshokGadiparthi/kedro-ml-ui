/**
 * Collection Service
 * API service layer for multi-table dataset collections
 */

import apiClient, { apiCall } from '../api/client';
import {
  transformTable,
  transformRelationship,
  transformAggregation,
  transformCollection,
  transformColumn,
  relationshipToApi,
  aggregationToApi,
} from './collectionTransformers';
import type {
  TableFile,
  TableRelationship,
  AggregationConfig,
  DatasetCollection,
  RelationshipSuggestion,
  ReviewSummary,
  ProcessResult,
  PreviewData,
  DerivedDatasetBuildResult,
  DerivedDatasetStatus,
  DerivedDatasetPreview,
} from '@/types/datasetCollection';

const API_BASE = 'http://192.168.1.147:8000/api/v1/collections';

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    let errorMessage = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      errorMessage = json.detail || json.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export const collectionService = {
  // ═══ STEP 1: CREATE + UPLOAD ═══════════════════════════════════

  /**
   * Create a new collection and upload files
   * POST /api/v1/collections/
   */
  async create(
    name: string,
    projectId: string,
    files: File[],
    description?: string
  ): Promise<{
    id: string;
    tables: TableFile[];
    raw: any;
  }> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('project_id', projectId);
    if (description) {
      formData.append('description', description);
    }
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE}/`, {
      method: 'POST',
      body: formData,
    });

    const data = await handleResponse(response);

    return {
      id: data.id,
      tables: (data.tables || []).map(transformTable),
      raw: data,
    };
  },

  /**
   * Add more files to existing collection
   * POST /api/v1/collections/{collection_id}/tables/upload
   */
  async addFiles(collectionId: string, files: File[]): Promise<TableFile[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(
      `${API_BASE}/${collectionId}/tables/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await handleResponse(response);
    return (data.tables || []).map(transformTable);
  },

  // ═══ LIST + DETAIL ═════════════════════════════════════════════

  /**
   * List all collections for a project
   * GET /api/v1/collections?project_id={project_id}
   */
  async list(projectId: string): Promise<DatasetCollection[]> {
    console.log('🔄 Fetching collections for project:', projectId);
    const response = await apiCall(
      apiClient.get(`${API_BASE}/?project_id=${projectId}`)
    );

    console.log('📦 Raw collections response:', response);
    
    // Backend LIST endpoint doesn't include tables, relationships, or aggregations
    // We need to fetch them separately
    const collections = await Promise.all(
      response.map(async (raw: any) => {
        const collection = transformCollection(raw);
        
        // Fetch tables for this collection
        try {
          const tables = await this.getTables(collection.id);
          collection.tables = tables;
          console.log(`✅ Loaded ${tables.length} tables for collection ${collection.name}`);
        } catch (error) {
          console.warn(`⚠️ Failed to load tables for collection ${collection.name}:`, error);
          collection.tables = [];
        }

        // Fetch relationships for this collection
        try {
          const relationships = await this.getRelationships(collection.id);
          collection.relationships = relationships;
          console.log(`✅ Loaded ${relationships.length} relationships for collection ${collection.name}`);
        } catch (error) {
          console.warn(`⚠️ Failed to load relationships for collection ${collection.name}:`, error);
          collection.relationships = [];
        }

        // Fetch aggregations for this collection
        try {
          const aggregations = await this.getAggregations(collection.id);
          collection.aggregations = aggregations;
          console.log(`✅ Loaded ${aggregations.length} aggregations for collection ${collection.name}`);
        } catch (error) {
          console.warn(`⚠️ Failed to load aggregations for collection ${collection.name}:`, error);
          collection.aggregations = [];
        }
        
        return collection;
      })
    );
    
    console.log('✨ Transformed collections with full data:', collections);
    return collections;
  },

  /**
   * Get tables for a specific collection
   * GET /api/v1/collections/{collection_id}/tables
   */
  async getTables(collectionId: string): Promise<TableFile[]> {
    const response = await apiCall(
      apiClient.get(`${API_BASE}/${collectionId}/tables`)
    );
    return (response || []).map(transformTable);
  },

  /**
   * Get full collection details
   * GET /api/v1/collections/{collection_id}
   */
  async getDetail(collectionId: string): Promise<DatasetCollection> {
    const response = await apiCall(apiClient.get(`${API_BASE}/${collectionId}`));
    return transformCollection(response);
  },

  /**
   * Delete a collection
   * DELETE /api/v1/collections/{collection_id}
   */
  async delete(collectionId: string): Promise<void> {
    await apiCall(apiClient.delete(`${API_BASE}/${collectionId}`));
  },

  // ═══ STEP 2: PRIMARY TABLE ════════════════════════════════════

  /**
   * Set primary table and target column
   * PUT /api/v1/collections/{collection_id}/primary
   */
  async setPrimary(
    collectionId: string,
    tableId: string,
    targetColumn?: string
  ): Promise<{
    primaryTableName: string;
    targetColumn: string | null;
    tables: TableFile[];
  }> {
    const response = await apiCall(
      apiClient.put(`${API_BASE}/${collectionId}/primary`, {
        primary_table_id: tableId,
        target_column: targetColumn || null,
      })
    );

    return {
      primaryTableName: response.primary_table_name,
      targetColumn: response.target_column,
      tables: (response.tables || []).map(transformTable),
    };
  },

  /**
   * Get columns for a table
   * GET /api/v1/collections/{collection_id}/tables/{table_id}/columns
   */
  async getColumns(collectionId: string, tableId: string): Promise<any> {
    const response = await apiCall(
      apiClient.get(`${API_BASE}/${collectionId}/tables/${tableId}/columns`)
    );

    return {
      tableId: response.table_id,
      tableName: response.table_name,
      rowCount: response.row_count,
      columnCount: response.column_count,
      columns: (response.columns || []).map(transformColumn),
    };
  },

  // ═══ STEP 3: RELATIONSHIPS ════════════════════════════════════

  /**
   * Get auto-suggested relationships
   * GET /api/v1/collections/{collection_id}/relationships/suggest
   */
  async suggestRelationships(
    collectionId: string
  ): Promise<RelationshipSuggestion[]> {
    return await apiCall(
      apiClient.get(`${API_BASE}/${collectionId}/relationships/suggest`)
    );
  },

  /**
   * Create a relationship
   * POST /api/v1/collections/{collection_id}/relationships
   */
  async createRelationship(
    collectionId: string,
    rel: Partial<TableRelationship>,
    tables: TableFile[]
  ): Promise<TableRelationship> {
    const apiData = relationshipToApi(rel, tables);
    const response = await apiCall(
      apiClient.post(`${API_BASE}/${collectionId}/relationships`, apiData)
    );
    return transformRelationship(response);
  },

  /**
   * Update a relationship
   * PUT /api/v1/collections/{collection_id}/relationships/{relationship_id}
   */
  async updateRelationship(
    collectionId: string,
    relId: string,
    updates: Partial<TableRelationship>,
    tables: TableFile[]
  ): Promise<TableRelationship> {
    const apiData = relationshipToApi(updates, tables);
    const response = await apiCall(
      apiClient.put(`${API_BASE}/${collectionId}/relationships/${relId}`, apiData)
    );
    return transformRelationship(response);
  },

  /**
   * Delete a relationship
   * DELETE /api/v1/collections/{collection_id}/relationships/{relationship_id}
   */
  async deleteRelationship(
    collectionId: string,
    relId: string
  ): Promise<void> {
    await apiCall(
      apiClient.delete(`${API_BASE}/${collectionId}/relationships/${relId}`)
    );
  },

  /**
   * Get all relationships for a collection
   * GET /api/v1/collections/{collection_id}/relationships
   */
  async getRelationships(collectionId: string): Promise<TableRelationship[]> {
    const response = await apiCall(
      apiClient.get(`${API_BASE}/${collectionId}/relationships`)
    );
    return (response || []).map(transformRelationship);
  },

  // ═══ STEP 4: AGGREGATIONS ═════════════════════════════════════

  /**
   * Create an aggregation
   * POST /api/v1/collections/{collection_id}/aggregations
   */
  async createAggregation(
    collectionId: string,
    agg: AggregationConfig,
    tables: TableFile[]
  ): Promise<AggregationConfig> {
    const apiData = aggregationToApi(agg, tables);
    const response = await apiCall(
      apiClient.post(`${API_BASE}/${collectionId}/aggregations`, apiData)
    );
    return transformAggregation(response);
  },

  /**
   * Update an aggregation
   * PUT /api/v1/collections/{collection_id}/aggregations/{aggregation_id}
   */
  async updateAggregation(
    collectionId: string,
    aggId: string,
    agg: AggregationConfig,
    tables: TableFile[]
  ): Promise<AggregationConfig> {
    const apiData = aggregationToApi(agg, tables);
    const response = await apiCall(
      apiClient.put(`${API_BASE}/${collectionId}/aggregations/${aggId}`, apiData)
    );
    return transformAggregation(response);
  },

  /**
   * Delete an aggregation
   * DELETE /api/v1/collections/{collection_id}/aggregations/{aggregation_id}
   */
  async deleteAggregation(
    collectionId: string,
    aggId: string
  ): Promise<void> {
    await apiCall(
      apiClient.delete(`${API_BASE}/${collectionId}/aggregations/${aggId}`)
    );
  },

  /**
   * Get all aggregations for a collection
   * GET /api/v1/collections/{collection_id}/aggregations
   */
  async getAggregations(collectionId: string): Promise<AggregationConfig[]> {
    const response = await apiCall(
      apiClient.get(`${API_BASE}/${collectionId}/aggregations`)
    );
    return (response || []).map(transformAggregation);
  },

  // ═══ STEP 5: REVIEW + PROCESS ════════════════════════════════

  /**
   * Get review summary
   * GET /api/v1/collections/{collection_id}/review
   */
  async getReview(collectionId: string): Promise<ReviewSummary> {
    const response = await apiCall(
      apiClient.get(`${API_BASE}/${collectionId}/review`)
    );
    return {
      collection: transformCollection(response.collection),
      primaryTable: transformTable(response.primary_table),
      targetColumn: response.target_column,
      tables: (response.tables || []).map(transformTable),
      relationships: (response.relationships || []).map(transformRelationship),
      aggregations: (response.aggregations || []).map(transformAggregation),
      totalInputRows: response.total_input_rows,
      totalInputColumns: response.total_input_columns,
      estimatedOutputColumns: response.estimated_output_columns,
      warnings: response.warnings || [],
      readyToProcess: response.ready_to_process,
    };
  },

  /**
   * Process the collection (merge tables)
   * POST /api/v1/collections/{collection_id}/process
   */
  async process(
    collectionId: string,
    options?: {
      output_name?: string;
      drop_duplicates?: boolean;
      handle_missing?: string;
    }
  ): Promise<ProcessResult> {
    const response = await apiCall(
      apiClient.post(`${API_BASE}/${collectionId}/process`, options || {})
    );
    return {
      status: response.status,
      collectionId: response.collection_id,
      mergedDatasetId: response.merged_dataset_id,
      mergedFilePath: response.merged_file_path,
      rowsBefore: response.rows_before,
      rowsAfter: response.rows_after,
      columnsAfter: response.columns_after,
      tablesJoined: response.tables_joined,
      durationSeconds: response.duration_seconds,
      outputColumns: response.output_columns || [],
    };
  },

  /**
   * Get preview of merged data
   * GET /api/v1/collections/{collection_id}/preview?rows={rows}
   */
  async getPreview(
    collectionId: string,
    rows: number = 20
  ): Promise<PreviewData> {
    const response = await apiCall(
      apiClient.get(`${API_BASE}/${collectionId}/preview?rows=${rows}`)
    );
    return {
      collectionId: response.collection_id,
      totalRows: response.total_rows,
      totalColumns: response.total_columns,
      previewRows: response.preview_rows,
      columns: (response.columns || []).map(transformColumn),
      rows: response.rows || [],
    };
  },

  // ═══ DERIVED DATASETS ══════════════════════════════════════════

  /**
   * Build derived dataset from collection
   * POST /api/v1/derived-datasets/{collection_id}/build
   */
  async buildDerivedDataset(collectionId: string): Promise<DerivedDatasetBuildResult> {
    const DERIVED_API_BASE = 'http://192.168.1.147:8000/api/v1/derived-datasets';
    const response = await apiCall(
      apiClient.post(`${DERIVED_API_BASE}/${collectionId}/build`, {})
    );
    return {
      status: response.status,
      collectionId: response.collection_id,
      mergedDatasetId: response.merged_dataset_id,
      mergedFilePath: response.merged_file_path,
      rowsBefore: response.rows_before,
      rowsAfter: response.rows_after,
      columnsBefore: response.columns_before,
      columnsAfter: response.columns_after,
      columnsAdded: response.columns_added,
      tablesJoined: response.tables_joined,
      durationSeconds: response.duration_seconds,
      warnings: response.warnings || [],
      outputColumns: response.output_columns || [],
      mergedFileSizeBytes: response.merged_file_size_bytes,
    };
  },

  /**
   * Get derived dataset status
   * GET /api/v1/derived-datasets/{collection_id}/status
   */
  async getDerivedDatasetStatus(collectionId: string): Promise<DerivedDatasetStatus> {
    const DERIVED_API_BASE = 'http://192.168.1.147:8000/api/v1/derived-datasets';
    const response = await apiCall(
      apiClient.get(`${DERIVED_API_BASE}/${collectionId}/status`)
    );
    return {
      collectionId: response.collection_id,
      status: response.status,
      mergedDatasetId: response.merged_dataset_id,
      mergedFilePath: response.merged_file_path,
      rowsBefore: response.rows_before,
      rowsAfter: response.rows_after,
      columnsAfter: response.columns_after,
      processingStartedAt: response.processing_started_at,
      processingCompletedAt: response.processing_completed_at,
      processingDurationSeconds: response.processing_duration_seconds,
      processingError: response.processing_error,
      engine: response.engine,
      mergedFileSizeBytes: response.merged_file_size_bytes,
    };
  },

  /**
   * Get derived dataset preview
   * GET /api/v1/derived-datasets/{collection_id}/preview
   */
  async getDerivedDatasetPreview(
    collectionId: string,
    rows: number = 20
  ): Promise<DerivedDatasetPreview> {
    const DERIVED_API_BASE = 'http://192.168.1.147:8000/api/v1/derived-datasets';
    const response = await apiCall(
      apiClient.get(`${DERIVED_API_BASE}/${collectionId}/preview?rows=${rows}`)
    );
    return {
      collectionId: response.collection_id,
      mergedDatasetId: response.merged_dataset_id,
      totalRows: response.total_rows,
      totalColumns: response.total_columns,
      previewRows: response.preview_rows,
      columns: (response.columns || []).map((col: any) => ({
        name: col.name,
        dtype: col.dtype,
        displayType: col.display_type,
        nullable: col.nullable,
      })),
      rows: response.rows || [],
    };
  },
};