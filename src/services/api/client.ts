/**
 * API Client
 * Axios instance with interceptors for auth, error handling, and logging
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config, getAuthToken, removeAuthToken, clearStorage } from '../../config/environment';

/**
 * Create Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  withCredentials: config.api.withCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Add auth token to every request
 */
apiClient.interceptors.request.use(
  (config: any) => {
    const token = getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ FIX: Remove Content-Type for FormData - let axios set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      
      // Debug: Log FormData details
      if (import.meta.env.DEV) {
        console.log('📋 FormData detected - axios will set Content-Type automatically');
        console.log('📋 FormData entries:');
        for (const [key, value] of config.data.entries()) {
          console.log(`   ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
        }
      }
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params,
      });
      // Only log request body if it exists
      if (config.data !== undefined) {
        console.log('📝 Stringified JSON being sent:', JSON.stringify(config.data, null, 2));
      }
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle responses and errors globally
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError<any>) => {
    // Phase 3 endpoints that are expected to 404 (not yet implemented in backend)
    const phase3Endpoints = [
      '/projects/', // Followed by ID and /stats
      '/models/recent',
      '/activities/recent',
    ];

    const isPhase3Endpoint = phase3Endpoints.some(endpoint => 
      error.config?.url?.includes(endpoint)
    );

    // Only log detailed errors in development, not network errors or expected Phase 3 404s
    const isNetworkError = !error.response && error.request;
    const isExpectedPhase3Error = error.response?.status === 404 && isPhase3Endpoint;
    
    if (!isNetworkError && !isExpectedPhase3Error && import.meta.env.DEV) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
      });
    } else if (isExpectedPhase3Error && import.meta.env.DEV) {
      console.log('ℹ️ Phase 3 endpoint not yet implemented:', error.config?.url);
    }

    // Handle specific error codes
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          console.warn('⚠️ Unauthorized - Logging out');
          clearStorage();
          window.location.href = '/login';
          break;

        case 403:
          // Forbidden
          if (import.meta.env.DEV) console.warn('⚠️ Forbidden - Insufficient permissions');
          break;

        case 404:
          // Not Found - only log if not a Phase 3 endpoint
          if (!isExpectedPhase3Error && import.meta.env.DEV) {
            console.warn('⚠️ Resource not found');
          }
          break;

        case 422:
          // Validation Error
          if (import.meta.env.DEV) {
            console.warn('⚠️ Validation error:', errorData);
            console.warn('⚠️ Validation details:', JSON.stringify(errorData, null, 2));
          }
          break;

        case 429:
          // Too Many Requests
          console.warn('⚠️ Rate limit exceeded');
          break;

        case 500:
          // Internal Server Error
          console.error('❌ Server error:', errorData);
          break;

        case 503:
          // Service Unavailable
          console.error('❌ Service unavailable');
          break;

        default:
          if (import.meta.env.DEV) console.error('❌ Unknown error:', status, errorData);
      }

      // Return formatted error
      return Promise.reject({
        status,
        message: errorData?.message || error.message,
        errors: errorData?.errors || {},
        code: errorData?.code || 'UNKNOWN_ERROR',
      });
    }

    // Network error - silently return error object (fallback will handle it)
    if (error.request) {
      // Don't log every network error - it's expected when backend is down
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    }

    // Something else happened
    return Promise.reject({
      status: 0,
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    });
  }
);

/**
 * API Error Type
 */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

/**
 * API Response Type
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    totalPages?: number;
  };
}

/**
 * Helper function to handle API calls with try/catch
 */
export const apiCall = async <T = any>(
  request: Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> => {
  try {
    const response = await request;
    return response.data.data || response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

/**
 * Upload file with progress
 */
export const uploadFile = async (
  url: string,
  file: File,
  additionalData?: Record<string, any>,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  // Add additional data
  if (additionalData) {
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });
  }

  try {
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.data || response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

/**
 * Download file
 */
export const downloadFile = async (
  url: string,
  filename: string,
  params?: Record<string, any>
): Promise<void> => {
  try {
    const response = await apiClient.get(url, {
      params,
      responseType: 'blob',
    });

    // Create blob link to download
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    throw error as ApiError;
  }
};

/**
 * Export default client
 */
export default apiClient;

/**
 * Named export for convenience
 */
export { apiClient };