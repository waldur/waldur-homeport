import { User } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { ActiveInvitationsList } from './ActiveInvitationsList';

interface ActiveInvitationsDialogProps {
  resolve: { user: User };
}

export const ActiveInvitationsDialog = ({
  resolve,
}: ActiveInvitationsDialogProps) => (
  <ModalDialog
    title={translate('Pending invitations')}
    subtitle={translate('Pending invitations sent to your email: {email}', {
      email: resolve.user.email,
    })}
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <ActiveInvitationsList user={resolve.user} />
  </ModalDialog>
);
