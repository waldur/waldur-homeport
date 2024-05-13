import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { rejectOrderByConsumer } from '@waldur/marketplace/common/api';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { OrderActionProps } from './types';

export const RejectByConsumerButton: FC<OrderActionProps> = ({
  order,
  refetch,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await rejectOrderByConsumer(order.uuid);
      if (refetch) {
        await refetch();
      }
      dispatch(showSuccess(translate('Order has been rejected.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to reject order.')));
    }
  });
  if (
    !hasPermission(user, {
      permission: PermissionEnum.REJECT_ORDER,
      customerId: order.customer_uuid,
      projectId: order.project_uuid,
    })
  ) {
    return null;
  }
  return (
    <button
      type="button"
      className="btn btn-danger btn-sm"
      onClick={() => mutate()}
      disabled={isLoading}
    >
      <i className="fa fa-ban" /> {translate('Reject')}{' '}
      {isLoading && <LoadingSpinnerIcon className="me-1" />}
    </button>
  );
};
