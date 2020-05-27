import { SidebarExtensionService } from '@waldur/navigation/sidebar/SidebarExtensionService';

import { getMenuForProject, getMenuForSupport } from './utils';

SidebarExtensionService.register('project', getMenuForProject);
SidebarExtensionService.register('support', getMenuForSupport);
