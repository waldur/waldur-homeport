import { FunctionComponent, useContext } from 'react';

import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
  const { confirm } = useModal();

  const onDelete = async () => {
    // A delete that reaches the helpdesk removes the file everywhere and goes
    // ahead at once. One that stays in Waldur leaves the provider's copy
    // behind, so the user is told before the file goes.
    if (attachment.delete_is_local_only) {
      try {
        await confirm(
          translate('Delete attachment'),
          translate(
            "This ticket's provider helpdesk has been removed from Waldur. Deleting removes the file from Waldur only; any copy on the provider's helpdesk stays.",
          ),
          { forDeletion: true },
        );
      } catch {
        return;
      }
    }
    deleteAttachment(attachment.uuid);
  };

  return (
    <AttachmentItem
      attachment={attachment}
      onDelete={canDeleteAttachment(attachment) ? onDelete : undefined}
      isDeleting={isDeleting(attachment.uuid)}
    />
  );
};
