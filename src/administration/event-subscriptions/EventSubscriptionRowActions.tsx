import { FC } from 'react';
import { EventSubscription, eventSubscriptionsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { EVENT_SUBSCRIPTIONS_QUERY_KEY } from './utils';

interface EventSubscriptionRowActionsProps {
  row: EventSubscription;
  refetch: () => void;
}

const EventSubscriptionDeleteAction: FC<{
  row: EventSubscription;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => eventSubscriptionsDestroy({ path: { uuid: row.uuid } }),
    refetch,
    invalidateQueries: [{ queryKey: EVENT_SUBSCRIPTIONS_QUERY_KEY }],
    confirmation: {
      title: translate('Delete event subscription'),
      body: translate(
        'Are you sure you want to delete this event subscription? External systems will no longer receive notifications.',
      ),
      options: {
        forDeletion: true,
      },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};

export const EventSubscriptionRowActions: FC<
  EventSubscriptionRowActionsProps
> = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[EventSubscriptionDeleteAction].filter(Boolean)}
    />
  );
};
