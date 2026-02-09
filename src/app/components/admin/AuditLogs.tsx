/**
 * Audit Logs Component
 * Security and compliance audit trail
 */
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  FileText,
  Search,
  Download,
  Filter,
  Clock,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  status: 'success' | 'failed' | 'warning';
  ipAddress: string;
  userAgent: string;
  details?: string;
}

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Mock audit logs
  const logs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      user: 'john@mlplatform.io',
      action: 'MODEL_DEPLOYED',
      resource: 'model',
      resourceId: 'model-123',
      status: 'success',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      details: 'Deployed model to production environment',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: 'jane@mlplatform.io',
      action: 'PROJECT_CREATED',
      resource: 'project',
      resourceId: 'proj-456',
      status: 'success',
      ipAddress: '192.168.1.101',
      userAgent: 'Chrome/120.0',
      details: 'Created new project: Customer Churn Analysis',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      user: 'bob@mlplatform.io',
      action: 'LOGIN_FAILED',
      resource: 'auth',
      resourceId: 'user-789',
      status: 'failed',
      ipAddress: '192.168.1.102',
      userAgent: 'Safari/17.0',
      details: 'Invalid credentials',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      user: 'alice@mlplatform.io',
      action: 'DATA_UPLOADED',
      resource: 'dataset',
      resourceId: 'data-321',
      status: 'success',
      ipAddress: '192.168.1.103',
      userAgent: 'Firefox/121.0',
      details: 'Uploaded dataset: customer_data.csv (12,450 rows)',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      user: 'charlie@mlplatform.io',
      action: 'PERMISSION_CHANGED',
      resource: 'user',
      resourceId: 'user-555',
      status: 'warning',
      ipAddress: '192.168.1.104',
      userAgent: 'Edge/120.0',
      details: 'Role changed from Viewer to Analyst',
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      user: 'john@mlplatform.io',
      action: 'MODEL_TRAINED',
      resource: 'model',
      resourceId: 'model-789',
      status: 'success',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      details: 'Trained XGBoost model with AutoML',
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      user: 'jane@mlplatform.io',
      action: 'PROJECT_DELETED',
      resource: 'project',
      resourceId: 'proj-111',
      status: 'warning',
      ipAddress: '192.168.1.101',
      userAgent: 'Chrome/120.0',
      details: 'Deleted project: Old Test Project',
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      user: 'bob@mlplatform.io',
      action: 'LOGIN_SUCCESS',
      resource: 'auth',
      resourceId: 'user-789',
      status: 'success',
      ipAddress: '192.168.1.102',
      userAgent: 'Safari/17.0',
      details: 'Successful login',
    },
  ];

  const actionConfig: Record<string, { icon: any; color: string }> = {
    MODEL_DEPLOYED: { icon: Activity, color: 'text-green-600' },
    MODEL_TRAINED: { icon: Activity, color: 'text-blue-600' },
    PROJECT_CREATED: { icon: Activity, color: 'text-blue-600' },
    PROJECT_DELETED: { icon: AlertCircle, color: 'text-orange-600' },
    DATA_UPLOADED: { icon: Activity, color: 'text-purple-600' },
    LOGIN_SUCCESS: { icon: CheckCircle, color: 'text-green-600' },
    LOGIN_FAILED: { icon: XCircle, color: 'text-red-600' },
    PERMISSION_CHANGED: { icon: AlertCircle, color: 'text-orange-600' },
  };

  const statusConfig = {
    success: { label: 'Success', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
    warning: { label: 'Warning', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleString();
  };

  const exportLogs = () => {
    // Mock export
    const csv = filteredLogs.map(log => 
      `${log.timestamp},${log.user},${log.action},${log.status},${log.details}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-logs.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all system activities and security events
          </p>
        </div>
        <Button onClick={exportLogs} className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Events</div>
          <div className="text-3xl font-bold">{logs.length}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Success</div>
          <div className="text-3xl font-bold text-green-600">
            {logs.filter(l => l.status === 'success').length}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Failed</div>
          <div className="text-3xl font-bold text-red-600">
            {logs.filter(l => l.status === 'failed').length}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Warnings</div>
          <div className="text-3xl font-bold text-orange-600">
            {logs.filter(l => l.status === 'warning').length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by user, action, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background"
          >
            <option value="all">All Actions</option>
            <option value="MODEL_DEPLOYED">Model Deployed</option>
            <option value="MODEL_TRAINED">Model Trained</option>
            <option value="PROJECT_CREATED">Project Created</option>
            <option value="PROJECT_DELETED">Project Deleted</option>
            <option value="DATA_UPLOADED">Data Uploaded</option>
            <option value="LOGIN_SUCCESS">Login Success</option>
            <option value="LOGIN_FAILED">Login Failed</option>
          </select>

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Advanced
          </Button>
        </div>
      </Card>

      {/* Logs Timeline */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredLogs.map((log, index) => {
            const ActionIcon = actionConfig[log.action]?.icon || Activity;
            const iconColor = actionConfig[log.action]?.color || 'text-gray-600';

            return (
              <div key={log.id} className="relative">
                {index < filteredLogs.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                )}
                
                <div className="flex gap-4">
                  <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <ActionIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          <Badge className={statusConfig[log.status].color}>
                            {statusConfig[log.status].label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {log.details && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-2">
                        <p className="text-sm">{log.details}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Resource: {log.resource}/{log.resourceId}</span>
                      <span>IP: {log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No audit logs found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
