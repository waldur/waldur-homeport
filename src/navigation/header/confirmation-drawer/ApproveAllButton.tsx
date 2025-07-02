import { CheckIcon } from '@phosphor-icons/react';
import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersApproveByProvider } from 'waldur-js-client';
import { OrderDetails as OrderResponse } from 'waldur-js-client';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import {
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@waldur/marketplace/orders/list/constants';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { fetchListStart, resetPagination } from '@waldur/table/actions';

interface ApproveAllButtonProps {
  orders: OrderResponse[];
}

export const ApproveAllButton: React.FC<ApproveAllButtonProps> = (props) => {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const handler = React.useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all(
        props.orders.map((order) =>
          marketplaceOrdersApproveByProvider({
            path: { uuid: order.uuid },
          }),
        ),
      );
      // refresh tables
      dispatch(resetPagination(TABLE_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PUBLIC_ORDERS));

      dispatch(resetPagination(TABLE_PENDING_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PENDING_PUBLIC_ORDERS));

      dispatch(resetPagination(TABLE_PENDING_PROVIDER_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PENDING_PROVIDER_PUBLIC_ORDERS));

      dispatch(showSuccess(translate('All orders have been approved.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to approve all orders.')),
      );
    }
    setLoading(false);
  }, [setLoading, dispatch, props.orders]);
  return (
    <Button variant="primary" onClick={handler} disabled={loading}>
      {loading ? (
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
