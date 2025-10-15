import { FunctionComponent } from 'react';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface TermsOfServiceDialogProps {
  resolve: {
    content: string;
  };
}

export const TermsOfServiceDialog: FunctionComponent<
  TermsOfServiceDialogProps
> = (props) => (
  <ModalDialog
    title={translate('Terms of Service')}
    footer={<CloseDialogButton label={translate('Ok')} />}
  >
    <SafeMarkdown text={props.resolve.content} />
  </ModalDialog>
);
