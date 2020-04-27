import IssueAttachmentModal from './IssueAttachmentModal';
import IssueAttachmentsContainer from './IssueAttachmentsContainer';

export default module => {
  module.component('issueAttachmentsContainer', IssueAttachmentsContainer);
  module.component('issueAttachmentModal', IssueAttachmentModal);
};
