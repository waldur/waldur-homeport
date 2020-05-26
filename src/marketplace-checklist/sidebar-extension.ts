import { SidebarExtensionService } from '@waldur/navigation/sidebar/SidebarExtensionService';

import { getMenuForProject, getMenuForSupport } from './utils';

export default function registerSidebarExtension() {
  SidebarExtensionService.register('project', getMenuForProject);
  SidebarExtensionService.register('support', getMenuForSupport);
}
