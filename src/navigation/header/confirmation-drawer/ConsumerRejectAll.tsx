import { ProhibitIcon } from '@phosphor-icons/react';
import { marketplaceOrdersRejectByConsumer } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionButton } from '@/table/ActionButton';

export const ConsumerRejectAll = ({ orders, refetch }) => {
  const batchMutation = useBatchMutation({
    rows: orders,
    mutationFn: (order) =>
      marketplaceOrdersRejectByConsumer({ path: { uuid: order.uuid } }),
    successMessage: translate('All orders have been rejected.'),
    errorMessage: translate('Unable to reject all orders.'),
    refetch,
    confirmation: {
      title: translate('Reject all orders'),
      body: translate('Are you sure you want to reject {count} orders?', {
        count: orders.length,
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
