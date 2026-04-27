import { WarningCircleIcon } from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceOrdersSetStateErred, OrderDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';

interface SetAsErredButtonProps {
  row: OrderDetails;
  refetch?: () => void;
}

export const SetAsErredButton: FunctionComponent<SetAsErredButtonProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      let result;
      try {
        result = await waitForConfirmation(
          dispatch,
          translate('Mark order as erred'),
          translate(
            'Marking an order as erred is expected to be done by the Waldur site agent. Doing it manually can lead to a broken state.',
          ),
          {
            showInput: true,
            inputLabel: translate('Error message (optional)'),
            positiveButton: translate('Mark as erred'),
          },
        );
      } catch {
        return;
      }

      try {
        await marketplaceOrdersSetStateErred({
          path: { uuid: props.row.uuid },
          body: {
            error_message: result?.input || '',
            error_traceback: '',
          },
        });
        queryClient.invalidateQueries({
          queryKey: ['OrderDetails', props.row.uuid],
        });
        if (props.refetch) await props.refetch();
        dispatch(showSuccess(translate('Order has been marked as erred.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to mark order as erred.'),
          ),
        );
      }
    },
  });

  return (
    <ActionItem
      className="text-danger"
      title={translate('Mark as erred')}
      action={mutate}
      disabled={isLoading}
      iconNode={<WarningCircleIcon weight="bold" />}
      iconColor="danger"
    />
  );
};
