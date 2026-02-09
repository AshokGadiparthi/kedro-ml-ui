/**
 * Console Info
 * Display platform status information in console
 */

export function displayPlatformInfo() {
  if (!import.meta.env.DEV) return;

  const styles = {
    title: 'color: #3b82f6; font-size: 16px; font-weight: bold;',
    subtitle: 'color: #6b7280; font-size: 12px;',
    complete: 'color: #10b981; font-weight: bold;',
    pending: 'color: #f59e0b; font-weight: bold;',
    info: 'color: #6b7280;',
  };

  console.log('%c🚀 ML Platform - Enterprise ML Engine', styles.title);
  console.log('%cFrontend Version: Phase 0-2 Complete', styles.subtitle);
  console.log('');
  
  console.log('%c✅ Phase 0: Authentication & Workspaces', styles.complete);
  console.log('%c   • User registration and login', styles.info);
  console.log('%c   • Workspace management', styles.info);
  console.log('%c   • Multi-tenant support', styles.info);
  console.log('');
  
  console.log('%c✅ Phase 1: Project Management', styles.complete);
  console.log('%c   • Create and manage projects', styles.info);
  console.log('%c   • Project organization', styles.info);
  console.log('%c   • Team collaboration', styles.info);
  console.log('');
  
  console.log('%c✅ Phase 2: Data Ingestion', styles.complete);
  console.log('%c   • Data source configuration', styles.info);
  console.log('%c   • Dataset upload and processing', styles.info);
  console.log('%c   • Data preview and validation', styles.info);
  console.log('');
  
  console.log('%c⏳ Phase 3: Model Training & Evaluation (Coming Soon)', styles.pending);
  console.log('%c   • Model training workflows', styles.info);
  console.log('%c   • Performance metrics', styles.info);
  console.log('%c   • Model comparison', styles.info);
  console.log('%c   • Activity tracking', styles.info);
  console.log('');
  
  console.log('%cℹ️ Note: Phase 3 endpoints will return 404 or empty data until backend implementation is complete.', 'color: #6b7280; font-style: italic;');
  console.log('%c   This is expected behavior and handled gracefully by the frontend.', 'color: #6b7280; font-style: italic;');
  console.log('');
  console.log('%c📚 Documentation: /FRONTEND_PHASE_STATUS.md', 'color: #3b82f6;');
  console.log('');
}

export function displayPhase3Info() {
  if (!import.meta.env.DEV) return;

  console.group('%cℹ️ Phase 3 Endpoints Status', 'color: #f59e0b; font-weight: bold;');
  console.log('%cThe following endpoints are expected to return 404 until Phase 3 backend is implemented:', 'color: #6b7280;');
  console.log('%c  • GET /projects/{id}/stats', 'color: #6b7280; font-family: monospace;');
  console.log('%c  • GET /models/recent', 'color: #6b7280; font-family: monospace;');
  console.log('%c  • GET /activities/recent', 'color: #6b7280; font-family: monospace;');
  console.log('');
  console.log('%cFrontend will gracefully handle these by:', 'color: #6b7280;');
  console.log('%c  ✓ Showing empty states for models and activities', 'color: #10b981;');
  console.log('%c  ✓ Using placeholder data for statistics', 'color: #10b981;');
  console.log('%c  ✓ Displaying helpful "Coming Soon" messages', 'color: #10b981;');
  console.groupEnd();
  console.log('');
}
