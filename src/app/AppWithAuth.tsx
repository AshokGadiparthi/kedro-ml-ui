/**
 * Main App Component with Authentication
 * Enterprise ML Platform with RBAC, Data Governance, and ML Governance
 */
import { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { Dashboard } from './components/Dashboard';
import { DataManagement } from './components/DataManagement';
import { ModelTraining } from './components/ModelTraining';
import { ModelEvaluation } from './components/ModelEvaluation';
import { Deployment } from './components/Deployment';
import { Predictions } from './components/Predictions';
import { Monitoring } from './components/Monitoring';
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogs } from './components/admin/AuditLogs';
import { DataCatalog } from './components/governance/DataCatalog';
import { PIIScanner } from './components/governance/PIIScanner';
import { ModelRegistry } from './components/mlops/ModelRegistry';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
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
} from 'lucide-react';

type Page = 
  | 'dashboard'
  | 'data'
  | 'training'
  | 'evaluation'
  | 'deployment'
  | 'predictions'
  | 'monitoring'
  | 'users'
  | 'audit'
  | 'catalog'
  | 'pii'
  | 'registry';

function AppContent() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (!isAuthenticated) {
    if (authMode === 'login') {
      return <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />;
    } else {
      return <SignupPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
  }

  const navigation = [
    { id: 'dashboard' as Page, name: 'Dashboard', icon: LayoutDashboard, roles: ['*'] },
    { id: 'data' as Page, name: 'Data Management', icon: Database, roles: ['*'] },
    { id: 'training' as Page, name: 'Model Training', icon: Brain, roles: ['admin', 'data_scientist', 'ml_engineer'] },
    { id: 'evaluation' as Page, name: 'Model Evaluation', icon: Target, roles: ['admin', 'data_scientist', 'ml_engineer'] },
    { id: 'deployment' as Page, name: 'Deployment', icon: Rocket, roles: ['admin', 'ml_engineer'] },
    { id: 'predictions' as Page, name: 'Predictions', icon: Zap, roles: ['*'] },
    { id: 'monitoring' as Page, name: 'Monitoring', icon: Activity, roles: ['admin', 'ml_engineer'] },
  ];

  const governanceNav = [
    { id: 'catalog' as Page, name: 'Data Catalog', icon: Database, roles: ['*'] },
    { id: 'pii' as Page, name: 'PII Scanner', icon: Shield, roles: ['admin', 'data_scientist'] },
  ];

  const mlopsNav = [
    { id: 'registry' as Page, name: 'Model Registry', icon: GitBranch, roles: ['*'] },
  ];

  const adminNav = [
    { id: 'users' as Page, name: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'audit' as Page, name: 'Audit Logs', icon: FileText, roles: ['admin'] },
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
      case 'dashboard': return <Dashboard />;
      case 'data': return <DataManagement />;
      case 'training': return <ModelTraining />;
      case 'evaluation': return <ModelEvaluation />;
      case 'deployment': return <Deployment />;
      case 'predictions': return <Predictions />;
      case 'monitoring': return <Monitoring />;
      case 'users': return <UserManagement />;
      case 'audit': return <AuditLogs />;
      case 'catalog': return <DataCatalog />;
      case 'pii': return <PIIScanner />;
      case 'registry': return <ModelRegistry />;
      default: return <Dashboard />;
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

          {/* Data Governance */}
          <div className="space-y-1 mb-6">
            <div className="text-xs font-semibold text-muted-foreground px-3 mb-2">DATA GOVERNANCE</div>
            {governanceNav.filter(item => canAccess(item.roles)).map((item) => {
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

          {/* ML Governance */}
          <div className="space-y-1 mb-6">
            <div className="text-xs font-semibold text-muted-foreground px-3 mb-2">ML GOVERNANCE</div>
            {mlopsNav.filter(item => canAccess(item.roles)).map((item) => {
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
              <div className="text-xs font-semibold text-muted-foreground px-3 mb-2">ADMIN</div>
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
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2">
              <Eye className="h-3 w-3" />
              Demo Mode
            </Badge>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium hidden md:block">Live</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-[1600px] mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
