import { CheckIcon } from '@phosphor-icons/react';
import {
  marketplaceOrdersApproveByConsumer,
  OrderDetails,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionButton } from '@/table/ActionButton';

export const ConsumerApproveAll = ({ orders, refetch }) => {
  const { mutate, isPending } = useBatchMutation<OrderDetails, void>({
    rows: orders,
    refetch,
    mutationFn: (order) =>
      marketplaceOrdersApproveByConsumer({ path: { uuid: order.uuid } }),
    successMessage: translate('All orders have been approved.'),
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
      iconNode={<CheckIcon weight="bold" />}
      title={translate('Approve all')}
    />
  );
};
