import { CheckIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersApproveByProvider } from 'waldur-js-client';
import { OrderDetails as OrderResponse } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
  TABLE_PENDING_PUBLIC_ORDERS,
  TABLE_PUBLIC_ORDERS,
} from '@/marketplace/orders/list/constants';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionButton } from '@/table/ActionButton';
import { fetchListStart, resetPagination } from '@/table/actions';

interface ApproveAllButtonProps {
  orders: OrderResponse[];
}

export const ApproveAllButton: React.FC<ApproveAllButtonProps> = (props) => {
  const dispatch = useDispatch();

  const approveMutation = useBatchMutation({
    rows: props.orders,
    mutationFn: (order) =>
      marketplaceOrdersApproveByProvider({
        path: { uuid: order.uuid },
      }),
    successMessage: translate('All orders have been approved.'),
    errorMessage: translate('Unable to approve all orders.'),
    refetch: () => {
      dispatch(resetPagination(TABLE_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PUBLIC_ORDERS));

      dispatch(resetPagination(TABLE_PENDING_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PENDING_PUBLIC_ORDERS));

      dispatch(resetPagination(TABLE_PENDING_PROVIDER_PUBLIC_ORDERS));
      dispatch(fetchListStart(TABLE_PENDING_PROVIDER_PUBLIC_ORDERS));
    },
    confirmation: {
      title: translate('Approve all orders'),
      body: translate('Are you sure you want to approve {count} orders?', {
        count: props.orders.length,
      }),
    },
  });
  return (
    <ActionButton
      variant="primary"
      action={() => approveMutation.mutate()}
      pending={approveMutation.isPending}
      iconNode={<CheckIcon weight="bold" />}
      title={translate('Approve all')}
    />
  );
};
