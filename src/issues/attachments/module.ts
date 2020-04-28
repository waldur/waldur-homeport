import { connectAngularComponent } from '@waldur/store/connect';

import { IssueAttachmentModal } from './IssueAttachmentModal';
import { IssueAttachmentsContainer } from './IssueAttachmentsContainer';

export default module => {
  module.component(
    'issueAttachmentsContainer',
    connectAngularComponent(IssueAttachmentsContainer, ['issue']),
  );
  module.component(
    'issueAttachmentModal',
    connectAngularComponent(IssueAttachmentModal, ['resolve']),
  );
};
