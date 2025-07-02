import { XCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { GroupInvitation, userGroupInvitationsCancel } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface GroupInvitationCancelButtonProps {
  invitation: GroupInvitation;
  refetch;
}

export const GroupInvitationCancelButton: FunctionComponent<
  GroupInvitationCancelButtonProps
> = ({ invitation: permissionRequest, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Cancel invitation'),
        translate(
          'You are going to cancel invitation by {name}. This action cannot be undone.',
          { name: permissionRequest.created_by_full_name },
        ),
        {
          type: 'danger',
          size: 'sm',
          positiveButton: translate('Unsent'),
          negativeButton: translate('Cancel'),
          positiveButtonVariant: 'light-danger',
          iconNode: <XCircleIcon weight="bold" />,
        },
      );
    } catch {
      return;
    }
    try {
      await userGroupInvitationsCancel({
        path: { uuid: permissionRequest.uuid },
      });
      refetch();
      dispatch(showSuccess(translate('Group invitation has been cancelled.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to cancel group invitation.')),
      );
    }
  };
  return (
    <ActionItem
      action={callback}
      title={translate('Cancel')}
      iconNode={<XCircleIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
      disabled={!permissionRequest.is_active}
    />
  );
};
