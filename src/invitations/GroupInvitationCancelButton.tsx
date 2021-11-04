import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { cancelGroupInvitation } from '@waldur/invitations/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface GroupInvitationCancelButtonProps {
  permissionRequest: any;
  refreshList;
}

export const GroupInvitationCancelButton: FunctionComponent<GroupInvitationCancelButtonProps> =
  ({ permissionRequest, refreshList }) => {
    const dispatch = useDispatch();
    const callback = async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to cancel invitation by {name}?', {
            name: permissionRequest.created_by_full_name,
          }),
        );
      } catch {
        return;
      }
      try {
        await cancelGroupInvitation(permissionRequest.uuid);
        refreshList();
        dispatch(
          showSuccess(translate('Group invitation has been cancelled.')),
        );
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to cancel group invitation.')),
        );
      }
    };
    return (
      <ActionButton
        action={callback}
        title={translate('Cancel')}
        icon="fa fa-ban"
      />
    );
  };
