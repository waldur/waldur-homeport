import { FC } from 'react';

import { ENV } from '@/core/config';
import { downloadFile } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface FileAttachment {
  name: string;
  size?: number;
  mime_type?: string;
  stored_file_id: string;
}

interface FileAttachmentsDialogProps {
  resolve: {
    files: FileAttachment[];
  };
}

const downloadMediaFile = (storedFileId: string, fileName: string) => {
  const url = `${ENV.apiEndpoint}api/media/${storedFileId}/`;
  downloadFile(url, fileName);
};

export const FileAttachmentsDialog: FC<FileAttachmentsDialogProps> = ({
  resolve,
}) => (
  <ModalDialog
    title={translate('File attachments')}
    footer={<CloseDialogButton className="min-w-125px" />}
  >
    <div className="d-flex flex-column gap-3">
      {resolve.files.map((file) => (
        <button
          key={file.stored_file_id}
          type="button"
          className="btn btn-link p-0 text-primary text-start align-self-start"
          onClick={() => downloadMediaFile(file.stored_file_id, file.name)}
        >
          {file.name}
        </button>
      ))}
    </div>
  </ModalDialog>
);
