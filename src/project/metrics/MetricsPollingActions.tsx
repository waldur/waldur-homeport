import {
  ArrowCounterClockwiseIcon,
  ArrowsClockwiseIcon,
  LightningIcon,
} from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import {
  InstanceMetricsPolling,
  MIN_INTERVAL_MINUTES,
  getFastIntervalOptions,
  getInstanceMetricsPolling,
  isRead,
  postInstanceMetricsPolling,
} from './instanceMetricsPolling';

const FasterUpdatesDialog = lazyComponent(() =>
  import('./FasterUpdatesDialog').then((module) => ({
    default: module.FasterUpdatesDialog,
  })),
);

export const getPollingQueryKey = (resourceUuid: string) => [
  'instance-metrics-polling',
  resourceUuid,
];

/**
 * How often an OpenStack instance or volume is read; off for other resources.
 * Given refetchInterval, it is asked again until a requested read shows up.
 */
export const useMetricsPolling = (
  resourceUuid: string,
  enabled: boolean,
  refetchInterval: number | false = false,
) =>
  useQuery({
    queryKey: getPollingQueryKey(resourceUuid),
    queryFn: () => getInstanceMetricsPolling(resourceUuid),
    enabled,
    refetchInterval,
    retry: false,
    // The schedule is extra: without it the tab still shows the metrics.
    meta: { skipGlobalErrorRedirect: true },
  });

/**
 * Menu rows for reading the metrics now, or more often for a while, for
 * someone who manages the instance; on a volume these act on the instance it
 * is attached to. onReadRequested gets the schedule once a read has been
 * asked for; readPending says one is on its way.
 */
export const MetricsPollingActions: FC<{
  resourceUuid: string;
  data: InstanceMetricsPolling;
  readPending: boolean;
  onReadRequested(status: InstanceMetricsPolling): void;
  onFasterUpdates(): void;
}> = ({
  resourceUuid,
  data,
  readPending,
  onReadRequested,
  onFasterUpdates,
}) => {
  const { openDialog } = useModal();
  const queryClient = useQueryClient();
  // The server answers with the new schedule.
  const setStatus = (status: InstanceMetricsPolling) =>
    queryClient.setQueryData(getPollingQueryKey(resourceUuid), status);
  const readNow = useManagedMutation<InstanceMetricsPolling, any, void>({
    mutationFn: () => postInstanceMetricsPolling(resourceUuid, 'update_now'),
    successMessage: translate('The metrics are being read.'),
    errorMessage: translate('Unable to read the metrics now.'),
    // Not in a dialog: don't close one the user has opened meanwhile.
    closeModal: false,
    onSuccess: (status) => {
      setStatus(status);
      onReadRequested(status);
    },
  });
  const backToNormal = useManagedMutation<InstanceMetricsPolling, any, void>({
    mutationFn: () =>
      postInstanceMetricsPolling(resourceUuid, 'normal_updates'),
    successMessage: translate('Back to the usual updates.'),
    errorMessage: translate('Unable to change the updates.'),
    closeModal: false,
    onSuccess: setStatus,
  });

  if (!data.can_manage) return null;

  const running = isRead(data);
  const notRunning = translate('The instance is not running.');
  const lastRead = data.last_polled_at ? new Date(data.last_polled_at) : null;
  const readRecently =
    lastRead !== null &&
    Date.now() - lastRead.getTime() < MIN_INTERVAL_MINUTES * 60000;
  const viaInstance = data.instance_resource_uuid !== resourceUuid;
  const canSpeedUp =
    getFastIntervalOptions(data.offering_interval_minutes).length > 0;

  return (
    <>
      <ActionItem
        title={translate('Update now')}
        iconNode={<ArrowsClockwiseIcon weight="bold" />}
        action={() => readNow.mutate()}
        disabled={!running || readPending || readRecently}
        tooltip={
          !running
            ? notRunning
            : readPending
              ? translate('A read is on its way.')
              : readRecently
                ? translate(
                    'Updated less than {count} minutes ago. Try again later.',
                    { count: MIN_INTERVAL_MINUTES },
                  )
                : undefined
        }
      />
      {data.faster_until ? (
        <ActionItem
          title={translate('Back to usual updates')}
          iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
          action={() => backToNormal.mutate()}
        />
      ) : canSpeedUp ? (
        <ActionItem
          title={translate('Faster updates…')}
          iconNode={<LightningIcon weight="bold" />}
          disabled={!running}
          tooltip={!running ? notRunning : undefined}
          action={() =>
            openDialog(FasterUpdatesDialog, {
              resolve: {
                resourceUuid,
                instanceName: viaInstance ? data.instance_name : null,
                offeringIntervalMinutes: data.offering_interval_minutes,
                onSaved: (status: InstanceMetricsPolling) => {
                  setStatus(status);
                  onReadRequested(status);
                  onFasterUpdates();
                },
              },
            })
          }
        />
      ) : null}
    </>
  );
};
