import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

const RobotAccountEditDialog = lazyComponent(() =>
  import('./RobotAccountEditDialog').then((module) => ({
    default: module.RobotAccountEditDialog,
  })),
);

export const RobotAccountEditButton = (props) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(RobotAccountEditDialog, {
        resolve: { resource: props.row, refetch: props.refetch },
      }),
    );
  const user = useUser();
  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_RESOURCE_ROBOT_ACCOUNT,
      customerId: props.row.provider_uuid,
    })
  ) {
    return null;
  }
  return <EditAction action={callback} size="sm" />;
};
