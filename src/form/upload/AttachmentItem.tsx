import { FileIcon, TrashIcon, WarningIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

import { CompactIconButton } from '@/core/buttons/IconButton';
import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { decodeFileName, formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { FileDownloader } from './FileDownloader';
import { ImageFetcher } from './ImageFetcher';
import { Attachment } from './types';

const AttachmentModal = lazyComponent(() =>
  import('./AttachmentModal').then((module) => ({
    default: module.AttachmentModal,
  })),
);

interface AttachmentItemProps {
  attachment: Attachment;
  error?: any;
  onDelete?(attachment): void;
  isDeleting?: boolean;
  iconSize?: number;
}

export const AttachmentItem: FC<AttachmentItemProps> = ({
  attachment,
  error,
  onDelete,
  isDeleting,
  iconSize = 22,
}) => {
  const { openDialog } = useModal();
  const openModal = () =>
    openDialog(AttachmentModal, {
      resolve: { attachment },
    });

  const fileName = decodeFileName(attachment.file_name);

  return (
    <div className={classNames('attachment-item', error && 'attachment-error')}>
      {isDeleting && (
        <div className="attachment-item__overlay">
          <LoadingSpinner />
        </div>
      )}
      {attachment.file ? (
        <>
          {attachment.file instanceof File ? (
            <div className="attachment-item__thumb">
              <FileIcon size={iconSize} weight="bold" />
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
                    name={fileName}
                    thumb
                    iconSize={iconSize}
                  />
                </button>
              ) : (
                <FileDownloader
                  url={attachment.file}
                  name={fileName}
                  size={iconSize}
                />
              )}
            </div>
          )}
          <div className="attachment-item__body">
            <h6 className="fw-bold text-secondary">{fileName}</h6>
            <p className="fs-6 text-muted">
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
            <WarningIcon
              size={iconSize}
              className="text-gray-400"
              weight="bold"
            />
          </div>
          <div className="attachment-item__body align-self-center">
            <h6 className="fw-bold text-secondary">
              {translate('Attachment is broken.')}
            </h6>
          </div>
        </>
      )}
      {onDelete ? (
        <div>
          <CompactIconButton
            iconNode={<TrashIcon weight="bold" />}
            tooltip={translate('Delete attachment')}
            onClick={() => onDelete(attachment)}
            variant="flush"
            className="btn-icon-gray-400 btn-active-icon-danger attachment-item__delete btn-icon-right"
          />
        </div>
      ) : null}
    </div>
  );
};
