import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Clock, Cpu } from 'lucide-react';
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const performanceData = [
  { time: '00:00', accuracy: 95.8, latency: 45, throughput: 1200 },
  { time: '04:00', accuracy: 95.6, latency: 48, throughput: 950 },
  { time: '08:00', accuracy: 95.4, latency: 52, throughput: 2100 },
  { time: '12:00', accuracy: 95.2, latency: 58, throughput: 2800 },
  { time: '16:00', accuracy: 94.8, latency: 62, throughput: 3200 },
  { time: '20:00', accuracy: 94.5, latency: 55, throughput: 2400 },
];

const driftData = [
  { date: 'Jan 1', feature_drift: 0.02, prediction_drift: 0.01, label_drift: 0.00 },
  { date: 'Jan 2', feature_drift: 0.03, prediction_drift: 0.02, label_drift: 0.01 },
  { date: 'Jan 3', feature_drift: 0.04, prediction_drift: 0.03, label_drift: 0.02 },
  { date: 'Jan 4', feature_drift: 0.06, prediction_drift: 0.05, label_drift: 0.03 },
  { date: 'Jan 5', feature_drift: 0.09, prediction_drift: 0.07, label_drift: 0.05 },
  { date: 'Jan 6', feature_drift: 0.12, prediction_drift: 0.10, label_drift: 0.08 },
  { date: 'Jan 7', feature_drift: 0.15, prediction_drift: 0.13, label_drift: 0.11 },
];

const resourceUsage = [
  { time: '00:00', cpu: 35, memory: 42, gpu: 28 },
  { time: '04:00', cpu: 28, memory: 38, gpu: 22 },
  { time: '08:00', cpu: 58, memory: 65, gpu: 52 },
  { time: '12:00', cpu: 75, memory: 78, gpu: 68 },
  { time: '16:00', cpu: 82, memory: 85, gpu: 78 },
  { time: '20:00', cpu: 65, memory: 68, gpu: 58 },
];

const errorDistribution = [
  { type: 'Timeout', count: 24 },
  { type: 'Invalid Input', count: 18 },
  { type: 'Model Error', count: 12 },
  { type: 'API Limit', count: 8 },
  { type: 'Network', count: 6 },
];

const alerts = [
  {
    id: 'ALT-245',
    severity: 'high',
    type: 'Data Drift',
    message: 'Feature drift detected above threshold (15%)',
    model: 'Churn Prediction XGBoost v1.2',
    timestamp: '2026-01-08 14:23:45',
    status: 'Active'
  },
  {
    id: 'ALT-244',
    severity: 'medium',
    type: 'Performance',
    message: 'Accuracy dropped below 95%',
    model: 'Churn Prediction XGBoost v1.2',
    timestamp: '2026-01-08 12:15:22',
    status: 'Active'
  },
  {
    id: 'ALT-243',
    severity: 'low',
    type: 'Latency',
    message: 'Average latency increased by 20%',
    model: 'Fraud Detection NN v2.0',
    timestamp: '2026-01-08 10:45:11',
    status: 'Resolved'
  },
  {
    id: 'ALT-242',
    severity: 'high',
    type: 'Error Rate',
    message: 'Error rate spiked to 5.2%',
    model: 'Sentiment Analysis v1.1',
    timestamp: '2026-01-08 09:30:05',
    status: 'Resolved'
  },
];

export function Monitoring() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Monitor model performance, drift, and health in real-time
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">11/12</span> models operational
            </p>
            <Progress value={91.6} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-1.3%</span> last 24h
            </p>
            <Progress value={94.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              1 high, 1 medium severity
            </p>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-red-600 text-xs">High: 1</Badge>
              <Badge className="bg-yellow-600 text-xs">Med: 1</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">55ms</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+8ms</span> vs target (47ms)
            </p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Real-time model performance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="accuracy">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
              <TabsTrigger value="latency">Latency</TabsTrigger>
              <TabsTrigger value="throughput">Throughput</TabsTrigger>
            </TabsList>

            <TabsContent value="accuracy" className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[90, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} name="Accuracy %" />
                  <Line
                    type="monotone"
                    data={performanceData.map(d => ({ ...d, threshold: 95 }))}
                    dataKey="threshold"
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    name="Threshold"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-center text-sm text-muted-foreground">
                Current accuracy: <span className="font-bold text-foreground">94.5%</span> • 
                Target: <span className="font-bold text-foreground">95.0%</span>
              </div>
            </TabsContent>

            <TabsContent value="latency" className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="latency" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Latency (ms)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="text-center text-sm text-muted-foreground">
                Average latency: <span className="font-bold text-foreground">55ms</span> • 
                P95: <span className="font-bold text-foreground">78ms</span> • 
                P99: <span className="font-bold text-foreground">95ms</span>
              </div>
            </TabsContent>

            <TabsContent value="throughput" className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="throughput" fill="#f59e0b" name="Requests/min" />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center text-sm text-muted-foreground">
                Peak throughput: <span className="font-bold text-foreground">3,200 req/min</span> • 
                Average: <span className="font-bold text-foreground">2,117 req/min</span>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Data Drift Detection */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Drift Detection</CardTitle>
            <CardDescription>Monitor distribution changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={driftData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="feature_drift" stroke="#3b82f6" strokeWidth={2} name="Feature Drift" />
                <Line type="monotone" dataKey="prediction_drift" stroke="#22c55e" strokeWidth={2} name="Prediction Drift" />
                <Line type="monotone" dataKey="label_drift" stroke="#f59e0b" strokeWidth={2} name="Label Drift" />
                <Line
                  type="monotone"
                  data={driftData.map(d => ({ ...d, threshold: 0.1 }))}
                  dataKey="threshold"
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  name="Alert Threshold"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Feature Drift</span>
                <Badge variant="destructive">High (15%)</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prediction Drift</span>
                <Badge className="bg-yellow-600">Medium (13%)</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Label Drift</span>
                <Badge className="bg-yellow-600">Medium (11%)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>Compute resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={resourceUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="CPU %" />
                <Area type="monotone" dataKey="memory" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Memory %" />
                <Area type="monotone" dataKey="gpu" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="GPU %" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">CPU</div>
                <div className="text-xl font-bold">65%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Memory</div>
                <div className="text-xl font-bold">68%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">GPU</div>
                <div className="text-xl font-bold">58%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Error Distribution</CardTitle>
          <CardDescription>Breakdown of errors in the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={errorDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="type" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ef4444" name="Error Count" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Total errors: <span className="font-bold text-foreground">68</span> • 
              Error rate: <span className="font-bold text-foreground">0.28%</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Model health and performance alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-4 border rounded-lg p-4">
                <div className="flex-shrink-0">
                  {alert.severity === 'high' && (
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                  {alert.severity === 'medium' && (
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                  )}
                  {alert.severity === 'low' && (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.type}</span>
                        {alert.severity === 'high' && (
                          <Badge variant="destructive">High</Badge>
                        )}
                        {alert.severity === 'medium' && (
                          <Badge className="bg-yellow-600">Medium</Badge>
                        )}
                        {alert.severity === 'low' && (
                          <Badge variant="outline">Low</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{alert.model}</span>
                        <span>•</span>
                        <span>{alert.timestamp}</span>
                        <span>•</span>
                        <span className="font-mono">{alert.id}</span>
                      </div>
                    </div>
                    <div>
                      {alert.status === 'Active' ? (
                        <Badge className="bg-red-600 gap-1">
                          <Activity className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
