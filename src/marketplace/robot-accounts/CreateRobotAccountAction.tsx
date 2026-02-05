import { RobotIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { useUser } from '@waldur/workspace/hooks';

import { ResourceAction } from '../resources/actions/constants';

const CreateRobotAccountDialog = lazyComponent(() =>
  import('./CreateRobotAccountDialog').then((module) => ({
    default: module.CreateRobotAccountDialog,
  })),
);

export const CreateRobotAccountAction: ActionItemType = ({ resource }) => {
  const dispatch = useDispatch();

  const callback = () =>
    dispatch(
      openModalDialog(CreateRobotAccountDialog, {
        resolve: {
          resource,
        },
      }),
    );
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
