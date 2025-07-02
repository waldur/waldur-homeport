import { FileIcon, TrashIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { Button, ProgressBar } from 'react-bootstrap';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import './AttachmentItem.scss';

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
  iconSize = 20,
  onRetry,
  onCancel,
}) => {
  return (
    <div
      className={classNames('attachment-item', error && 'attachment-error')}
      data-testid="pending-attachment-item"
    >
      <div className="attachment-item__thumb">
        <FileIcon
          size={iconSize}
          weight="bold"
          className={error ? 'text-danger' : 'text-muted'}
        />
      </div>

      <div className="attachment-item__body">
        <h6 className="fw-bold text-gray-700 mb-0">
          {error ? translate('Upload failed, please try again') : file.name}
        </h6>
        <p className="fs-6 text-muted mb-0">
          {error ? file.name : formatFilesize(file.size, 'B')}
        </p>
        {error ? (
          <button
            type="button"
            className="text-btn text-gray-700 text-hover-primary fw-bold"
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
          variant="link"
          size="sm"
          className={classNames(
            'btn-active-icon-danger attachment-item__delete p-0 btn-icon-right',
            error && 'btn-icon-danger',
          )}
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
