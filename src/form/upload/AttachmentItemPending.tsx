import { FileIcon, TrashIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

import { BaseButton, Progress } from 'waldur-ui';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

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
    <div
      className={classNames('attachment-item', error && 'attachment-error')}
      data-testid="pending-attachment-item"
    >
      <div className="attachment-item__thumb">
        <FileIcon size={iconSize} weight="bold" />
      </div>

      <div className="attachment-item__body">
        <h6 className="fw-bold text-secondary">
          {error ? translate('Upload failed, please try again') : file.name}
        </h6>
        <p className="fs-6 text-muted">
          {error ? file.name : formatFilesize(file.size, 'B')}
        </p>
        {error ? (
          <button
            type="button"
            className="text-anchor text-anchor-danger mt-4px"
            onClick={() => onRetry(file)}
          >
            {translate('Try again')}
          </button>
        ) : progress || progress === 0 ? (
          progress ? (
            <Progress className="mt-2" value={progress} />
          ) : (
            <Progress className="mt-2" indeterminate />
          )
        ) : null}
      </div>
      <div>
        <BaseButton
          iconNode={<TrashIcon weight="bold" />}
          tooltip={translate('Cancel upload')}
          onClick={() => onCancel(file)}
          variant="text-danger"
          className="attachment-item__delete"
          disabled={!error && progress && progress !== 0}
          size="sm"
        />
      </div>
    </div>
  );
};
