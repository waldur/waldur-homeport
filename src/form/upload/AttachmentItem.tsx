import { FileIcon, TrashIcon, WarningIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { decodeFileName, formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { AttachmentCard } from './AttachmentCard';
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

  const thumb = !attachment.file ? (
    <WarningIcon size={iconSize} className="text-quinary" weight="bold" />
  ) : attachment.file instanceof File ? (
    <FileIcon size={iconSize} weight="bold" />
  ) : attachment.mime_type?.startsWith('image') ? (
    <button
      type="button"
      className="bg-transparent border-0 p-0 m-0 cursor-pointer text-quaternary hover:text-brand inline-flex"
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
    <FileDownloader url={attachment.file} name={fileName} size={iconSize} />
  );

  const meta = [
    attachment.file_size ? formatFilesize(attachment.file_size, 'B') : '',
    attachment.created ? formatDateTime(attachment.created) : '',
  ]
    .filter(Boolean)
    .join(' - ');

  return (
    <AttachmentCard
      error={Boolean(error)}
      overlay={isDeleting ? <LoadingSpinner /> : null}
      thumb={thumb}
      title={attachment.file ? fileName : translate('Attachment is broken.')}
      subtitle={attachment.file ? meta : undefined}
      bodyClassName={attachment.file ? undefined : 'self-center'}
      actions={
        onDelete ? (
          <BaseButton
            iconNode={<TrashIcon weight="bold" />}
            tooltip={translate('Delete attachment')}
            onClick={() => onDelete(attachment)}
            variant="text-danger"
            size="sm"
          />
        ) : null
      }
    />
  );
};
