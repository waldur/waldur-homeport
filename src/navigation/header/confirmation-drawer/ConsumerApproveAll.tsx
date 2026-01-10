import { CheckIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersApproveByConsumer } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

export const ConsumerApproveAll = ({ orders, refetch }) => {
  const dispatch = useDispatch();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await Promise.all(
          orders.map((order) =>
            marketplaceOrdersApproveByConsumer({ path: { uuid: order.uuid } }),
          ),
        );
        await refetch();
        dispatch(showSuccess(translate('All orders have been approved.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to approve all orders.'),
          ),
        );
      }
    },
  });
  return (
    <ActionButton
      variant="primary"
      action={() => mutate()}
      pending={isLoading}
      iconNode={<CheckIcon weight="bold" />}
      title={translate('Approve all')}
    />
  );
};
