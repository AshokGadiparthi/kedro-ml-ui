// ============================================================================
// BROWSER CONSOLE TEST SCRIPT
// ============================================================================
// Copy and paste this into your browser console (F12) while on the Data Management page
// This will help diagnose what data your backend is actually returning

console.clear();
console.log('🔬 Backend Diagnostic Test Starting...\n');

// Test 1: Check if API client is available
console.log('='.repeat(80));
console.log('TEST 1: Checking API availability');
console.log('='.repeat(80));

try {
  // Try to import the API client
  const test = async () => {
    // Get current project from localStorage or context
    const workspacesStr = localStorage.getItem('workspaces');
    const workspaces = workspacesStr ? JSON.parse(workspacesStr) : [];
    const currentWorkspaceId = workspaces[0]?.id;
    
    console.log('📍 Current workspace ID:', currentWorkspaceId);
    
    if (!currentWorkspaceId) {
      console.error('❌ No workspace found! Please create a workspace first.');
      return;
    }
    
    // Make direct API call
    console.log('\n' + '='.repeat(80));
    console.log('TEST 2: Calling Backend API');
    console.log('='.repeat(80));
    console.log('🔄 Making request to: /api/datasets/');
    
    const response = await fetch('/api/datasets/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ API call failed!');
      console.error('Status:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST 3: Analyzing Backend Response');
    console.log('='.repeat(80));
    console.log('✅ API call successful!');
    console.log('📊 Total datasets returned:', data.length);
    console.log('\n📦 Raw backend response:', data);
    
    if (data.length === 0) {
      console.warn('\n⚠️  No datasets found!');
      console.log('This could mean:');
      console.log('  1. You haven\'t uploaded any datasets yet');
      console.log('  2. The backend is filtering by wrong workspace ID');
      console.log('  3. The database is empty');
      return;
    }
    
    // Analyze first dataset
    const firstDataset = data[0];
    console.log('\n' + '='.repeat(80));
    console.log('TEST 4: Analyzing First Dataset');
    console.log('='.repeat(80));
    console.log('📋 First dataset:', firstDataset);
    console.log('\n🔍 Field-by-field analysis:');
    
    const requiredFields = {
      'id': firstDataset.id,
      'name': firstDataset.name,
      'file_name': firstDataset.file_name,
      'file_size': firstDataset.file_size,
      'row_count': firstDataset.row_count,
      'column_count': firstDataset.column_count,
      'status': firstDataset.status,
      'workspace_id': firstDataset.workspace_id,
      'project_id': firstDataset.project_id,
      'created_at': firstDataset.created_at,
    };
    
    let missingFields = [];
    let presentFields = [];
    
    for (const [field, value] of Object.entries(requiredFields)) {
      const exists = value !== undefined && value !== null;
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${field}: ${exists ? value : 'MISSING'}`);
      
      if (!exists && ['row_count', 'column_count', 'file_size'].includes(field)) {
        missingFields.push(field);
      } else if (exists) {
        presentFields.push(field);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('DIAGNOSTIC SUMMARY');
    console.log('='.repeat(80));
    
    if (missingFields.length === 0) {
      console.log('✅ SUCCESS! All required fields are present.');
      console.log('📊 Your datasets should display correctly.');
      console.log('\n💡 If you still see N/A in the UI:');
      console.log('   1. Check browser console for transformer errors');
      console.log('   2. Verify the transformed data in console logs');
      console.log('   3. Try refreshing the page');
    } else {
      console.error('❌ PROBLEM DETECTED!');
      console.error('Missing critical fields:', missingFields.join(', '));
      console.log('\n🔧 HOW TO FIX:');
      console.log('=' + '='.repeat(79));
      
      if (missingFields.includes('row_count') || missingFields.includes('column_count')) {
        console.log('\n1️⃣  Add missing columns to database:');
        console.log('   Run this SQL:');
        console.log('   ALTER TABLE datasets ADD COLUMN row_count INTEGER DEFAULT 0;');
        console.log('   ALTER TABLE datasets ADD COLUMN column_count INTEGER DEFAULT 0;');
        console.log('   ALTER TABLE datasets ADD COLUMN status TEXT DEFAULT \'ACTIVE\';');
        
        console.log('\n2️⃣  Populate row_count and column_count:');
        console.log('   Run the update_existing_datasets.py script');
        console.log('   See: update_existing_datasets.py in project root');
      }
      
      console.log('\n3️⃣  Update your FastAPI endpoint:');
      console.log('   Make sure GET /api/datasets/ returns all these fields:');
      console.log('   ' + JSON.stringify(Object.keys(requiredFields), null, 2));
      
      console.log('\n4️⃣  See detailed examples:');
      console.log('   - BACKEND_FASTAPI_EXAMPLE.py');
      console.log('   - FIX_DATASETS_README.md');
    }
    
    // Alternative field names check
    console.log('\n' + '='.repeat(80));
    console.log('TEST 5: Checking Alternative Field Names');
    console.log('='.repeat(80));
    console.log('Backend might be using different field names (snake_case vs camelCase)');
    console.log('Available fields in response:', Object.keys(firstDataset));
    
    const alternativeNames = {
      'row_count': firstDataset.rowCount,
      'column_count': firstDataset.columnCount,
      'file_size': firstDataset.fileSize,
      'file_name': firstDataset.fileName,
      'original_filename': firstDataset.originalFilename || firstDataset.original_filename,
    };
    
    console.log('\nAlternative naming check:');
    for (const [field, value] of Object.entries(alternativeNames)) {
      if (value !== undefined && value !== null) {
        console.log(`  ⚠️  Found "${field}" as camelCase:`, value);
        console.log(`      Backend should use snake_case: ${field}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 DIAGNOSTIC COMPLETE');
    console.log('='.repeat(80));
    console.log('\n📚 Next steps:');
    console.log('   1. Review the output above');
    console.log('   2. Fix missing fields in backend');
    console.log('   3. Run update_existing_datasets.py to populate data');
    console.log('   4. Restart backend and refresh frontend');
    console.log('   5. Check Data Management page again');
  };
  
  test();
} catch (error) {
  console.error('❌ Test failed with error:', error);
  console.error(error.stack);
}
