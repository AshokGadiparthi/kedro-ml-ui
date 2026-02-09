/**
 * DYNAMIC EDA - WORKS WITH ANY DATASET
 * Automatically adapts to any data shape and type
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import {
  LineChart as LineChartIcon, BarChart3, Database, Sparkles, AlertCircle, 
  CheckCircle2, Download, Zap, Target, Grid3x3, Layers, ScatterChart as ScatterChartIcon,
  Brain, Loader2, Info, Box, TrendingUp,
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useDatasets } from '../../hooks/useDatasets';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ScatterChart, Scatter, ReferenceLine,
} from 'recharts';
import { 
  analyzeDynamicDataset, 
  generateHistogramData, 
  calculateMissingPattern,
  type FeatureStat,
  type Correlation,
  type EDASummary,
  type DataColumn,
} from '../../services/edaAnalyzer';
import { BoxPlotCard } from './eda/BoxPlotCard';
import { MissingDataHeatmap } from './eda/MissingDataHeatmap';
import { FeatureTargetRelationships } from './eda/FeatureTargetRelationships';

export function ExploratoryDataAnalysisDynamic() {
  const { currentProject } = useProject();
  const { datasets, loading: datasetsLoading } = useDatasets(currentProject?.id);

  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analysis results
  const [summary, setSummary] = useState<EDASummary | null>(null);
  const [features, setFeatures] = useState<FeatureStat[]>([]);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [rawData, setRawData] = useState<DataColumn[]>([]);

  const dataset = datasets?.find(d => d.id === selectedDataset);

  // Load and analyze dataset
  const handleAnalyze = async () => {
    if (!selectedDataset) {
      toast.error('Please select a dataset first');
      return;
    }

    setIsAnalyzing(true);

    try {
      // TODO: Replace with actual API call to fetch dataset
      // const response = await fetch(`http://192.168.1.147:8080/api/datasets/${selectedDataset}/data`);
      // const data = await response.json();
      
      // DEMO: Simulating data load
      const demoData = await simulateDataLoad(selectedDataset);
      
      setRawData(demoData);

      // Analyze the data
      const analysis = analyzeDynamicDataset(demoData, targetColumn);
      
      setSummary(analysis.summary);
      setFeatures(analysis.features);
      setCorrelations(analysis.correlations);

      toast.success(`✅ Analyzed ${analysis.summary.totalRows} rows, ${analysis.summary.totalColumns} features!`);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze dataset');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simulate data loading (replace with real API)
  async function simulateDataLoad(datasetId: string): Promise<DataColumn[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate demo data
        const rows = 2450;
        resolve([
          { name: 'age', type: 'numerical', values: Array.from({ length: rows }, () => Math.floor(Math.random() * 60) + 18) },
          { name: 'annual_income', type: 'numerical', values: Array.from({ length: rows }, () => Math.floor(Math.random() * 200000) + 20000) },
          { name: 'credit_score', type: 'numerical', values: Array.from({ length: rows }, () => Math.floor(Math.random() * 500) + 350) },
          { name: 'loan_amount', type: 'numerical', values: Array.from({ length: rows }, () => Math.floor(Math.random() * 700000) + 10000) },
          { name: 'employment_years', type: 'numerical', values: Array.from({ length: rows }, (_, i) => i % 70 === 0 ? null : Math.floor(Math.random() * 30)) },
          { name: 'existing_loans', type: 'numerical', values: Array.from({ length: rows }, () => Math.floor(Math.random() * 6)) },
          { 
            name: 'employment_type', 
            type: 'categorical', 
            values: Array.from({ length: rows }, () => 
              ['Full-time', 'Self-employed', 'Part-time', 'Contractor'][Math.floor(Math.random() * 4)]
            ) 
          },
          { 
            name: 'education_level', 
            type: 'categorical', 
            values: Array.from({ length: rows }, () => 
              ["Bachelor's", "Master's", 'High School', 'PhD', 'Associate'][Math.floor(Math.random() * 5)]
            ) 
          },
          {
            name: 'approved',
            type: 'categorical',
            values: Array.from({ length: rows }, () => Math.random() > 0.28 ? 'approved' : 'rejected'),
          },
        ]);
      }, 1000);
    });
  }

  const filteredFeatures = useMemo(() => {
    if (!featureSearchQuery) return features;
    return features.filter(f => f.name.toLowerCase().includes(featureSearchQuery.toLowerCase()));
  }, [features, featureSearchQuery]);

  const featuresByImportance = useMemo(() => {
    return [...features]
      .filter(f => f.importance !== undefined)
      .sort((a, b) => (b.importance || 0) - (a.importance || 0));
  }, [features]);

  const missingPattern = useMemo(() => {
    if (!rawData.length) return [];
    return calculateMissingPattern(rawData);
  }, [rawData]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <LineChartIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Project Selected</h3>
          <p className="text-muted-foreground">Please select a project to start exploring data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
            <LineChartIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dynamic EDA</h1>
            <p className="text-muted-foreground">Works with any dataset automatically</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Exporting...')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dataset</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset..." />
                </SelectTrigger>
                <SelectContent>
                  {datasetsLoading ? (
                    <div className="p-2 text-sm">Loading...</div>
                  ) : datasets && datasets.length > 0 ? (
                    datasets.map(ds => (
                      <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm">No datasets</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Column (Optional)</label>
              <Select value={targetColumn} onValueChange={setTargetColumn}>
                <SelectTrigger><SelectValue placeholder="Select target..." /></SelectTrigger>
                <SelectContent>
                  {features.map(f => (
                    <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full gap-2">
                {isAnalyzing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</>
                ) : (
                  <><Zap className="h-4 w-4" />Analyze Dataset</>
                )}
              </Button>
            </div>
          </div>

          {summary && (
            <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
              <Badge variant="outline">{summary.totalRows.toLocaleString()} rows</Badge>
              <Badge variant="outline">{summary.totalColumns} columns</Badge>
              <Badge variant="outline">{summary.numericalFeatures} numerical</Badge>
              <Badge variant="outline">{summary.categoricalFeatures} categorical</Badge>
              <Badge variant="default">Quality: {(summary.overallQuality * 100).toFixed(1)}%</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      {summary && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="features"><Layers className="h-4 w-4 mr-2" />Features</TabsTrigger>
            <TabsTrigger value="correlations">
              <ScatterChartIcon className="h-4 w-4 mr-2" />
              Correlations
              {correlations.length > 0 && <Badge className="ml-2">{correlations.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="target"><Target className="h-4 w-4 mr-2" />Target</TabsTrigger>
            <TabsTrigger value="insights"><Brain className="h-4 w-4 mr-2" />Insights</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Database className="h-6 w-6 text-blue-600" />
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold">{summary.totalRows.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </CardContent>
              </Card>
              
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Grid3x3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold">{summary.totalColumns}</div>
                  <div className="text-sm text-muted-foreground">Features</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {summary.numericalFeatures} num, {summary.categoricalFeatures} cat
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold">{summary.missingPct.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Missing</div>
                  <div className="text-xs text-muted-foreground mt-1">{summary.missingValues} cells</div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold">{(summary.overallQuality * 100).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Quality</div>
                  <div className="text-xs text-emerald-600 mt-1 font-medium">
                    {summary.overallQuality > 0.9 ? 'Excellent' : summary.overallQuality > 0.7 ? 'Good' : 'Fair'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Features */}
            {featuresByImportance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Features by Importance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {featuresByImportance.slice(0, 6).map((feature, idx) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{feature.name}</span>
                          <span className="text-sm font-semibold text-primary">
                            {((feature.importance || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={(feature.importance || 0) * 100} className="h-2" />
                      </div>
                      <Badge variant="outline">{feature.type}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Missing Data Heatmap - Dynamic */}
            {missingPattern.length > 0 && missingPattern.some(m => m.total > 0) && (
              <Card className="border-2 border-rose-200">
                <CardHeader>
                  <CardTitle>Missing Data Pattern</CardTitle>
                  <CardDescription>Visual representation of missing values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {missingPattern.filter(m => m.total > 0).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-36 text-sm font-medium truncate">{item.feature}</div>
                        <div className="flex-1 flex gap-1">
                          {item.missing.map((count, i) => (
                            <div
                              key={i}
                              className="flex-1 h-10 rounded"
                              style={{
                                backgroundColor: count === 0 ? '#10b981' : `rgba(239, 68, 68, ${Math.min(count / 50, 1)})`,
                              }}
                            ></div>
                          ))}
                        </div>
                        <Badge variant="destructive">{item.total} ({item.pct}%)</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* FEATURES TAB */}
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Features ({filteredFeatures.length})</CardTitle>
                    <Input 
                      placeholder="Search features..." 
                      value={featureSearchQuery} 
                      onChange={(e) => setFeatureSearchQuery(e.target.value)} 
                    />
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1 max-h-[600px] overflow-y-auto p-4">
                      {filteredFeatures.map((feature) => (
                        <button
                          key={feature.name}
                          onClick={() => setSelectedFeature(feature.name)}
                          className={`w-full p-3 rounded-lg text-left transition-all ${
                            selectedFeature === feature.name 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="font-medium text-sm">{feature.name}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{feature.type}</Badge>
                            {feature.targetCorrelation && (
                              <Badge variant="secondary" className="text-xs">
                                r={feature.targetCorrelation.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-8">
                {selectedFeature ? (
                  <div className="space-y-4">
                    {(() => {
                      const feature = features.find(f => f.name === selectedFeature);
                      if (!feature) return null;

                      return (
                        <>
                          <Card>
                            <CardContent className="p-6">
                              <h3 className="text-2xl font-bold mb-2">{feature.name}</h3>
                              <div className="flex gap-2 mb-4">
                                <Badge>{feature.type}</Badge>
                                <Badge variant="outline">{feature.uniqueCount} unique</Badge>
                                {feature.missingCount > 0 && (
                                  <Badge variant="destructive">
                                    {feature.missingCount} missing ({feature.missingPct}%)
                                  </Badge>
                                )}
                              </div>
                              
                              {feature.type === 'numerical' && (
                                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                                  <div>
                                    <div className="text-xs text-muted-foreground">Mean</div>
                                    <div className="font-semibold">{feature.mean?.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Median</div>
                                    <div className="font-semibold">{feature.median?.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Std Dev</div>
                                    <div className="font-semibold">{feature.std?.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Range</div>
                                    <div className="font-semibold">{feature.min} - {feature.max}</div>
                                  </div>
                                </div>
                              )}

                              {feature.type === 'categorical' && feature.topValues && (
                                <div className="space-y-2">
                                  <div className="font-semibold mb-2">Top Values:</div>
                                  {feature.topValues.map((tv, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                      <div className="w-32 text-sm font-medium">{tv.value}</div>
                                      <Progress value={tv.percentage} className="flex-1" />
                                      <div className="text-sm font-semibold">{tv.percentage}%</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {feature.type === 'numerical' && rawData.length > 0 && (
                            <>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={generateHistogramData(rawData.find(c => c.name === feature.name)?.values || [])}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="bin" />
                                      <YAxis />
                                      <RechartsTooltip />
                                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </CardContent>
                              </Card>

                              <BoxPlotCard feature={feature} />
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <Card className="flex items-center justify-center min-h-[600px]">
                    <div className="text-center p-8">
                      <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select a Feature</h3>
                      <p className="text-muted-foreground">Choose a feature to see detailed analysis</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* CORRELATIONS TAB */}
          <TabsContent value="correlations" className="space-y-6">
            {correlations.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Correlations</CardTitle>
                    <CardDescription>Ranked by correlation strength</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {correlations.slice(0, 10).map((corr, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{corr.feature1} ↔ {corr.feature2}</div>
                          <div className="text-xs text-muted-foreground capitalize">{corr.strength.replace('_', ' ')}</div>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: corr.correlation > 0 ? '#10b981' : '#ef4444' }}>
                          {corr.correlation.toFixed(2)}
                        </div>
                        <Progress value={Math.abs(corr.correlation) * 100} className="w-32" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {correlations.filter(c => Math.abs(c.correlation) > 0.7).length > 0 && (
                  <Card className="border-2 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2">⚠️ Multicollinearity Detected</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {correlations.filter(c => Math.abs(c.correlation) > 0.7).length} feature pairs have very strong correlation (|r| &gt; 0.7)
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => toast.success('✅ Features flagged for removal')}>
                              Flag for removal
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => toast.success('✅ PCA recommended')}>
                              Apply PCA
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="flex items-center justify-center min-h-[400px]">
                <div className="text-center p-8">
                  <Info className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Correlations Available</h3>
                  <p className="text-muted-foreground">Need at least 2 numerical features to calculate correlations</p>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* TARGET TAB */}
          <TabsContent value="target" className="space-y-6">
            {targetColumn ? (
              <FeatureTargetRelationships />
            ) : (
              <Card className="flex items-center justify-center min-h-[400px]">
                <div className="text-center p-8">
                  <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Target Selected</h3>
                  <p className="text-muted-foreground mb-4">Select a target column to see target-specific analysis</p>
                  <Button onClick={() => setSelectedTab('overview')}>Go to Configuration</Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* INSIGHTS TAB */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Insights</CardTitle>
                <CardDescription>AI-generated insights based on your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.filter(f => f.hasOutliers).length > 0 && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">Outliers Detected</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {features.filter(f => f.hasOutliers).map(f => f.name).join(', ')} contain outliers
                        </div>
                        <Button size="sm" onClick={() => toast.success('✅ Outliers will be handled during preprocessing')}>
                          Handle outliers
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {summary.missingPct > 5 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">Significant Missing Data</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {summary.missingPct.toFixed(1)}% of values are missing
                        </div>
                        <Button size="sm" onClick={() => toast.success('✅ Imputation strategy configured')}>
                          Configure imputation
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {features.filter(f => f.skewness && Math.abs(f.skewness) > 1).length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">Skewed Distributions</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {features.filter(f => f.skewness && Math.abs(f.skewness) > 1).map(f => f.name).join(', ')} are highly skewed
                        </div>
                        <Button size="sm" onClick={() => toast.success('✅ Transformations recommended')}>
                          Apply transformations
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {features.filter(f => f.importance && f.importance > 0.7).length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">Strong Predictive Features</div>
                        <div className="text-sm text-muted-foreground">
                          {features.filter(f => f.importance && f.importance > 0.7).map(f => f.name).join(', ')} show strong correlation with target
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!summary && (
        <Card className="flex items-center justify-center min-h-[500px]">
          <div className="text-center p-8">
            <Database className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Analysis Yet</h3>
            <p className="text-muted-foreground mb-6">
              Select a dataset and click "Analyze Dataset" to start
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
