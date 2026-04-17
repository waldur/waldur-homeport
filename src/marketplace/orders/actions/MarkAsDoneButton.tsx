import { CheckCircleIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersSetStateDone, OrderDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

interface MarkAsDoneButtonProps {
  row: OrderDetails;
  refetch?: () => void;
  as?: React.ComponentType;
}

export const MarkAsDoneButton: FunctionComponent<MarkAsDoneButtonProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await marketplaceOrdersSetStateDone({
          path: { uuid: props.row.uuid },
        });
        // Invalidate the order details query to trigger a refetch
        queryClient.invalidateQueries({
          queryKey: ['OrderDetails', props.row.uuid],
        });
        if (props.refetch) await props.refetch();
        dispatch(showSuccess(translate('Order has been marked as done.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to mark order as done.'),
          ),
        );
      }
    },
  });
  return (
    <ActionItem
      as={props.as}
      className={
        props.as === Button ? 'btn-light-success btn-sm w-100' : undefined
      }
      title={translate('Mark as done')}
      action={mutate}
      disabled={isLoading}
      iconNode={<CheckCircleIcon weight="bold" />}
    />
  );
};
