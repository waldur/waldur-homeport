import { connectAngularComponent } from '@waldur/store/connect';

import { IssueCommentDeleteDialog } from './IssueCommentDeleteDialog';

export default module => {
  module.component(
    'issueCommentDeleteDialog',
    connectAngularComponent(IssueCommentDeleteDialog, ['resolve']),
  );
};
