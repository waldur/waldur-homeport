import { connectAngularComponent } from '@waldur/store/connect';

import { IssueCreateDialog } from './IssueCreateDialog';

export default module => {
  module.component(
    'issueCreateDialog',
    connectAngularComponent(IssueCreateDialog, ['resolve']),
  );
};
