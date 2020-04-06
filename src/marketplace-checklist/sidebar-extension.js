import { getMenuForProject, getMenuForSupport } from './utils';

// @ngInject
export default function registerSidebarExtension(SidebarExtensionService) {
  SidebarExtensionService.register('project', getMenuForProject);
  SidebarExtensionService.register('support', getMenuForSupport);
}
