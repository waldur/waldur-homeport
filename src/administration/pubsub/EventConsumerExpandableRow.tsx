import { FC } from 'react';
import { EventConsumer } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { getConsumerQueueName } from '../rabbitmq/utils';

import { formatObjectType, QueueStats } from './eventConsumers';
import { useConsumerQueueStats } from './useConsumerQueueStats';

const listOrDash = (items: string[]) =>
  items.length ? (
    <ul className="mb-0 ps-3">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  ) : (
    DASH_ESCAPE_CODE
  );

const formatFilters = (filters: EventConsumer['payload_filters']) =>
  Object.entries(filters ?? {}).map(
    ([field, values]) => `${field}: ${(values as unknown[]).join(', ')}`,
  );

const WebhookFields: FC<{ row: EventConsumer }> = ({ row }) => (
  <>
    <Field
      label={translate('Destination')}
      value={row.webhook_destination}
      tooltip={translate(
        'Scheme and host only. The full URL is a credential and is never shown.',
      )}
    />
    <Field
      label={translate('Last delivered')}
      value={
        row.last_delivered_at
          ? formatDateTime(row.last_delivered_at)
          : DASH_ESCAPE_CODE
      }
    />
    <Field
      label={translate('Last error')}
      value={
        row.last_error_at
          ? `${row.last_error} (${formatDateTime(row.last_error_at)})`
          : DASH_ESCAPE_CODE
      }
    />
  </>
);

const QueueFields: FC<{ row: EventConsumer; stats?: QueueStats }> = ({
  row,
  stats,
}) => (
  <>
    <Field
      label={translate('Queue')}
      value={getConsumerQueueName(row.uuid)}
      hasCopy
    />
    <Field
      label={translate('RabbitMQ username')}
      value={row.rmq_username || DASH_ESCAPE_CODE}
      hasCopy={Boolean(row.rmq_username)}
    />
    <Field
      label={translate('Messages waiting')}
      value={stats ? stats.messages.toLocaleString() : DASH_ESCAPE_CODE}
    />
    <Field
      label={translate('Clients connected')}
      value={stats ? stats.consumers : DASH_ESCAPE_CODE}
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
      <Field label={translate('UUID')} value={row.uuid} hasCopy />
      <Field
        label={translate('Receives')}
        value={
          row.object_types.length
            ? listOrDash(row.object_types.map(formatObjectType))
            : translate('All event types')
        }
      />
      <Field
        label={translate('Payload filters')}
        value={listOrDash(formatFilters(row.payload_filters))}
      />
      <Field
        label={translate('Scope')}
        tooltip={translate(
          'A global consumer receives every event in the system, including events about all users.',
        )}
        value={
          row.is_global
            ? translate('Global')
            : listOrDash(
                row.scopes.map((scope) => `${scope.type}: ${scope.uuid}`),
              )
        }
      />
      {row.delivery === 'webhook' ? (
        <WebhookFields row={row} />
      ) : (
        <QueueFields row={row} stats={stats} />
      )}
      <Field
        label={translate('Registered with')}
        value={
          [
            row.auth_kind,
            row.auth_token_name &&
              `${row.auth_token_name} (${row.auth_token_prefix}…)`,
            row.authorized_via &&
              translate('authorized as {role}', { role: row.authorized_via }),
          ]
            .filter(Boolean)
            .join(', ') || DASH_ESCAPE_CODE
        }
      />
      {row.delivery_blocked_reason && (
        <Field
          label={translate('Not delivering')}
          value={
            <span className="text-danger">{row.delivery_blocked_reason}</span>
          }
        />
      )}
      <Field label={translate('Created')} value={formatDateTime(row.created)} />
    </ExpandableContainer>
  );
};
