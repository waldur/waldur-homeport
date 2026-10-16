import { EventConsumer, ObservableObjectTypeEnum } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';

export interface QueueStats {
  messages: number;
  consumers: number;
}

// Every type the backend can route to a consumer, with a readable label.
// Typed against the SDK enum, so a type renamed or removed in mastermind fails
// compilation here.
export const getObjectTypeLabels = (): Record<
  ObservableObjectTypeEnum,
  string
> => ({
  user_role: translate('Role changes'),
  user_profile: translate('User profile changes'),
  user_lifecycle: translate('User account lifecycle'),
  user_ssh_key: translate('User SSH keys'),
  order: translate('Orders'),
  resource: translate('Resources'),
  offering_user: translate('Offering users'),
  importable_resources: translate('Importable resources'),
  service_account: translate('Service accounts'),
  course_account: translate('Course accounts'),
  resource_periodic_limits: translate('Resource periodic limits'),
  offering_resources_sync: translate('Offering resources sync'),
  resource_api_key_rotation: translate('Resource API key rotation'),
  resource_end_date_change_request: translate(
    'Resource end date change requests',
  ),
  service_provider_account: translate('Service provider accounts'),
  service_provider_project_group: translate('Service provider project groups'),
  call: translate('Calls'),
  proposal: translate('Proposals'),
});

export const formatObjectType = (type: string) =>
  getObjectTypeLabels()[type as ObservableObjectTypeEnum] ?? type;

/** Short summary of what a consumer receives, for a table cell. */
export const summarizeObjectTypes = (types: string[]) => {
  if (!types?.length) return translate('All event types');
  if (types.length === 1) return formatObjectType(types[0]);
  return translate('{count} event types', { count: types.length });
};

/** Host (and port) of a webhook destination, without scheme or ellipsis. */
export const getWebhookHost = (destination: string | null) =>
  destination
    ? destination.replace(/^[a-z]+:\/\//, '').replace(/\/…$/, '')
    : null;

export interface ConsumerStatus {
  label: string;
  variant: BadgeVariant;
  tooltip?: string;
}

// A batch that delivers some messages and then fails stamps both fields with
// the same time, and that consumer is failing: hence >=, compared as dates.
const isFailing = (row: EventConsumer) =>
  Boolean(
    row.last_error_at &&
    (!row.last_delivered_at ||
      Date.parse(row.last_error_at) >= Date.parse(row.last_delivered_at)),
  );

/** Whether a resync can replay anything: it sends role grants only. */
export const canResync = (row: EventConsumer) =>
  row.is_global &&
  (!row.object_types.length || row.object_types.includes('user_role'));

/**
 * One status for a consumer, whatever its transport: the most important thing
 * an operator needs to know about it, with the detail in the tooltip.
 */
export const getConsumerStatus = (
  row: EventConsumer,
  stats: QueueStats | undefined,
): ConsumerStatus => {
  if (row.delivery_blocked_reason) {
    return {
      label: translate('Blocked'),
      variant: 'danger',
      tooltip: row.delivery_blocked_reason,
    };
  }
  if (row.delivery === 'webhook') {
    if (isFailing(row)) {
      return {
        label: translate('Failing'),
        variant: 'danger',
        tooltip: translate('{error} Since {date}.', {
          error: row.last_error,
          date: formatDateTime(row.last_error_at),
        }),
      };
    }
    if (row.last_delivered_at) {
      return {
        label: translate('Delivering'),
        variant: 'success',
        tooltip: translate('Last delivered {date}.', {
          date: formatDateTime(row.last_delivered_at),
        }),
      };
    }
    return {
      label: translate('Waiting'),
      variant: 'neutral',
      tooltip: translate('No event has been delivered yet.'),
    };
  }
  if (!row.queue_created) {
    return {
      label: translate('Pending'),
      variant: 'warning',
      tooltip: translate('The RabbitMQ queue has not been created yet.'),
    };
  }
  if (!stats) {
    return {
      label: translate('Ready'),
      variant: 'neutral',
      tooltip: translate(
        'The queue exists; RabbitMQ statistics are not available.',
      ),
    };
  }
  return stats.consumers > 0
    ? {
        label: translate('Connected'),
        variant: 'success',
        tooltip: translate('{count} client(s) connected.', {
          count: stats.consumers,
        }),
      }
    : {
        label: translate('Disconnected'),
        variant: 'warning',
        tooltip: translate('No client is reading the queue.'),
      };
};
