import { UserPlusIcon } from '@phosphor-icons/react';
import React from 'react';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useUser } from '@waldur/workspace/hooks';

const AddUserDialog = lazyComponent(() =>
  import('./AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

export const AddUserButton: React.FC<{ project: Project; refetch }> = ({
  project,
  refetch,
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  const canAddUser =
    hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
      customerId: project.customer_uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
      projectId: project.uuid,
    });

  return (
    <ActionItem
      title={translate('Member')}
      action={() => openDialog(AddUserDialog, { refetch, level: 'project' })}
      iconNode={<UserPlusIcon weight="bold" />}
      disabled={!canAddUser}
      tooltip={
        !canAddUser
          ? translate(
              "You don't have enough privileges to perform this operation.",
            )
          : null
      }
    />
  );
};
