import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { PermissionEnum, hasPermission } from '@waldur/core/permissions';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';
import { getUser } from '@waldur/workspace/selectors';

const CreateRobotAccountDialog = lazyComponent(
  () => import('./CreateRobotAccountDialog'),
  'CreateRobotAccountDialog',
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
  const user = useSelector(getUser);
  if (
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_RESOURCE_ROBOT_ACCOUNT,
      customerId: resource.offering_customer_uuid,
    })
  ) {
    return null;
  }

  return (
    <ActionItem title={translate('Create robot account')} action={callback} />
  );
};
