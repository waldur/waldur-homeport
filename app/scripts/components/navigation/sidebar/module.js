import sidebar from './sidebar';
import sidebarToggle from './sidebar-toggle';
import SidebarExtensionService from './sidebar-extension-service';

export default module => {
  module.service('SidebarExtensionService', SidebarExtensionService);
  module.component('sidebar', sidebar);
  module.component('sidebarToggle', sidebarToggle);
};
