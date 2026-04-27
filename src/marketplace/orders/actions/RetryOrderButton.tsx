import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersRetry, OrderDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';

interface RetryOrderButtonProps {
  row: OrderDetails;
  refetch?: () => void;
}

export const RetryOrderButton: FunctionComponent<RetryOrderButtonProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Retry order'),
          translate(
            'This will reset the order and its resource back to an active processing state. The order will be resubmitted for processing. Are you sure?',
          ),
        );
      } catch {
        return;
      }
      try {
        await marketplaceOrdersRetry({
          path: { uuid: props.row.uuid },
        });
        queryClient.invalidateQueries({
          queryKey: ['OrderDetails', props.row.uuid],
        });
        if (props.refetch) await props.refetch();
        dispatch(showSuccess(translate('Order has been submitted for retry.')));
      } catch (response) {
        dispatch(
          showErrorResponse(response, translate('Unable to retry order.')),
        );
      }
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
