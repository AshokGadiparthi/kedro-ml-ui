/**
 * Dashboard Component
 * Main dashboard showing projects, models, and quick stats
 */
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ProjectWizard } from './ProjectWizard';
import { mlApiService, Project } from '../../services/mlApiService';
import { toast } from 'sonner';
import {
  Plus,
  Rocket,
  Database,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Trash2,
  Play,
  BarChart3,
} from 'lucide-react';

export function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeModels: 0,
    totalPredictions: 0,
    accuracy: 0,
  });

  useEffect(() => {
    loadProjects();
    loadStats();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await mlApiService.getProjects();
      setProjects(data);
    } catch (error: any) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats for now - replace with actual API call
      setStats({
        totalProjects: 12,
        activeModels: 5,
        totalPredictions: 45632,
        accuracy: 93.5,
      });
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  const handleProjectComplete = (projectId: string) => {
    setShowWizard(false);
    loadProjects();
    toast.success('Project created! You can now configure your model.');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await mlApiService.deleteProject(projectId);
      toast.success('Project deleted');
      loadProjects();
    } catch (error: any) {
      toast.error('Failed to delete project');
    }
  };

  if (showWizard) {
    return (
      <ProjectWizard
        onComplete={handleProjectComplete}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your ML workspace
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
              <p className="text-3xl font-bold">{stats.totalProjects}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2 this month
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Models</p>
              <p className="text-3xl font-bold">{stats.activeModels}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                All running
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Predictions</p>
              <p className="text-3xl font-bold">{stats.totalPredictions.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +1.2k today
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Accuracy</p>
              <p className="text-3xl font-bold">{stats.accuracy}%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2.3% improved
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first ML project. Connect your data source,
                train models, and deploy predictions.
              </p>
              <Button onClick={() => setShowWizard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Upload Data</h3>
                <p className="text-sm text-muted-foreground">Import CSV or connect database</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Train Model</h3>
                <p className="text-sm text-muted-foreground">Start AutoML or custom training</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Deploy Model</h3>
                <p className="text-sm text-muted-foreground">Make predictions live</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = {
    created: { label: 'Created', color: 'bg-gray-500', icon: Clock },
    data_loaded: { label: 'Data Loaded', color: 'bg-blue-500', icon: Database },
    training: { label: 'Training', color: 'bg-yellow-500', icon: Brain },
    completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
    failed: { label: 'Failed', color: 'bg-red-500', icon: AlertCircle },
  };

  const status = statusConfig[project.status] || statusConfig.created;
  const StatusIcon = status.icon;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow relative group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg z-10">
              <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                <Play className="h-4 w-4" />
                Open Project
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-red-600"
                onClick={() => {
                  onDelete(project.id);
                  setShowMenu(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className={`h-2 w-2 rounded-full ${status.color}`} />
        <span className="text-sm font-medium">{status.label}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Database className="h-4 w-4" />
          <span>{project.dataSource?.type || 'No data source'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <Button variant="outline" className="w-full" size="sm">
          View Details
        </Button>
      </div>
    </Card>
  );
}
