import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  EventConsumer,
  eventConsumersDestroy,
  eventConsumersResync,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import { canResync } from './eventConsumers';

const EventConsumerWebhookDialog = lazyComponent(() =>
  import('./EventConsumerWebhookDialog').then((module) => ({
    default: module.EventConsumerWebhookDialog,
  })),
);

interface EventConsumerRowActionsProps {
  row: EventConsumer;
  refetch: () => void;
}

const EventConsumerEditWebhookAction: FC<EventConsumerRowActionsProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const openFormDialog = useCallback(
    () =>
      openDialog(EventConsumerWebhookDialog, {
        resolve: { consumer: row, refetch },
        size: 'lg',
      }),
    [openDialog, row, refetch],
  );
  return <EditAction action={openFormDialog} />;
};

export const EventConsumerResyncAction: FC<EventConsumerRowActionsProps> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => eventConsumersResync({ path: { uuid: row.uuid } }),
    refetch,
    successMessage: translate(
      'Resync started. The current state is being sent to the consumer.',
    ),
    errorMessage: translate('Unable to start resync.'),
    confirmation: {
      title: translate('Resync event consumer'),
      body: translate(
        'Every active role grant matching this consumer’s filters is sent to it again as a role_snapshot message, so the receiver can rebuild its state. Continue?',
      ),
    },
  });
  return (
    <ActionItem
      title={translate('Resync')}
      action={mutate}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      disabled={isPending}
    />
  );
};

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
      body:
        row.delivery === 'webhook'
          ? translate(
              'Events will no longer be sent to this webhook. Continue?',
            )
          : translate(
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
}) => {
  const isStaff = useSelector(isStaffSelector);
  const actions = [
    // Editing a webhook is staff only on the backend; support sees the list.
    ...(row.delivery === 'webhook' && isStaff
      ? [EventConsumerEditWebhookAction]
      : []),
    ...(canResync(row) ? [EventConsumerResyncAction] : []),
    // Support may remove queue consumers but not a staff-owned webhook.
    ...(row.delivery !== 'webhook' || isStaff
      ? [EventConsumerDeregisterAction]
      : []),
  ];
  return <ActionsDropdown row={row} refetch={refetch} actions={actions} />;
};
