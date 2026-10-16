import { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { EventConsumer, eventConsumersList } from 'waldur-js-client';

import { AccordionCard, Badge, Tooltip } from 'waldur-ui';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { Link } from '@/core/Link';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  EventConsumersFilter,
  EventConsumersFilterFormId,
  selectEventConsumersFilter,
} from '@/table/generated/EventConsumersFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import { getConsumerQueueName } from '../rabbitmq/utils';

import { EventConsumerExpandableRow } from './EventConsumerExpandableRow';
import { EventConsumerRowActions } from './EventConsumerRowActions';
import {
  getConsumerStatus,
  getWebhookHost,
  QueueStats,
  summarizeObjectTypes,
} from './eventConsumers';
import { useConsumerQueueStats } from './useConsumerQueueStats';

const EventConsumerWebhookDialog = lazyComponent(() =>
  import('./EventConsumerWebhookDialog').then((module) => ({
    default: module.EventConsumerWebhookDialog,
  })),
);

// Where the events go, how and what they are: what tells consumers apart at a
// glance. Everything else is in the expandable row.
const ConsumerCell: FC<{ row: EventConsumer }> = ({ row }) => (
  <div>
    <div className="font-medium text-primary">
      {row.delivery === 'webhook'
        ? getWebhookHost(row.webhook_destination)
        : getConsumerQueueName(row.uuid).substring(0, 17)}
    </div>
    <div className="text-quaternary">
      {row.delivery === 'webhook'
        ? translate('Webhook')
        : translate('RabbitMQ queue')}
      {' · '}
      {summarizeObjectTypes(row.object_types)}
    </div>
  </div>
);

const ScopeCell: FC<{ row: EventConsumer }> = ({ row }) =>
  row.is_global ? (
    <Tooltip
      label={translate(
        'Bound to no scope: receives every event in the system, including events about all users.',
      )}
    >
      <Badge variant="danger" shape="pill" tone="outline">
        {translate('Global')}
      </Badge>
    </Tooltip>
  ) : (
    <span>
      {row.scopes.length === 1
        ? row.scopes[0].type
        : translate('{count} scopes', { count: row.scopes.length })}
    </span>
  );

const StatusCell: FC<{ row: EventConsumer; stats?: QueueStats }> = ({
  row,
  stats,
}) => {
  const status = getConsumerStatus(row, stats);
  return (
    <StateIndicator
      label={status.label}
      variant={status.variant}
      tooltip={status.tooltip}
      shape="pill"
      tone="outline"
      hasBullet
    />
  );
};

const AddWebhookButton: FC<{ refetch: () => void }> = ({ refetch }) => (
  <CreateModalButton
    dialog={EventConsumerWebhookDialog}
    resolve={{ refetch }}
    title={translate('Add webhook')}
    size="lg"
  />
);

const EventConsumersTable: FC = () => {
  const filterValues = useFilterValues(EventConsumersFilterFormId);
  const filter = useMemo(
    () => selectEventConsumersFilter(filterValues),
    [filterValues],
  );
  const tableProps = useTable({
    table: 'EventConsumers',
    fetchData: createFetcher(eventConsumersList),
    filter,
  });
  const { byQueue: queueStats, statsUnavailable } = useConsumerQueueStats(true);
  const isStaff = useSelector(isStaffSelector);

  const columns = useMemo(
    () => [
      {
        title: translate('Consumer'),
        render: ConsumerCell,
        copyField: (row: EventConsumer) => row.uuid,
      },
      {
        title: translate('Owner'),
        render: ({ row }: { row: EventConsumer }) =>
          row.user_full_name || row.user_username,
      },
      {
        title: translate('Scope'),
        render: ScopeCell,
      },
      {
        title: translate('Status'),
        render: ({ row }: { row: EventConsumer }) => (
          <StatusCell
            row={row}
            stats={queueStats.get(getConsumerQueueName(row.uuid))}
          />
        ),
      },
    ],
    [queueStats],
  );

  return (
    <>
      {statsUnavailable && (
        <p className="text-warning mb-3">
          {translate(
            'RabbitMQ statistics are unavailable; queue status and message counts are not shown.',
          )}
        </p>
      )}
      <Table<EventConsumer>
        {...tableProps}
        columns={columns}
        verboseName={translate('event consumers')}
        formId={EventConsumersFilterFormId}
        filters={<EventConsumersFilter />}
        hideTitle
        hoverShadow={false}
        initialPageSize={10}
        minHeight="auto"
        expandableRow={EventConsumerExpandableRow}
        tableActions={
          isStaff ? <AddWebhookButton refetch={tableProps.fetch} /> : null
        }
        rowActions={({ row }) => (
          <EventConsumerRowActions row={row} refetch={tableProps.fetch} />
        )}
      />
    </>
  );
};

export const EventConsumersCard: FC = () => {
  // Collapsed by default: neither the consumer list nor the RabbitMQ
  // management scrape should run until an operator actually opens the card.
  const [open, setOpen] = useState(false);
  return (
    <AccordionCard
      id="event-consumers"
      title={translate('Event consumers')}
      subtitle={translate(
        'Consumers registered through /api/event-consumers/, delivering over RabbitMQ queues or HTTP webhooks. Site-agent consumers are managed on the Site agents page.',
      )}
      actions={
        <Link
          state="admin-site-agents"
          buttonVariant="tertiary"
          buttonSize="sm"
          label={translate('Site agents')}
        />
      }
      isOpen={open}
      onToggle={setOpen}
      className="mb-6"
    >
      {open && <EventConsumersTable />}
    </AccordionCard>
  );
};
