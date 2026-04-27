import { FunctionComponent } from 'react';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

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
