/**
 * Main App - WORLD-CLASS ENTERPRISE ML PLATFORM
 * Project-centric architecture with comprehensive RBAC
 * Updated: 2026-02-01 - Removed workspace concept (backend has no workspaces!)
 */
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
// ⚠️ NO MORE WorkspaceProvider - Backend removed workspaces!
import { ProjectProvider, useProject } from '@/contexts/ProjectContext';
import { LoginPage } from '@/app/components/auth/LoginPage';
import { SignupPage } from '@/app/components/auth/SignupPage';
import { ProjectDashboard } from '@/app/components/ProjectDashboard';
import { AnalyticsDashboard } from '@/app/components/AnalyticsDashboard';
import { DataManagement } from '@/app/components/DataManagement';
import { ExploratoryDataAnalysisReal } from '@/app/components/ExploratoryDataAnalysisReal';
import { ModelTraining } from '@/app/components/ModelTraining';
import { ModelEvaluationContainer } from '@/app/components/ModelEvaluationContainer';
import { Deployment } from '@/app/components/Deployment';
import { PredictionsContainer } from '@/app/components/PredictionsContainer';
import { Monitoring } from '@/app/components/Monitoring';
import { UserManagement } from '@/app/components/admin/UserManagement';
import { AutoMLEngine } from '@/app/components/automl/AutoMLEngine';
import { MLFlowEngine } from '@/app/components/mlflow/MLFlowEngine';
import { MLFlowWizard } from '@/app/components/mlflow/MLFlowWizardComplete';
import { ModelInterpretability } from '@/app/components/interpretability/ModelInterpretability';
import { ModelRegistry } from '@/app/components/registry/ModelRegistry';
import { ProjectSelector } from '@/app/components/project/ProjectSelector';
import { NewProjectModal } from '@/app/components/project/NewProjectModal';
import { GuidedOnboarding } from '@/app/components/onboarding/GuidedOnboarding';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  LayoutDashboard,
  Database,
  Brain,
  Target,
  Rocket,
  Zap,
  Activity,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Users,
  FileText,
  Shield,
  Eye,
  GitBranch,
  Plus,
  Sparkles,
  Layers,
  BarChart3,
  LineChart,
  Filter,
} from 'lucide-react';

type Page = 
  | 'dashboard'
  | 'analytics'
  | 'data'
  | 'eda'
  | 'mlflow'
  | 'automl'
  | 'training'
  | 'evaluation'
  | 'interpretability'
  | 'registry'
  | 'deployment'
  | 'predictions'
  | 'monitoring'
  | 'users';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isAuthenticated, logout, hasRole, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users (can be triggered from dashboard or menu)
  const handleShowOnboarding = () => setShowOnboarding(true);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 animate-pulse">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {authMode === 'login' ? (
          <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />
        ) : (
          <SignupPage onSwitchToLogin={() => setAuthMode('login')} />
        )}
        <Toaster />
      </>
    );
  }

  // User is authenticated - wrap with ProjectProvider
  return (
    <ProjectProvider>
      <AuthenticatedApp 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showNewProjectModal={showNewProjectModal}
        setShowNewProjectModal={setShowNewProjectModal}
        showOnboarding={showOnboarding}
        setShowOnboarding={setShowOnboarding}
        handleShowOnboarding={handleShowOnboarding}
        user={user!}
        hasRole={hasRole}
        logout={logout}
      />
      <Toaster />
    </ProjectProvider>
  );
}

// Component that uses useProject - must be inside ProjectProvider
function AuthenticatedApp({
  currentPage,
  setCurrentPage,
  sidebarOpen,
  setSidebarOpen,
  showNewProjectModal,
  setShowNewProjectModal,
  showOnboarding,
  setShowOnboarding,
  handleShowOnboarding,
  user,
  hasRole,
  logout,
}: {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showNewProjectModal: boolean;
  setShowNewProjectModal: (show: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  handleShowOnboarding: () => void;
  user: any;
  hasRole: (role: string) => boolean;
  logout: () => void;
}) {
  const { currentProject, loading: projectsLoading } = useProject();

  // Show loading state while projects are loading
  if (projectsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 animate-pulse">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { id: 'dashboard' as Page, name: 'Dashboard', icon: LayoutDashboard, roles: ['*'] },
    // 🚧 HIDDEN FOR NOW - Will be enabled in future
    // { id: 'analytics' as Page, name: 'Analytics', icon: BarChart3, roles: ['*'] },
    { id: 'data' as Page, name: 'Data Management', icon: Database, roles: ['*'] },
    { id: 'eda' as Page, name: 'Exploratory Data Analysis', icon: LineChart, roles: ['*'] },
    { id: 'mlflow' as Page, name: 'ML Flow', icon: GitBranch, roles: ['admin', 'data_scientist', 'ml_engineer'] },
    { id: 'registry' as Page, name: 'Model Registry', icon: Layers, roles: ['admin', 'data_scientist', 'ml_engineer'] },
    { id: 'evaluation' as Page, name: 'Model Evaluation', icon: Target, roles: ['admin', 'data_scientist', 'ml_engineer'] },
    { id: 'deployment' as Page, name: 'Deployment', icon: Rocket, roles: ['admin', 'ml_engineer'] },
    { id: 'predictions' as Page, name: 'Predictions', icon: Zap, roles: ['*'] },
    { id: 'monitoring' as Page, name: 'Monitoring', icon: Activity, roles: ['admin', 'ml_engineer'] },
    // 🚧 HIDDEN - Model Training (replaced by ML Flow)
    // { id: 'training' as Page, name: 'Model Training', icon: Brain, roles: ['admin', 'data_scientist', 'ml_engineer'] },
    // 🚧 HIDDEN FOR NOW - AutoML (kept for future use)
    // { id: 'automl' as Page, name: 'AutoML Engine', icon: Sparkles, roles: ['admin', 'data_scientist', 'ml_engineer'] },
    // 🚧 HIDDEN FOR NOW - Will be enabled in future
    // { id: 'interpretability' as Page, name: 'Model Interpretability', icon: Zap, roles: ['admin', 'data_scientist', 'ml_engineer'] },
  ];

  const adminNav = [
    { id: 'users' as Page, name: 'User Management', icon: Users, roles: ['admin'] },
  ];

  const roleConfig = {
    admin: { label: 'Admin', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
    data_scientist: { label: 'Data Scientist', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
    ml_engineer: { label: 'ML Engineer', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' },
    analyst: { label: 'Analyst', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' },
    viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  };

  const canAccess = (roles: string[]) => {
    if (roles.includes('*')) return true;
    return roles.includes(user!.role);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <ProjectDashboard />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'data': return <DataManagement />;
      case 'eda': return <ExploratoryDataAnalysisReal />;
      case 'mlflow': return <MLFlowWizard onNavigateToRegistry={() => setCurrentPage('registry')} />;
      case 'automl': return <AutoMLEngine />;
      case 'training': return <ModelTraining />;
      case 'evaluation': return <ModelEvaluationContainer />;
      case 'interpretability': return <ModelInterpretability />;
      case 'registry': return <ModelRegistry onNavigateToMLFlow={() => setCurrentPage('mlflow')} />;
      case 'deployment': return <Deployment />;
      case 'predictions': return <PredictionsContainer />;
      case 'monitoring': return <Monitoring />;
      case 'users': return <UserManagement />;
      default: return <ProjectDashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-card border-r border-border transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">ML Platform</div>
              <div className="text-xs text-muted-foreground">Enterprise AI</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1 mb-6">
            <div className="text-xs font-semibold text-muted-foreground px-3 mb-2">MAIN</div>
            {navigation.filter(item => canAccess(item.roles)).map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Admin Section */}
          {hasRole('admin') && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground px-3 mb-2">
                ⚙️ ADMIN
              </div>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer mb-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Settings</span>
          </div>
          <div className="px-3 py-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
            </div>
            <Badge className={`${roleConfig[user!.role].color} text-xs w-full justify-center mb-2`}>
              {roleConfig[user!.role].label}
            </Badge>
            <Button variant="outline" size="sm" onClick={logout} className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Project Selector */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Project Selector - ALWAYS VISIBLE */}
            <ProjectSelector />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShowOnboarding}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden md:inline">Quick Start</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowNewProjectModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">New Project</span>
            </Button>
            
            <Badge variant="outline" className="gap-2">
              <Eye className="h-3 w-3" />
              Demo Mode
            </Badge>
            
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium hidden lg:block">Live</span>
          </div>
        </header>

        {/* Page Content - Shows SELECTED PROJECT's data */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className={currentPage === 'registry' ? '' : 'p-6'}>
            <div className={currentPage === 'registry' ? '' : 'max-w-[1600px] mx-auto'}>
              {renderPage()}
            </div>
          </div>
        </main>
      </div>

      {/* New Project Modal */}
      <NewProjectModal 
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
      />

      {/* Onboarding Modal */}
      <GuidedOnboarding 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onNavigate={(page) => {
          setCurrentPage(page as Page);
          setShowOnboarding(false);
        }}
      />
    </div>
  );
}