import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { rejectOrder } from '@waldur/marketplace/common/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { orderCanBeRejected } from './selectors';
import { OrderActionProps } from './types';

export const RejectButton: FC<OrderActionProps> = ({ orderId, refetch }) => {
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await rejectOrder(orderId);
      if (refetch) {
        await refetch();
      }
      dispatch(showSuccess(translate('Order has been rejected.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to reject order.')));
    }
  });
  const isValid = useSelector(orderCanBeRejected);
  if (!isValid) {
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
      {isLoading && <i className="fa fa-spinner fa-spin me-1" />}
    </button>
  );
};
