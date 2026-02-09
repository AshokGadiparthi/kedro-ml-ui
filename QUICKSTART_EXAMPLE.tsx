/**
 * QUICK START EXAMPLE
 * Copy this code to your /src/app/App.tsx to test the integration
 */

import React from 'react';
import { ConnectionChecker } from './test/ConnectionChecker';
import { ApiTester } from './test/ApiTester';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0 }}>🤖 ML Platform - Backend Integration Test</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Testing connection to http://192.168.1.147:8080/api
        </p>
      </header>

      {/* Connection Checker */}
      <ConnectionChecker />

      {/* API Tester */}
      <div style={{ padding: '0 20px 20px 20px' }}>
        <ApiTester />
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          ✅ Once all tests pass, you can start integrating the API into your components!
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
          See /TESTING_GUIDE.md for detailed instructions
        </p>
      </footer>
    </div>
  );
}

export default App;

/**
 * STEP 1: Copy this code to /src/app/App.tsx
 * 
 * STEP 2: Make sure CORS is configured in your backend:
 * 
 * @Configuration
 * public class CorsConfig {
 *     @Bean
 *     public WebMvcConfigurer corsConfigurer() {
 *         return new WebMvcConfigurer() {
 *             @Override
 *             public void addCorsMappings(CorsRegistry registry) {
 *                 registry.addMapping("/api/**")
 *                     .allowedOrigins("http://localhost:3000")
 *                     .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
 *                     .allowedHeaders("*")
 *                     .allowCredentials(false);
 *             }
 *         };
 *     }
 * }
 * 
 * STEP 3: Start your app:
 * npm start
 * 
 * STEP 4: Check the Connection Checker:
 * ✅ Green = Connected!
 * ❌ Red = Check CORS or backend connection
 * 
 * STEP 5: Run API Tests:
 * Click "Run All Tests" button
 * ✅ All green = Integration working!
 * ❌ Any red = Check those specific endpoints
 * 
 * STEP 6: Once everything passes:
 * - Remove ConnectionChecker and ApiTester
 * - Start building your actual UI
 * - Use the hooks from /src/hooks
 * - Import services from /src/services
 * 
 * Example:
 * 
 * import { useProjects } from './hooks/useProjects';
 * 
 * function MyComponent() {
 *   const { projects, loading, error } = useProjects();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       {projects.map(p => (
 *         <div key={p.id}>{p.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 */
