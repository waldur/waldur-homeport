import { FunctionComponent, useContext } from 'react';

import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';

import { useDeleteAttachment } from './api';
import { IssueAttachmentsContext } from './IssueAttachmentsContext';
import { Attachment } from './types';

interface IssueAttachmentProps {
  attachment: Attachment;
}

export const IssueAttachment: FunctionComponent<IssueAttachmentProps> = ({
  attachment,
}) => {
  const issue = useContext(IssueAttachmentsContext);
  const { deleteAttachment, isDeleting } = useDeleteAttachment(issue.url);

  return (
    <AttachmentItem
      attachment={attachment}
      onDelete={() => deleteAttachment(attachment.uuid)}
      isDeleting={isDeleting(attachment.uuid)}
    />
  );
};
