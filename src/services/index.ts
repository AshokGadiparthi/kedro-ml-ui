/**
 * Service Layer Index
 * Centralized export for all services
 */

import * as projectService from './projects/projectService';
import * as datasetService from './datasets/datasetService';
import * as datasourceService from './datasources/datasourceService';
import * as automlService from './automl/automlService';
import * as trainingService from './training/trainingService';
import * as authService from './auth/authService';
import * as workspaceService from './workspaces/workspaceService';
import * as activityService from './activities/activityService';
import { collectionService } from './collections/collectionService';

export { 
  projectService, 
  datasetService, 
  datasourceService, 
  automlService, 
  trainingService,
  authService,
  workspaceService,
  activityService,
  collectionService
};

export * from './api/types';
export * from './api/client';