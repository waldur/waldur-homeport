import { connectAngularComponent } from '@waldur/store/connect';

import selectWorkspaceToggle from './select-workspace-toggle';
import { SelectWorkspaceDialog } from './SelectWorkspaceDialog';
import WorkspaceService from './workspace-service';

export default module => {
  module.component('selectWorkspaceToggle', selectWorkspaceToggle);
  module.component(
    'selectWorkspaceDialog',
    connectAngularComponent(SelectWorkspaceDialog),
  );
  module.service('WorkspaceService', WorkspaceService);
};
