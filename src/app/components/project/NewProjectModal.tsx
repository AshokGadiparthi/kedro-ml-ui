/**
 * New Project Modal
 * Simple form to create a new project (NO data source selection)
 */
import { useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { X, Folder, Sparkles } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { createProject } = useProject();
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const icons = ['📁', '🧠', '📊', '🎯', '🚀', '💡', '⚡', '🔮', '🌟', '🎨', '👥', '📈', '💳', '🖼️', '🔬', '🎪'];
  const colors = [
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'indigo', class: 'bg-indigo-500' },
    { name: 'teal', class: 'bg-teal-500' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await createProject({
        name: projectName,
        description: description,
        owner: user?.email || '',
        team: [user?.email || ''],
        status: 'active',
        icon: selectedIcon,
        color: selectedColor,
        models: 0,
        datasets: 0,
        deployments: 0,
      });
      
      // Reset form
      setProjectName('');
      setDescription('');
      setSelectedIcon('📁');
      setSelectedColor('blue');
      onClose();
    } catch (error) {
      // Error is already handled by the context
      console.error('Error in NewProjectModal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create New Project</h2>
              <p className="text-sm text-muted-foreground">
                Set up a new ML project workspace
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              placeholder="e.g., Customer Churn Prediction"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-2"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Brief description of your project goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full px-3 py-2 bg-background border border-border rounded-md min-h-[100px]"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <Label>Project Icon</Label>
            <div className="mt-2 grid grid-cols-8 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`h-12 w-12 rounded-lg text-2xl flex items-center justify-center hover:bg-muted transition-colors ${
                    selectedIcon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label>Project Color</Label>
            <div className="mt-2 flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-12 w-12 rounded-lg ${color.class} hover:scale-110 transition-transform ${
                    selectedColor === color.name ? 'ring-4 ring-offset-2 ring-offset-background ring-primary' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Preview:</div>
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-lg ${colors.find(c => c.name === selectedColor)?.class} flex items-center justify-center text-2xl`}>
                {selectedIcon}
              </div>
              <div>
                <div className="font-semibold">{projectName || 'Project Name'}</div>
                <div className="text-sm text-muted-foreground">
                  {description || 'Project description'}
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <div className="flex gap-3">
              <Folder className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-400 mb-1">
                  What's a Project?
                </div>
                <div className="text-blue-800 dark:text-blue-300">
                  A project is a workspace for your ML workflow. After creating a project, 
                  you can add data sources, train models, and deploy predictions - all within 
                  this project context.
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              <Sparkles className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}