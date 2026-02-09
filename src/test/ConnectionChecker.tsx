/**
 * Connection Checker
 * Quick utility to verify backend connectivity
 */

import React, { useState, useEffect } from 'react';
import apiClient from '../services/api/client';
import { config } from '../config/environment';

export const ConnectionChecker: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Checking connection...');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [serverInfo, setServerInfo] = useState<any>(null);

  const checkConnection = async () => {
    setStatus('checking');
    setMessage('Checking connection...');
    setResponseTime(null);
    setServerInfo(null);

    const startTime = Date.now();

    try {
      // Test health endpoint
      const response = await apiClient.get('/health');
      const endTime = Date.now();
      
      setStatus('connected');
      setMessage('✅ Backend is connected!');
      setResponseTime(endTime - startTime);
      setServerInfo(response.data);
    } catch (error: any) {
      setStatus('error');
      
      if (error.code === 'ECONNABORTED') {
        setMessage('❌ Connection timeout - Backend is not responding');
      } else if (error.code === 'ERR_NETWORK') {
        setMessage('❌ Network error - Cannot reach backend server');
      } else if (error.response) {
        setMessage(`❌ Server error: ${error.response.status} - ${error.response.statusText}`);
      } else {
        setMessage(`❌ Connection failed: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'error': return '#f44336';
      case 'checking': return '#ff9800';
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        margin: '20px',
        border: `3px solid ${getStatusColor()}`,
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            marginRight: '10px',
            animation: status === 'checking' ? 'pulse 1.5s infinite' : 'none',
          }}
        />
        <h2 style={{ margin: 0 }}>Backend Connection Status</h2>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: getStatusColor() }}>
          {message}
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '15px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Backend URL</h3>
        <code style={{ fontSize: '14px' }}>{config.api.baseURL}</code>
        <br />
        <a
          href={config.api.baseURL.replace('/api', '/swagger-ui.html')}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '12px', marginTop: '10px', display: 'inline-block' }}
        >
          Open Swagger UI →
        </a>
      </div>

      {responseTime !== null && (
        <div style={{ marginBottom: '15px' }}>
          <p>
            <strong>Response Time:</strong> {responseTime}ms
          </p>
        </div>
      )}

      {serverInfo && (
        <details style={{ marginBottom: '15px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Server Info
          </summary>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              marginTop: '10px',
            }}
          >
            {JSON.stringify(serverInfo, null, 2)}
          </pre>
        </details>
      )}

      <button
        onClick={checkConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Recheck Connection
      </button>

      {status === 'error' && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffc107',
          }}
        >
          <h4 style={{ marginTop: 0 }}>Troubleshooting Steps:</h4>
          <ol style={{ lineHeight: '1.8', fontSize: '14px' }}>
            <li>
              Verify backend is running:
              <br />
              <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>
                curl http://192.168.1.147:8000/health
              </code>
            </li>
            <li>
              Check CORS configuration in your Spring Boot backend
            </li>
            <li>
              Ensure your machine can reach <code>192.168.1.147</code>
              <br />
              <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>
                ping 192.168.1.147
              </code>
            </li>
            <li>
              Check if the port <code>8080</code> is open in VirtualBox
            </li>
          </ol>
        </div>
      )}

      {status === 'connected' && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#d4edda',
            borderRadius: '4px',
            border: '1px solid #c3e6cb',
          }}
        >
          <h4 style={{ marginTop: 0, color: '#155724' }}>🎉 Connection Successful!</h4>
          <p style={{ color: '#155724', fontSize: '14px' }}>
            Your frontend is successfully connected to the backend. You can now:
          </p>
          <ul style={{ color: '#155724', fontSize: '14px', lineHeight: '1.8' }}>
            <li>Use the API Tester to test all endpoints</li>
            <li>Start integrating API calls in your components</li>
            <li>Use the React hooks from <code>/src/hooks</code></li>
          </ul>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ConnectionChecker;