import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { downloadMediaFile, FileAttachment } from './ParsedAnswer';

interface FileAttachmentsDialogProps {
  resolve: {
    files: FileAttachment[];
  };
}

export const FileAttachmentsDialog: FC<FileAttachmentsDialogProps> = ({
  resolve,
}) => (
  <ModalDialog
    title={translate('File attachments')}
    footer={<CloseDialogButton />}
  >
    <div className="flex flex-col gap-2.5">
      {resolve.files.map((file) => (
        <BaseButton
          key={file.stored_file_id}
          variant="text-primary"
          className="text-start self-start"
          onClick={() => downloadMediaFile(file.stored_file_id, file.name)}
          label={file.name}
        />
      ))}
    </div>
  </ModalDialog>
);
