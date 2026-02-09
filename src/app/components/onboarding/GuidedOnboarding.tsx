/**
 * WORLD-CLASS Guided Onboarding Component
 * Inspired by: Notion, Figma, Linear
 * Features: Step-by-step guide, templates, smart suggestions
 */
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sparkles,
  Database,
  Brain,
  Rocket,
  CheckCircle,
  ArrowRight,
  Upload,
  Link2,
  Zap,
  Target,
  X,
  Play,
  FileText,
  Users,
  TrendingUp,
} from 'lucide-react';

interface GuidedOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export function GuidedOnboarding({ isOpen, onClose, onNavigate }: GuidedOnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'templates' | 'quickstart'>('welcome');

  if (!isOpen) return null;

  const templates = [
    {
      id: 'customer-churn',
      name: 'Customer Churn Prediction',
      description: 'Predict which customers are likely to leave',
      icon: '👥',
      difficulty: 'Beginner',
      time: '15 min',
      datasets: 1,
      features: ['Binary Classification', 'AutoML', 'SHAP Explanations'],
      useCase: 'Reduce customer churn by 30%',
    },
    {
      id: 'sales-forecast',
      name: 'Sales Forecasting',
      description: 'Predict future sales based on historical data',
      icon: '📈',
      difficulty: 'Beginner',
      time: '20 min',
      datasets: 1,
      features: ['Time Series', 'Multiple Algorithms', 'Confidence Intervals'],
      useCase: 'Improve inventory planning',
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection',
      description: 'Identify fraudulent transactions in real-time',
      icon: '🔒',
      difficulty: 'Intermediate',
      time: '25 min',
      datasets: 2,
      features: ['Anomaly Detection', 'Real-time API', 'Model Monitoring'],
      useCase: 'Prevent financial losses',
    },
    {
      id: 'product-recommendations',
      name: 'Product Recommendations',
      description: 'Recommend products based on user behavior',
      icon: '🛍️',
      difficulty: 'Intermediate',
      time: '30 min',
      datasets: 2,
      features: ['Collaborative Filtering', 'A/B Testing', 'Personalization'],
      useCase: 'Increase revenue by 20%',
    },
    {
      id: 'sentiment-analysis',
      name: 'Customer Sentiment Analysis',
      description: 'Analyze customer reviews and feedback',
      icon: '💬',
      difficulty: 'Advanced',
      time: '35 min',
      datasets: 1,
      features: ['NLP', 'Text Processing', 'Multi-class Classification'],
      useCase: 'Improve product quality',
    },
    {
      id: 'blank',
      name: 'Start from Scratch',
      description: 'Build your own custom ML project',
      icon: '✨',
      difficulty: 'Custom',
      time: 'Flexible',
      datasets: 0,
      features: ['Full Control', 'Any Algorithm', 'Custom Workflows'],
      useCase: 'Your unique use case',
    },
  ];

  const quickStartSteps = [
    {
      id: 1,
      title: 'Add Your Data',
      description: 'Upload CSV or connect to PostgreSQL, MySQL, S3, BigQuery',
      icon: Database,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-950',
      action: () => onNavigate && onNavigate('data'),
    },
    {
      id: 2,
      title: 'Run AutoML',
      description: 'Let AI automatically find the best model for your data',
      icon: Sparkles,
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-950',
      action: () => onNavigate && onNavigate('automl'),
    },
    {
      id: 3,
      title: 'Understand Results',
      description: 'View SHAP explanations and feature importance',
      icon: Target,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-950',
      action: () => onNavigate && onNavigate('interpretability'),
    },
    {
      id: 4,
      title: 'Deploy & Predict',
      description: 'One-click deploy and get instant API endpoint',
      icon: Rocket,
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-950',
      action: () => onNavigate && onNavigate('deployment'),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* WELCOME SCREEN */}
        {step === 'welcome' && (
          <div className="p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-3">Welcome to Your ML Platform! 🎉</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Build, train, and deploy machine learning models in minutes - no coding required!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">AutoML Powered</h3>
                <p className="text-sm text-muted-foreground">
                  AI automatically finds the best model for your data
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">No Code Required</h3>
                <p className="text-sm text-muted-foreground">
                  Beautiful UI for analysts and data scientists alike
                </p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Rocket className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Production Ready</h3>
                <p className="text-sm text-muted-foreground">
                  One-click deploy with API endpoints and monitoring
                </p>
              </Card>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setStep('quickstart')}
                className="gap-2"
              >
                <Play className="h-5 w-5" />
                Quick Start Guide
              </Button>
              <Button
                size="lg"
                onClick={() => setStep('templates')}
                className="gap-2"
              >
                <FileText className="h-5 w-5" />
                Choose a Template
              </Button>
            </div>
          </div>
        )}

        {/* TEMPLATES SCREEN */}
        {step === 'templates' && (
          <div className="p-8">
            <button
              onClick={() => setStep('welcome')}
              className="absolute top-4 left-4 p-2 hover:bg-muted rounded-lg"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3">Choose a Template</h1>
              <p className="text-muted-foreground">
                Start with a pre-built project or create your own from scratch
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => {
                    onClose();
                    // Create project from template logic here
                  }}
                >
                  <div className="text-4xl mb-3">{template.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4 text-xs">
                    <Badge variant="outline">{template.difficulty}</Badge>
                    <Badge variant="outline">⏱️ {template.time}</Badge>
                    <Badge variant="outline">📊 {template.datasets} dataset(s)</Badge>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-semibold mb-2">Includes:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-4">
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                      💡 Use Case
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-300">
                      {template.useCase}
                    </div>
                  </div>

                  <Button className="w-full gap-2 group-hover:bg-primary/90">
                    Use This Template
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* QUICK START SCREEN */}
        {step === 'quickstart' && (
          <div className="p-8">
            <button
              onClick={() => setStep('welcome')}
              className="absolute top-4 left-4 p-2 hover:bg-muted rounded-lg"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3">Quick Start Guide</h1>
              <p className="text-muted-foreground">
                Follow these 4 simple steps to build your first ML model
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {quickStartSteps.map((stepItem, index) => {
                const Icon = stepItem.icon;
                return (
                  <Card
                    key={stepItem.id}
                    className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={stepItem.action}
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center font-bold text-xl">
                          {stepItem.id}
                        </div>
                        <div className={`h-16 w-16 ${stepItem.bg} rounded-xl flex items-center justify-center`}>
                          <Icon className={`h-8 w-8 ${stepItem.color}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl mb-2">{stepItem.title}</h3>
                        <p className="text-muted-foreground">{stepItem.description}</p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">💡 Pro Tip: Use AutoML!</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AutoML Engine automatically tests 12+ algorithms and creates 247+ features.
                    It's the fastest way to get a high-accuracy model!
                  </p>
                  <Button
                    onClick={() => {
                      onClose();
                      onNavigate && onNavigate('automl');
                    }}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Go to AutoML Engine
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Button variant="outline" onClick={onClose}>
                I'll Explore on My Own
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}