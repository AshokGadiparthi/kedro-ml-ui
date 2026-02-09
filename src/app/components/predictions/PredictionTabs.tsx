/**
 * Prediction Tab Components - Batch, History, API Integration
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { TabsContent } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Code,
  RefreshCw,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface BatchTabProps {
  selectedModel: string | null;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  isLoading: boolean;
  batchProgress: number;
  batchResults: any;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleBatchPredict: () => void;
  copyToClipboard: (text: string) => void;
}

export function BatchTab({
  selectedModel,
  uploadedFile,
  setUploadedFile,
  isLoading,
  batchProgress,
  batchResults,
  handleFileUpload,
  handleBatchPredict,
  copyToClipboard,
}: BatchTabProps) {
  const downloadTemplate = () => {
    const csvContent = 'age,annual_income,credit_score,loan_amount,employment_years,existing_loans\n35,75000,720,250000,8,1\n42,92000,680,180000,12,0\n28,55000,750,120000,3,2';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prediction_template.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  return (
    <TabsContent value="batch" className="space-y-6 mt-6">
      {!selectedModel ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a deployed model above to start making batch predictions.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {/* Step 1: Upload Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                Upload Data
              </CardTitle>
              <CardDescription>
                Upload a CSV file with your data for batch prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Drag & Drop Area */}
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-all"
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <div className="text-center">
                    <p className="text-lg font-medium mb-1">
                      {uploadedFile ? uploadedFile.name : 'Drag & drop CSV file here'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">or click to browse</p>
                    <p className="text-xs text-muted-foreground">
                      Supported: .csv (max 100MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {uploadedFile && (
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Configure Options */}
          {uploadedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  Configure Options
                </CardTitle>
                <CardDescription>
                  Select what to include in the results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include confidence scores</Label>
                    <p className="text-sm text-muted-foreground">
                      Add confidence percentage for each prediction
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include probabilities</Label>
                    <p className="text-sm text-muted-foreground">
                      Add probability distribution for all classes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include feature explanations</Label>
                    <p className="text-sm text-muted-foreground">
                      Add SHAP values (slower processing)
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Run Prediction */}
          {uploadedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  Run Batch Prediction
                </CardTitle>
                <CardDescription>
                  Process all rows in your CSV file
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoading && !batchResults && (
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleBatchPredict}
                  >
                    <Zap className="h-5 w-5" />
                    Run Batch Prediction (1,500 rows)
                  </Button>
                )}

                {isLoading && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing predictions...</span>
                      <span className="font-bold">{batchProgress}%</span>
                    </div>
                    <Progress value={batchProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      This may take a few moments...
                    </p>
                  </div>
                )}

                {batchResults && (
                  <div className="space-y-6">
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-900 dark:text-green-100">
                        ✅ Completed: {batchResults.total} / {batchResults.total} predictions
                      </AlertDescription>
                    </Alert>

                    <div>
                      <h4 className="font-semibold mb-4">Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Approved</div>
                          <div className="text-2xl font-bold text-green-600">
                            {batchResults.approved}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {((batchResults.approved / batchResults.total) * 100).toFixed(1)}%
                          </div>
                          <Progress 
                            value={(batchResults.approved / batchResults.total) * 100} 
                            className="h-1 mt-2" 
                          />
                        </div>
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Rejected</div>
                          <div className="text-2xl font-bold text-red-600">
                            {batchResults.rejected}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {((batchResults.rejected / batchResults.total) * 100).toFixed(1)}%
                          </div>
                          <Progress 
                            value={(batchResults.rejected / batchResults.total) * 100} 
                            className="h-1 mt-2" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Avg Confidence</div>
                          <div className="text-xl font-bold">{batchResults.avgConfidence}%</div>
                        </div>
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 gap-2">
                        <Download className="h-4 w-4" />
                        Download Results (CSV)
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2">
                        <BarChart3 className="h-4 w-4" />
                        View Detailed Results
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        setUploadedFile(null);
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Process Another File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </TabsContent>
  );
}

// ============================================================================
// HISTORY TAB
// ============================================================================

interface HistoryTabProps {
  predictionHistory: any[];
  historyFilter: string;
  setHistoryFilter: (filter: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function HistoryTab({
  predictionHistory,
  historyFilter,
  setHistoryFilter,
  searchQuery,
  setSearchQuery,
}: HistoryTabProps) {
  const filteredHistory = predictionHistory.filter(item => {
    if (historyFilter !== 'all' && item.type !== historyFilter) return false;
    if (searchQuery && !item.model.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: predictionHistory.length,
    approved: predictionHistory.filter(h => h.result.includes('Approved')).length,
    rejected: predictionHistory.filter(h => h.result.includes('Rejected') || h.result.includes('Risk')).length,
  };

  return (
    <TabsContent value="history" className="space-y-6 mt-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search predictions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={historyFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHistoryFilter('all')}
              >
                All
              </Button>
              <Button
                variant={historyFilter === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHistoryFilter('single')}
              >
                Single
              </Button>
              <Button
                variant={historyFilter === 'batch' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHistoryFilter('batch')}
              >
                Batch
              </Button>
              <Button
                variant={historyFilter === 'api' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHistoryFilter('api')}
              >
                API
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Predictions</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.approved}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.approved / stats.total) * 100).toFixed(0)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.rejected / stats.total) * 100).toFixed(0)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
          <CardDescription>Your prediction history and results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const typeConfig = {
                single: { icon: Target, color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'Single' },
                batch: { icon: Upload, color: 'text-purple-600', bg: 'bg-purple-500/10', label: 'Batch' },
                api: { icon: Code, color: 'text-green-600', bg: 'bg-green-500/10', label: 'API' },
              };
              const config = typeConfig[item.type as keyof typeof typeConfig];
              const Icon = config.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className={`${config.bg} p-3 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                    </div>
                    <p className="font-medium">{item.model}</p>
                    <p className="text-sm text-muted-foreground">
                      Result: <span className="font-medium text-foreground">{item.result}</span>
                      {item.confidence > 0 && ` (${item.confidence}% confidence)`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          <Button variant="outline" className="w-full gap-2">
            <Download className="h-4 w-4" />
            Export All History (CSV)
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

// ============================================================================
// API TAB
// ============================================================================

interface APITabProps {
  selectedModel: string | null;
  selectedLanguage: string;
  setSelectedLanguage: (lang: any) => void;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
  codeSnippets: Record<string, string>;
  copyToClipboard: (text: string) => void;
}

export function APITab({
  selectedModel,
  selectedLanguage,
  setSelectedLanguage,
  showApiKey,
  setShowApiKey,
  codeSnippets,
  copyToClipboard,
}: APITabProps) {
  const mockApiKey = 'sk_live_7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u';

  return (
    <TabsContent value="api" className="space-y-6 mt-6">
      {/* API Endpoint */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint</CardTitle>
          <CardDescription>Use this endpoint to make predictions from your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
              POST https://api.mlplatform.io/v1/models/{selectedModel || 'MODEL_ID'}/predict
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(`https://api.mlplatform.io/v1/models/${selectedModel || 'MODEL_ID'}/predict`)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>Keep this key secret and never share it publicly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
              {showApiKey ? mockApiKey : '●'.repeat(40)}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(mockApiKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Keep this key secret. Do not share in public repositories or client-side code.
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Regenerate API Key
          </Button>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>Copy and paste these examples into your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selector */}
          <div className="flex gap-2">
            {['python', 'javascript', 'curl', 'java'].map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLanguage(lang)}
                className="capitalize"
              >
                {lang}
              </Button>
            ))}
          </div>

          {/* Code Snippet */}
          <div className="relative">
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
              <code className="text-sm font-mono">
                {codeSnippets[selectedLanguage as keyof typeof codeSnippets]}
              </code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 gap-2"
              onClick={() => copyToClipboard(codeSnippets[selectedLanguage as keyof typeof codeSnippets])}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test API */}
      <Card>
        <CardHeader>
          <CardTitle>Test API</CardTitle>
          <CardDescription>Send a test request to verify your integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Request</Label>
              <Textarea
                className="font-mono text-sm h-48"
                defaultValue={JSON.stringify({
                  features: {
                    age: 35,
                    annual_income: 75000,
                    credit_score: 720,
                    loan_amount: 250000,
                    employment_years: 8,
                    existing_loans: 1,
                  }
                }, null, 2)}
              />
            </div>
            <div>
              <Label className="mb-2 block">Response</Label>
              <Textarea
                className="font-mono text-sm h-48 bg-muted"
                value={JSON.stringify({
                  prediction: 'approved',
                  confidence: 0.873,
                  probabilities: {
                    approved: 0.873,
                    rejected: 0.127,
                  }
                }, null, 2)}
                readOnly
              />
            </div>
          </div>
          <Button className="w-full gap-2">
            <Zap className="h-4 w-4" />
            Send Test Request
          </Button>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Learn more about using the prediction API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              View Full API Documentation
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Code className="h-4 w-4" />
              Interactive API Explorer
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Info className="h-4 w-4" />
              Rate Limits & Usage
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
