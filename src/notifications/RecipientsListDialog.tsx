import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { RecipientsListComponent } from './RecipientsList';

export const RecipientsListDialog = (props) => (
  <ModalDialog
    title={translate('Recepients list')}
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <RecipientsListComponent query={props.resolve.query} />
  </ModalDialog>
);
