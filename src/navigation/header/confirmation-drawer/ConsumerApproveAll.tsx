import { useMutation } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { approveOrder } from '@waldur/marketplace/common/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const ConsumerApproveAll = ({ orders, refetch }) => {
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await Promise.all(orders.map((order) => approveOrder(order.uuid)));
      await refetch();
      dispatch(showSuccess(translate('All order items have been approved.')));
    } catch (response) {
      dispatch(
        showErrorResponse(
          response,
          translate('Unable to approve all order items.'),
        ),
      );
    }
  });
  return (
    <Button
      variant="primary"
      className="me-4"
      onClick={() => mutate()}
      disabled={isLoading}
    >
      {isLoading ? <LoadingSpinnerIcon /> : <i className="fa fa-check me-1" />}
      {translate('Approve all')}
    </Button>
  );
};
