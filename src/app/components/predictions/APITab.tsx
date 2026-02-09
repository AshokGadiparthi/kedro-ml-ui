/**
 * API Integration Tab - Enhanced with usage statistics
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { TabsContent } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import {
  Code,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  FileText,
  Info,
  AlertCircle,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface APITabProps {
  selectedModel: string | null;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: any) => void;
  codeSnippets: Record<string, string>;
  copyToClipboard: (text: string) => void;
  apiUsageStats: {
    today: number;
    thisMonth: number;
    avgLatency: number;
    rateLimit: number;
    currentUsage: number;
  };
}

export function APITab({
  selectedModel,
  showApiKey,
  setShowApiKey,
  selectedLanguage,
  setSelectedLanguage,
  codeSnippets,
  copyToClipboard,
  apiUsageStats,
}: APITabProps) {
  const mockApiKey = 'sk_live_7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u';

  const usagePercentage = (apiUsageStats.currentUsage / apiUsageStats.rateLimit) * 100;

  return (
    <TabsContent value="api" className="space-y-6 mt-6">
      {/* API Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Usage Statistics
          </CardTitle>
          <CardDescription>Monitor your API usage and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Today</span>
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">{apiUsageStats.today}</div>
              <div className="text-xs text-muted-foreground mt-1">API calls</div>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">This Month</span>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{apiUsageStats.thisMonth.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">API calls</div>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg Latency</span>
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">{apiUsageStats.avgLatency}ms</div>
              <div className="text-xs text-muted-foreground mt-1">response time</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Rate Limit</span>
              <span className="text-sm font-bold">
                {apiUsageStats.currentUsage} / {apiUsageStats.rateLimit.toLocaleString()} requests/hour
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {usagePercentage.toFixed(0)}% of hourly limit used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoint */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint</CardTitle>
          <CardDescription>Use this endpoint to make predictions from your application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
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
              <label className="text-sm font-medium mb-2 block">Request</label>
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
              <label className="text-sm font-medium mb-2 block">Response</label>
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
