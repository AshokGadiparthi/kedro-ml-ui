/**
 * API Tester Component
 * Visual UI to test all backend API endpoints
 * Use this to verify integration and debug issues
 */

import React, { useState } from 'react';
import apiClient from '../services/api/client';
import { config } from '../config/environment';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'pending';
  statusCode?: number;
  responseTime?: number;
  data?: any;
  error?: string;
}

export const ApiTester: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateResult = (endpoint: string, method: string, result: Partial<TestResult>) => {
    setResults(prev => {
      const existing = prev.findIndex(r => r.endpoint === endpoint && r.method === method);
      const newResult = { endpoint, method, ...result } as TestResult;
      
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newResult;
        return updated;
      }
      return [...prev, newResult];
    });
  };

  const testEndpoint = async (
    endpoint: string,
    method: string,
    testFn: () => Promise<any>
  ) => {
    updateResult(endpoint, method, { status: 'pending' });
    const startTime = Date.now();
    
    try {
      const response = await testFn();
      const responseTime = Date.now() - startTime;
      
      updateResult(endpoint, method, {
        status: 'success',
        statusCode: response.status,
        responseTime,
        data: response.data,
      });
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      updateResult(endpoint, method, {
        status: 'error',
        statusCode: error.response?.status,
        responseTime,
        error: error.response?.data?.message || error.message,
      });
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    // 1. Health Check
    await testEndpoint('/api', 'GET', () => apiClient.get('/'));
    await testEndpoint('/health', 'GET', () => apiClient.get('/health'));

    // 2. Projects
    await testEndpoint('/api/projects', 'GET', () => apiClient.get('/projects'));

    // 3. Datasets
    await testEndpoint('/api/datasets', 'GET', () => apiClient.get('/datasets'));

    // 4. Algorithms
    await testEndpoint('/api/algorithms', 'GET', () => apiClient.get('/algorithms'));

    // 5. Models
    await testEndpoint('/api/models', 'GET', () => apiClient.get('/models'));

    // 6. Training Jobs
    await testEndpoint('/api/training/jobs', 'GET', () => apiClient.get('/training/jobs'));

    // 7. Predictions History
    await testEndpoint('/api/predictions/history', 'GET', () => apiClient.get('/predictions/history'));

    setTesting(false);
  };

  const testCreateProject = async () => {
    await testEndpoint('/api/projects', 'POST', () =>
      apiClient.post('/projects', {
        name: 'Test Project ' + Date.now(),
        description: 'Created by API Tester',
      })
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 ML Platform API Tester</h1>
      <p>Backend URL: <strong>{config.api.baseURL}</strong></p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={runAllTests}
          disabled={testing}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: testing ? 'not-allowed' : 'pointer',
            marginRight: '10px',
          }}
        >
          {testing ? 'Testing...' : 'Run All Tests'}
        </button>

        <button
          onClick={testCreateProject}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Test Create Project
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <h2>Test Results ({results.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  Endpoint
                </th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  Method
                </th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  Status
                </th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  Code
                </th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  Time
                </th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>
                  Response
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
                    {result.endpoint}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: result.method === 'GET' ? '#e3f2fd' : '#fff3e0',
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}
                    >
                      {result.method}
                    </span>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <span
                      style={{
                        color: getStatusColor(result.status),
                        fontWeight: 'bold',
                      }}
                    >
                      {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳'}{' '}
                      {result.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {result.statusCode || '-'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {result.responseTime ? `${result.responseTime}ms` : '-'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '11px' }}>
                    {result.error ? (
                      <span style={{ color: 'red' }}>{result.error}</span>
                    ) : result.data ? (
                      <details>
                        <summary style={{ cursor: 'pointer' }}>View Data</summary>
                        <pre
                          style={{
                            backgroundColor: '#f5f5f5',
                            padding: '10px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            maxHeight: '200px',
                            marginTop: '5px',
                          }}
                        >
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <h3>Summary</h3>
            <p>
              ✅ Success: {results.filter(r => r.status === 'success').length} |{' '}
              ❌ Failed: {results.filter(r => r.status === 'error').length} |{' '}
              ⏳ Pending: {results.filter(r => r.status === 'pending').length}
            </p>
            <p>
              Average Response Time:{' '}
              {results.filter(r => r.responseTime).length > 0
                ? Math.round(
                    results
                      .filter(r => r.responseTime)
                      .reduce((sum, r) => sum + (r.responseTime || 0), 0) /
                      results.filter(r => r.responseTime).length
                  )
                : 0}
              ms
            </p>
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
        <h3>🔧 Troubleshooting</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>CORS Error?</strong> Your backend needs to allow <code>http://localhost:3000</code>
          </li>
          <li>
            <strong>Network Error?</strong> Check if backend is running: <code>http://192.168.1.147:8000/health</code>
          </li>
          <li>
            <strong>404 Errors?</strong> Endpoint might not exist yet in your backend
          </li>
          <li>
            <strong>All tests pass?</strong> 🎉 Integration is working perfectly!
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <h3>📋 Next Steps After Testing</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>If all tests pass, start integrating with your actual UI components</li>
          <li>Use the hooks from <code>/src/hooks/useProjects.ts</code></li>
          <li>Import services from <code>/src/services</code></li>
          <li>Check the examples in <code>/API_INTEGRATION_COMPLETE.md</code></li>
        </ol>
      </div>
    </div>
  );
};

export default ApiTester;