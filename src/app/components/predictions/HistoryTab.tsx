/**
 * History Tab - Enhanced with filters and detail modal
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { TabsContent } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  Target,
  Upload,
  Code,
  Eye,
  RotateCw,
  Copy,
  Calendar,
  Filter,
  BarChart3,
} from 'lucide-react';

interface HistoryTabProps {
  predictionHistory: any[];
  filteredHistory: any[];
  historyFilter: string;
  setHistoryFilter: (filter: any) => void;
  historyDateRange: string;
  setHistoryDateRange: (range: string) => void;
  historyModelFilter: string;
  setHistoryModelFilter: (filter: string) => void;
  historyResultFilter: string;
  setHistoryResultFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedHistoryItem: any;
  setSelectedHistoryItem: (item: any) => void;
  deployedModels: any[];
}

export function HistoryTab({
  predictionHistory,
  filteredHistory,
  historyFilter,
  setHistoryFilter,
  historyDateRange,
  setHistoryDateRange,
  historyModelFilter,
  setHistoryModelFilter,
  historyResultFilter,
  setHistoryResultFilter,
  searchQuery,
  setSearchQuery,
  selectedHistoryItem,
  setSelectedHistoryItem,
  deployedModels,
}: HistoryTabProps) {
  const stats = {
    total: predictionHistory.length,
    approved: predictionHistory.filter(h => h.predictedClass?.includes('Approved') || h.predictedLabel?.includes('Approved')).length,
    rejected: predictionHistory.filter(h => h.predictedClass?.includes('Rejected') || h.predictedLabel?.includes('Rejected')).length,
  };

  const typeConfig = {
    single: { icon: Target, color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'Single', borderColor: 'border-blue-500/20' },
    batch: { icon: Upload, color: 'text-purple-600', bg: 'bg-purple-500/10', label: 'Batch', borderColor: 'border-purple-500/20' },
    api: { icon: Code, color: 'text-green-600', bg: 'bg-green-500/10', label: 'API', borderColor: 'border-green-500/20' },
  };

  return (
    <>
      <TabsContent value="history" className="space-y-6 mt-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search and Date Range */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search predictions..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={historyDateRange} onValueChange={setHistoryDateRange}>
                    <SelectTrigger className="w-[150px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Type and Model Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2">
                  <Button
                    variant={historyFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('all')}
                  >
                    All Types
                  </Button>
                  <Button
                    variant={historyFilter === 'single' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('single')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Single
                  </Button>
                  <Button
                    variant={historyFilter === 'batch' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('batch')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Batch
                  </Button>
                  <Button
                    variant={historyFilter === 'api' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('api')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    API
                  </Button>
                </div>

                <div className="flex gap-2 flex-1">
                  <Select value={historyModelFilter} onValueChange={setHistoryModelFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Models</SelectItem>
                      {deployedModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={historyResultFilter} onValueChange={setHistoryResultFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results</SelectItem>
                      <SelectItem value="approved">✅ Approved</SelectItem>
                      <SelectItem value="rejected">❌ Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <BarChart3 className="h-6 w-6 text-blue-600" />
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
                    {stats.total > 0 ? `${((stats.approved / stats.total) * 100).toFixed(0)}%` : '0%'} of total
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
                    {stats.total > 0 ? `${((stats.rejected / stats.total) * 100).toFixed(0)}%` : '0%'} of total
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prediction History</CardTitle>
                <CardDescription>
                  Showing {filteredHistory.length} of {predictionHistory.length} predictions
                </CardDescription>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export History
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredHistory.map((item) => {
                // Safely get the type config with fallback
                const itemType = (item.type || item.predictionType || 'single').toLowerCase();
                const config = typeConfig[itemType as keyof typeof typeConfig] || typeConfig.single;
                const Icon = config.icon;

                return (
                  <div
                    key={item.id || item.predictionId}
                    className={`flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors ${config.borderColor}`}
                  >
                    <div className={`${config.bg} p-3 rounded-lg`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{item.timestamp || item.timestampLabel}</span>
                      </div>
                      <p className="font-medium">{item.model || item.modelName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          Result:{' '}
                          <span className={`font-medium ${
                            (item.predictedClass?.includes('Approved') || item.predictedLabel?.includes('Approved')) ? 'text-green-600' : 
                            (item.predictedClass?.includes('Rejected') || item.predictedLabel?.includes('Rejected')) ? 'text-red-600' : 
                            'text-foreground'
                          }`}>
                            {item.predictedLabel || item.predictedClass || 'N/A'}
                          </span>
                          {item.confidence > 0 && (
                            <span className="text-muted-foreground">
                              {' '}({item.confidence}% confidence)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setSelectedHistoryItem(item)}
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                  </div>
                );
              })}

              {filteredHistory.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No predictions found matching your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Prediction Detail Modal */}
      <Dialog open={!!selectedHistoryItem} onOpenChange={() => setSelectedHistoryItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Prediction Details
              {selectedHistoryItem && (() => {
                const itemType = (selectedHistoryItem.type || selectedHistoryItem.predictionType || 'single').toLowerCase();
                const config = typeConfig[itemType as keyof typeof typeConfig] || typeConfig.single;
                return (
                  <Badge variant="outline">
                    {config.label}
                  </Badge>
                );
              })()}
            </DialogTitle>
            <DialogDescription>
              {selectedHistoryItem?.timestampFull || selectedHistoryItem?.timestampLabel}
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryItem && (
            <div className="space-y-6">
              {/* Model Info */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Model</h4>
                <p className="text-sm">{selectedHistoryItem.model || selectedHistoryItem.modelName}</p>
              </div>

              <Separator />

              {/* Input Features (if available) */}
              {selectedHistoryItem.inputs && (
                <>
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Input Features</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedHistoryItem.inputs).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 bg-muted rounded-lg">
                          <div className="text-xs text-muted-foreground capitalize mb-1">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="font-medium">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Result */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Result</h4>
                <div className={`p-6 rounded-lg border-2 ${
                  (selectedHistoryItem.predictedClass?.includes('Approved') || selectedHistoryItem.predictedLabel?.includes('Approved'))
                    ? 'bg-green-500/10 border-green-500/20'
                    : (selectedHistoryItem.predictedClass?.includes('Rejected') || selectedHistoryItem.predictedLabel?.includes('Rejected'))
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-muted border-border'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${
                        (selectedHistoryItem.predictedClass?.includes('Approved') || selectedHistoryItem.predictedLabel?.includes('Approved')) ? 'text-green-600' :
                        (selectedHistoryItem.predictedClass?.includes('Rejected') || selectedHistoryItem.predictedLabel?.includes('Rejected')) ? 'text-red-600' :
                        'text-foreground'
                      }`}>
                        {selectedHistoryItem.predictedLabel || selectedHistoryItem.predictedClass || 'N/A'}
                      </div>
                      {selectedHistoryItem.confidence > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Confidence: {selectedHistoryItem.confidence}%
                        </div>
                      )}
                    </div>
                    {(selectedHistoryItem.predictedClass?.includes('Approved') || selectedHistoryItem.predictedLabel?.includes('Approved')) ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (selectedHistoryItem.predictedClass?.includes('Rejected') || selectedHistoryItem.predictedLabel?.includes('Rejected')) ? (
                      <XCircle className="h-8 w-8 text-red-600" />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Batch Details */}
              {selectedHistoryItem.type === 'batch' && selectedHistoryItem.details && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Batch Summary</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-xs text-muted-foreground mb-1">Approved</div>
                        <div className="text-xl font-bold text-green-600">
                          {selectedHistoryItem.details.approved?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="text-xs text-muted-foreground mb-1">Rejected</div>
                        <div className="text-xl font-bold text-red-600">
                          {selectedHistoryItem.details.rejected?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <RotateCw className="h-4 w-4" />
                  Re-run Prediction
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}