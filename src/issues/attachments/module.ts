import { connectAngularComponent } from '@waldur/store/connect';

import { IssueAttachmentModal } from './IssueAttachmentModal';

export default module => {
  module.component(
    'issueAttachmentModal',
    connectAngularComponent(IssueAttachmentModal, ['resolve']),
  );
};
