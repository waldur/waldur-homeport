import { FC } from 'react';
import { EventConsumer, eventConsumersDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

interface EventConsumerRowActionsProps {
  row: EventConsumer;
  refetch: () => void;
}

export const EventConsumerDeregisterAction: FC<
  EventConsumerRowActionsProps
> = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => eventConsumersDestroy({ path: { uuid: row.uuid } }),
    refetch,
    invalidateQueries: [{ queryKey: ['RabbitMQStats'] }],
    successMessage: translate('Event consumer deregistered.'),
    errorMessage: translate('Unable to deregister event consumer.'),
    confirmation: {
      title: translate('Deregister event consumer'),
      body: translate(
        'This deletes the RabbitMQ queue and broker user of this consumer. The client will stop receiving events until it registers again. Continue?',
      ),
      options: {
        forDeletion: true,
      },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Deregister')}
      action={mutate}
      disabled={isPending}
    />
  );
};

export const EventConsumerRowActions: FC<EventConsumerRowActionsProps> = ({
  row,
  refetch,
}) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[EventConsumerDeregisterAction]}
  />
);
