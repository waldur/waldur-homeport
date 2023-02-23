import { FunctionComponent, ReactNode } from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface MessageDialogProps {
  resolve: {
    title: ReactNode;
    message: ReactNode;
  };
}

export const MessageDialog: FunctionComponent<MessageDialogProps> = (props) => (
  <ModalDialog
    title={props.resolve.title}
    footer={<CloseDialogButton label={translate('Ok')} />}
  >
    {props.resolve.message}
  </ModalDialog>
);
