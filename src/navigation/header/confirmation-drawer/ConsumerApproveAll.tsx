import { CheckIcon } from '@phosphor-icons/react';
import {
  marketplaceOrdersApproveByConsumer,
  OrderDetails,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionButton } from '@/table/ActionButton';

export const ConsumerApproveAll = ({ orders, refetch }) => {
  // Orders requiring a purchase order upload must be approved individually.
  const approvableOrders = (orders as OrderDetails[]).filter((order) => {
    const opts = order.offering_plugin_options as
      Record<string, unknown> | undefined;
    return !opts?.require_purchase_order_upload;
  });
  const skippedCount = orders.length - approvableOrders.length;

  const { mutate, isPending } = useBatchMutation<OrderDetails, void>({
    rows: approvableOrders,
    refetch,
    mutationFn: (order) =>
      marketplaceOrdersApproveByConsumer({ path: { uuid: order.uuid } }),
    successMessage:
      skippedCount > 0
        ? translate(
            '{n} orders have been approved. {skipped} require a purchase order upload and must be approved individually.',
            { n: approvableOrders.length, skipped: skippedCount },
          )
        : translate('All orders have been approved.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} orders have been approved.', { n }),
    errorMessage: translate('Unable to approve all orders.'),
    renderErrorMessage: (n) =>
      translate('{n} orders could not be approved.', { n }),
  });
  return (
    <ActionButton
      variant="primary"
      action={mutate}
      pending={isPending}
      disabled={approvableOrders.length === 0}
      disabledReason={translate(
        'All orders require a purchase order upload and must be approved individually.',
      )}
      iconNode={<CheckIcon weight="bold" />}
      title={translate('Approve all')}
    />
  );
};
