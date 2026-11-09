import { ComponentType, FC } from 'react';

import { AttachmentCardList } from './AttachmentCard';
import { AttachmentItem } from './AttachmentItem';
import { AttachmentItemPending } from './AttachmentItemPending';
import { Attachment, AttachmentUploading } from './types';

interface AttachmentsListProps {
  attachments?: Attachment[];
  uploading?: AttachmentUploading[];
  ItemComponent?: ComponentType<{ attachment }>;
  ItemPendingComponent?: ComponentType<{ itemKey; file; progress; error }>;
  className?: string;
}

export const AttachmentsList: FC<AttachmentsListProps> = ({
  attachments = [],
  uploading = [],
  ItemComponent = AttachmentItem,
  ItemPendingComponent = AttachmentItemPending,
  className,
}) => {
  return attachments?.length > 0 || uploading?.length > 0 ? (
    <AttachmentCardList className={className}>
      {uploading &&
        uploading.map((item) => (
          <li key={item.key}>
            <ItemPendingComponent
              itemKey={item.key}
              file={item.file}
              progress={item.progress}
              error={item.error}
            />
          </li>
        ))}
      {attachments &&
        attachments.map((attachment) => (
          <li key={attachment.file_name + attachment.file_size}>
            <ItemComponent attachment={attachment} />
          </li>
        ))}
    </AttachmentCardList>
  ) : null;
};
