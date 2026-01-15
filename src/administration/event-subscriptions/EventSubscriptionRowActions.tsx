import { FC } from 'react';
import { EventSubscription, eventSubscriptionsDestroy } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { useInvalidateEventSubscriptions } from './utils';

interface EventSubscriptionRowActionsProps {
  row: EventSubscription;
  refetch: () => void;
}

const EventSubscriptionDeleteAction: FC<{
  row: EventSubscription;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const invalidateEventSubscriptions = useInvalidateEventSubscriptions();

  return (
    <DeleteButton
      row={row}
      apiFunction={(r) =>
        eventSubscriptionsDestroy({
          path: { uuid: r.uuid },
        })
      }
      refetch={refetch}
      onSuccess={invalidateEventSubscriptions}
      confirmTitle={translate('Delete event subscription')}
      confirmMessage={translate(
        'Are you sure you want to delete this event subscription? External systems will no longer receive notifications.',
      )}
      title={translate('Delete')}
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
