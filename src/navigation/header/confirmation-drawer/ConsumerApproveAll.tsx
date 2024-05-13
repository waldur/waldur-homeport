import { Check } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { approveOrderByConsumer } from '@waldur/marketplace/common/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const ConsumerApproveAll = ({ orders, refetch }) => {
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      await Promise.all(
        orders.map((order) => approveOrderByConsumer(order.uuid)),
      );
      await refetch();
      dispatch(showSuccess(translate('All orders have been approved.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to approve all orders.')),
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
      {isLoading ? (
        <LoadingSpinnerIcon />
      ) : (
        <span className="svg-icon svg-icon-2">
          <Check />
        </span>
      )}
      {translate('Approve all')}
    </Button>
  );
};
