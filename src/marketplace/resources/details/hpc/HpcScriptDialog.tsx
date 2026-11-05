import { FC } from 'react';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { HpcJobFile, HpcScriptViewer } from './HpcScriptViewer';

/** The script viewer where there is no room for it beside the chat. */
export const HpcScriptDialog: FC<{
  resolve: { name: string; script: string; files?: HpcJobFile[] };
}> = ({ resolve }) => (
  <ModalDialog
    title={resolve.name || translate('Batch job')}
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <HpcScriptViewer
      script={resolve.script}
      files={resolve.files}
      height="60vh"
    />
  </ModalDialog>
);
