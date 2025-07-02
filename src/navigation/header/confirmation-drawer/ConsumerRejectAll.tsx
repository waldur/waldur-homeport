import { ProhibitIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersRejectByConsumer } from 'waldur-js-client';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const ConsumerRejectAll = ({ orders, refetch }) => {
  const dispatch = useDispatch();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await Promise.all(
          orders.map((order) =>
            marketplaceOrdersRejectByConsumer({ path: { uuid: order.uuid } }),
          ),
        );
        await refetch();
        dispatch(showSuccess(translate('All orders have been rejected.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to reject all orders.'),
          ),
        );
      }
    },
  });
  return (
    <Button variant="danger" onClick={() => mutate()} disabled={isLoading}>
      {isLoading ? (
        <LoadingSpinnerIcon />
      ) : (
        <span className="svg-icon svg-icon-2">
          <ProhibitIcon weight="bold" />
        </span>
      )}
      {translate('Reject all')}
    </Button>
  );
};
