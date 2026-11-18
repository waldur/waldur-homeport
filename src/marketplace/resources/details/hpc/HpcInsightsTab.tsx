import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import type {
  ChartSpec,
  HpcComponentUsage,
  HpcJob,
  Resource,
} from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  BaseButton,
  Card,
  CardContent,
  CardHeader,
  StatCardGrid,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { ChartSpecView } from '@/core/charts/ChartSpecView';
import { formatDate } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { HpcErrorAlert } from './HpcErrorAlert';
import { getStatsPeriodOptions, HpcPeriodSelect } from './HpcPeriodSelect';
import {
  HpcWorkspaceMode,
  hpcQueryKey,
  useHpcClusterLoad,
  useHpcJobStats,
  useHpcUsage,
} from './queries';
import { HPC_CARD_CLASS } from './utils';

const HpcJobOutputDialog = lazyComponent(() =>
  import('./HpcJobOutputDialog').then((module) => ({
    default: module.HpcJobOutputDialog,
  })),
);

const formatWindowTime = (epochSeconds: number) =>
  new Date(epochSeconds * 1000).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

// Timelines (jobs, reservations) and the node heatmap read better across the
// whole row.
const isWideChart = (chartType: string) =>
  chartType === 'timeline' || chartType === 'heatmap';

const ChartGrid: FC<{
  charts: ChartSpec[];
  onPointClick?(id: string): void;
}> = ({ charts, onPointClick }) => (
  <div className="grid gap-8 lg:grid-cols-2">
    {charts.map((chart) => (
      <div
        key={chart.title}
        className={isWideChart(chart.chart_type) ? 'lg:col-span-2' : ''}
      >
        <ChartSpecView spec={chart} onPointClick={onPointClick} />
      </div>
    ))}
  </div>
);

const number = (value: number, digits = 0) =>
  value.toLocaleString(undefined, { maximumFractionDigits: digits });

const ComponentStats: FC<{ component: HpcComponentUsage }> = ({
  component,
}) => {
  const unit = component.unit || component.name;
  return (
    <StatCardGrid
      size="sm"
      spaceless
      stats={[
        {
          label: translate('{name} used', { name: component.name }),
          value: `${number(component.consumed)} ${unit}`,
          footer: component.limit
            ? translate('of {limit} ({percent}%)', {
                limit: number(component.limit),
                percent: component.percent,
              })
            : translate('No limit set'),
        },
        {
          label: translate('Recent pace'),
          value: component.daily_rate
            ? translate('{rate} {unit} / day', {
                rate: number(component.daily_rate),
                unit,
              })
            : '—',
          footer: translate('This month and the last'),
        },
        {
          label: translate('Runs out'),
          value: component.runs_out ? formatDate(component.runs_out) : '—',
          footer: component.runs_out_before_period_end ? (
            <Badge variant="warning" shape="pill">
              {translate('Before the allocation ends')}
            </Badge>
          ) : component.runs_out ? (
            <Badge variant="success" shape="pill">
              {translate('Lasts the period')}
            </Badge>
          ) : null,
        },
        {
          label: translate('Allocation period'),
          value: component.period_end
            ? translate('until {date}', {
                date: formatDate(component.period_end),
              })
            : translate('Open-ended'),
          footer: translate('since {date}', {
            date: formatDate(component.period_start),
          }),
        },
      ]}
    />
  );
};

const AllocationSection: FC<{ resourceUuid: string }> = ({ resourceUuid }) => {
  const { data, isLoading, error } = useHpcUsage(resourceUuid);
  return (
    <div className="flex flex-col gap-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <HpcErrorAlert error={error} />
      ) : !data?.components.length ? (
        <div className="text-tertiary">
          {translate('No usage has been reported for this allocation yet.')}
        </div>
      ) : (
        <>
          {data.components.map((component, index) => (
            <div key={component.type} className="flex flex-col gap-6">
              <ComponentStats component={component} />
              <ChartGrid charts={data.charts.slice(index * 2, index * 2 + 2)} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

type JobView = 'jobs' | 'efficiency' | 'queue';

/** The job statistics' charts, in the order the backend sends them. */
const JOB_CHARTS: Record<JobView, [number, number]> = {
  jobs: [0, 2], // outcomes per day, job timeline
  efficiency: [2, 4], // time limit fit, CPU and memory efficiency
  queue: [4, 5], // queue wait by partition
};

const JOB_VIEW_TEXT: Record<JobView, () => string> = {
  jobs: () =>
    translate(
      'Jobs of this allocation from the cluster. Click a job in a chart to see its output.',
    ),
  efficiency: () =>
    translate(
      'How well jobs fit their time limits and use the cores and memory they ask for.',
    ),
  queue: () => translate('How long jobs waited to start, by partition.'),
};

const JobStatsSection: FC<{
  resourceUuid: string;
  days: number;
  view: JobView;
  /** A job's output is read through FirecREST. */
  firecrest: boolean;
}> = ({ resourceUuid, days, view, firecrest }) => {
  const { data, isLoading, error } = useHpcJobStats(resourceUuid, days);
  const { openDialog } = useModal();
  const openJob = useCallback(
    (jobId: string) =>
      openDialog(HpcJobOutputDialog, {
        resolve: {
          resourceUuid,
          job: { job_id: jobId, name: '' } as HpcJob,
        },
        size: 'xl',
      }),
    [openDialog, resourceUuid],
  );
  const totals = data?.totals;
  return (
    <div className="flex flex-col gap-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <HpcErrorAlert error={error} />
      ) : data && totals ? (
        <>
          {view === 'jobs' && (
            <StatCardGrid
              size="sm"
              spaceless
              stats={[
                { label: translate('Completed'), value: totals.completed },
                { label: translate('Failed'), value: totals.failed },
                { label: translate('Timed out'), value: totals.timeout },
                { label: translate('Canceled'), value: totals.cancelled },
                {
                  label: translate('Running / pending'),
                  value: `${totals.running} / ${totals.pending}`,
                },
                {
                  label: translate('CPU-hours'),
                  value: number(data.cpu_hours),
                },
              ]}
            />
          )}
          {view === 'efficiency' &&
            data.suggestions.map((suggestion) => (
              <AlertItem
                key={`${suggestion.kind}-${suggestion.name}`}
                variant="info"
                type="floating"
                title={
                  suggestion.kind === 'time_limit'
                    ? translate('Shorter time limit')
                    : translate('Fewer cores')
                }
                body={suggestion.message}
              />
            ))}
          {view === 'jobs' && data.failures.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-tertiary text-xs">
                {translate('Failures by exit code')}:
              </span>
              {data.failures.map((failure) => (
                <Badge
                  key={String(failure.exit_code)}
                  variant="danger"
                  shape="pill"
                  tone="outline"
                >
                  {translate('{code}: {count}× ({names})', {
                    code: failure.exit_code ?? '?',
                    count: failure.count,
                    names: failure.names.join(', '),
                  })}
                </Badge>
              ))}
            </div>
          )}
          <ChartGrid
            charts={data.charts.slice(...JOB_CHARTS[view])}
            onPointClick={firecrest ? openJob : undefined}
          />
        </>
      ) : null}
    </div>
  );
};

const ClusterSection: FC<{ resourceUuid: string }> = ({ resourceUuid }) => {
  const { data, isLoading, error } = useHpcClusterLoad(resourceUuid);
  return (
    <div className="flex flex-col gap-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <HpcErrorAlert error={error} />
      ) : data ? (
        <>
          <StatCardGrid
            size="sm"
            spaceless
            stats={data.partitions.map((partition) => ({
              label: translate('Partition {name}', { name: partition.name }),
              value: translate('{idle} of {total} idle', {
                idle: partition.idle,
                total: partition.total,
              }),
              footer: translate(
                '{busy} busy, {down} unavailable, load {load}',
                {
                  busy: partition.allocated + partition.mixed,
                  down: partition.unavailable,
                  load:
                    partition.average_load_percent === null
                      ? '—'
                      : `${partition.average_load_percent}%`,
                },
              ),
            }))}
          />
          {data.announcements.map((announcement) => (
            <AlertItem
              key={announcement.uuid}
              variant={announcement.outage ? 'warning' : 'info'}
              type="floating"
              title={translate('Maintenance: {name} ({impact})', {
                name: announcement.name,
                impact: announcement.impact.toLowerCase(),
              })}
              body={
                <div className="flex flex-col gap-1">
                  {announcement.message && <div>{announcement.message}</div>}
                  <div>
                    {translate('{start} to {end} on {partitions}.', {
                      start: formatWindowTime(announcement.start),
                      end: formatWindowTime(announcement.end),
                      partitions: announcement.partitions.join(', '),
                    })}{' '}
                    {announcement.reservation_in_place === true &&
                      translate(
                        'The cluster holds it: jobs that would run into it wait until it is over.',
                      )}
                    {announcement.reservation_in_place === false &&
                      translate(
                        'The cluster does not hold it yet, so jobs still running then may be stopped.',
                      )}
                  </div>
                </div>
              }
            />
          ))}
          {data.reservations
            .filter((reservation) => reservation.announced === false)
            .map((reservation) => (
              <AlertItem
                key={reservation.name}
                variant="warning"
                type="floating"
                title={translate('Cluster maintenance {name}', {
                  name: reservation.name,
                })}
                body={translate(
                  '{start} to {end} on {partitions}. Jobs whose time limit reaches into it wait until it is over. The provider has not announced it.',
                  {
                    start: formatWindowTime(reservation.start),
                    end: formatWindowTime(reservation.end),
                    partitions: reservation.partitions.join(', '),
                  },
                )}
              />
            ))}
          <ChartGrid charts={data.charts} />
        </>
      ) : null}
    </div>
  );
};

type InsightsView = 'allocation' | JobView | 'cluster';

const isJobView = (view: InsightsView): view is JobView => view in JOB_CHARTS;

export const HpcInsightsTab: FC<{
  resource: Resource;
  hpcMode?: HpcWorkspaceMode | null;
}> = ({ resource, hpcMode }) => {
  const [view, setView] = useState<InsightsView>('allocation');
  const [days, setDays] = useState(7);
  const firecrestEnabled = Boolean(hpcMode?.firecrest);
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: hpcQueryKey(resource.uuid) });
  const jobs = (jobView: JobView) => (
    <JobStatsSection
      resourceUuid={resource.uuid}
      days={days}
      view={jobView}
      firecrest={firecrestEnabled}
    />
  );
  const items = [
    {
      value: 'allocation',
      title: translate('Allocation'),
      hint: translate(
        'Usage the cluster reported to Waldur, against the allocation limits.',
      ),
      content: <AllocationSection resourceUuid={resource.uuid} />,
    },
    {
      value: 'jobs',
      title: translate('Jobs'),
      hint: JOB_VIEW_TEXT.jobs(),
      content: jobs('jobs'),
    },
    {
      value: 'efficiency',
      title: translate('Efficiency'),
      hint: JOB_VIEW_TEXT.efficiency(),
      content: jobs('efficiency'),
    },
    {
      value: 'queue',
      title: translate('Queue'),
      hint: JOB_VIEW_TEXT.queue(),
      content: jobs('queue'),
    },
    // The cluster's live state is FirecREST's.
    ...(firecrestEnabled
      ? [
          {
            value: 'cluster',
            title: translate('Cluster load'),
            hint: translate(
              'Live node state and upcoming reservations, as the cluster reports them.',
            ),
            content: <ClusterSection resourceUuid={resource.uuid} />,
          },
        ]
      : []),
  ];
  // The tab strip heads the card, with the controls at its right end.
  return (
    <Tabs
      value={view}
      onValueChange={(value) => setView(value as InsightsView)}
    >
      <Card bordered className={HPC_CARD_CLASS}>
        <CardHeader className="border-b-0">
          <TabsList scrollable>
            {items.map((item) => (
              <TabsTrigger key={item.value} value={item.value} hint={item.hint}>
                {item.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-3">
            {isJobView(view) && (
              <HpcPeriodSelect<number>
                value={days}
                options={getStatsPeriodOptions()}
                onChange={setDays}
              />
            )}
            <BaseButton
              variant="tertiary"
              size="sm"
              onClick={refresh}
              tooltip={translate('Refresh')}
              iconNode={<ArrowClockwiseIcon weight="bold" />}
            />
          </div>
        </CardHeader>
        <CardContent>
          {items.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {item.content}
            </TabsContent>
          ))}
        </CardContent>
      </Card>
    </Tabs>
  );
};
