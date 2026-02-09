/**
 * INTEGRATION GUIDE
 * Follow these steps to add improvements to ExploratoryDataAnalysisReal.tsx
 */

// ============================================================================
// STEP 1: Add imports at the top
// ============================================================================

// Add this after existing recharts imports (around line 27):
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';

// Add this after edaApi imports (around line 44):
import { MissingDataTab, ExportButton, OutlierCard, CategoricalDistribution } from './EDA_IMPROVEMENTS';
import { EnhancedOverview } from './EDA_ENHANCED_OVERVIEW';

// ============================================================================
// STEP 2: Update TabsList (around line 414)
// ============================================================================

// REPLACE:
<TabsList className="grid w-full grid-cols-6 h-auto">

// WITH:
<TabsList className="grid w-full grid-cols-7 h-auto">

// Then ADD this new tab after distributions tab (around line 440):
<TabsTrigger value="missing" className="gap-2 py-3">
  <AlertTriangle className="h-4 w-4" />
  <span className="hidden sm:inline">Missing Data</span>
  {quality && quality.metrics.missingValues > 0 && (
    <Badge variant="outline" className="ml-1 text-xs">
      {quality.metrics.missingValues}
    </Badge>
  )}
</TabsTrigger>

// ============================================================================
// STEP 3: Add Export Button to Overview Tab
// ============================================================================

// Find the Overview TabsContent (around line 460)
// ADD this before the summary cards:

{currentEdaId && (
  <div className="flex justify-end mb-4">
    <ExportButton edaId={currentEdaId} />
  </div>
)}

// ============================================================================
// STEP 4: Replace Overview Tab Content
// ============================================================================

// FIND the Overview TabsContent (around line 460)
// REPLACE the entire content with:

<TabsContent value="overview" className="space-y-6">
  {loading ? (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ) : summary ? (
    <>
      {currentEdaId && (
        <div className="flex justify-end mb-4">
          <ExportButton edaId={currentEdaId} />
        </div>
      )}
      <EnhancedOverview
        summary={summary}
        quality={quality}
        features={features}
        insights={insights}
      />
    </>
  ) : (
    <Card className="min-h-[300px] flex items-center justify-center">
      <div className="text-center p-8">
        <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analysis Found</h3>
        <p className="text-muted-foreground">Select a dataset and run analysis</p>
      </div>
    </Card>
  )}
</TabsContent>

// ============================================================================
// STEP 5: Add Missing Data Tab
// ============================================================================

// ADD this new TabsContent after Distributions tab (around line 1320):

<TabsContent value="missing" className="space-y-6">
  {loadingFeatures ? (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ) : (
    <MissingDataTab features={features} summary={summary} />
  )}
</TabsContent>

// ============================================================================
// STEP 6: Add Outlier Detection to Feature Details
// ============================================================================

// In Features tab, inside the feature detail card (around line 965)
// ADD this after the histogram chart:

{feature.dataType === 'NUMERIC' && (
  <div className="mt-4">
    <OutlierCard feature={feature} />
  </div>
)}

// ============================================================================
// STEP 7: Add Categorical Distribution Chart
// ============================================================================

// In Features tab, after categorical statistics (around line 990)
// ADD this:

{feature.dataType === 'CATEGORICAL' && currentEdaId && (
  <CategoricalDistribution feature={feature} edaId={currentEdaId} />
)}

// ============================================================================
// STEP 8: Improve Dark Mode Support
// ============================================================================

// Find quality badge (around line 424) and UPDATE:

<Badge variant="outline" className="ml-1 text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
  {quality.metrics.overallScore.toFixed(0)}%
</Badge>

// ============================================================================
// STEP 9: Add Responsive Grid Classes
// ============================================================================

// Find all instances of "grid grid-cols-2" or "grid grid-cols-3" and UPDATE to:
// grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Example (around line 470):
// REPLACE: <div className="grid grid-cols-4 gap-4">
// WITH: <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// ============================================================================
// STEP 10: Add Loading States
// ============================================================================

// For each chart, wrap with loading state:

{loadingFeatures ? (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
  </div>
) : (
  <ResponsiveContainer width="100%" height={250}>
    {/* Chart component */}
  </ResponsiveContainer>
)}

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
✅ Dark mode colors work correctly
✅ Mobile responsive (test at 375px, 768px, 1024px)
✅ Export buttons functional
✅ Missing Data tab shows correct data
✅ Outlier cards display for numeric features
✅ Categorical charts render properly
✅ No console errors
✅ All tabs load without breaking
✅ Hover states work
✅ Tooltips display correctly
*/

// ============================================================================
// BACKEND APIS TO IMPLEMENT
// ============================================================================

/*
Priority 1 (This Week):
- GET /api/eda/histogram/{edaId}/{featureName}
- GET /api/eda/categorical/{edaId}/{featureName}
- GET /api/eda/missing-pattern/{edaId}

Priority 2 (Next Week):
- GET /api/eda/outliers/{edaId}
- GET /api/eda/scatter/{edaId}?feature1=x&feature2=y

Priority 3 (Later):
- GET /api/eda/export/{edaId}/pdf
- GET /api/eda/export/{edaId}/csv
*/
