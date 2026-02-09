/**
 * Save Configuration Modal
 * Dialog for saving training configurations with scope selection
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Save, Loader2, Globe, FolderOpen, Database, Plug } from 'lucide-react';
import { ConfigScope, SaveConfigRequest } from '../../services/training/configTypes';
import { toast } from 'sonner';

interface SaveConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConfig: Partial<SaveConfigRequest>;
  onSave: (request: SaveConfigRequest) => Promise<void>;
  projectId?: string;
  datasetId?: string;
  datasetName?: string;
  datasourceId?: string;
  datasourceName?: string;
}

export function SaveConfigModal({
  open,
  onOpenChange,
  currentConfig,
  onSave,
  projectId,
  datasetId,
  datasetName,
  datasourceId,
  datasourceName,
}: SaveConfigModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<ConfigScope>('PROJECT');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Please enter a configuration name');
      return;
    }

    setIsSaving(true);
    try {
      const request: SaveConfigRequest = {
        ...currentConfig,
        name: name.trim(),
        description: description.trim() || undefined,
        scope,
        // Always include projectId for PROJECT/DATASET/DATASOURCE scopes
        projectId: scope !== 'GLOBAL' ? projectId : undefined,
        // Include datasetId only for DATASET scope
        datasetId: scope === 'DATASET' ? datasetId : undefined,
        datasetName: scope === 'DATASET' ? datasetName : undefined,
        // Include datasourceId only for DATASOURCE scope
        datasourceId: scope === 'DATASOURCE' ? datasourceId : undefined,
        datasourceName: scope === 'DATASOURCE' ? datasourceName : undefined,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      };

      console.log('SaveConfigModal: Saving configuration with request:', {
        name: request.name,
        scope: request.scope,
        projectId: request.projectId,
        datasetId: request.datasetId,
        datasourceId: request.datasourceId,
        hasAlgorithm: !!request.algorithm,
        hasTargetVariable: !!request.targetVariable,
      });

      await onSave(request);
      
      toast.success('Configuration saved successfully!', {
        description: `Saved as ${getScopeLabel(scope)}`,
      });
      
      // Reset and close
      setName('');
      setDescription('');
      setTags('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('SaveConfigModal: Failed to save configuration:', error);
      toast.error('Failed to save configuration', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getScopeLabel = (s: ConfigScope): string => {
    switch (s) {
      case 'GLOBAL': return 'Global Template';
      case 'PROJECT': return 'Project Level';
      case 'DATASET': return 'Dataset Level';
      case 'DATASOURCE': return 'DataSource Level';
    }
  };

  const getScopeDescription = (s: ConfigScope): string => {
    switch (s) {
      case 'GLOBAL': return 'Available across all projects';
      case 'PROJECT': return 'Available for all datasets in this project';
      case 'DATASET': return `Available only for "${datasetName || 'this dataset'}"`;
      case 'DATASOURCE': return `Available only for "${datasourceName || 'this datasource'}"`;
    }
  };

  const getScopeIcon = (s: ConfigScope) => {
    switch (s) {
      case 'GLOBAL': return <Globe className="h-4 w-4" />;
      case 'PROJECT': return <FolderOpen className="h-4 w-4" />;
      case 'DATASET': return <Database className="h-4 w-4" />;
      case 'DATASOURCE': return <Plug className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Training Configuration
          </DialogTitle>
          <DialogDescription>
            Save your current training settings for reuse
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Configuration Name */}
          <div className="space-y-2">
            <Label htmlFor="config-name">Configuration Name *</Label>
            <Input
              id="config-name"
              placeholder="e.g., XGBoost Production Config"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="config-description">Description</Label>
            <Textarea
              id="config-description"
              placeholder="Optional description of this configuration"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Scope Selection */}
          <div className="space-y-2">
            <Label htmlFor="config-scope">Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as ConfigScope)}>
              <SelectTrigger id="config-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GLOBAL">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Global Template
                  </div>
                </SelectItem>
                {projectId && (
                  <SelectItem value="PROJECT">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Project Level
                    </div>
                  </SelectItem>
                )}
                {datasetId && (
                  <SelectItem value="DATASET">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Dataset Level
                    </div>
                  </SelectItem>
                )}
                {datasourceId && (
                  <SelectItem value="DATASOURCE">
                    <div className="flex items-center gap-2">
                      <Plug className="h-4 w-4" />
                      DataSource Level
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getScopeDescription(scope)}
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="config-tags">Tags (comma-separated)</Label>
            <Input
              id="config-tags"
              placeholder="e.g., production, xgboost, high-accuracy"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              {getScopeIcon(scope)}
              Configuration Preview
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Algorithm: <span className="font-medium">{currentConfig.algorithmDisplayName || currentConfig.algorithm || 'Not set'}</span></div>
              <div>• Problem Type: <span className="font-medium">{currentConfig.problemType || 'Not set'}</span></div>
              <div>• Target: <span className="font-medium">{currentConfig.targetVariable || 'Not set'}</span></div>
              <div>• Train/Test Split: <span className="font-medium">{((currentConfig.trainTestSplit || 0.8) * 100)}%</span></div>
              {currentConfig.hyperparameters && Object.keys(currentConfig.hyperparameters).length > 0 && (
                <div>• Hyperparameters: <span className="font-medium">{Object.keys(currentConfig.hyperparameters).length} configured</span></div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Configuration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}