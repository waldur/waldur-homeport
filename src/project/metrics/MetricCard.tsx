import {
  ChartBarIcon,
  CubeIcon,
  FlagIcon,
  ListBulletsIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useMemo, useState } from 'react';
import { ProjectMetric, ResourceMetric } from 'waldur-js-client';

import { getCssVar } from 'waldur-design-tokens';
import { Badge, HelpIcon, Tooltip } from 'waldur-ui';

import { EChart } from '@/core/EChart';
import { lazyComponent } from '@/core/lazyComponent';
import { getCostWidgetChartOptions } from '@/dashboard/chart';
import { useChartThemeColors } from '@/dashboard/chartColors';
import { getChartBrandColor } from '@/dashboard/constants';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { translate } from '@/i18n';
import {
  formatFigure,
  getChangeLabel,
  getGoalPeriodOptions,
  getRateUnit,
  getSecondsAxis,
  isScaledUnit,
} from '@/marketplace/metrics/options';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import {
  DEFAULT_RANGE,
  getBucketValues,
  getTimelineAxis,
  getTimelineEnd,
  getTimelineQuery,
  isFineRange,
  MetricRange,
} from './metricTimeline';
import {
  assignColorSlots,
  OTHER_GROUP,
  SPLIT_RAMPS,
  splitSeries,
} from './splitSeries';
import { useMetricSeries } from './useMetricSeries';

const MetricBreakdownDialog = lazyComponent(() =>
  import('./MetricBreakdownDialog').then((module) => ({
    default: module.MetricBreakdownDialog,
  })),
);

const MetricGoalDialog = lazyComponent(() =>
  import('@/marketplace/metrics/MetricGoalDialog').then((module) => ({
    default: module.MetricGoalDialog,
  })),
);

const CHART_HEIGHT = 200;
const AXIS_SPLITS = 2;

const sumValues = (maps: Map<string, number>[]) => {
  const total = new Map<string, number>();
  maps.forEach((values) =>
    values.forEach((value, key) =>
      total.set(key, (total.get(key) ?? 0) + value),
    ),
  );
  return total;
};

/**
 * One metric's card: a project's combined figure, with its goal, or, given
 * resourceUuid, one resource's own figure. Goals apply to the project figure,
 * so a resource's card has none. The chart covers range up to anchor, the
 * time it was last asked to show; 90 days up to now unless given.
 */
export const MetricCard: FC<{
  item: ProjectMetric | ResourceMetric;
  project?: { uuid: string; name: string; customer_uuid?: string };
  resourceUuid?: string;
  range?: MetricRange;
  anchor?: number;
  refetch(): void;
}> = ({
  item,
  project,
  resourceUuid,
  range = DEFAULT_RANGE,
  anchor,
  refetch,
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  const metric = item.offering_metric;
  const isCounter = metric.kind === 'counter';
  // Values of different groups can be stacked only when they add up: counts,
  // and levels the offering adds up across resources.
  const additive = isCounter || metric.project_aggregation !== 'mean';
  const attributes = metric.attribute_keys ?? [];
  // The chart is split by the first attribute unless the user picks another
  // one, or the total, from the card's menu.
  const [splitBy, setSplitBy] = useState<string | null>(attributes[0] ?? null);
  const theme = useChartThemeColors();
  const [mountedAt] = useState(() => Date.now());
  const at = anchor ?? mountedAt;
  const fine = isFineRange(range);
  // Over hours, bytes and I/O operations read best as rates: MB/s, IOPS.
  const rateUnit = isCounter && fine ? getRateUnit(metric.unit) : null;
  // A counter is spread over the time between its points only when each
  // group the chart gets is one series. Over hours, the total of a counter
  // with one attribute is asked for by that attribute and added up here.
  const groupBy =
    splitBy ??
    (fine && isCounter && attributes.length === 1 ? attributes[0] : null);
  const spread =
    attributes.length === 0 || (attributes.length === 1 && Boolean(groupBy));
  const timeline = useMemo(() => getTimelineQuery(range, at), [range, at]);
  const { data } = useMetricSeries({
    offering_metric_uuid: metric.uuid,
    ...(resourceUuid
      ? { resource_uuid: resourceUuid }
      : { project_uuid: project.uuid }),
    start: timeline.start,
    granularity: timeline.granularity,
    aggregate: 'last',
    ...(groupBy ? { group_by: groupBy } : {}),
  });
  const points = useMemo(
    () => (data?.series ?? []).flatMap((series) => series.points),
    [data],
  );
  const projectItem = 'goal' in item ? item : null;
  const goal = projectItem?.goal;
  const period = getGoalPeriodOptions().find(
    (o) => o.value === item.period,
  )?.label;
  const scope = resourceUuid ? { resourceUuid } : { projectUuid: project.uuid };
  // The backend refuses a project goal without PROJECT.UPDATE; don't offer it.
  const canSetGoal =
    Boolean(projectItem) &&
    Boolean(user) &&
    (hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      projectId: project.uuid,
    }) ||
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_PROJECT,
        customerId: project.customer_uuid,
      }));

  const end = useMemo(() => getTimelineEnd(at, points), [at, points]);
  const bucketValues = useCallback(
    (series: typeof points) =>
      getBucketValues(range, end, series, {
        counter: isCounter,
        spread,
        rate: Boolean(rateUnit),
      }),
    [range, end, isCounter, spread, rateUnit],
  );
  const axis = useMemo(
    () => getTimelineAxis(range, end, points),
    [range, end, points],
  );
  const groups = useMemo(
    () =>
      splitBy
        ? splitSeries(
            data?.series ?? [],
            splitBy,
            additive,
            undefined,
            bucketValues,
          )
        : null,
    [data, splitBy, additive, bucketValues],
  );
  // Each returned group on its own, then added up.
  const totals = useMemo(
    () =>
      groups
        ? null
        : sumValues(
            (data?.series ?? []).map((series) => bucketValues(series.points)),
          ),
    [groups, data, bucketValues],
  );
  const hasData = axis.keys.some((key) =>
    groups ? groups.some((group) => group.values.has(key)) : totals.has(key),
  );
  const chartOptions = useMemo(() => {
    const chartUnit = rateUnit ?? metric.unit;
    // A line of one or two points draws nothing without its symbols.
    const fewPoints = (values: { value: number | null }[]) =>
      values.filter((datum) => datum.value !== null).length <= 2;
    const palette = SPLIT_RAMPS.map((ramp) => getCssVar(`--color-${ramp}-500`));
    const slots = assignColorSlots((groups ?? []).map((group) => group.key));
    const series = groups
      ? groups.map((group) => ({
          name: group.key === OTHER_GROUP ? translate('Other') : group.key,
          type: isCounter ? ('bar' as const) : ('line' as const),
          stack: additive ? 'split' : undefined,
          areaStyle: !isCounter && additive ? { opacity: 0.3 } : undefined,
          showSymbol: fewPoints(
            axis.keys.map((key) => ({ value: group.values.get(key) ?? null })),
          ),
          data: axis.keys.map((key) => ({
            value: group.values.get(key) ?? null,
          })),
          color:
            group.key === OTHER_GROUP
              ? theme.neutral
              : palette[slots.get(group.key)],
        }))
      : [
          {
            name: metric.name,
            type: isCounter ? ('bar' as const) : ('line' as const),
            // A bucket without data is a gap, not a zero.
            data: axis.keys.map((key) => ({ value: totals.get(key) ?? null })),
            color: getChartBrandColor(),
          },
        ];
    // The top of the axis: the highest day, stacked groups added up, or the
    // goal line when it is higher.
    const columns = series.map((serie) =>
      serie.data.map((datum) => datum.value ?? 0),
    );
    const axisMax = Math.max(
      0,
      goal && !isCounter ? Number(goal.value) : 0,
      ...(groups && additive
        ? axis.keys.map((_, index) =>
            columns.reduce((sum, column) => sum + column[index], 0),
          )
        : columns.flat()),
    );
    const secondsAxis =
      chartUnit === 's' ? getSecondsAxis(axisMax, AXIS_SPLITS) : null;
    const base = getCostWidgetChartOptions(
      series,
      // A counter's goal is for a whole period; drawing it over daily bars
      // would compare a month's target with one day's count.
      goal && !isCounter
        ? [
            {
              label: translate('Goal: {value}', {
                value: formatFigure(Number(goal.value), metric.unit),
              }),
              value: Number(goal.value),
            },
          ]
        : undefined,
      axis.labels,
      (value) => formatFigure(value, chartUnit),
    );
    return {
      ...base,
      // Stacked segments are square; only a single bar gets round corners.
      series: groups
        ? base.series.map((serie) => ({
            ...serie,
            data: (serie.data as any[]).map((datum) =>
              datum ? { ...datum, itemStyle: { borderRadius: 0 } } : datum,
            ),
          }))
        : base.series,
      legend: groups
        ? {
            ...base.legend,
            type: 'scroll',
            top: undefined,
            right: undefined,
            bottom: 0,
            left: 0,
            // Long values (module names) are cut; the tooltip has them whole.
            textStyle: {
              fontSize: 11,
              color: theme.text,
              width: 110,
              overflow: 'truncate',
            },
            tooltip: { show: true },
          }
        : { show: false },
      grid: { ...base.grid, top: 8, bottom: groups ? 28 : base.grid.bottom },
      yAxis: base.yAxis.map((axis) => ({
        ...axis,
        splitNumber: AXIS_SPLITS,
        ...(secondsAxis && { interval: secondsAxis.interval }),
        axisLabel: {
          hideOverlap: true,
          // 600 MB rather than 600,000,000, and rates with their unit;
          // other units stay bare numbers.
          ...(secondsAxis
            ? { formatter: secondsAxis.formatter }
            : (isScaledUnit(chartUnit) || rateUnit) && {
                formatter: (value: number) => formatFigure(value, chartUnit),
              }),
        },
      })),
    };
  }, [
    totals,
    groups,
    axis,
    goal,
    isCounter,
    additive,
    metric,
    theme,
    rateUnit,
  ]);

  const openGoal = () =>
    openDialog(MetricGoalDialog, {
      resolve: {
        offeringMetric: metric,
        project,
        goal: projectItem.goal_is_project ? goal : null,
        refetch,
      },
    });
  const goalBadge = goal ? (
    <Badge
      variant={
        projectItem.goal_met === null
          ? 'neutral'
          : projectItem.goal_met
            ? 'success'
            : 'warning'
      }
      shape="pill"
      tone="outline"
    >
      {translate('Goal {comparator} {value}', {
        comparator: goal.comparator === 'ge' ? '≥' : '≤',
        value: formatFigure(Number(goal.value), metric.unit),
      })}
    </Badge>
  ) : null;

  const hasChange = Boolean(item.previous) && item.current !== null;
  const change = hasChange
    ? ((item.current - item.previous) / item.previous) * 100
    : 0;

  return (
    <WidgetCard
      className="h-full"
      cardTitle={
        <>
          {metric.name}{' '}
          <HelpIcon
            label={translate('Reported by {offering}', {
              offering: metric.offering_name,
            })}
            tooltipProps={{
              body: isCounter
                ? translate('The figure is the total for {period}.', {
                    period: period?.toLowerCase(),
                  })
                : translate('The figure is the latest level in {period}.', {
                    period: period?.toLowerCase(),
                  }),
            }}
          />
        </>
      }
      title={formatFigure(item.current, metric.unit)}
      cardAction={
        // The goal is where people look for it: on the card, beside its menu,
        // so a card with a goal is laid out like one without. Whoever may
        // change it can click it; setting one is in the card's menu.
        goal ? (
          canSetGoal ? (
            <Tooltip
              label={
                projectItem.goal_is_project
                  ? translate('Edit project goal')
                  : translate(
                      "The service's default goal. Click to set this project's own.",
                    )
              }
            >
              <button
                type="button"
                className="border-0 bg-transparent p-0"
                onClick={openGoal}
              >
                {goalBadge}
              </button>
            </Tooltip>
          ) : (
            goalBadge
          )
        ) : undefined
      }
      right={
        hasChange ? (
          <div className="flex-none self-center">
            <Tooltip label={getChangeLabel(item.period)}>
              <span>
                <ChangesAmountBadge
                  changes={change}
                  showOnZero
                  asBadge
                  fractionDigits={0}
                  reverseColor={metric.good_direction === 'down'}
                />
              </span>
            </Tooltip>
          </div>
        ) : undefined
      }
      actions={[
        ...(canSetGoal
          ? [
              {
                label: projectItem.goal_is_project
                  ? translate('Edit project goal')
                  : translate('Set project goal'),
                icon: <FlagIcon weight="bold" />,
                callback: openGoal,
              },
            ]
          : []),
        ...attributes
          .filter((attribute) => attribute !== splitBy)
          .map((attribute) => ({
            label: translate('Split chart by {attribute}', { attribute }),
            icon: <ChartBarIcon weight="bold" />,
            callback: () => setSplitBy(attribute),
          })),
        ...(splitBy
          ? [
              {
                label: translate('Show total only'),
                icon: <ChartBarIcon weight="bold" />,
                callback: () => setSplitBy(null),
              },
            ]
          : []),
        ...attributes.map((attribute) => ({
          label: translate('Breakdown by {attribute}', { attribute }),
          icon: <ListBulletsIcon weight="bold" />,
          callback: () =>
            openDialog(MetricBreakdownDialog, {
              resolve: { item, ...scope, attribute },
            }),
        })),
        ...(projectItem
          ? [
              {
                label: translate('Breakdown by resource'),
                icon: <CubeIcon weight="bold" />,
                callback: () =>
                  openDialog(MetricBreakdownDialog, {
                    resolve: { item, ...scope, attribute: 'resource' },
                  }),
              },
            ]
          : []),
      ]}
    >
      {hasData ? (
        <EChart options={chartOptions} height={`${CHART_HEIGHT}px`} />
      ) : (
        // Same height as a chart, so cards in a row line up.
        <div
          className="flex items-center justify-center text-quaternary text-xs"
          style={{ height: CHART_HEIGHT }}
        >
          {fine
            ? translate('No data in this period.')
            : translate('No data reported yet.')}
        </div>
      )}
    </WidgetCard>
  );
};
