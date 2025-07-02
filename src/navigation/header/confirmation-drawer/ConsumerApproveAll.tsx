import { CheckIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersApproveByConsumer } from 'waldur-js-client';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const ConsumerApproveAll = ({ orders, refetch }) => {
  const dispatch = useDispatch();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await Promise.all(
          orders.map((order) =>
            marketplaceOrdersApproveByConsumer({ path: { uuid: order.uuid } }),
          ),
        );
        await refetch();
        dispatch(showSuccess(translate('All orders have been approved.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to approve all orders.'),
          ),
        );
      }
    },
  });
  return (
    <Button variant="primary" onClick={() => mutate()} disabled={isLoading}>
      {isLoading ? (
        <LoadingSpinnerIcon />
      ) : (
        <span className="svg-icon svg-icon-2">
          <CheckIcon weight="bold" />
        </span>
      )}
      {translate('Approve all')}
    </Button>
  );
};
