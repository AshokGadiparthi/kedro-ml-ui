/**
 * Batch Prediction Tab - Enhanced with validation preview and results
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { TabsContent } from '../ui/tabs';
import {
  Upload,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  FileText,
  AlertTriangle,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface BatchPredictionTabProps {
  selectedModel: string | null;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  batchValidation: any;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleBatchPredict: () => void;
  isLoading: boolean;
  batchProgress: number;
  batchResults: any;
  downloadTemplate: () => void;
}

export function BatchPredictionTab({
  selectedModel,
  uploadedFile,
  setUploadedFile,
  batchValidation,
  handleFileUpload,
  handleBatchPredict,
  isLoading,
  batchProgress,
  batchResults,
  downloadTemplate,
}: BatchPredictionTabProps) {
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
                  className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    uploadedFile
                      ? 'border-green-500 bg-green-500/5'
                      : 'border-border hover:border-primary hover:bg-muted/50'
                  }`}
                >
                  {uploadedFile ? (
                    <>
                      <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                      <div className="text-center">
                        <p className="text-lg font-medium mb-1 text-green-900 dark:text-green-100">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click to upload a different file
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <div className="text-center">
                        <p className="text-lg font-medium mb-1">
                          Drag & drop CSV file here
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">or click to browse</p>
                        <p className="text-xs text-muted-foreground">
                          Supported: .csv (max 100MB)
                        </p>
                      </div>
                    </>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    className="flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Template CSV
                  </Button>
                  {uploadedFile && (
                    <Button
                      variant="outline"
                      onClick={() => setUploadedFile(null)}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Validation Results */}
          {batchValidation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  Validation Results
                </CardTitle>
                <CardDescription>
                  Review data quality and validation warnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Validation Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Total Rows</div>
                    <div className="text-2xl font-bold text-blue-600">{batchValidation.totalRows}</div>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Valid Rows</div>
                    <div className="text-2xl font-bold text-green-600">{batchValidation.validRows}</div>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Invalid Rows</div>
                    <div className="text-2xl font-bold text-red-600">{batchValidation.invalidRows}</div>
                  </div>
                </div>

                {/* Warnings */}
                {batchValidation.warnings && batchValidation.warnings.length > 0 && (
                  <div className="space-y-2">
                    {batchValidation.warnings.map((warning: string, idx: number) => (
                      <Alert key={idx} variant={warning.includes('missing') ? 'destructive' : 'default'}>
                        {warning.includes('missing') ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{warning}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {/* Preview */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Preview (first 5 rows)
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            {batchValidation.columns.map((col: string) => (
                              <th key={col} className="p-3 text-left font-medium capitalize">
                                {col.replace(/_/g, ' ')}
                              </th>
                            ))}
                            <th className="p-3 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {batchValidation.preview.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-muted/50">
                              {batchValidation.columns.map((col: string) => (
                                <td key={col} className="p-3">
                                  {row[col] !== null && row[col] !== undefined 
                                    ? typeof row[col] === 'number' 
                                      ? row[col].toLocaleString() 
                                      : row[col]
                                    : <span className="text-muted-foreground">--</span>
                                  }
                                </td>
                              ))}
                              <td className="p-3">
                                {row.status === 'Valid' ? (
                                  <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-700 border-green-500/20">
                                    <CheckCircle className="h-3 w-3" />
                                    Valid
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                                    <AlertTriangle className="h-3 w-3" />
                                    {row.status}
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Run Prediction */}
          {batchValidation && !batchResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  Run Batch Prediction
                </CardTitle>
                <CardDescription>
                  Process all valid rows in your CSV file
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isLoading ? (
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleBatchPredict}
                  >
                    <Zap className="h-5 w-5" />
                    Run Batch Prediction ({batchValidation.validRows.toLocaleString()} rows)
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing predictions...
                      </span>
                      <span className="font-bold tabular-nums">{batchProgress}%</span>
                    </div>
                    <Progress value={batchProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Processing: {Math.floor((batchProgress / 100) * batchValidation.validRows).toLocaleString()} / {batchValidation.validRows.toLocaleString()} rows
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {batchResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Batch Prediction Results
                </CardTitle>
                <CardDescription>
                  ✅ Completed: {batchResults.total.toLocaleString()} predictions in {batchResults.processingTime}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Approved</div>
                        <div className="text-3xl font-bold text-green-600">
                          {batchResults.approved.toLocaleString()}
                        </div>
                      </div>
                      <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {((batchResults.approved / batchResults.total) * 100).toFixed(1)}% of total
                    </div>
                    <Progress 
                      value={(batchResults.approved / batchResults.total) * 100} 
                      className="h-1.5" 
                    />
                  </div>

                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Rejected</div>
                        <div className="text-3xl font-bold text-red-600">
                          {batchResults.rejected.toLocaleString()}
                        </div>
                      </div>
                      <XCircle className="h-10 w-10 text-red-600 opacity-20" />
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {((batchResults.rejected / batchResults.total) * 100).toFixed(1)}% of total
                    </div>
                    <Progress 
                      value={(batchResults.rejected / batchResults.total) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Average Confidence</div>
                      <div className="text-2xl font-bold">{batchResults.avgConfidence}%</div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>

                {/* Visual Distribution */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Result Distribution</h4>
                  <div className="flex h-8 rounded-lg overflow-hidden">
                    <div 
                      className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(batchResults.approved / batchResults.total) * 100}%` }}
                    >
                      {((batchResults.approved / batchResults.total) * 100) > 10 && 
                        `${((batchResults.approved / batchResults.total) * 100).toFixed(0)}%`
                      }
                    </div>
                    <div 
                      className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(batchResults.rejected / batchResults.total) * 100}%` }}
                    >
                      {((batchResults.rejected / batchResults.total) * 100) > 10 && 
                        `${((batchResults.rejected / batchResults.total) * 100).toFixed(0)}%`
                      }
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Approved: {batchResults.approved.toLocaleString()}</span>
                    <span>Rejected: {batchResults.rejected.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
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
                    /* Reset batch state */
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Process Another File
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </TabsContent>
  );
}
