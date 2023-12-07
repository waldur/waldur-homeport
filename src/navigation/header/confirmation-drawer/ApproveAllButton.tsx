import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { approveOrderByProvider } from '@waldur/marketplace/common/api';
import {
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@waldur/marketplace/orders/list/constants';
import { OrderResponse } from '@waldur/marketplace/orders/types';
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
      const promises = [];
      props.orders.forEach((order) => {
        promises.push(approveOrderByProvider(order.uuid));
      });
      await Promise.all(promises);
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
    <Button
      variant="primary"
      className="me-4"
      onClick={handler}
      disabled={loading}
    >
      {loading ? <LoadingSpinnerIcon /> : <i className="fa fa-check me-1" />}
      {translate('Approve all')}
    </Button>
  );
};
