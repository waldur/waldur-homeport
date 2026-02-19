import { TrashIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Permission } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { useUser } from '@waldur/workspace/hooks';

import {
  canDeletePermission as canDeletePermissionFn,
  revokePermission,
} from './utils';

interface UserAffiliationsRowActionsProps {
  row: Permission;
  fetch;
}

export const UserAffiliationsRowActions: FC<UserAffiliationsRowActionsProps> = (
  props,
) => {
  const user = useUser();
  // Check user permission based on the scope type
  const canDeletePermission = useMemo(
    () => canDeletePermissionFn(user, props.row),
    [user, props.row],
  );

  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to revoke this permission?'),
      );
    } catch {
      return;
    }
    try {
      await revokePermission(props.row);
      dispatch(showSuccess(translate('Permission has been revoked.')));
      await props.fetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to revoke permission.')));
    }
  };
  return (
    <ActionsDropdownComponent>
      <ActionItem
        action={callback}
        title={translate('Revoke')}
        iconNode={<TrashIcon weight="bold" />}
        className="text-danger"
        iconColor="danger"
        disabled={!canDeletePermission}
        tooltip={
          !canDeletePermission &&
          translate(
            "You don't have enough privileges to perform this operation.",
          )
        }
      />
    </ActionsDropdownComponent>
  );
};
