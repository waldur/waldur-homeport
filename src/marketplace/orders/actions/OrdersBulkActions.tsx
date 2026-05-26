import { CheckIcon, ProhibitIcon } from '@phosphor-icons/react';
import {
  marketplaceOrdersApproveByConsumer,
  marketplaceOrdersApproveByProvider,
  marketplaceOrdersRejectByConsumer,
  marketplaceOrdersRejectByProvider,
  OrderDetails,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionButton } from '@/table/ActionButton';

export const OrdersBulkActions = ({
  rows,
  refetch,
}: {
  rows: OrderDetails[];
  refetch: any;
}) => {
  // Pending orders
  const pendingOrders = rows.filter((order) =>
    ['pending-consumer', 'pending-provider'].includes(order.state),
  );
  const isPendingOrderSelected = pendingOrders.length > 0;

  // Order actions
  const orderActionMap = {
    'pending-consumer': {
      approve: marketplaceOrdersApproveByConsumer,
      reject: marketplaceOrdersRejectByConsumer,
    },
    'pending-provider': {
      approve: marketplaceOrdersApproveByProvider,
      reject: marketplaceOrdersRejectByProvider,
    },
  } as const;

  const approveMutation = useBatchMutation<OrderDetails, void>({
    rows: pendingOrders,
    refetch,
    mutationFn: (order) => {
      const handler = orderActionMap[order.state]?.approve;
      return handler
        ? handler({ path: { uuid: order.uuid } })
        : Promise.resolve();
    },
    successMessage: translate('{count} order(s) have been approved.', {
      count: pendingOrders.length,
    }),
    renderPartialSuccessMessage: (n) =>
      translate('{n} order(s) have been approved.', { n }),
    errorMessage: translate('Unable to approve orders.'),
    renderErrorMessage: (n) =>
      translate('Unable to approve {n} orders.', { n }),
  });

  const rejectMutation = useBatchMutation<OrderDetails, void>({
    rows: pendingOrders,
    refetch,
    mutationFn: (order) => {
      const handler = orderActionMap[order.state]?.reject;
      return handler
        ? handler({ path: { uuid: order.uuid } })
        : Promise.resolve();
    },
    successMessage: translate('{count} order(s) have been rejected.', {
      count: pendingOrders.length,
    }),
    renderPartialSuccessMessage: (n) =>
      translate('{n} order(s) have been rejected.', { n }),
    errorMessage: translate('Unable to reject orders.'),
    renderErrorMessage: (n) => translate('Unable to reject {n} orders.', { n }),
  });

  return (
    <>
      <ActionButton
        title={translate('Approve')}
        action={() => approveMutation.mutate()}
        iconNode={<CheckIcon weight="bold" />}
        variant="primary"
        disabled={
          approveMutation.isPending ||
          rejectMutation.isPending ||
          !isPendingOrderSelected
        }
        disabledReason={
          !isPendingOrderSelected
            ? translate('No pending orders selected')
            : translate('Operation in progress')
        }
        pending={approveMutation.isPending}
      />
      <ActionButton
        title={translate('Reject')}
        action={() => rejectMutation.mutate()}
        iconNode={<ProhibitIcon weight="bold" />}
        variant="danger"
        disabled={
          approveMutation.isPending ||
          rejectMutation.isPending ||
          !isPendingOrderSelected
        }
        disabledReason={
          !isPendingOrderSelected
            ? translate('No pending orders selected')
            : translate('Operation in progress')
        }
        pending={rejectMutation.isPending}
      />
    </>
  );
};
