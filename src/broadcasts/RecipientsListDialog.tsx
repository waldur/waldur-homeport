import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { RecipientsList } from './RecipientsList';

export const RecipientsListDialog = (props) => (
  <ModalDialog
    title={translate('Recipients list')}
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <RecipientsList query={props.resolve.query} />
  </ModalDialog>
);
