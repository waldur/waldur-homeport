import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { marketplaceServiceProvidersDeleteUser } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { GenericPermission } from '@waldur/permissions/types';
import { getPermissionDisabledTooltip } from '@waldur/permissions/utils';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

interface UserRemoveButtonProps {
  user: GenericPermission;
  refetch;
}

export const UserRemoveButton: FC<UserRemoveButtonProps> = ({
  user,
  refetch,
}) => {
  const currentUser = useSelector(getUser);
  const currentCustomer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const disabled = !hasPermission(currentUser, {
    permission: PermissionEnum.DELETE_CUSTOMER_PERMISSION,
    customerId: currentCustomer.uuid,
  });

  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to remove {userName}?', {
          userName: user.user_full_name || user.user_username,
        }),
      );
    } catch {
      return;
    }
    try {
      await marketplaceServiceProvidersDeleteUser({
        path: { uuid: currentCustomer.service_provider_uuid },
        body: {
          user: user.user_uuid,
          role: user.role_name,
        },
      });

      await refetch();
      dispatch(showSuccess(translate('Team member has been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete team member.')),
      );
    }
  };
  return (
    <ActionItem
      className="text-danger"
      iconColor="danger"
      title={translate('Remove')}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      disabled={disabled}
      tooltip={
        disabled &&
        getPermissionDisabledTooltip(
          PermissionEnum.DELETE_CUSTOMER_PERMISSION,
          ['customer'],
        )
      }
    />
  );
};
