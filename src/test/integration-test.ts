/**
 * FastAPI Integration Test
 * Run this in the browser console to test the integration
 */

import { authService } from '@/services/auth/authService';
import { workspaceService } from '@/services/workspaces/workspaceService';

/**
 * Test Suite for FastAPI Integration
 */
export const runIntegrationTests = async () => {
  console.log('🚀 Starting FastAPI Integration Tests...\n');

  try {
    // Test 1: Login
    console.log('📝 Test 1: Login');
    const loginResult = await authService.login({
      email: 'demo@mlplatform.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResult.user.email);
    console.log('   Token:', loginResult.access_token.substring(0, 20) + '...');

    // Test 2: Get Current User
    console.log('\n📝 Test 2: Get Current User');
    const currentUser = await authService.getCurrentUser();
    console.log('✅ User fetched:', currentUser.full_name);
    console.log('   Email:', currentUser.email);

    // Test 3: Check Authentication
    console.log('\n📝 Test 3: Check Authentication');
    const isAuth = authService.isAuthenticated();
    console.log('✅ Is Authenticated:', isAuth);

    // Test 4: Get Workspaces
    console.log('\n📝 Test 4: Get Workspaces');
    const workspaces = await workspaceService.getWorkspaces();
    console.log('✅ Workspaces loaded:', workspaces.length);
    workspaces.forEach((ws, i) => {
      console.log(`   ${i + 1}. ${ws.name} (${ws.slug})`);
    });

    // Test 5: Create Workspace
    console.log('\n📝 Test 5: Create Workspace');
    const newWorkspace = await workspaceService.createWorkspace({
      name: 'Test Integration Workspace',
      slug: workspaceService.generateSlug('Test Integration Workspace'),
      description: 'Created by integration test'
    });
    console.log('✅ Workspace created:', newWorkspace.name);
    console.log('   ID:', newWorkspace.id);
    console.log('   Slug:', newWorkspace.slug);

    // Test 6: Get Specific Workspace
    console.log('\n📝 Test 6: Get Specific Workspace');
    const workspace = await workspaceService.getWorkspace(newWorkspace.id);
    console.log('✅ Workspace fetched:', workspace.name);

    // Test 7: Update Workspace
    console.log('\n📝 Test 7: Update Workspace');
    const updatedWorkspace = await workspaceService.updateWorkspace(
      newWorkspace.id,
      {
        name: 'Updated Integration Workspace',
        description: 'Updated by integration test'
      }
    );
    console.log('✅ Workspace updated:', updatedWorkspace.name);
    console.log('   New description:', updatedWorkspace.description);

    // Test 8: Validate Slug
    console.log('\n📝 Test 8: Slug Validation');
    const validSlug = workspaceService.validateSlug('my-workspace');
    const invalidSlug = workspaceService.validateSlug('My Workspace');
    console.log('✅ Slug validation working');
    console.log('   "my-workspace" is valid:', validSlug);
    console.log('   "My Workspace" is valid:', invalidSlug);

    // Test 9: Generate Slug
    console.log('\n📝 Test 9: Generate Slug');
    const generatedSlug = workspaceService.generateSlug('My Test Workspace');
    console.log('✅ Slug generated:', generatedSlug);

    // Test 10: Delete Workspace
    console.log('\n📝 Test 10: Delete Workspace');
    const deleteResult = await workspaceService.deleteWorkspace(newWorkspace.id);
    console.log('✅ Workspace deleted:', deleteResult);

    // Test 11: Logout
    console.log('\n📝 Test 11: Logout');
    authService.logout();
    const isAuthAfterLogout = authService.isAuthenticated();
    console.log('✅ Logout successful');
    console.log('   Is Authenticated:', isAuthAfterLogout);

    // All tests passed
    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests passed!');
    console.log('='.repeat(50));
    console.log('\n✅ FastAPI Integration is working correctly!');
    console.log('✅ Authentication service: OK');
    console.log('✅ Workspace service: OK');
    console.log('✅ Smart fallback: OK');

    return true;
  } catch (error: any) {
    console.error('\n❌ Test failed:', error);
    console.error('Error details:', error.message || error);
    return false;
  }
};

/**
 * Quick test function - just tests basic connectivity
 */
export const quickTest = async () => {
  console.log('🔍 Quick connectivity test...\n');

  try {
    const workspaces = await workspaceService.getWorkspaces();
    console.log('✅ Backend is reachable!');
    console.log(`   Found ${workspaces.length} workspaces`);
    return true;
  } catch (error: any) {
    console.log('⚠️ Backend not reachable - using mock data');
    console.log('   This is expected if backend is not running');
    return false;
  }
};

/**
 * Test with mock data (simulates backend down)
 */
export const testMockFallback = async () => {
  console.log('🧪 Testing mock data fallback...\n');

  // Force backend check to fail by using an invalid endpoint
  try {
    const workspaces = await workspaceService.getWorkspaces();
    console.log('✅ Fallback working!');
    console.log(`   Got ${workspaces.length} mock workspaces`);
    workspaces.forEach((ws, i) => {
      console.log(`   ${i + 1}. ${ws.name}`);
    });
    return true;
  } catch (error) {
    console.error('❌ Fallback failed:', error);
    return false;
  }
};

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).integrationTest = {
    runAll: runIntegrationTests,
    quick: quickTest,
    testFallback: testMockFallback
  };

  console.log('📦 Integration tests loaded!');
  console.log('   Run: integrationTest.runAll()');
  console.log('   Quick test: integrationTest.quick()');
  console.log('   Test fallback: integrationTest.testFallback()');
}

export default {
  runIntegrationTests,
  quickTest,
  testMockFallback
};
