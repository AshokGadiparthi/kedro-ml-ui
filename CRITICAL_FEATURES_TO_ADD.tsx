/**
 * 🔥 CRITICAL FEATURES TO ADD TO EDA
 * Copy these 3 code blocks into ExploratoryDataAnalysis.tsx
 */

// ====================================================================
// 1️⃣ BOX PLOT - Add after the Distribution Card in Features Tab
// Location: Line ~630, after </Card> for Distribution
// ====================================================================

{/* BOX PLOT - CRITICAL FEATURE! */}
{feature.type === 'numerical' && (
  <Card className="border-2 border-cyan-200 dark:border-cyan-900 shadow-lg">
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <Box className="h-4 w-4 text-cyan-600" />
        Box Plot & Outlier Detection
      </CardTitle>
      <CardDescription>Quartile distribution and outlier analysis</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Statistical Summary Grid */}
      <div className="grid grid-cols-5 gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg mb-6">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Min</div>
          <div className="font-bold text-lg">{feature.min}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Q1 (25%)</div>
          <div className="font-bold text-lg text-blue-600">{feature.q1}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Median</div>
          <div className="font-bold text-2xl text-primary">{feature.median}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Q3 (75%)</div>
          <div className="font-bold text-lg text-blue-600">{feature.q3}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Max</div>
          <div className="font-bold text-lg">{feature.max}</div>
        </div>
      </div>
      
      {/* Visual Box Plot */}
      <div className="relative h-32 my-8 px-4">
        {/* Whisker line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-400 -translate-y-1/2"></div>
        
        {/* Min whisker */}
        <div className="absolute top-1/2 w-0.5 h-16 bg-slate-600 -translate-y-1/2" style={{ left: '5%' }}></div>
        
        {/* Box (IQR) */}
        <div className="absolute top-1/2 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded shadow-lg -translate-y-1/2" style={{ left: '25%', right: '25%' }}>
          {/* Median line */}
          <div className="absolute inset-y-0 left-1/2 w-1 bg-white shadow-sm -translate-x-1/2"></div>
        </div>
        
        {/* Max whisker */}
        <div className="absolute top-1/2 w-0.5 h-16 bg-slate-600 -translate-y-1/2" style={{ right: '5%' }}></div>

        {/* Outliers */}
        {feature.hasOutliers && (
          <>
            <div className="absolute top-1/2 w-3 h-3 bg-red-500 rounded-full -translate-y-1/2 animate-pulse" style={{ left: '2%' }}></div>
            <div className="absolute top-1/2 w-3 h-3 bg-red-500 rounded-full -translate-y-1/2 animate-pulse" style={{ right: '2%' }}></div>
          </>
        )}
      </div>

      {/* Labels */}
      <div className="relative h-6 mb-6">
        <div className="absolute w-full flex justify-between text-xs text-muted-foreground px-2">
          <span>Min</span>
          <span>Q1</span>
          <span className="font-bold text-primary">Median</span>
          <span>Q3</span>
          <span>Max</span>
        </div>
      </div>

      {/* IQR Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">IQR (Q3 - Q1)</div>
          <div className="font-semibold text-xl">{feature.iqr}</div>
          <div className="text-xs text-muted-foreground mt-1">Interquartile range</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Outlier Bounds</div>
          <div className="font-semibold text-sm">
            [{(feature.q1! - 1.5 * feature.iqr!).toFixed(0)}, {(feature.q3! + 1.5 * feature.iqr!).toFixed(0)}]
          </div>
          <div className="text-xs text-muted-foreground mt-1">1.5 × IQR rule</div>
        </div>
      </div>

      {/* Outlier Actions */}
      {feature.hasOutliers ? (
        <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                ⚠️ {feature.outlierCount} outliers detected ({((feature.outlierCount! / 2450) * 100).toFixed(1)}%)
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Values beyond 1.5 × IQR may skew model predictions
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="default" size="sm" onClick={() => toast.success(`✅ ${feature.outlierCount} outliers removed`)}>
                  Remove outliers
                </Button>
                <Button variant="secondary" size="sm" onClick={() => toast.success('✅ Outliers winsorized at 95th percentile')}>
                  Winsorize (cap)
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast.success('✅ Log transformation applied')}>
                  Transform
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900 dark:text-green-100">
              ✓ No outliers detected - Clean distribution
            </span>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)}


// ====================================================================
// 2️⃣ MISSING DATA HEATMAP - Add to Overview Tab
// Location: After "Top Features by Importance" card (around line ~570)
// ====================================================================

{/* Missing Data Heatmap */}
<Card className="border-2 border-rose-200 dark:border-rose-900 shadow-lg">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Grid3x3 className="h-5 w-5 text-rose-600" />
      Missing Data Pattern
    </CardTitle>
    <CardDescription>
      Visual representation of missing values across features
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      {[
        { feature: 'employment_years', missing: [12, 8, 7, 5, 3], total: 35 },
        { feature: 'employment_type', missing: [4, 3, 2, 2, 1], total: 12 },
        { feature: 'age', missing: [0, 0, 0, 0, 0], total: 0 },
        { feature: 'annual_income', missing: [0, 0, 0, 0, 0], total: 0 },
        { feature: 'credit_score', missing: [0, 0, 0, 0, 0], total: 0 },
      ].map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="w-32 text-sm font-medium truncate">{item.feature}</div>
          <div className="flex-1 flex gap-1">
            {item.missing.map((count, i) => (
              <div
                key={i}
                className="flex-1 h-8 rounded transition-all hover:scale-105"
                style={{
                  backgroundColor: count === 0 ? '#10b981' : `rgba(239, 68, 68, ${Math.min(count / 15, 1)})`,
                }}
                title={`Rows ${i * 500}-${(i + 1) * 500}: ${count} missing`}
              ></div>
            ))}
          </div>
          <div className="w-16 text-right">
            <Badge variant={item.total === 0 ? 'default' : 'destructive'} className="text-xs">
              {item.total}
            </Badge>
          </div>
        </div>
      ))}
    </div>
    
    <div className="flex items-center justify-center gap-6 mt-6 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-6 h-4 bg-green-600 rounded"></div>
        <span>Complete</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-4 bg-red-300 rounded"></div>
        <span>Few Missing</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-4 bg-red-600 rounded"></div>
        <span>Many Missing</span>
      </div>
    </div>

    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold mb-1">Missing Pattern: MCAR (Missing Completely At Random)</div>
          <div className="text-sm text-muted-foreground">
            No systematic pattern detected. Missing values appear randomly distributed across rows.
            Safe to use imputation or deletion strategies.
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>


// ====================================================================
// 3️⃣ FEATURE-TARGET RELATIONSHIP - Add to Target Tab
// Location: Inside Target Tab, after class distribution (around line ~910)
// ====================================================================

{/* Feature-Target Relationships */}
<Card className="border-2 border-indigo-200 dark:border-indigo-900 shadow-lg">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <BarChart3 className="h-5 w-5 text-indigo-600" />
      Feature-Target Relationships
    </CardTitle>
    <CardDescription>
      How each feature relates to the target variable
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      {/* Top 4 numerical features */}
      {[
        { name: 'annual_income', approved_mean: 78500, rejected_mean: 42300, correlation: 0.78 },
        { name: 'credit_score', approved_mean: 715, rejected_mean: 625, correlation: 0.62 },
        { name: 'loan_amount', approved_mean: 165000, rejected_mean: 225000, correlation: 0.51 },
        { name: 'employment_years', approved_mean: 9.2, rejected_mean: 6.8, correlation: 0.42 },
      ].map((feat, idx) => (
        <div key={idx} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">{feat.name}</span>
            <Badge variant="secondary" className="text-xs">r={feat.correlation.toFixed(2)}</Badge>
          </div>
          
          {/* Bar comparison */}
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-green-700 dark:text-green-400">Approved</span>
                <span className="font-semibold">{feat.approved_mean.toLocaleString()}</span>
              </div>
              <div className="h-6 bg-green-600 rounded" style={{ width: '100%' }}></div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-red-700 dark:text-red-400">Rejected</span>
                <span className="font-semibold">{feat.rejected_mean.toLocaleString()}</span>
              </div>
              <div className="h-6 bg-red-600 rounded" style={{ width: `${(feat.rejected_mean / feat.approved_mean) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-center text-muted-foreground">
            {feat.approved_mean > feat.rejected_mean ? 
              `Approved has ${((feat.approved_mean / feat.rejected_mean - 1) * 100).toFixed(0)}% higher ${feat.name}` :
              `Rejected has ${((feat.rejected_mean / feat.approved_mean - 1) * 100).toFixed(0)}% higher ${feat.name}`
            }
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-emerald-600 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold mb-1">🎯 Key Insight</div>
          <div className="text-sm text-muted-foreground">
            Approved applications have significantly higher annual_income (+85.5%) and credit_score (+14.4%).
            These are your strongest predictive features.
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>


// ====================================================================
// IMPORTS TO ADD (at the top of file if not already present)
// ====================================================================

// Already imported: Box, Grid3x3, BarChart3, Sparkles, Info, AlertCircle, CheckCircle2

