import * as React from 'react';

import { translate } from '@waldur/i18n';
import { TermsOfServiceContent } from '@waldur/marketplace/common/TermsOfServiceContent';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

interface TermsOfServiceDialogProps {
  resolve: {
    content: string;
  };
}

export const TermsOfServiceDialog = (props: TermsOfServiceDialogProps) => (
  <ModalDialog
    title={translate('Terms of Service')}
    footer={<CloseDialogButton />}
  >
    <TermsOfServiceContent content={props.resolve.content}/>
  </ModalDialog>
);

export default connectAngularComponent(TermsOfServiceDialog, ['resolve']);
