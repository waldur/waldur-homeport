import { FileIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton, LinkButton, Progress } from 'waldur-ui';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

import { AttachmentCard } from './AttachmentCard';

interface AttachmentItemPendingProps {
  file: File;
  progress: number;
  error?: any;
  iconSize?: number;
  onRetry?(file: File): void;
  onCancel?(file: File): void;
}

export const AttachmentItemPending: FC<AttachmentItemPendingProps> = ({
  file,
  progress,
  error,
  iconSize = 22,
  onRetry,
  onCancel,
}) => {
  return (
    <AttachmentCard
      error={Boolean(error)}
      data-testid="pending-attachment-item"
      thumb={<FileIcon size={iconSize} weight="bold" />}
      title={error ? translate('Upload failed, please try again') : file.name}
      subtitle={error ? file.name : formatFilesize(file.size, 'B')}
      actions={
        <BaseButton
          iconNode={<TrashIcon weight="bold" />}
          tooltip={translate('Cancel upload')}
          onClick={() => onCancel(file)}
          variant="text-danger"
          disabled={!error && progress && progress !== 0}
          size="sm"
        />
      }
    >
      {error ? (
        <LinkButton
          variant="danger"
          className="mt-1"
          onClick={() => onRetry(file)}
        >
          {translate('Try again')}
        </LinkButton>
      ) : progress || progress === 0 ? (
        progress ? (
          <Progress className="mt-1.5" value={progress} />
        ) : (
          <Progress className="mt-1.5" indeterminate />
        )
      ) : null}
    </AttachmentCard>
  );
};
