import { WarningCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { marketplaceOrdersSetStateErred, OrderDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface SetAsErredButtonProps {
  row: OrderDetails;
  refetch?: () => void;
}

export const SetAsErredButton: FunctionComponent<SetAsErredButtonProps> = (
  props,
) => {
  const { mutate, isPending: isLoading } = useManagedMutation<any, any, any>({
    mutationFn: (result) =>
      marketplaceOrdersSetStateErred({
        path: { uuid: props.row.uuid },
        body: {
          error_message: result?.input || '',
          error_traceback: '',
        },
      }),
    confirmation: {
      title: translate('Mark order as erred'),
      body: translate(
        'Marking an order as erred is expected to be done by the Waldur site agent. Doing it manually can lead to a broken state.',
      ),
      options: {
        showInput: true,
        inputLabel: translate('Error message (optional)'),
        positiveButton: translate('Mark as erred'),
      },
    },
    invalidateQueries: [{ queryKey: ['OrderDetails', props.row.uuid] }],
    refetch: props.refetch,
    successMessage: translate('Order has been marked as erred.'),
    errorMessage: translate('Unable to mark order as erred.'),
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
