import selectWorkspaceToggle from './select-workspace-toggle';
import selectWorkspaceDialog from './select-workspace-dialog';
import WorkspaceService from './workspace-service';

export default module => {
  module.component('selectWorkspaceToggle', selectWorkspaceToggle);
  module.component('selectWorkspaceDialog', selectWorkspaceDialog);
  module.service('WorkspaceService', WorkspaceService);
};
