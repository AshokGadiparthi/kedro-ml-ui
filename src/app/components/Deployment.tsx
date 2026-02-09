import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Rocket, Copy, ExternalLink, Settings, Clock, Activity, CheckCircle2, AlertCircle, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

const deployedModels = [
  {
    id: 'MODEL-001',
    name: 'Churn Prediction XGBoost',
    version: 'v1.2',
    endpoint: 'https://api.mlplatform.io/v1/churn-predict',
    status: 'Active',
    accuracy: 95.8,
    deployed: '2026-01-05',
    requests: 125000,
    latency: 45,
    uptime: 99.9
  },
  {
    id: 'MODEL-002',
    name: 'Fraud Detection NN',
    version: 'v2.0',
    endpoint: 'https://api.mlplatform.io/v1/fraud-detect',
    status: 'Active',
    accuracy: 94.5,
    deployed: '2026-01-03',
    requests: 98000,
    latency: 78,
    uptime: 99.8
  },
  {
    id: 'MODEL-003',
    name: 'Sentiment Analysis',
    version: 'v1.1',
    endpoint: 'https://api.mlplatform.io/v1/sentiment',
    status: 'Staging',
    accuracy: 91.3,
    deployed: '2026-01-07',
    requests: 5200,
    latency: 32,
    uptime: 100
  },
  {
    id: 'MODEL-004',
    name: 'Recommendation Engine',
    version: 'v3.2',
    endpoint: 'https://api.mlplatform.io/v1/recommend',
    status: 'Deprecated',
    accuracy: 89.2,
    deployed: '2025-12-15',
    requests: 12000,
    latency: 120,
    uptime: 98.5
  },
];

const modelVersions = [
  { version: 'v1.2', accuracy: 95.8, deployed: '2026-01-05', status: 'Production' },
  { version: 'v1.1', accuracy: 94.2, deployed: '2025-12-28', status: 'Archived' },
  { version: 'v1.0', accuracy: 92.5, deployed: '2025-12-15', status: 'Archived' },
];

export function Deployment() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Deployment</h1>
          <p className="text-muted-foreground mt-2">
            Deploy, manage, and monitor your ML models in production
          </p>
        </div>
        <Button className="gap-2">
          <Rocket className="h-4 w-4" />
          Deploy New Model
        </Button>
      </div>

      {/* Deployment Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              2 in staging
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Latency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">52ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">-8ms</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Uptime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deployed Models Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deployed Models</CardTitle>
          <CardDescription>Manage your production and staging models</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Requests/Day</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployedModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-muted-foreground">{model.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{model.version}</Badge>
                  </TableCell>
                  <TableCell>
                    {model.status === 'Active' && (
                      <Badge className="bg-green-600 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {model.status}
                      </Badge>
                    )}
                    {model.status === 'Staging' && (
                      <Badge className="bg-blue-600 gap-1">
                        <Activity className="h-3 w-3" />
                        {model.status}
                      </Badge>
                    )}
                    {model.status === 'Deprecated' && (
                      <Badge className="bg-gray-600 gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {model.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{model.accuracy}%</TableCell>
                  <TableCell>{model.requests.toLocaleString()}</TableCell>
                  <TableCell>{model.latency}ms</TableCell>
                  <TableCell>{model.uptime}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deployment Configuration */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deploy Model</CardTitle>
            <CardDescription>Configure deployment settings for your model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Model</Label>
              <Select defaultValue="exp-1245">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exp-1245">Churn Prediction XGBoost v1.2 (95.8%)</SelectItem>
                  <SelectItem value="exp-1244">Fraud Detection NN v2.0 (94.5%)</SelectItem>
                  <SelectItem value="exp-1243">Sentiment Analysis v1.1 (91.3%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Environment</Label>
              <Select defaultValue="production">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deployment Strategy</Label>
              <Select defaultValue="blue-green">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue-green">Blue-Green Deployment</SelectItem>
                  <SelectItem value="canary">Canary Release</SelectItem>
                  <SelectItem value="rolling">Rolling Update</SelectItem>
                  <SelectItem value="immediate">Immediate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Instance Type</Label>
              <Select defaultValue="compute-optimized">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpu-small">CPU Small (2 vCPU, 4GB RAM)</SelectItem>
                  <SelectItem value="cpu-medium">CPU Medium (4 vCPU, 8GB RAM)</SelectItem>
                  <SelectItem value="compute-optimized">Compute Optimized (8 vCPU, 16GB RAM)</SelectItem>
                  <SelectItem value="gpu-enabled">GPU Enabled (4 GPU, 32GB RAM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Instances</Label>
              <Input type="number" defaultValue="2" />
            </div>

            <div className="space-y-2">
              <Label>Max Instances</Label>
              <Input type="number" defaultValue="10" />
            </div>

            <Button className="w-full gap-2">
              <Rocket className="h-4 w-4" />
              Deploy Model
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Access your deployed model via API</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="endpoint">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
                <TabsTrigger value="code">Code Example</TabsTrigger>
              </TabsList>

              <TabsContent value="endpoint" className="space-y-4">
                <div className="space-y-2">
                  <Label>API Endpoint</Label>
                  <div className="flex gap-2">
                    <Input
                      value="https://api.mlplatform.io/v1/churn-predict"
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard('https://api.mlplatform.io/v1/churn-predict')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value="sk_live_a1b2c3d4e5f6g7h8i9j0"
                      type="password"
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard('sk_live_a1b2c3d4e5f6g7h8i9j0')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rate Limit</Label>
                  <Input value="1000 requests/minute" readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Timeout</Label>
                  <Input value="30 seconds" readOnly />
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View API Documentation
                </Button>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Python Example</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`import requests

url = "https://api.mlplatform.io/v1/churn-predict"
headers = {
    "Authorization": "Bearer sk_live_a1b2c3d4e5f6g7h8i9j0",
    "Content-Type": "application/json"
}
data = {
    "features": {
        "tenure": 24,
        "monthly_charges": 75.50,
        "total_charges": 1810.00,
        "contract_type": "Two year"
    }
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{`import requests

url = "https://api.mlplatform.io/v1/churn-predict"
headers = {
    "Authorization": "Bearer sk_live_...",
    "Content-Type": "application/json"
}
data = {
    "features": {
        "tenure": 24,
        "monthly_charges": 75.50,
        "total_charges": 1810.00,
        "contract_type": "Two year"
    }
}

response = requests.post(url, json=data, headers=headers)
print(response.json())

# Output:
# {
#   "prediction": 0,
#   "probability": 0.12,
#   "model_version": "v1.2"
# }`}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>Track model versions and deployments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Deployed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelVersions.map((version) => (
                <TableRow key={version.version}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{version.version}</span>
                    </div>
                  </TableCell>
                  <TableCell>{version.accuracy}%</TableCell>
                  <TableCell>{version.deployed}</TableCell>
                  <TableCell>
                    {version.status === 'Production' ? (
                      <Badge className="bg-green-600">{version.status}</Badge>
                    ) : (
                      <Badge variant="outline">{version.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {version.status === 'Archived' && (
                      <Button variant="outline" size="sm">
                        Rollback
                      </Button>
                    )}
                    {version.status === 'Production' && (
                      <Button variant="outline" size="sm">
                        View Logs
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
