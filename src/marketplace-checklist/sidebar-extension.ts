import { SidebarExtensionService } from '@waldur/navigation/sidebar/SidebarExtensionService';
import { PROJECT_WORKSPACE, SUPPORT_WORKSPACE } from '@waldur/workspace/types';

import { getMenuForProject, getMenuForSupport } from './utils';

SidebarExtensionService.register(PROJECT_WORKSPACE, getMenuForProject);
SidebarExtensionService.register(SUPPORT_WORKSPACE, getMenuForSupport);
