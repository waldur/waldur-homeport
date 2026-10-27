import {
  InstanceMetricsFasterUpdatesRequest,
  InstanceMetricsPolling,
  IntervalMinutesEnum,
  marketplaceOpenstackInstanceMetricsFasterUpdates,
  marketplaceOpenstackInstanceMetricsNormalUpdates,
  marketplaceOpenstackInstanceMetricsRetrieve,
  marketplaceOpenstackInstanceMetricsUpdateNow,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';

/** How often Waldur reads an OpenStack instance's metrics from Nova. */
export type { InstanceMetricsPolling };

export const getInstanceMetricsPolling = (uuid: string) =>
  marketplaceOpenstackInstanceMetricsRetrieve({ path: { uuid } }).then(
    (response) => response.data,
  );

export const postInstanceMetricsPolling = (
  uuid: string,
  action: 'faster_updates' | 'normal_updates' | 'update_now',
  body?: InstanceMetricsFasterUpdatesRequest,
): Promise<InstanceMetricsPolling> => {
  const path = { uuid };
  const request =
    action === 'faster_updates'
      ? marketplaceOpenstackInstanceMetricsFasterUpdates({ path, body })
      : action === 'normal_updates'
        ? marketplaceOpenstackInstanceMetricsNormalUpdates({ path })
        : marketplaceOpenstackInstanceMetricsUpdateNow({ path });
  return request.then((response) => response.data);
};

// The server refuses a read now while the last one is this recent.
export const MIN_INTERVAL_MINUTES = 5;

// Whole sentences, so each language can phrase them its own way.
const formatSchedule = (minutes: number, until: string | null) => {
  const time = until ? formatDateTime(until) : null;
  if (minutes === 60) {
    return time
      ? translate('Updated every hour until {time}', { time })
      : translate('Updated every hour');
  }
  if (minutes % 60 === 0) {
    const count = minutes / 60;
    return time
      ? translate('Updated every {count} hours until {time}', { count, time })
      : translate('Updated every {count} hours', { count });
  }
  return time
    ? translate('Updated every {count} minutes until {time}', {
        count: minutes,
        time,
      })
    : translate('Updated every {count} minutes', { count: minutes });
};

/** The intervals faster than the provider's own; none when it is fastest. */
export const getFastIntervalOptions = (
  offeringIntervalMinutes: number,
): { value: IntervalMinutesEnum; label: string }[] =>
  [
    { value: 5 as const, label: translate('Every 5 minutes') },
    { value: 15 as const, label: translate('Every 15 minutes') },
    { value: 60 as const, label: translate('Every hour') },
  ].filter((option) => option.value < offeringIntervalMinutes);

export const getFastDurationOptions = () => [
  { value: 1, label: translate('For 1 hour') },
  { value: 6, label: translate('For 6 hours') },
  { value: 24, label: translate('For 24 hours') },
];

/**
 * Whether the instance is read at all: it exists and is running. The server
 * gives no next read while the instance is not running.
 */
export const isRead = (data: InstanceMetricsPolling) =>
  Boolean(data.instance_name && data.next_poll_at);

/**
 * How the resource is read, for the help icon beside the Metrics panel's
 * title: the update interval as the tooltip's label, the details below it.
 */
export const getPollingStatus = (
  data: InstanceMetricsPolling,
  resourceUuid: string,
  isVolume: boolean,
): { label: string; details: string[] } => {
  if (!data.instance_name) {
    return {
      label: isVolume
        ? translate('Not read while the volume is detached from an instance.')
        : translate('Not read: the instance has no OpenStack server.'),
      details: [],
    };
  }
  const details = [];
  if (data.instance_resource_uuid !== resourceUuid) {
    details.push(
      translate('Read with {instance}', { instance: data.instance_name }),
    );
  }
  details.push(
    data.last_polled_at
      ? translate('Last update {time}', {
          time: formatDateTime(data.last_polled_at),
        })
      : translate('Not read yet'),
  );
  if (!isRead(data)) {
    return {
      label: translate('Not read while the instance is not running.'),
      details,
    };
  }
  details.push(
    translate('Next around {time}', {
      time: formatDateTime(data.next_poll_at),
    }),
  );
  return {
    label: formatSchedule(data.interval_minutes, data.faster_until),
    details,
  };
};
