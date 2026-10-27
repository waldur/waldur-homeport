import { FlagIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { marketplaceResourceMetricsList, Resource } from 'waldur-js-client';

import { HelpIcon, Menu, SegmentedControl } from 'waldur-ui';

import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { INSTANCE_TYPE, VOLUME_TYPE } from '@/openstack/constants';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { TableRefreshButton } from '@/table/TableRefreshButton';

import { getPollingStatus } from './instanceMetricsPolling';
import { MetricCard } from './MetricCard';
import {
  getPollingQueryKey,
  MetricsPollingActions,
  useMetricsPolling,
} from './MetricsPollingActions';
import {
  DEFAULT_RANGE,
  getMetricRangeOptions,
  MetricRange,
} from './metricTimeline';

// While a requested read is awaited, the schedule is asked again this often,
// for at most a minute.
const READ_CHECK_MS = 3000;
const READ_WAIT_MS = 60000;

/** One resource's own figures for the metrics its offering reports. */
export const ResourceMetricsTab: FC<{ resource: Resource }> = ({
  resource,
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resource-metrics', resource.uuid],
    queryFn: () =>
      marketplaceResourceMetricsList({
        query: { resource_uuid: resource.uuid },
      }).then((response) => response.data),
  });
  const queryClient = useQueryClient();
  // The last read before one was asked for, until a newer one shows up.
  const [awaitingRead, setAwaitingRead] = useState<{
    since: string | null;
    until: number;
  } | null>(null);
  // OpenStack instances and volumes are read by Waldur, on a schedule.
  const isVolume = resource.offering_type === VOLUME_TYPE;
  const isRead = resource.offering_type === INSTANCE_TYPE || isVolume;
  const polling = useMetricsPolling(
    resource.uuid,
    isRead,
    awaitingRead ? READ_CHECK_MS : false,
  );
  const pollingData = polling.data?.enabled ? polling.data : null;
  const status =
    pollingData && getPollingStatus(pollingData, resource.uuid, isVolume);
  // The charts' span: the last few hours while the resource is read often,
  // unless the user picked one; they end when last refreshed.
  const [chosenRange, setChosenRange] = useState<MetricRange | null>(null);
  const range =
    chosenRange ?? (pollingData?.faster_until ? '6h' : DEFAULT_RANGE);
  const [anchor, setAnchor] = useState(() => Date.now());

  // Waldur's latest figures and charts for this resource.
  const reloadFigures = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['resource-metrics', resource.uuid],
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === 'metric-series' &&
            (query.queryKey[1] as { resource_uuid?: string })?.resource_uuid ===
              resource.uuid,
        }),
      ]),
    [queryClient, resource.uuid],
  );
  useEffect(() => {
    if (!awaitingRead || !polling.data) return;
    if (polling.data.last_polled_at !== awaitingRead.since) {
      setAwaitingRead(null);
      setAnchor(Date.now());
      reloadFigures();
    } else if (
      // Given up on, also when asking for the schedule keeps failing.
      Math.max(polling.dataUpdatedAt, polling.errorUpdatedAt) >
      awaitingRead.until
    ) {
      setAwaitingRead(null);
    }
  }, [
    awaitingRead,
    polling.data,
    polling.dataUpdatedAt,
    polling.errorUpdatedAt,
    reloadFigures,
  ]);

  // Refresh doesn't read the resource itself; "Update now" does.
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    setRefreshing(true);
    setAnchor(Date.now());
    Promise.all([
      reloadFigures(),
      queryClient.invalidateQueries({
        queryKey: getPollingQueryKey(resource.uuid),
      }),
    ]).finally(() => setRefreshing(false));
  };

  let body;
  // The schedule picks the charts' span: wait for it, or they load twice.
  if (isLoading || (isRead && polling.isLoading)) {
    body = <LoadingSpinner />;
  } else if (error) {
    body = <LoadingErred loadData={refetch} />;
  } else if (!data?.length) {
    body = (
      <NoResult
        title={translate('No metrics yet')}
        message={translate(
          "This resource's service hasn't adopted any metrics.",
        )}
        callback={refetch}
        buttonTitle={translate('Search again')}
      />
    );
  } else {
    body = (
      <Row className="g-6">
        {data.map((item) => (
          <Col key={item.offering_metric.uuid} xs={12} lg={6}>
            <MetricCard
              item={item}
              resourceUuid={resource.uuid}
              range={range}
              anchor={anchor}
              refetch={refetch}
            />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Panel
      title={
        // As a table's title: the refresh icon right after it.
        <span className="inline-flex items-center gap-1.5">
          {translate('Metrics')}
          {status && (
            <HelpIcon
              label={status.label}
              aria-label={translate('Update schedule')}
              tooltipProps={{
                // Wide enough for a date and time on one line, never wider
                // than the screen.
                contentClassName: 'max-w-[min(22rem,calc(100vw-2rem))]',
                body: status.details.length
                  ? status.details.map((line) => <div key={line}>{line}</div>)
                  : undefined,
              }}
            />
          )}
          <TableRefreshButton fetch={refresh} loading={refreshing} />
        </span>
      }
      cardBordered
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedControl<MetricRange>
            aria-label={translate('Time period')}
            options={getMetricRangeOptions()}
            value={range}
            onValueChange={(value) => {
              setChosenRange(value);
              setAnchor(Date.now());
            }}
            size="lg"
          />
          <ActionsMenu
            label={translate('Actions')}
            toggle="labeled"
            variant="tertiary"
            size="lg"
            side="bottom"
            align="end"
            // A read may have happened since the tab was opened.
            onOpenChange={(open) => {
              if (open && pollingData) polling.refetch();
            }}
          >
            {pollingData?.can_manage && (
              <>
                <MetricsPollingActions
                  resourceUuid={resource.uuid}
                  data={pollingData}
                  readPending={Boolean(awaitingRead)}
                  onReadRequested={(status) =>
                    setAwaitingRead({
                      since: status.last_polled_at,
                      until: Date.now() + READ_WAIT_MS,
                    })
                  }
                  // Faster updates are for watching closely: show the last
                  // few hours.
                  onFasterUpdates={() => {
                    setChosenRange('6h');
                    setAnchor(Date.now());
                  }}
                />
                <Menu.Separator />
              </>
            )}
            {/* Goals apply to the project's combined figure, set there. */}
            <Menu.Item asChild>
              <Link
                state="project.metrics"
                params={{ uuid: resource.project_uuid }}
              >
                <span
                  data-slot="menu-item-icon"
                  className="inline-flex shrink-0 items-center justify-center size-[20px] me-[12px] [&>svg]:size-[20px] leading-none"
                >
                  <FlagIcon weight="bold" />
                </span>
                <span data-slot="menu-item-label" className="flex-1 min-w-0">
                  {translate('Project goals')}
                </span>
              </Link>
            </Menu.Item>
          </ActionsMenu>
        </div>
      }
    >
      {body}
    </Panel>
  );
};
