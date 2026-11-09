import { UserPlusIcon } from '@phosphor-icons/react';
import React from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { getPermissionDisabledTooltip } from '@/permissions/utils';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

import { AddUserDialogProps } from './types';

const AddUserDialog = lazyComponent(() =>
  import('./AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

const ADD_USER_PERMISSIONS = [
  PermissionEnum.CREATE_CALL_PERMISSION,
  PermissionEnum.MANAGE_PROPOSAL,
];

/**
 * Whether the user may add a member to the team of ``scope``, and if not,
 * who may. Mirrors UserRoleCreateSerializer: the scope type's create
 * permission -- CALL.CREATE_PERMISSION for a call, PROPOSAL.MANAGE for a
 * proposal -- held on the scope's organization or on the scope itself. The
 * team panel renders for both, and checkScope inside hasPermission tells them
 * apart by scope_type. Organization owners hold the call one on the
 * organization. ``override`` decides instead where the scope has rules of
 * its own.
 */
export const useCanAddTeamMember = (
  scope: AddUserDialogProps['scope'] | undefined,
  override?: boolean,
  /** The team's role types; the tooltip names only the roles of these. */
  roleTypes?: AddUserDialogProps['roleTypes'],
) => {
  const user = useUser();
  const scopeUuid = scope?.uuid;
  const canAddUser =
    override ??
    (!!scopeUuid &&
      ADD_USER_PERMISSIONS.some((permission) =>
        hasPermission(user, {
          permission,
          scopeId: scopeUuid,
          customerId: scope?.customer_uuid,
        }),
      ));
  return {
    canAddUser,
    reason: canAddUser
      ? undefined
      : getPermissionDisabledTooltip(
          ADD_USER_PERMISSIONS,
          roleTypes?.length
            ? ['customer', ...roleTypes]
            : ['customer', 'call', 'proposal'],
        ),
  };
};

export const AddUserButton: React.FC<
  AddUserDialogProps & {
    /** Decided by the caller when the scope has rules of its own, e.g. a
     * proposal whose call managers may add its managers. */
    canAddUser?: boolean;
    /** Asked before the dialog opens; it stays shut unless this resolves
     * to true. */
    beforeOpen?: () => Promise<boolean>;
  }
> = ({ canAddUser: canAddUserOverride, beforeOpen, ...props }) => {
  const { openDialog } = useModal();
  const { canAddUser, reason } = useCanAddTeamMember(
    props.scope,
    canAddUserOverride,
    props.roleTypes,
  );

  return (
    <ActionItem
      title={translate('Member')}
      action={async () => {
        if (beforeOpen && !(await beforeOpen())) return;
        openDialog(AddUserDialog, props);
      }}
      iconNode={<UserPlusIcon weight="bold" />}
      disabled={!canAddUser}
      tooltip={reason ?? null}
    />
  );
};
