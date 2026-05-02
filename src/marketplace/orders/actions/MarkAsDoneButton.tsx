import { CheckCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { marketplaceOrdersSetStateDone, OrderDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface MarkAsDoneButtonProps {
  row: OrderDetails;
  refetch?: () => void;
  as?: React.ComponentType;
}

export const MarkAsDoneButton: FunctionComponent<MarkAsDoneButtonProps> = (
  props,
) => {
  const { mutate, isPending: isLoading } = useManagedMutation({
    mutationFn: () =>
      marketplaceOrdersSetStateDone({
        path: { uuid: props.row.uuid },
      }),
    invalidateQueries: [{ queryKey: ['OrderDetails', props.row.uuid] }],
    refetch: props.refetch,
    successMessage: translate('Order has been marked as done.'),
    errorMessage: translate('Unable to mark order as done.'),
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
