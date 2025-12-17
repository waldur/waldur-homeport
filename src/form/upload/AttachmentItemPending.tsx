import { FileIcon, TrashIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { Button, ProgressBar } from 'react-bootstrap';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

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
          <ProgressBar
            animated={!progress}
            now={progress || 100}
            className="h-8px mt-2"
          />
        ) : null}
      </div>
      <div>
        <Button
          variant="flush"
          size="sm"
          className="btn-icon-gray-400 btn-active-icon-danger attachment-item__delete btn-icon-right"
          disabled={!error && progress && progress !== 0}
          onClick={() => onCancel(file)}
        >
          <span className="svg-icon svg-icon-2">
            <TrashIcon weight="bold" />
          </span>
        </Button>
      </div>
    </div>
  );
};
