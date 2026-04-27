import { ProhibitIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersRejectByConsumer } from 'waldur-js-client';

import { translate } from '@/i18n';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

export const ConsumerRejectAll = ({ orders, refetch }) => {
  const dispatch = useDispatch();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await Promise.all(
          orders.map((order) =>
            marketplaceOrdersRejectByConsumer({ path: { uuid: order.uuid } }),
          ),
        );
        await refetch();
        dispatch(showSuccess(translate('All orders have been rejected.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to reject all orders.'),
          ),
        );
      }
    },
  });
  return (
    <ActionButton
      variant="danger"
      action={() => mutate()}
      pending={isLoading}
      iconNode={<ProhibitIcon weight="bold" />}
      title={translate('Reject all')}
    />
  );
};
