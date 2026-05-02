import { FC, useMemo } from 'react';
import { Permission } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useNotify } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

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
  const { confirm } = useModal();
  const user = useUser();

  // Check user permission based on the scope type
  const canDeletePermission = useMemo(
    () => canDeletePermissionFn(user, props.row),
    [user],
  );

  const { showErrorResponse, showSuccess } = useNotify();

  const callback = async () => {
    try {
      await confirm(
        translate('Confirmation'),
        translate('Are you sure you want to revoke this permission?'),
      );
    } catch {
      return;
    }
    try {
      await revokePermission(props.row);
      showSuccess(translate('Permission has been revoked.'));
      await props.fetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to revoke permission.'));
    }
  };
  return (
    <ActionsDropdownComponent>
      <RemovalActionItem
        action={callback}
        title={translate('Revoke')}
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
