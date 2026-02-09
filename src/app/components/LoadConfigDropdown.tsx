/**
 * Load Configuration Dropdown
 * Dropdown menu for loading, cloning, and deleting saved configurations
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { History, Loader2, Upload, Star, Clock, Globe, FolderOpen, Database, Plug, Copy, Trash2 } from 'lucide-react';
import { ConfigListItem, ConfigScope } from '../../services/training/configTypes';
import { trainingConfigService } from '../../services/training/trainingConfigService';
import { toast } from 'sonner';

interface LoadConfigDropdownProps {
  projectId?: string;
  datasetId?: string;
  datasourceId?: string;
  onLoad: (configId: string) => Promise<void>;
  disabled?: boolean;
}

export function LoadConfigDropdown({
  projectId,
  datasetId,
  datasourceId,
  onLoad,
  disabled = false,
}: LoadConfigDropdownProps) {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<ConfigListItem[]>([]);
  const [popularConfigs, setPopularConfigs] = useState<ConfigListItem[]>([]);
  const [recentConfigs, setRecentConfigs] = useState<ConfigListItem[]>([]);
  const [open, setOpen] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Fetch configurations when dropdown opens OR when dependencies change
  useEffect(() => {
    if (open || !initialLoadDone) {
      fetchConfigurations();
    }
  }, [open, projectId, datasetId, datasourceId]);

  const fetchConfigurations = async () => {
    console.log('LoadConfigDropdown: Fetching configurations...', { projectId, datasetId, datasourceId });
    setLoading(true);
    try {
      // Fetch all configurations first (this is the main data source)
      const all = await trainingConfigService.list({
        projectId,
        datasetId,
        datasourceId,
        includeParentScopes: true,
      });

      console.log('LoadConfigDropdown: Loaded', all.length, 'total configs');

      setConfigs(all);

      // Try to fetch popular and recent, but don't fail if they're empty
      try {
        const [popular, recent] = await Promise.all([
          trainingConfigService.getPopular(projectId, datasetId, 5),
          trainingConfigService.getRecent(projectId, 5),
        ]);
        
        console.log('LoadConfigDropdown: Popular:', popular.length, 'Recent:', recent.length);
        setPopularConfigs(popular);
        setRecentConfigs(recent);
      } catch (error) {
        console.warn('Failed to load popular/recent configs, using empty lists:', error);
        setPopularConfigs([]);
        setRecentConfigs([]);
      }

      setInitialLoadDone(true);
    } catch (error: any) {
      console.error('Failed to load configurations:', error);
      toast.error('Failed to load configurations', {
        description: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (configId: string) => {
    console.log('LoadConfigDropdown: handleLoad called with configId:', configId);
    try {
      await onLoad(configId);
      setOpen(false);
      toast.success('Configuration loaded successfully!');
    } catch (error: any) {
      console.error('Failed to load configuration:', error);
      toast.error('Failed to load configuration', {
        description: error.message || 'Please try again',
      });
    }
  };

  const handleClone = async (configId: string, name: string) => {
    try {
      const cloned = await trainingConfigService.clone(configId, `${name} (Copy)`);
      toast.success('Configuration cloned successfully!', {
        description: cloned.name,
      });
      fetchConfigurations();
    } catch (error: any) {
      console.error('Failed to clone configuration:', error);
      toast.error('Failed to clone configuration', {
        description: error.message || 'Please try again',
      });
    }
  };

  const handleDelete = async (configId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await trainingConfigService.delete(configId);
      toast.success('Configuration deleted successfully!');
      fetchConfigurations();
    } catch (error: any) {
      console.error('Failed to delete configuration:', error);
      toast.error('Failed to delete configuration', {
        description: error.message || 'Please try again',
      });
    }
  };

  const getScopeIcon = (scope: ConfigScope) => {
    switch (scope) {
      case 'GLOBAL': return <Globe className="h-3 w-3" />;
      case 'PROJECT': return <FolderOpen className="h-3 w-3" />;
      case 'DATASET': return <Database className="h-3 w-3" />;
      case 'DATASOURCE': return <Plug className="h-3 w-3" />;
    }
  };

  const getScopeBadgeColor = (scope: ConfigScope): string => {
    switch (scope) {
      case 'GLOBAL': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400';
      case 'PROJECT': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
      case 'DATASET': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400';
      case 'DATASOURCE': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400';
    }
  };

  // Group configs by scope
  const configsByScope = configs.reduce((acc, config) => {
    if (!acc[config.scope]) {
      acc[config.scope] = [];
    }
    acc[config.scope].push(config);
    return acc;
  }, {} as Record<ConfigScope, ConfigListItem[]>);

  const scopeOrder: ConfigScope[] = ['DATASET', 'DATASOURCE', 'PROJECT', 'GLOBAL'];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={disabled}>
          <History className="h-4 w-4" />
          Load Configuration
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[400px]" align="end">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading configurations...
          </div>
        ) : configs.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No saved configurations</p>
            <p className="text-xs mt-1">Save your current settings to reuse them later</p>
          </div>
        ) : (
          <>
            {/* Popular Configurations */}
            {popularConfigs.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  Most Used
                </DropdownMenuLabel>
                {popularConfigs.map((config) => (
                  <DropdownMenuSub key={config.id}>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center justify-between flex-1 gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getScopeIcon(config.scope)}
                          <span className="truncate">{config.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {config.usageCount}× used
                        </Badge>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleLoad(config.id)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Load Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClone(config.id, config.name)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </DropdownMenuItem>
                      {config.scope !== 'GLOBAL' && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(config.id, config.name)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Recent Configurations */}
            {recentConfigs.length > 0 && (
              <>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Recently Used
                </DropdownMenuLabel>
                {recentConfigs.map((config) => (
                  <DropdownMenuSub key={config.id}>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center justify-between flex-1 gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getScopeIcon(config.scope)}
                          <span className="truncate">{config.name}</span>
                        </div>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleLoad(config.id)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Load Configuration
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClone(config.id, config.name)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </DropdownMenuItem>
                      {config.scope !== 'GLOBAL' && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(config.id, config.name)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* All Configurations by Scope */}
            <DropdownMenuLabel>All Configurations</DropdownMenuLabel>
            {scopeOrder.map((scope) => {
              const scopeConfigs = configsByScope[scope];
              if (!scopeConfigs || scopeConfigs.length === 0) return null;

              return (
                <div key={scope}>
                  <DropdownMenuLabel className="text-xs text-muted-foreground pl-2 flex items-center gap-2">
                    {getScopeIcon(scope)}
                    {scope.charAt(0) + scope.slice(1).toLowerCase()} Level
                  </DropdownMenuLabel>
                  {scopeConfigs.map((config) => (
                    <DropdownMenuSub key={config.id}>
                      <DropdownMenuSubTrigger>
                        <div className="flex items-center justify-between flex-1 gap-2">
                          <span className="truncate">{config.name}</span>
                          <Badge className={`text-xs ${getScopeBadgeColor(config.scope)}`}>
                            {config.algorithmDisplayName || config.algorithm}
                          </Badge>
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleLoad(config.id)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Load Configuration
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleClone(config.id, config.name)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Clone
                        </DropdownMenuItem>
                        {config.scope !== 'GLOBAL' && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(config.id, config.name)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}