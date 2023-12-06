import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { approveOrderByConsumer } from '@waldur/marketplace/common/api';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { wrapTooltip } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { OrderActionProps } from './types';

export const ApproveByConsumerButton: FC<OrderActionProps> = ({
  orderId,
  customerId,
  projectId,
  refetch,
}) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await approveOrderByConsumer(orderId);
      if (refetch) {
        await refetch();
      }
      dispatch(showSuccess(translate('Order has been approved.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to approve order.')));
    }
  });
  if (
    !hasPermission(user, {
      permission: PermissionEnum.APPROVE_ORDER,
      customerId: customerId,
      projectId: projectId,
    })
  ) {
    return null;
  }
  return wrapTooltip(
    translate('You need approval to finish purchasing of services.'),
    <button
      type="button"
      className="btn btn-primary btn-sm me-1"
      onClick={() => mutate()}
      disabled={isLoading}
    >
      <i className="fa fa-check" /> {translate('Approve')}{' '}
      {isLoading && <i className="fa fa-spinner fa-spin me-1" />}
    </button>,
  );
};
