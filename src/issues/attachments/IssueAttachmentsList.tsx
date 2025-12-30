import { FunctionComponent, useCallback } from 'react';

import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';

import { IssueAttachment } from './IssueAttachment';
import { IssueAttachmentPending } from './IssueAttachmentPending';
import { Attachment, IssueAttachmentUploading } from './types';

interface IssueAttachmentsListProps {
  attachments: Attachment[];
  uploading: IssueAttachmentUploading[];
  onRetry: (key: string) => void;
  onCancel: (key: string) => void;
}

export const IssueAttachmentsList: FunctionComponent<
  IssueAttachmentsListProps
> = ({ attachments, uploading, onRetry, onCancel }) => {
  const ItemPendingComponent = useCallback(
    ({
      itemKey,
      file,
      progress,
      error,
    }: {
      itemKey: string;
      file: File;
      progress: number;
      error?: any;
    }) => (
      <IssueAttachmentPending
        file={file}
        progress={progress}
        error={error}
        onRetry={() => onRetry(itemKey)}
        onCancel={() => onCancel(itemKey)}
      />
    ),
    [onRetry, onCancel],
  );

  return (
    <AttachmentsList
      attachments={attachments}
      uploading={uploading}
      ItemComponent={IssueAttachment}
      ItemPendingComponent={ItemPendingComponent}
    />
  );
};
