import { FileIcon, TrashIcon, WarningIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { FileDownloader } from './FileDownloader';
import { ImageFetcher } from './ImageFetcher';
import { Attachment } from './types';

import './AttachmentItem.scss';

const AttachmentModal = lazyComponent(() =>
  import('./AttachmentModal').then((module) => ({
    default: module.AttachmentModal,
  })),
);

interface AttachmentItemProps {
  attachment: Attachment;
  onDelete?(attachment): void;
  isDeleting?: boolean;
  iconSize?: number;
}

export const AttachmentItem: FC<AttachmentItemProps> = ({
  attachment,
  onDelete,
  isDeleting,
  iconSize = 40,
}) => {
  const dispatch = useDispatch();
  const openModal = () =>
    dispatch(
      openModalDialog(AttachmentModal, {
        resolve: { attachment },
      }),
    );

  return (
    <div className="attachment-item">
      {isDeleting && (
        <div className="attachment-item__overlay">
          <LoadingSpinner />
        </div>
      )}
      {attachment.file ? (
        <>
          {attachment.file instanceof File ? (
            <div className="attachment-item__thumb">
              <FileIcon size={iconSize} className="text-muted" />
            </div>
          ) : (
            <div className="attachment-item__thumb">
              {attachment.mime_type &&
              attachment.mime_type.startsWith('image') ? (
                <button
                  className="text-btn text-hover-primary"
                  onClick={openModal}
                >
                  <ImageFetcher
                    url={attachment.file}
                    name={attachment.file_name}
                    thumb
                    iconSize={iconSize}
                  />
                </button>
              ) : (
                <FileDownloader
                  url={attachment.file}
                  name={attachment.file_name}
                  size={iconSize}
                />
              )}
            </div>
          )}
          <div className="attachment-item__body">
            <h6 className="fw-bold text-gray-700 mb-0">
              {attachment.file_name}
            </h6>
            <p className="fs-6 text-muted mb-0">
              {[
                attachment.file_size
                  ? formatFilesize(attachment.file_size, 'B')
                  : '',
                attachment.created ? formatDateTime(attachment.created) : '',
              ]
                .filter(Boolean)
                .join(' - ')}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="attachment-item__thumb">
            <WarningIcon weight="bold" />
          </div>
          <div className="attachment-item__body">
            <div className="attachment-item__body-name">
              {translate('Attachment is broken.')}
            </div>
          </div>
        </>
      )}
      {onDelete ? (
        <div>
          <Button
            variant="link"
            size="sm"
            className="btn-active-icon-danger attachment-item__delete p-0 btn-icon-right"
            onClick={() => onDelete(attachment)}
          >
            <span className="svg-icon svg-icon-2">
              <TrashIcon weight="bold" />
            </span>
          </Button>
        </div>
      ) : null}
    </div>
  );
};
