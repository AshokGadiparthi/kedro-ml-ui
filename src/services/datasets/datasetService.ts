/**
 * Dataset Service - API Integrated!
 * Interacts with FastAPI backend for dataset operations
 */

import apiClient, { apiCall } from '../api/client';
import { transformDataset, transformPreview, transformQuality, transformSchema } from './datasetTransformers';
import type {
  Dataset,
  DatasetPreview,
  DatasetQuality,
  DatasetSchema,
  UploadDatasetRequest,
  UpdateDatasetRequest,
  ColumnInfo,
} from '../api/types';

// ─── PREVIEW CACHE TO PREVENT DUPLICATE API CALLS ─────────────────
const previewCache = new Map<string, { data: DatasetPreview; timestamp: number }>();
const ongoingPreviewRequests = new Map<string, Promise<DatasetPreview>>();
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Get datasets with caching for preview calls
 */
export const getDatasets = async (projectId: string): Promise<Dataset[]> => {
  // ✅ CORRECT: GET /api/datasets/ (backend filters by authenticated user)
  const response = await apiCall(apiClient.get('/api/datasets/'));
  
  console.log('🔍 RAW Backend Response for datasets:', JSON.stringify(response, null, 2));
  console.log('🔍 First dataset from backend:', response[0]);
  console.log('🔍 file_path in first dataset:', response[0]?.file_path);
  
  // Transform each dataset from backend format to frontend format
  const datasets = response.map(transformDataset);
  
  // 🔧 EMERGENCY FIX: Backend is returning incorrect row_count (showing 1 for all datasets)
  // ALWAYS fetch preview to get accurate counts until backend is fixed
  const enrichedDatasets = await Promise.all(
    datasets.map(async (dataset) => {
      console.log(`📊 Dataset "${dataset.name}" - Backend metadata: ${dataset.rowCount} rows, ${dataset.columnCount} columns`);
      console.log(`⚡ Fetching preview to get accurate row/column count...`);
      
      try {
        const preview = await getCachedPreview(dataset.id, 1); // Cached preview fetch
        
        console.log(`📊 Preview returned: ${preview.totalRows} rows, ${preview.totalColumns} columns`);
        
        const enriched = {
          ...dataset,
          rowCount: preview.totalRows || dataset.rowCount,
          columnCount: preview.totalColumns || dataset.columnCount,
        };
        
        console.log(`✅ Final enriched "${dataset.name}": ${enriched.rowCount} rows, ${enriched.columnCount} columns`);
        return enriched;
      } catch (error) {
        console.warn(`⚠️ Failed to fetch preview for "${dataset.name}", using backend metadata`, error);
        return dataset; // Return as-is if preview fails
      }
    })
  );
  
  return enrichedDatasets;
};

/**
 * Upload a new dataset
 */
export const uploadDataset = async (request: UploadDatasetRequest): Promise<Dataset> => {
  if (!request.projectId) {
    throw new Error('Project ID is required');
  }
  
  if (!request.name || request.name.trim() === '') {
    throw new Error('Dataset name is required');
  }

  console.log('📤 Uploading dataset:', {
    name: request.name,
    projectId: request.projectId,
    fileName: request.file.name,
    fileSize: request.file.size,
  });

  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('project_id', request.projectId);
  formData.append('name', request.name);
  
  // Add description if provided
  if (request.description) {
    formData.append('description', request.description);
  }

  // Debug: Log all FormData entries
  console.log('📝 FormData entries:');
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
  }

  // ✅ WORKAROUND: Send name and project_id as query params since backend isn't reading form fields
  // TODO: Fix backend to properly read Form() fields in FastAPI
  const response = await apiCall(
    apiClient.post('/api/datasets/', formData, {
      params: {
        name: request.name,
        project_id: request.projectId,
        ...(request.description && { description: request.description }),
      },
    })
  );
  
  console.log('✅ Dataset uploaded successfully:', response);
  return transformDataset(response);
};

/**
 * Get dataset by ID
 */
export const getDatasetById = async (id: string): Promise<Dataset> => {
  console.log(`📊 Fetching dataset by ID: ${id}`);
  const response = await apiCall(apiClient.get(`/api/datasets/${id}/info`));
  console.log('📦 Dataset response:', response);
  return transformDataset(response);
};

/**
 * Update dataset metadata
 */
export const updateDataset = async (
  id: string,
  request: UpdateDatasetRequest
): Promise<Dataset> => {
  const response = await apiCall(
    apiClient.put(`/api/datasets/${id}`, request)
  );
  return transformDataset(response);
};

/**
 * Delete dataset
 */
export const deleteDataset = async (id: string): Promise<void> => {
  return apiCall(apiClient.delete(`/api/datasets/${id}`));
};

/**
 * Get data preview with caching
 */
export const getDatasetPreview = async (
  id: string,
  rows: number = 100
): Promise<DatasetPreview> => {
  // Reduced logging for performance
  const response = await apiCall(
    apiClient.get(`/api/datasets/${id}/preview`, {
      params: { rows },
    })
  );
  const transformed = transformPreview(response);
  return transformed;
};

/**
 * Get cached preview with TTL
 */
const getCachedPreview = async (id: string, rows: number = 100): Promise<DatasetPreview> => {
  const cached = previewCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📊 Using cached preview for dataset ${id}`);
    return cached.data;
  }

  const ongoingRequest = ongoingPreviewRequests.get(id);
  if (ongoingRequest) {
    console.log(`📊 Waiting for ongoing preview request for dataset ${id}`);
    return ongoingRequest;
  }

  const newRequest = getDatasetPreview(id, rows);
  ongoingPreviewRequests.set(id, newRequest);

  try {
    const preview = await newRequest;
    previewCache.set(id, { data: preview, timestamp: Date.now() });
    return preview;
  } finally {
    ongoingPreviewRequests.delete(id);
  }
};

/**
 * Get column information
 */
export const getDatasetColumns = async (id: string): Promise<any> => {
  const response = await apiCall(apiClient.get(`/api/datasets/${id}/columns`));
  console.log('🔍 RAW Columns API Response:', JSON.stringify(response, null, 2));
  console.log('🔍 file_path in columns response:', response.file_path);
  // Return the full response object so we can access file_path
  return response;
};

/**
 * Get dataset info (statistics and metadata)
 */
export const getDatasetInfo = async (id: string): Promise<any> => {
  console.log(`📊 Fetching info for dataset ${id}`);
  const response = await apiCall(apiClient.get(`/api/datasets/${id}/info`));
  console.log('📦 Dataset info response:', response);
  return response;
};

/**
 * Get quality report
 */
export const getDatasetQuality = async (id: string): Promise<DatasetQuality> => {
  const response = await apiCall(apiClient.get(`/api/datasets/${id}/quality`));
  return transformQuality(response);
};

/**
 * Get dataset schema
 */
export const getDatasetSchema = async (id: string): Promise<DatasetSchema> => {
  const response = await apiCall(apiClient.get(`/api/datasets/${id}/schema`));
  return transformSchema(response);
};