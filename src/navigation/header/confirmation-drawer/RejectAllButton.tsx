import { ProhibitIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceOrdersRejectByProvider,
  OrderDetails as OrderResponse,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@/marketplace/orders/list/constants';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionButton } from '@/table/ActionButton';
import { fetchListStart, resetPagination } from '@/table/actions';

interface RejectAllButtonProps {
  orders: OrderResponse[];
}

export const RejectAllButton: React.FC<RejectAllButtonProps> = (props) => {
  const dispatch = useDispatch();

  const batchMutation = useBatchMutation({
    rows: props.orders,
    mutationFn: (order) =>
      marketplaceOrdersRejectByProvider({ path: { uuid: order.uuid } }),
    successMessage: translate('All orders have been rejected.'),
    errorMessage: translate('Unable to reject all orders.'),
    refetch: () => {
      // refresh tables
      dispatch(resetPagination(TABLE_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PUBLIC_ORDERS));

      dispatch(resetPagination(TABLE_PENDING_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PENDING_PUBLIC_ORDERS));

      dispatch(resetPagination(TABLE_PENDING_PROVIDER_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PENDING_PROVIDER_PUBLIC_ORDERS));
    },
    confirmation: {
      title: translate('Reject all orders'),
      body: translate('Are you sure you want to reject {count} orders?', {
        count: props.orders.length,
      }),
    },
  });

  return (
    <ActionButton
      variant="danger"
      action={() => batchMutation.mutate()}
      pending={batchMutation.isPending}
      iconNode={<ProhibitIcon weight="bold" />}
      title={translate('Reject all')}
    />
  );
};
