import { CheckIcon, ProhibitIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceOrdersApproveByConsumer,
  marketplaceOrdersApproveByProvider,
  marketplaceOrdersRejectByConsumer,
  marketplaceOrdersRejectByProvider,
  OrderDetails,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showInfo, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

export const OrdersBulkActions = ({
  rows,
  refetch,
}: {
  rows: OrderDetails[];
  refetch: any;
}) => {
  const dispatch = useDispatch();
  const [actionPending, setActionPending] = useState({
    reject: false,
    approve: false,
  });

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

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async (actionType: 'approve' | 'reject') => {
      if (!pendingOrders) return;

      setActionPending((prev) => ({ ...prev, [actionType]: true }));

      if (pendingOrders && pendingOrders?.length === 0) {
        dispatch(showInfo(translate('No pending orders have been selected.')));
        setActionPending((prev) => ({ ...prev, [actionType]: false }));
        return;
      }

      try {
        await Promise.all(
          pendingOrders.map((order) => {
            const handler = orderActionMap[order.state]?.[actionType];

            if (!handler) {
              dispatch(
                showInfo(
                  translate(`Unsupported action for state: ${order.state}`),
                ),
              );
              return Promise.resolve(); // no-op fallback
            }

            return handler({ path: { uuid: order.uuid } });
          }),
        );

        await refetch();

        dispatch(
          showSuccess(
            translate('{count} order(s) have been {action}.', {
              count: pendingOrders.length,
              action: actionType === 'approve' ? 'approved' : 'rejected',
            }),
          ),
        );
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to perform operation.'),
          ),
        );
      } finally {
        setActionPending((prev) => ({ ...prev, [actionType]: false }));
      }
    },
  });

  return (
    <>
      <ActionButton
        title={translate('Approve')}
        action={() => mutate('approve')}
        iconNode={<CheckIcon weight="bold" />}
        variant="primary"
        disabled={isLoading || !isPendingOrderSelected}
        pending={actionPending.approve}
      />
      <ActionButton
        title={translate('Reject')}
        action={() => mutate('reject')}
        iconNode={<ProhibitIcon weight="bold" />}
        variant="danger"
        disabled={isLoading || !isPendingOrderSelected}
        pending={actionPending.reject}
      />
    </>
  );
};
