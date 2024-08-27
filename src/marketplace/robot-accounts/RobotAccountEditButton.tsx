import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getUser } from '@waldur/workspace/selectors';

const RobotAccountEditDialog = lazyComponent(
  () => import('./RobotAccountEditDialog'),
  'RobotAccountEditDialog',
);

export const RobotAccountEditButton = (props) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(RobotAccountEditDialog, {
        resolve: { resource: props.row, refetch: props.refetch },
      }),
    );
  const user = useSelector(getUser);
  if (
    !hasPermission(user, {
      permission: PermissionEnum.UPDATE_RESOURCE_ROBOT_ACCOUNT,
      customerId: props.row.offering_customer_uuid,
    })
  ) {
    return null;
  }
  return <EditButton onClick={callback} size="sm" />;
};
