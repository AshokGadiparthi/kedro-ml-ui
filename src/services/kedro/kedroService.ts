/**
 * Kedro Source Code Service
 * Handles downloading Kedro source code for models
 */

import { apiClient } from '../api/client';

export interface DownloadKedroSourceParams {
  projectId: string;
  filePath: string;
  collectionId?: string; // UUID of the collection for multi-table datasets (optional)
  modelName?: string; // Model name for Kedro source code generation (optional)
}

/**
 * Download Kedro source code for a specific model/dataset
 * @param params - Download parameters
 */
export const downloadKedroSource = async (
  params: DownloadKedroSourceParams
): Promise<void> => {
  try {
    console.log('📦 Downloading Kedro source code:', params);

    // Build API parameters - only include collection_id if it exists
    const apiParams: any = {
      project_id: params.projectId,
      file_path: params.filePath,
    };

    // Only add collection_id if it's provided (for multi-table datasets)
    if (params.collectionId) {
      apiParams.collection_id = params.collectionId;
    }

    // Only add model_name if it's provided (for Kedro source code generation)
    if (params.modelName) {
      apiParams.model_name = params.modelName;
    }

    // Make API request
    const response = await apiClient.get('/api/v1/kedro-source/download', {
      params: apiParams,
      responseType: 'blob', // Important: Tell axios to expect binary data
    });

    // Create blob from response
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/zip',
    });

    // Extract filename from Content-Disposition header if available
    let filename = 'kedro-source.zip';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('✅ Kedro source code downloaded successfully:', filename);
  } catch (error: any) {
    console.error('❌ Failed to download Kedro source code:', error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to download Kedro source code'
    );
  }
};

/**
 * Build download parameters for a single/primary dataset
 * @param projectId - The project ID
 * @param fileName - The file name (e.g., "test.csv")
 * @returns Download parameters
 */
export const buildSingleDatasetParams = (
  projectId: string,
  fileName: string = 'test.csv'
): DownloadKedroSourceParams => {
  return {
    projectId,
    filePath: `data/01_raw/abc/${fileName}`,
    // No collection_id for single datasets
  };
};

/**
 * Build download parameters for a merged/multi-table dataset
 * @param projectId - The project ID
 * @param collectionId - The collection UUID
 * @param collectionName - The collection name (e.g., "m1", "m2", "m3")
 * @returns Download parameters
 */
export const buildMergedDatasetParams = (
  projectId: string,
  collectionId: string,
  collectionName: string
): DownloadKedroSourceParams => {
  return {
    projectId,
    filePath: `data/01_raw/abc/${collectionName}`,
    collectionId, // UUID of the collection
  };
};