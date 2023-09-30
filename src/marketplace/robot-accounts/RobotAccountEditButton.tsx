import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
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
  return (
    <ActionButton
      title={translate('Edit')}
      action={callback}
      icon="fa fa-edit"
    />
  );
};
