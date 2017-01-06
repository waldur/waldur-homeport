import selectWorkspaceToggle from './select-workspace-toggle';
import selectWorkspaceDialog from './select-workspace-dialog';
import sidebar from './sidebar';
import sidebarToggle from './sidebar-toggle';
import ncHeader from './nc-header';
import pageTitle from './page-title';
import uiSrefActiveIf from './ui-sref-active-if';

export default module => {
  module.directive('selectWorkspaceToggle', selectWorkspaceToggle);
  module.directive('selectWorkspaceDialog', selectWorkspaceDialog);
  module.directive('sidebar', sidebar);
  module.component('sidebarToggle', sidebarToggle);
  module.component('ncHeader', ncHeader);
  module.directive('pageTitle', pageTitle);
  module.directive('uiSrefActiveIf', uiSrefActiveIf);
};
