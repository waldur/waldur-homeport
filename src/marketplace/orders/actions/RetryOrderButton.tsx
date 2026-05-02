import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { marketplaceOrdersRetry, OrderDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface RetryOrderButtonProps {
  row: OrderDetails;
  refetch?: () => void;
}

export const RetryOrderButton: FunctionComponent<RetryOrderButtonProps> = (
  props,
) => {
  const { mutate, isPending: isLoading } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOrdersRetry({
        path: { uuid: props.row.uuid },
      }),
    invalidateQueries: [{ queryKey: ['OrderDetails', props.row.uuid] }],
    refetch: props.refetch,
    successMessage: translate('Order has been submitted for retry.'),
    errorMessage: translate('Unable to retry order.'),
    confirmation: {
      title: translate('Retry order'),
      body: translate(
        'This will reset the order and its resource back to an active processing state. The order will be resubmitted for processing. Are you sure?',
      ),
    },
  });
  return (
    <ActionItem
      className="text-warning"
      title={translate('Retry')}
      action={mutate}
      disabled={isLoading}
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
      iconColor="warning"
    />
  );
};
