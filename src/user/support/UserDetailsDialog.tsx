import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { UserDetails } from '@waldur/workspace/types';

import { UserActivateButton } from './UserActivateButton';
import { UserDetailsView } from './UserDetailsView';

interface UserDetailsDialogProps {
  resolve: { user: UserDetails };
}

export const UserDetailsDialog: FunctionComponent<UserDetailsDialogProps> = (
  props,
) => {
  return (
    <ModalDialog
      title={translate('User details of {fullName}', {
        fullName: props.resolve.user.full_name,
      })}
      footer={
        <div className="flex-grow-1 d-flex justify-content-between">
          <UserActivateButton row={props.resolve.user} />
          <CloseDialogButton label={translate('Done')} />
        </div>
      }
    >
      <UserDetailsView user={props.resolve.user} />
    </ModalDialog>
  );
};
