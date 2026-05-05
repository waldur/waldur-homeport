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
}) => (
  <ModalDialog
    title={attachment.file_name}
    subtitle={
      formatFilesize(attachment.file_size, 'B') +
      ' - ' +
      formatDateTime(attachment.created)
    }
    actions={
      <FileDownloader
        url={attachment.file}
        name={attachment.file_name}
        size={30}
      />
    }
  >
    <ImageFetcher url={attachment.file} name={attachment.file_name} />
  </ModalDialog>
);
