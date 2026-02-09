/**
 * Project Dashboard Component - WORLD-CLASS VERSION!
 * Shows metrics and activity for the SELECTED PROJECT ONLY
 * WITH: Guided onboarding, quick actions, smart suggestions
 */
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PhaseBanner } from './PhaseBanner';
import { NewProjectModal } from './project/NewProjectModal';
import { useProject } from '../../contexts/ProjectContext';
import { useProjectStats } from '../../hooks/useProjectStats';
import { useRecentModels } from '../../hooks/useRecentModels';
import { useRecentActivities } from '../../hooks/useRecentActivities';
import { useDatasetCount } from '../../hooks/useDatasetCount';
import { DashboardDebug } from './DashboardDebug';
import { useState } from 'react';
import {
  Brain,
  Database,
  Rocket,
  TrendingUp,
  Clock,
  Activity,
  Users,
  Play,
  Settings,
  BarChart3,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  Sparkles,
  Target,
  Upload,
  Link2,
  ArrowRight,
  Lightbulb,
  X,
  ChevronRight,
} from 'lucide-react';

export function ProjectDashboard() {
  const { currentProject, loading } = useProject();
  const { stats, loading: statsLoading } = useProjectStats(currentProject?.id);
  const { models: recentModels, loading: modelsLoading } = useRecentModels(currentProject?.id, 5);
  const { activities: recentActivities, loading: activitiesLoading } = useRecentActivities(currentProject?.id, 5);
  const { count: datasetCount, loading: datasetCountLoading } = useDatasetCount(currentProject?.id);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Show loading state while projects are being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-xl font-semibold mb-2">Loading Project...</h3>
          <p className="text-muted-foreground">
            Fetching your data from the server
          </p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Project Selected</h3>
          <p className="text-muted-foreground mb-6">
            Create a new project to get started
          </p>
          <Button onClick={() => setShowNewProjectModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
        />
      </div>
    );
  }

  // Mock project-specific data (replace with real API calls)
  const projectData = {
    recentModels: [
      { id: 1, name: 'XGBoost Model v2.1', accuracy: 93.5, status: 'deployed', lastRun: '2h ago' },
      { id: 2, name: 'Random Forest v1.3', accuracy: 91.2, status: 'training', lastRun: '5h ago' },
      { id: 3, name: 'Neural Network v1.0', accuracy: 88.7, status: 'completed', lastRun: '1d ago' },
    ],
    recentActivity: [
      { id: 1, action: 'Model deployed to production', user: 'Jane Smith', time: '2h ago', icon: Rocket },
      { id: 2, action: 'New dataset uploaded', user: 'John Doe', time: '5h ago', icon: Database },
      { id: 3, action: 'Model training completed', user: 'Bob Johnson', time: '1d ago', icon: Brain },
      { id: 4, action: 'Predictions batch processed', user: 'Alice Brown', time: '2d ago', icon: Zap },
    ],
    metrics: {
      accuracy: 93.5,
      predictions: 12450,
      trainingTime: '2.5h',
      activeDeployments: currentProject.deployments,
    },
  };

  const statusConfig = {
    Deployed: { label: 'Deployed', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400', icon: CheckCircle },
    Training: { label: 'Training', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400', icon: Activity },
    Completed: { label: 'Completed', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: CheckCircle },
    Failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400', icon: AlertCircle },
  };

  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="space-y-6">
      {/* Phase Banner - Shows implementation status */}
      <PhaseBanner />

      {/* Project Header */}
      <div className={`bg-gradient-to-r ${colorClasses[currentProject.color || 'blue']} rounded-xl p-8 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl backdrop-blur">
              {currentProject.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{currentProject.name}</h1>
              <p className="text-white/90">{currentProject.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{currentProject.team.length} team members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date(currentProject.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="secondary" className="gap-2">
            <Settings className="h-4 w-4" />
            Project Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Models</div>
            <Brain className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold">
            {statsLoading ? '...' : (stats?.modelsCount ?? 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {statsLoading ? '...' : `${stats?.deployedModelsCount ?? 0} deployed`}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Datasets</div>
            <Database className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold">
            {datasetCountLoading ? '...' : datasetCount}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {statsLoading ? '...' : (stats?.totalDataSize ?? '0 GB')}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Avg Accuracy</div>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold">
            {statsLoading ? '...' : `${((stats?.avgAccuracy ?? 0) * 100).toFixed(1)}%`}
          </div>
          <div className={`text-xs mt-1 ${(stats?.accuracyTrend ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {statsLoading ? '...' : (stats?.accuracyTrendLabel ?? 'N/A')}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Predictions</div>
            <Zap className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold">
            {statsLoading ? '...' : (stats?.predictionsLabel ?? '0')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {statsLoading ? '...' : `${(stats?.predictionsThisMonth ?? 0).toLocaleString()} this month`}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Models */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Recent Models</h3>
              <p className="text-sm text-muted-foreground">Latest trained models in this project</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {modelsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading models...
              </div>
            ) : recentModels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No models yet. Train your first model to get started!
              </div>
            ) : (
              recentModels.map((model) => {
                const statusInfo = statusConfig[model.statusLabel as keyof typeof statusConfig] || statusConfig.Completed;
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={model.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{model.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {model.algorithmDisplayName} • {model.accuracyLabel} • {model.createdAtLabel}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      {model.isBest && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Best
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Team actions in this project</p>
            </div>
          </div>

          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading activities...
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities yet. Start training models to see activity!
              </div>
            ) : (
              recentActivities.map((activity) => {
                // Map entity type to icon component  
                const entityIconMap: Record<string, any> = {
                  'project': Database,
                  'dataset': Upload,
                  'model': Brain,
                  'datasource': Link2,
                  'training_job': Settings,
                  'deployment': Rocket,
                };
                
                const Icon = entityIconMap[activity.entityType] || Activity;

                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{activity.displayText}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {activity.timeAgo}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Database className="h-6 w-6" />
            <span>Add Data Source</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Brain className="h-6 w-6" />
            <span>Train Model</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Rocket className="h-6 w-6" />
            <span>Deploy Model</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Play className="h-6 w-6" />
            <span>Run Predictions</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}