import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { UserDetails } from '@waldur/workspace/types';

import { UserDetailsView } from './UserDetailsView';

interface UserDetailsDialogProps {
  resolve: { user: UserDetails };
}

export const UserDetailsDialog: FunctionComponent<UserDetailsDialogProps> = (
  props,
) => {
  return (
    <ModalDialog
      title={translate('User details')}
      footer={<CloseDialogButton />}
    >
      <UserDetailsView user={props.resolve.user} />
    </ModalDialog>
  );
};
