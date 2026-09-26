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

export const AddUserButton: React.FC<AddUserDialogProps> = (props) => {
  const { openDialog } = useModal();
  const user = useUser();

  // Mirrors UserRoleCreateSerializer: the scope type's create permission --
  // CALL.CREATE_PERMISSION for a call, PROPOSAL.MANAGE for a proposal -- held
  // on the scope's organization or on the scope itself. The team panel renders
  // for both, and checkScope inside hasPermission tells them apart by
  // scope_type. Organization owners hold the call one on the organization.
  const scopeUuid = props.scope?.uuid;
  const canAddUser =
    !!scopeUuid &&
    ADD_USER_PERMISSIONS.some((permission) =>
      hasPermission(user, {
        permission,
        scopeId: scopeUuid,
        customerId: props.scope?.customer_uuid,
      }),
    );

  return (
    <ActionItem
      title={translate('Member')}
      action={() => openDialog(AddUserDialog, props)}
      iconNode={<UserPlusIcon weight="bold" />}
      disabled={!canAddUser}
      tooltip={
        !canAddUser
          ? getPermissionDisabledTooltip(ADD_USER_PERMISSIONS, [
              'customer',
              'call',
              'proposal',
            ])
          : null
      }
    />
  );
};
