import { UserPlusIcon } from '@phosphor-icons/react';
import React from 'react';
import { Project } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { getPermissionDisabledTooltip } from '@/permissions/utils';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

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
      action={() =>
        openDialog(AddUserDialog, {
          refetch,
          level: 'project',
          project,
          customerUuid: project.customer_uuid,
        })
      }
      iconNode={<UserPlusIcon weight="bold" />}
      disabled={!canAddUser}
      tooltip={
        !canAddUser
          ? getPermissionDisabledTooltip(
              PermissionEnum.CREATE_PROJECT_PERMISSION,
            )
          : null
      }
    />
  );
};
