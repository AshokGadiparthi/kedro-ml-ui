/**
 * Authentication Example Component
 * Demonstrates how to use the useAuth hook
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const AuthExample: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    clearError
  } = useAuth();

  const [email, setEmail] = useState('demo@mlplatform.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('demo_user');
  const [fullName, setFullName] = useState('Demo User');
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      console.log('✓ Login successful!');
    } catch (err) {
      console.error('✗ Login failed:', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await register({
        email,
        username,
        password,
        full_name: fullName
      });
      console.log('✓ Registration successful!');
      setShowRegister(false);
    } catch (err) {
      console.error('✗ Registration failed:', err);
    }
  };

  const handleLogout = () => {
    logout();
    console.log('✓ Logged out');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Authentication Example</h2>

      {/* Loading State */}
      {isLoading && (
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px' }}>
          Loading...
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: '10px', 
          background: '#fee', 
          color: '#c00', 
          marginBottom: '10px',
          borderRadius: '4px'
        }}>
          {error}
          <button onClick={clearError} style={{ marginLeft: '10px' }}>✕</button>
        </div>
      )}

      {/* Authenticated View */}
      {isAuthenticated && user ? (
        <div style={{ border: '2px solid #4caf50', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#4caf50' }}>✓ Authenticated</h3>
          <div style={{ marginBottom: '15px' }}>
            <strong>User Info:</strong>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ border: '2px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          {/* Toggle between Login/Register */}
          <div style={{ marginBottom: '15px' }}>
            <button
              onClick={() => setShowRegister(false)}
              style={{
                padding: '8px 16px',
                marginRight: '10px',
                background: !showRegister ? '#2196F3' : '#e0e0e0',
                color: !showRegister ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
            <button
              onClick={() => setShowRegister(true)}
              style={{
                padding: '8px 16px',
                background: showRegister ? '#2196F3' : '#e0e0e0',
                color: showRegister ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {!showRegister ? (
            <form onSubmit={handleLogin}>
              <h3>Login</h3>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister}>
              <h3>Register</h3>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Full Name:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Usage Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#f9f9f9', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>📝 Usage Instructions:</strong>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Use the demo credentials to login (pre-filled)</li>
          <li>Or register a new account</li>
          <li>Open browser console to see API calls</li>
          <li>If backend is unavailable, mock data is used automatically</li>
          <li>Token is stored in localStorage</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthExample;
