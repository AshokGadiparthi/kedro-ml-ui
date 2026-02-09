/**
 * Model Interpretability Component
 * SHAP, LIME, PDP, ICE, and other explainability tools
 * Enterprise-grade model interpretation like H2O.ai MLI
 */
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Eye,
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3,
  LineChart,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export function ModelInterpretability() {
  const [selectedModel, setSelectedModel] = useState('xgboost_v2');
  const [selectedFeature, setSelectedFeature] = useState('customer_lifetime_value');

  const models = [
    { id: 'xgboost_v2', name: 'XGBoost Model v2.1', accuracy: 93.5 },
    { id: 'random_forest', name: 'Random Forest v1.3', accuracy: 91.2 },
    { id: 'neural_net', name: 'Neural Network v1.0', accuracy: 88.7 },
  ];

  // Mock SHAP values data
  const shapValues = [
    { feature: 'customer_lifetime_value', importance: 0.45, direction: 'positive' },
    { feature: 'days_since_last_purchase', importance: 0.32, direction: 'negative' },
    { feature: 'purchase_frequency_30d', importance: 0.28, direction: 'negative' },
    { feature: 'avg_basket_size', importance: 0.21, direction: 'positive' },
    { feature: 'preferred_category', importance: 0.18, direction: 'positive' },
    { feature: 'account_age_days', importance: 0.15, direction: 'negative' },
    { feature: 'email_engagement_score', importance: 0.12, direction: 'positive' },
    { feature: 'support_tickets_count', importance: 0.09, direction: 'positive' },
    { feature: 'discount_usage_pct', importance: 0.07, direction: 'negative' },
    { feature: 'referral_count', importance: 0.05, direction: 'negative' },
  ];

  // Mock prediction example
  const samplePrediction = {
    customer_id: 'CUST-12345',
    prediction: 'High Risk',
    probability: 0.78,
    contributions: [
      { feature: 'days_since_last_purchase', value: 120, impact: +0.32, baseline: 45 },
      { feature: 'purchase_frequency_30d', value: 0, impact: +0.28, baseline: 2.8 },
      { feature: 'customer_lifetime_value', value: 234, impact: -0.15, baseline: 1247 },
      { feature: 'email_engagement_score', value: 12, impact: +0.11, baseline: 65 },
      { feature: 'support_tickets_count', value: 8, impact: +0.08, baseline: 1.2 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Eye className="h-8 w-8 text-purple-500" />
            Model Interpretability
          </h1>
          <p className="text-muted-foreground mt-2">
            Understand how your models make predictions with SHAP, LIME, and advanced explainability tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Model Selection */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">Select Model:</div>
          <div className="flex gap-2">
            {models.map(model => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedModel(model.id)}
              >
                {model.name}
                <Badge variant="secondary" className="ml-2">{model.accuracy}%</Badge>
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="shap" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shap">SHAP Values</TabsTrigger>
          <TabsTrigger value="lime">LIME</TabsTrigger>
          <TabsTrigger value="pdp">PDP / ICE</TabsTrigger>
          <TabsTrigger value="whatif">What-If Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
        </TabsList>

        {/* SHAP Tab */}
        <TabsContent value="shap" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Global Feature Importance */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Global Feature Importance (SHAP)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Impact of each feature on model predictions across all data
              </p>

              <div className="space-y-3">
                {shapValues.map((item, idx) => (
                  <div key={item.feature} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        #{idx + 1} {item.feature.replace(/_/g, ' ')}
                      </span>
                      <span className="text-muted-foreground">{item.importance.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.direction === 'positive'
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : 'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                          style={{ width: `${item.importance * 100}%` }}
                        />
                      </div>
                      <Badge variant="outline" className={item.direction === 'positive' ? 'text-green-600' : 'text-red-600'}>
                        {item.direction === 'positive' ? '↑ Pos' : '↓ Neg'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* SHAP Summary Plot */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">SHAP Summary Plot</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Distribution of SHAP values for each feature
              </p>
              
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg p-6 h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <div className="font-semibold mb-2">SHAP Beeswarm Plot</div>
                  <div className="text-sm text-muted-foreground">
                    Interactive visualization showing feature value distribution
                    <br />
                    and impact on predictions
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    View Interactive Chart
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Individual Prediction Explanation */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Individual Prediction Explanation
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Understanding why the model predicted {samplePrediction.prediction} for customer {samplePrediction.customer_id}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <div className="text-sm text-red-800 dark:text-red-400 mb-1">Prediction</div>
                <div className="text-2xl font-bold text-red-600">{samplePrediction.prediction}</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg">
                <div className="text-sm text-orange-800 dark:text-orange-400 mb-1">Probability</div>
                <div className="text-2xl font-bold text-orange-600">{(samplePrediction.probability * 100).toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="text-sm text-blue-800 dark:text-blue-400 mb-1">Confidence</div>
                <div className="text-2xl font-bold text-blue-600">High</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-medium text-sm mb-2">Feature Contributions:</div>
              {samplePrediction.contributions.map(contrib => (
                <div key={contrib.feature} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{contrib.feature.replace(/_/g, ' ')}</div>
                    <Badge variant={contrib.impact > 0 ? 'destructive' : 'default'}>
                      {contrib.impact > 0 ? '+' : ''}{contrib.impact.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Value: </span>
                      <span className="font-mono font-semibold">{contrib.value}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Baseline: </span>
                      <span className="font-mono">{contrib.baseline}</span>
                    </div>
                    <div className="flex-1 text-right">
                      {contrib.impact > 0 ? (
                        <span className="text-red-600 flex items-center justify-end gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Increases churn risk
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center justify-end gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Decreases churn risk
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* LIME Tab */}
        <TabsContent value="lime" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              LIME: Local Interpretable Model-agnostic Explanations
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              LIME explains individual predictions by approximating the model locally with an interpretable model
            </p>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">💡</div>
              <div className="font-semibold text-lg mb-2">LIME Explanation</div>
              <div className="text-sm text-muted-foreground mb-4">
                Local surrogate model showing which features
                <br />
                contribute most to this specific prediction
              </div>
              <Button variant="outline">Generate LIME Explanation</Button>
            </div>
          </Card>
        </TabsContent>

        {/* PDP/ICE Tab */}
        <TabsContent value="pdp" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-500" />
              Partial Dependence & ICE Plots
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Understand how features affect predictions while marginalizing over other features
            </p>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Select Feature:</label>
              <select
                value={selectedFeature}
                onChange={e => setSelectedFeature(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md"
              >
                {shapValues.map(item => (
                  <option key={item.feature} value={item.feature}>
                    {item.feature.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-8 h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <div className="font-semibold text-lg mb-2">
                  PDP for {selectedFeature.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Shows the marginal effect of this feature
                  <br />
                  on predicted churn probability
                </div>
                <Button variant="outline">View Interactive Plot</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* What-If Analysis Tab */}
        <TabsContent value="whatif" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              What-If Analysis
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Simulate how changes in feature values affect predictions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Current Scenario</h4>
                {samplePrediction.contributions.map(contrib => (
                  <div key={contrib.feature}>
                    <label className="text-sm font-medium mb-1 block">
                      {contrib.feature.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="number"
                      defaultValue={contrib.value}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                    />
                  </div>
                ))}
                <Button className="w-full">Run Simulation</Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Predicted Outcome</h4>
                <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">New Prediction</div>
                  <div className="text-3xl font-bold text-green-600 mb-4">Low Risk</div>
                  <div className="text-sm text-muted-foreground mb-1">Probability</div>
                  <div className="text-2xl font-bold mb-4">23%</div>
                  <div className="text-sm">
                    <span className="text-green-600 font-semibold">↓ 55%</span> reduction in churn risk
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-2">
                    💡 Recommendations:
                  </div>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Engage customer within next 30 days</li>
                    <li>Offer personalized discount (15-20%)</li>
                    <li>Send product recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Model Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Model Comparison</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Compare feature importance and behavior across different models
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    {models.map(model => (
                      <th key={model.id} className="text-center py-3 px-4">
                        {model.name}
                        <div className="text-xs text-muted-foreground font-normal">{model.accuracy}% accuracy</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shapValues.slice(0, 5).map(item => (
                    <tr key={item.feature} className="border-b">
                      <td className="py-3 px-4 font-medium">{item.feature.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-blue-100 text-blue-700">
                          {item.importance.toFixed(3)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-green-100 text-green-700">
                          {(item.importance * 0.9).toFixed(3)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-purple-100 text-purple-700">
                          {(item.importance * 0.75).toFixed(3)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
