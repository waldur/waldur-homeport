import { FunctionComponent, useContext } from 'react';

import { AttachmentItem } from '@/form/upload/AttachmentItem';

import { useDeleteAttachment } from './api';
import { IssueAttachmentsContext } from './IssueAttachmentsContext';
import { Attachment } from './types';

interface IssueAttachmentProps {
  attachment: Attachment;
}

// The API refuses a delete the caller may not make (403) and one the support
// backend does not allow (400). Without `can_delete`, only the second is known.
const canDeleteAttachment = (attachment: Attachment) =>
  attachment.destroy_is_available && attachment.can_delete !== false;

export const IssueAttachment: FunctionComponent<IssueAttachmentProps> = ({
  attachment,
}) => {
  const issue = useContext(IssueAttachmentsContext);
  const { deleteAttachment, isDeleting } = useDeleteAttachment(issue.url);

  return (
    <AttachmentItem
      attachment={attachment}
      onDelete={
        canDeleteAttachment(attachment)
          ? () => deleteAttachment(attachment.uuid)
          : undefined
      }
      isDeleting={isDeleting(attachment.uuid)}
    />
  );
};
