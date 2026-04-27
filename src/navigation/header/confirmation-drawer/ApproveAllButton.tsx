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
import { showSuccess, showErrorResponse } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { fetchListStart, resetPagination } from '@/table/actions';

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
    <ActionButton
      variant="primary"
      action={handler}
      pending={loading}
      iconNode={<CheckIcon weight="bold" />}
      title={translate('Approve all')}
    />
  );
};
