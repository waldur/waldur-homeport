import sidebar from './sidebar';
import SidebarExtensionService from './sidebar-extension-service';

export default module => {
  module.service('SidebarExtensionService', SidebarExtensionService);
  module.component('sidebar', sidebar);
};
