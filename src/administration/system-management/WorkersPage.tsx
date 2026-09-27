import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

const CELERY_TAB = {
  key: 'celery',
  title: translate('Celery'),
  component: lazyComponent(() =>
    import('../CeleryInfoPage').then((module) => ({
      default: module.CeleryInfoPage,
    })),
  ),
};

const RABBITMQ_TAB = {
  key: 'rabbitmq',
  title: translate('RabbitMQ'),
  component: lazyComponent(() =>
    import('../rabbitmq/RabbitMQPage').then((module) => ({
      default: module.RabbitMQPage,
    })),
  ),
};

// The PubSub debug API is staff-only; this replaces the route-level
// `permissions: [isStaff]` guard that the standalone page carried.
const PUBSUB_TAB = {
  key: 'pubsub',
  title: translate('PubSub health'),
  component: lazyComponent(() =>
    import('../pubsub/PubSubHealthPage').then((module) => ({
      default: module.PubSubHealthPage,
    })),
  ),
};

const EVENT_SUBSCRIPTIONS_TAB = {
  key: 'event-subscriptions',
  title: translate('Event subscriptions (legacy)'),
  component: lazyComponent(() =>
    import('../event-subscriptions/EventSubscriptionsList').then((module) => ({
      default: module.EventSubscriptionsList,
    })),
  ),
};

export const WorkersPage = () => {
  const isStaff = useSelector(isStaffSelector);
  // Stable identity: TableWithTabs re-syncs the active tab whenever `tabs` changes.
  const tabs = useMemo(
    () =>
      isStaff
        ? [CELERY_TAB, RABBITMQ_TAB, PUBSUB_TAB, EVENT_SUBSCRIPTIONS_TAB]
        : [CELERY_TAB, RABBITMQ_TAB, EVENT_SUBSCRIPTIONS_TAB],
    [isStaff],
  );

  return (
    <TableWithTabs
      title={translate('Workers & messaging')}
      subtitle={translate(
        'Background task workers, the message broker and event publishing.',
      )}
      tabs={tabs}
      syncWithUrlKey="tab"
    />
  );
};
