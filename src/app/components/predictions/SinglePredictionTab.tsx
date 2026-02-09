/**
 * Single Prediction Tab - Enhanced with validation and rich results
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { TabsContent } from '../ui/tabs';
import {
  FileText,
  RotateCw,
  Zap,
  Loader2,
  Target,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Info,
  Copy,
  Download,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

interface SinglePredictionTabProps {
  selectedModel: string | null;
  featureSchema: any[];
  predictionInputs: any;
  setPredictionInputs: (inputs: any) => void;
  predictionResult: any;
  isLoading: boolean;
  handlePredict: () => void;
  loadSampleData: () => void;
  resetForm: () => void;
  copyToClipboard: (text: string) => void;
  validateField: (name: string, value: number) => any;
}

export function SinglePredictionTab({
  selectedModel,
  featureSchema,
  predictionInputs,
  setPredictionInputs,
  predictionResult,
  isLoading,
  handlePredict,
  loadSampleData,
  resetForm,
  copyToClipboard,
  validateField,
}: SinglePredictionTabProps) {
  return (
    <TabsContent value="single" className="space-y-6 mt-6">
      {!selectedModel ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a deployed model above to start making predictions.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Input Features</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadSampleData}>
                    <FileText className="h-4 w-4 mr-2" />
                    Load Sample
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Enter values for all required features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureSchema.map((feature) => {
                const value = predictionInputs[feature.name];
                const validation = value ? validateField(feature.name, Number(value)) : null;

                return (
                  <div key={feature.name} className="space-y-2">
                    <Label htmlFor={feature.name} className="flex items-center gap-2">
                      <span className="capitalize">{feature.name.replace(/_/g, ' ')}</span>
                      {feature.required && <span className="text-red-500">*</span>}
                      <span className="text-xs text-muted-foreground">({feature.description})</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id={feature.name}
                        type="number"
                        placeholder={`Enter ${feature.name.replace(/_/g, ' ')}`}
                        value={value || ''}
                        onChange={(e) =>
                          setPredictionInputs({
                            ...predictionInputs,
                            [feature.name]: parseFloat(e.target.value) || '',
                          })
                        }
                        min={feature.min}
                        max={feature.max}
                        className={
                          validation
                            ? validation.type === 'error'
                              ? 'border-red-500'
                              : validation.type === 'warning'
                              ? 'border-yellow-500'
                              : 'border-green-500'
                            : ''
                        }
                      />
                      {validation && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {validation.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {validation.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                          {validation.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                        </div>
                      )}
                    </div>
                    {validation && validation.message && (
                      <p
                        className={`text-xs ${
                          validation.type === 'error'
                            ? 'text-red-600'
                            : validation.type === 'warning'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {validation.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Typical range: {feature.typicalRange}
                    </p>
                  </div>
                );
              })}

              <Separator className="my-6" />

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handlePredict}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Make Prediction
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Prediction Result */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction Result</CardTitle>
              <CardDescription>
                Model output and confidence analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!predictionResult ? (
                <div className="flex items-center justify-center py-16 text-center text-muted-foreground">
                  <div>
                    <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No prediction yet</p>
                    <p className="text-sm mt-2">Fill in the features and click "Make Prediction"</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Main Result */}
                  <div 
                    className={`p-6 rounded-lg border-2 ${
                      predictionResult.prediction === 'Approved'
                        ? 'bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20'
                        : 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Prediction</span>
                      {predictionResult.prediction === 'Approved' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${
                      predictionResult.prediction === 'Approved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {predictionResult.prediction}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Confidence: {(predictionResult.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  {/* Probability Breakdown */}
                  <div className="space-y-3">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Probability Distribution
                    </div>
                    {Object.entries(predictionResult.probabilities).map(([label, prob]: [string, any]) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span className="capitalize font-medium">{label}</span>
                          <span className="font-bold">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              label === 'approved' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Feature Importance */}
                  {predictionResult.explanation && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Top Contributing Factors
                        </div>
                        <div className="space-y-2">
                          {predictionResult.explanation.map((exp: any, idx: number) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                exp.direction === 'positive' || exp.impact > 0
                                  ? 'bg-green-500/5 border-green-500/20'
                                  : 'bg-red-500/5 border-red-500/20'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {exp.direction === 'positive' || exp.impact > 0 ? (
                                  <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
                                ) : (
                                  <TrendingDown className="h-5 w-5 text-red-600 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{exp.feature}</div>
                                  <div className="text-xs text-muted-foreground">Value: {exp.value}</div>
                                </div>
                              </div>
                              <span
                                className={`text-sm font-bold tabular-nums ${
                                  exp.direction === 'positive' || exp.impact > 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {exp.impact > 0 ? '+' : ''}
                                {exp.impact}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        const result = JSON.stringify(predictionResult, null, 2);
                        copyToClipboard(result);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Result
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        /* Save to history functionality */
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={resetForm}
                    >
                      <RotateCw className="h-4 w-4" />
                      New
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </TabsContent>
  );
}

// Missing import
import { BarChart3 } from 'lucide-react';
