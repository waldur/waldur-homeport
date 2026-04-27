import { ProhibitIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersRejectByProvider } from 'waldur-js-client';
import { OrderDetails as OrderResponse } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@/marketplace/orders/list/constants';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { fetchListStart, resetPagination } from '@/table/actions';

interface RejectAllButtonProps {
  orders: OrderResponse[];
}

export const RejectAllButton: React.FC<RejectAllButtonProps> = (props) => {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const handler = React.useCallback(async () => {
    setLoading(true);
    try {
      const promises = [];
      props.orders.forEach((order) => {
        promises.push(
          marketplaceOrdersRejectByProvider({ path: { uuid: order.uuid } }),
        );
      });
      await Promise.all(promises);
      // refresh tables
      dispatch(resetPagination(TABLE_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PUBLIC_ORDERS));

      dispatch(resetPagination(TABLE_PENDING_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PENDING_PUBLIC_ORDERS));

      dispatch(resetPagination(TABLE_PENDING_PROVIDER_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PENDING_PROVIDER_PUBLIC_ORDERS));

      dispatch(showSuccess(translate('All orders have been rejected.')));
    } catch (response) {
      dispatch(
        showErrorResponse(response, translate('Unable to reject all orders.')),
      );
    }
    setLoading(false);
  }, [setLoading, dispatch, props.orders]);
  return (
    <ActionButton
      variant="danger"
      action={handler}
      pending={loading}
      iconNode={<ProhibitIcon weight="bold" />}
      title={translate('Reject all')}
    />
  );
};
