import { connectAngularComponent } from '@waldur/store/connect';

import issueQuickCreate from './issue-quick-create';
import { IssueCreateDialog } from './IssueCreateDialog';

export default module => {
  module.component(
    'issueCreateDialog',
    connectAngularComponent(IssueCreateDialog, ['resolve']),
  );
  module.directive('issueQuickCreate', issueQuickCreate);
};
