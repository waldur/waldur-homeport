import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Permission } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import {
  canDeletePermission as canDeletePermissionFn,
  canRestorePermission as canRestorePermissionFn,
  restoreUserRole,
  revokeUserRole,
} from './utils';

interface UserAffiliationsRowActionsProps {
  row: Permission;
  fetch;
}

export const UserAffiliationsRowActions: FC<UserAffiliationsRowActionsProps> = (
  props,
) => {
  const user = useUser();
  const { row } = props;

  const canRevoke = useMemo(
    () => canDeletePermissionFn(user, row),
    [user, row],
  );
  const canRestore = useMemo(
    () => canRestorePermissionFn(user, row),
    [user, row],
  );

  const scopeLabel = renderFieldOrDash(row.scope_name);

  const { mutate: revoke, isPending: isRevoking } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => revokeUserRole(row),
    confirmation: {
      title: translate('Revoke access'),
      body: translate(
        'Revoking {role} role for {scope}. This will remove associated permissions immediately.',
        { role: row.role_name, scope: scopeLabel },
      ),
    },
    successMessage: translate('Access has been revoked.'),
    errorMessage: translate('Unable to revoke access.'),
    refetch: props.fetch,
  });

  const { mutate: restore, isPending: isRestoring } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => restoreUserRole(row),
    confirmation: {
      title: translate('Restore access'),
      body: translate(
        'Restoring {role} role for {scope}. This will reinstate associated permissions immediately.',
        { role: row.role_name, scope: scopeLabel },
      ),
    },
    successMessage: translate('Access has been restored.'),
    errorMessage: translate('Unable to restore access.'),
    refetch: props.fetch,
  });

  return (
    <ActionsDropdownComponent>
      {row.is_active ? (
        <RemovalActionItem
          action={revoke}
          title={translate('Revoke')}
          disabled={!canRevoke || isRevoking}
          tooltip={
            !canRevoke
              ? translate(
                  "You don't have enough privileges to perform this operation.",
                )
              : undefined
          }
        />
      ) : (
        <ActionItem
          action={restore}
          title={translate('Restore')}
          iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
          disabled={!canRestore || isRestoring}
          tooltip={
            !canRestore
              ? row.scope_is_removed
                ? translate('The scope of this role has been deleted.')
                : translate(
                    "You don't have enough privileges to perform this operation.",
                  )
              : undefined
          }
        />
      )}
    </ActionsDropdownComponent>
  );
};
