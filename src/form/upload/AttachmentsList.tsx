import { ComponentType, FC } from 'react';

import { AttachmentItem } from './AttachmentItem';
import { AttachmentItemPending } from './AttachmentItemPending';
import { Attachment, AttachmentUploading } from './types';

import './AttachmentsList.scss';

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
    <ul className={'attachment-list' + (className ? ' ' + className : '')}>
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
    </ul>
  ) : null;
};
