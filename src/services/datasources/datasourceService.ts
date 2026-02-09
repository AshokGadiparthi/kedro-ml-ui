/**
 * Data Source Service
 * Handles all data source connection API calls
 */

import apiClient, { apiCall } from '../api/client';
import type {
  DataSource,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  TestConnectionRequest,
  ConnectionTestResult,
} from '../api/types';

/**
 * Get all data sources for a project
 */
export const getDataSources = async (projectId?: string): Promise<DataSource[]> => {
  console.log('🔄 Fetching datasources (backend filters by auth token)');
  
  // ✅ CORRECT: GET /api/datasources/ (backend filters by authenticated user)
  return apiCall(apiClient.get('/api/datasources/'));
};

/**
 * Create a new data source
 */
export const createDataSource = async (
  request: CreateDataSourceRequest
): Promise<DataSource> => {
  if (!request.projectId) {
    throw new Error('Project ID is required');
  }
  
  // Transform frontend camelCase to backend snake_case
  const backendRequest: any = {
    name: request.name,
    type: request.sourceType,  // sourceType → type
    description: request.description,
    project_id: request.projectId,  // Add project_id to request body
    // Database fields
    host: request.host,
    port: request.port,
    database_name: request.databaseName,  // databaseName → database_name
    username: request.username,
    password: request.password,
    // AWS S3 fields
    bucket_name: request.bucketName,  // bucketName → bucket_name
    region: request.region,
    access_key: request.accessKey,  // accessKey → access_key
    secret_key: request.secretKey,  // secretKey → secret_key
    // BigQuery/GCS fields
    credentials_json: request.credentialsJson,  // credentialsJson → credentials_json
  };
  
  // Remove undefined fields to keep request clean
  Object.keys(backendRequest).forEach(key => {
    if (backendRequest[key] === undefined) {
      delete backendRequest[key];
    }
  });
  
  console.log('🔄 Transformed datasource request:', backendRequest);
  
  // ✅ CORRECT: POST /api/datasources/ (with project_id in request body)
  return apiCall(apiClient.post('/api/datasources/', backendRequest));
};

/**
 * Get data source by ID
 */
export const getDataSourceById = async (id: string): Promise<DataSource> => {
  return apiCall(apiClient.get(`/api/datasources/details/${id}`));
};

/**
 * Update data source
 */
export const updateDataSource = async (
  id: string,
  request: UpdateDataSourceRequest
): Promise<DataSource> => {
  // Transform frontend camelCase to backend snake_case
  const backendRequest: any = {
    name: request.name,
    description: request.description,
    // Database fields
    host: request.host,
    port: request.port,
    database_name: request.databaseName,  // databaseName → database_name
    username: request.username,
    password: request.password,
    // AWS S3 fields
    bucket_name: request.bucketName,  // bucketName → bucket_name
    region: request.region,
    access_key: request.accessKey,  // accessKey → access_key
    secret_key: request.secretKey,  // secretKey → secret_key
    // BigQuery/GCS fields
    credentials_json: request.credentialsJson,  // credentialsJson → credentials_json
  };
  
  // Remove undefined fields to keep request clean
  Object.keys(backendRequest).forEach(key => {
    if (backendRequest[key] === undefined) {
      delete backendRequest[key];
    }
  });
  
  return apiCall(apiClient.put(`/api/datasources/${id}`, backendRequest));
};

/**
 * Delete data source
 */
export const deleteDataSource = async (id: string): Promise<void> => {
  return apiCall(apiClient.delete(`/api/datasources/${id}`));
};

/**
 * Test new connection (before creating)
 */
export const testConnection = async (
  request: TestConnectionRequest
): Promise<ConnectionTestResult> => {
  // Transform frontend camelCase to backend snake_case
  const backendRequest: any = {
    type: request.sourceType,  // sourceType → type
    // Database fields
    host: request.host,
    port: request.port,
    database_name: request.databaseName,  // databaseName → database_name
    username: request.username,
    password: request.password,
    // AWS S3 fields
    bucket_name: request.bucketName,  // bucketName → bucket_name
    region: request.region,
    access_key: request.accessKey,  // accessKey → access_key
    secret_key: request.secretKey,  // secretKey → secret_key
    // BigQuery/GCS fields
    credentials_json: request.credentialsJson,  // credentialsJson → credentials_json
  };
  
  // Remove undefined fields to keep request clean
  Object.keys(backendRequest).forEach(key => {
    if (backendRequest[key] === undefined) {
      delete backendRequest[key];
    }
  });
  
  return apiCall(apiClient.post('/api/datasources/test', backendRequest));
};

/**
 * Test existing data source connection
 */
export const testExistingConnection = async (id: string): Promise<ConnectionTestResult> => {
  const response = await apiCall(apiClient.post(`/api/datasources/${id}/test`));
  
  // Transform backend response to frontend format
  // Backend returns: { status: "success"|"error", is_connected: boolean, message: string, ... }
  // Frontend expects: { success: boolean, message: string, ... }
  return {
    success: response.status === 'success' || response.is_connected === true,
    message: response.message || (response.status === 'success' ? 'Connection successful' : 'Connection failed'),
    latencyMs: response.latency_ms || response.latencyMs || null,
    serverVersion: response.server_version || response.serverVersion || null,
    tablesCount: response.tables_count || response.tablesCount || null,
    availableTables: response.available_tables || response.availableTables || null,
  };
};

/**
 * ❌ REMOVED: Browse endpoint doesn't exist in backend
 * Use getDatasourceById to get details instead
 */
// export const browseDataSource = async (id: string): Promise<any> => {
//   return apiCall(apiClient.get(`/api/datasources/${id}/browse`));  // ❌ 404
// };