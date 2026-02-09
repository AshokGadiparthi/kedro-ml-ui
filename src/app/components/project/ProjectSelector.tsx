/**
 * Project Selector Component
 * Always visible at top - changes entire dashboard context
 */
import { useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useProjectCounts } from '../../../hooks/useProjectCounts';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChevronDown, Plus, Search, Settings, Archive } from 'lucide-react';

export function ProjectSelector() {
  const { currentProject, projects, selectProject } = useProject();
  const { counts } = useProjectCounts(currentProject?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    p.status === 'active'
  );

  if (!currentProject) return null;

  const projectColors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="relative">
      {/* Current Project Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors min-w-[300px]"
      >
        <div className={`h-10 w-10 rounded-lg ${projectColors[currentProject.color || 'blue']} flex items-center justify-center text-2xl flex-shrink-0`}>
          {currentProject.icon}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-semibold truncate">{currentProject.name}</div>
          <div className="text-xs text-muted-foreground">
            {counts.models} models • {counts.datasets} datasets
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute top-full left-0 mt-2 w-[400px] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-md text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Projects List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    selectProject(project.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors ${
                    project.id === currentProject.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg ${projectColors[project.color || 'blue']} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {project.icon}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate">{project.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {project.description}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {project.models} models
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {project.datasets} datasets
                      </Badge>
                    </div>
                  </div>
                  {project.id === currentProject.id && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}

              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No projects found
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t bg-muted/50">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Archive className="h-4 w-4" />
                  Archived
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}