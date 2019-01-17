import * as React from 'react';

import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

interface MessageDialogProps {
  resolve: {
    title: string;
    message: string;
  };
}

export const MessageDialog = (props: MessageDialogProps) => (
  <ModalDialog title={props.resolve.title} footer={<CloseDialogButton/>}>
    {props.resolve.message}
  </ModalDialog>
);

export default connectAngularComponent(MessageDialog, ['resolve']);
