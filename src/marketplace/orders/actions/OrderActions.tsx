import { FC } from 'react';
import { useSelector } from 'react-redux';

import { PermissionEnum, hasPermission } from '@waldur/core/permissions';
import { getUser } from '@waldur/workspace/selectors';

import { ApproveButton } from './ApproveButton';
import { RejectButton } from './RejectButton';
import { OrderActionProps } from './types';

export const OrderActions: FC<OrderActionProps> = (props) => {
  const user = useSelector(getUser);
  return (
    <>
      {hasPermission(user, {
        permission: PermissionEnum.APPROVE_ORDER,
        customerId: props.customerId,
        projectId: props.projectId,
      }) && <ApproveButton {...props} />}
      {hasPermission(user, {
        permission: PermissionEnum.REJECT_ORDER,
        customerId: props.customerId,
        projectId: props.projectId,
      }) && <RejectButton {...props} />}
    </>
  );
};
