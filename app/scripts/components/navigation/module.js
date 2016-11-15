import selectWorkspaceToggle from './select-workspace-toggle';
import selectWorkspaceDialog from './select-workspace-dialog';
import sidebar from './sidebar';

export default module => {
  module.directive('selectWorkspaceToggle', selectWorkspaceToggle);
  module.directive('selectWorkspaceDialog', selectWorkspaceDialog);
  module.directive('sidebar', sidebar);
}
