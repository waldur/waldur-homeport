import { useMutation } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { rejectOrder } from '@waldur/marketplace/common/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const RejectButton: FunctionComponent<{ orderId: string; refetch? }> = ({
  orderId,
  refetch,
}) => {
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
