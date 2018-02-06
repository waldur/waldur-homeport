import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';
import { UserDetails } from '@waldur/workspace/types';

import { UserDetailsView } from './UserDetailsView';

interface UserDetailsDialogProps extends TranslateProps {
  resolve: { user: UserDetails };
}

const PureUserDetailsDialog = (props: UserDetailsDialogProps) => {
  return (
    <ModalDialog title={props.translate('User details')} footer={<CloseDialogButton/>}>
      <UserDetailsView user={props.resolve.user} />
    </ModalDialog>
  );
};

export const UserDetailsDialog = withTranslation(PureUserDetailsDialog);
export default connectAngularComponent(UserDetailsDialog, ['resolve']);
