import selectWorkspaceToggle from './select-workspace-toggle';
import WorkspaceService from './workspace-service';

export default (module) => {
  module.component('selectWorkspaceToggle', selectWorkspaceToggle);
  module.service('WorkspaceService', WorkspaceService);
};
