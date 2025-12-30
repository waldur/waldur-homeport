import { FunctionComponent } from 'react';

import { AttachmentItemPending } from '@waldur/form/upload/AttachmentItemPending';

interface IssueAttachmentPendingProps {
  file: File;
  progress: number;
  error?: any;
  onRetry: () => void;
  onCancel: () => void;
}

export const IssueAttachmentPending: FunctionComponent<
  IssueAttachmentPendingProps
> = ({ file, progress, error, onRetry, onCancel }) => {
  return (
    <AttachmentItemPending
      file={file}
      progress={progress}
      error={error}
      onRetry={onRetry}
      onCancel={onCancel}
    />
  );
};
