import { Prohibit } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { cancelGroupInvitation } from '@waldur/invitations/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

interface GroupInvitationCancelButtonProps {
  permissionRequest: any;
  refetch;
}

export const GroupInvitationCancelButton: FunctionComponent<
  GroupInvitationCancelButtonProps
> = ({ permissionRequest, refetch }) => {
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
      refetch();
      dispatch(showSuccess(translate('Group invitation has been cancelled.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to cancel group invitation.')),
      );
    }
  };
  return (
    <RowActionButton
      action={callback}
      title={translate('Cancel')}
      iconNode={<Prohibit />}
      size="sm"
    />
  );
};
