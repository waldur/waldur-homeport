import selectWorkspaceToggle from './select-workspace-toggle';
import selectWorkspaceDialog from './select-workspace-dialog';

export default module => {
  module.directive('selectWorkspaceToggle', selectWorkspaceToggle);
  module.directive('selectWorkspaceDialog', selectWorkspaceDialog);
}
