/**
 * Environment Configuration
 * Centralized configuration for API endpoints and environment variables
 */

// Helper function to safely get environment variables (Vite uses import.meta.env)
const getEnv = (key: string, defaultValue: string = ''): string => {
  // In Vite, environment variables are accessed via import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || defaultValue;
  }
  return defaultValue;
};

export const config = {
  // API Configuration
  api: {
    baseURL: getEnv('VITE_API_URL', 'http://192.168.1.147:8000'),
    timeout: 30000, // 30 seconds
    withCredentials: false, // Set to true if using cookies
  },

  // Feature Flags
  features: {
    useMockData: getEnv('VITE_USE_MOCK_DATA') === 'true' || false,
    enableAnalytics: getEnv('VITE_ENABLE_ANALYTICS') === 'true' || false,
    enableWebSocket: getEnv('VITE_ENABLE_WEBSOCKET') === 'true' || false,
  },

  // Environment
  env: getEnv('MODE', 'development'),
  isDevelopment: getEnv('MODE') === 'development' || getEnv('DEV') === 'true',
  isProduction: getEnv('MODE') === 'production' || getEnv('PROD') === 'true',

  // WebSocket (for real-time updates)
  websocket: {
    url: getEnv('VITE_WS_URL', 'ws://localhost:8080/ws'),
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  },

  // Storage
  storage: {
    authTokenKey: 'ml_platform_auth_token',
    userKey: 'ml_platform_user',
    themeKey: 'ml_platform_theme',
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },

  // File Upload
  upload: {
    maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
    allowedFormats: ['.csv', '.json', '.xlsx', '.xls', '.parquet'],
    chunkSize: 1024 * 1024, // 1MB chunks for large files
  },

  // Training
  training: {
    pollingInterval: 2000, // Poll job status every 2 seconds
    maxPollingTime: 3600000, // Stop polling after 1 hour
  },

  // Predictions
  predictions: {
    batchPollingInterval: 5000, // Poll batch job every 5 seconds
  },
};

/**
 * Get API base URL
 */
export const getApiBaseUrl = (): string => {
  return config.api.baseURL;
};

/**
 * Check if using mock data
 */
export const useMockData = (): boolean => {
  return config.features.useMockData;
};

/**
 * Get auth token from storage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(config.storage.authTokenKey);
};

/**
 * Set auth token in storage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(config.storage.authTokenKey, token);
};

/**
 * Remove auth token from storage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(config.storage.authTokenKey);
};

/**
 * Get current user from storage
 */
export const getCurrentUser = (): any => {
  const user = localStorage.getItem(config.storage.userKey);
  return user ? JSON.parse(user) : null;
};

/**
 * Set current user in storage
 */
export const setCurrentUser = (user: any): void => {
  localStorage.setItem(config.storage.userKey, JSON.stringify(user));
};

/**
 * Remove current user from storage
 */
export const removeCurrentUser = (): void => {
  localStorage.removeItem(config.storage.userKey);
};

/**
 * Clear all storage
 */
export const clearStorage = (): void => {
  removeAuthToken();
  removeCurrentUser();
};

export default config;