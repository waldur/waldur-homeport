import { FC } from 'react';
import { EventConsumer } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { getConsumerQueueName } from '../rabbitmq/utils';

import { formatObjectType, QueueStats } from './eventConsumers';
import { useConsumerQueueStats } from './useConsumerQueueStats';

const formatFilters = (filters: EventConsumer['payload_filters']) =>
  Object.entries(filters ?? {}).map(
    ([field, values]) => `${field}: ${(values as unknown[]).join(', ')}`,
  );

const WebhookFields: FC<{ row: EventConsumer }> = ({ row }) => (
  <>
    <PropertyItem
      label={translate('Destination')}
      value={row.webhook_destination}
      tooltip={translate(
        'Scheme and host only. The full URL is a credential and is never shown.',
      )}
    />
    <PropertyItem
      label={translate('Last delivered')}
      value={propVal.date(row.last_delivered_at, { precision: 'datetime' })}
    />
    <PropertyItem
      label={translate('Last error')}
      value={
        row.last_error
          ? propVal.annotated(row.last_error, {
              hint: row.last_error_at
                ? formatDateTime(row.last_error_at)
                : undefined,
            })
          : null
      }
    />
  </>
);

const QueueFields: FC<{ row: EventConsumer; stats?: QueueStats }> = ({
  row,
  stats,
}) => (
  <>
    <PropertyItem
      label={translate('Queue')}
      value={getConsumerQueueName(row.uuid)}
      hasCopy
    />
    <PropertyItem
      label={translate('RabbitMQ username')}
      value={row.rmq_username}
      hasCopy
    />
    <PropertyItem
      label={translate('Messages waiting')}
      value={stats ? propVal.count(stats.messages) : null}
    />
    <PropertyItem
      label={translate('Clients connected')}
      value={stats ? propVal.count(stats.consumers) : null}
    />
  </>
);

export const EventConsumerExpandableRow: FC<{ row: EventConsumer }> = ({
  row,
}) => {
  // Shares the table's cached RabbitMQ snapshot; no extra request per row.
  const { byQueue } = useConsumerQueueStats(row.delivery !== 'webhook');
  const stats = byQueue.get(getConsumerQueueName(row.uuid));

  return (
    // fluid: this table sits inside an accordion card, narrower than the
    // content area the default panel width is computed from.
    <ExpandableContainer asTable className="fluid">
      <PropertyItem label={translate('UUID')} value={row.uuid} hasCopy />
      <PropertyItem
        label={translate('Receives')}
        value={propVal.list(row.object_types.map(formatObjectType), {
          display: 'stack',
        })}
        placeholder={translate('All event types')}
      />
      <PropertyItem
        label={translate('Payload filters')}
        value={propVal.list(formatFilters(row.payload_filters), {
          display: 'stack',
        })}
      />
      <PropertyItem
        label={translate('Scope')}
        tooltip={translate(
          'A global consumer receives every event in the system, including events about all users.',
        )}
        value={propVal.list(
          row.is_global
            ? [translate('Global')]
            : row.scopes.map((scope) => `${scope.type}: ${scope.uuid}`),
          { display: 'stack' },
        )}
      />
      {row.delivery === 'webhook' ? (
        <WebhookFields row={row} />
      ) : (
        <QueueFields row={row} stats={stats} />
      )}
      <PropertyItem
        label={translate('Registered with')}
        value={propVal.list([
          row.auth_kind,
          row.auth_token_name &&
            `${row.auth_token_name} (${row.auth_token_prefix}…)`,
          row.authorized_via &&
            translate('authorized as {role}', { role: row.authorized_via }),
        ])}
      />
      {row.delivery_blocked_reason && (
        <PropertyItem
          label={translate('Not delivering')}
          value={
            <span className="text-danger">{row.delivery_blocked_reason}</span>
          }
        />
      )}
      <PropertyItem
        label={translate('Created')}
        value={propVal.date(row.created, { precision: 'datetime' })}
      />
    </ExpandableContainer>
  );
};
