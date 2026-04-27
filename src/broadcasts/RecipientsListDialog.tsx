import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { RecipientsList } from './RecipientsList';

export const RecipientsListDialog = (props) => (
  <ModalDialog
    title={translate('Recipients list')}
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <RecipientsList query={props.resolve.query} />
  </ModalDialog>
);
