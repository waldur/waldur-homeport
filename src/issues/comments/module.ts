import { connectAngularComponent } from '@waldur/store/connect';

import { IssueCommentDeleteDialog } from './IssueCommentDeleteDialog';
import { IssueCommentsContainer } from './IssueCommentsContainer';

export default module => {
  module.component(
    'issueCommentsContainer',
    connectAngularComponent(IssueCommentsContainer, ['issue']),
  );
  module.component(
    'issueCommentDeleteDialog',
    connectAngularComponent(IssueCommentDeleteDialog, ['resolve']),
  );
};
