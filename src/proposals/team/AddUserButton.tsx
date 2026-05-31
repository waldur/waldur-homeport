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

export const AddUserButton: React.FC<AddUserDialogProps> = (props) => {
  const { openDialog } = useModal();
  const user = useUser();

  // The team panel renders for both proposal and call scopes. scope.uuid is
  // either a proposal or a call uuid — checkScope inside hasPermission
  // disambiguates by scope_type. Permission-granting on either side counts.
  const scopeUuid = props.scope?.uuid;
  const canAddUser =
    !!scopeUuid &&
    (hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROPOSAL_PERMISSION,
      scopeId: scopeUuid,
    }) ||
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_CALL_PERMISSION,
        scopeId: scopeUuid,
      }));

  return (
    <ActionItem
      title={translate('Member')}
      action={() => openDialog(AddUserDialog, props)}
      iconNode={<UserPlusIcon weight="bold" />}
      disabled={!canAddUser}
      tooltip={
        !canAddUser
          ? getPermissionDisabledTooltip(
              PermissionEnum.UPDATE_PROPOSAL_PERMISSION,
            )
          : null
      }
    />
  );
};
