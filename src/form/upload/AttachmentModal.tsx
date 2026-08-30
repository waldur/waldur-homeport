import { formatDateTime } from '@/core/dateUtils';
import { formatFilesize } from '@/core/utils';
import { ModalDialog } from '@/modal/ModalDialog';

import { FileDownloader } from './FileDownloader';
import { ImageFetcher } from './ImageFetcher';
import { Attachment } from './types';

export const AttachmentModal = ({
  resolve: { attachment },
}: {
  resolve: { attachment: Attachment };
}) => {
  const fileUrl =
    typeof attachment.file === 'string' ? attachment.file : undefined;

  return (
    <ModalDialog
      title={attachment.file_name}
      subtitle={
        formatFilesize(attachment.file_size, 'B') +
        ' - ' +
        formatDateTime(attachment.created)
      }
      actions={
        fileUrl ? (
          <FileDownloader url={fileUrl} name={attachment.file_name} size={30} />
        ) : undefined
      }
    >
      {fileUrl ? (
        <ImageFetcher url={fileUrl} name={attachment.file_name} />
      ) : null}
    </ModalDialog>
  );
};
