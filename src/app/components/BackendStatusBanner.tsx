/**
 * Backend Status Banner
 * Shows a warning when backend is unreachable and using demo data
 */

import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { Button } from './ui/button';

export function BackendStatusBanner() {
  const { isUsingMockData, retryConnection } = useProject();
  const [dismissed, setDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await retryConnection();
    setRetrying(false);
  };

  if (!isUsingMockData || dismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-900">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Backend Unreachable - Using Demo Data
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Cannot connect to backend at{' '}
                <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">
                  {import.meta.env.VITE_API_URL || 'http://192.168.1.147:8080/api'}
                </code>
                . Check if your backend is running and CORS is configured.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retrying}
              className="gap-2 bg-white dark:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Retry'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="text-yellow-700 hover:text-yellow-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}