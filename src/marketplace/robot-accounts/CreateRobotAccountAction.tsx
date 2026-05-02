import { RobotIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from '../resources/actions/constants';

const CreateRobotAccountDialog = lazyComponent(() =>
  import('./CreateRobotAccountDialog').then((module) => ({
    default: module.CreateRobotAccountDialog,
  })),
);

export const CreateRobotAccountAction: ActionItemType = ({ resource }) => {
  const { openDialog } = useModal();

  const callback = () =>
    openDialog(CreateRobotAccountDialog, {
      resolve: {
        resource,
      },
    });
  const user = useUser();
  if (
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_RESOURCE_ROBOT_ACCOUNT,
      customerId: resource.provider_uuid,
    })
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Create robot account')}
      action={callback}
      iconNode={<RobotIcon weight="bold" />}
      actionId={ResourceAction.CREATE_ROBOT_ACCOUNT}
      resource={resource}
    />
  );
};
