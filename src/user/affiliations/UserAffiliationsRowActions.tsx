import { FC, useMemo } from 'react';
import { Permission } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
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
  const user = useUser();

  // Check user permission based on the scope type
  const canDeletePermission = useMemo(
    () => canDeletePermissionFn(user, props.row),
    [user, props.row],
  );

  const { mutate: callback, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => revokePermission(props.row),
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to revoke this permission?'),
    },
    successMessage: translate('Permission has been revoked.'),
    errorMessage: translate('Unable to revoke permission.'),
    refetch: props.fetch,
  });

  return (
    <ActionsDropdownComponent>
      <RemovalActionItem
        action={callback}
        title={translate('Revoke')}
        disabled={!canDeletePermission || isPending}
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
