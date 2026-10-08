import {
  ChartBarIcon,
  CubeIcon,
  FlagIcon,
  ListBulletsIcon,
} from '@phosphor-icons/react';
import { FC, useMemo, useState } from 'react';
import { Col } from 'react-bootstrap';
import { ProjectMetric, ResourceMetric } from 'waldur-js-client';

import { getCssVar } from 'waldur-design-tokens';
import { Badge, BaseButton, HelpIcon, Tooltip } from 'waldur-ui';

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
} from '@/marketplace/metrics/options';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

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

const TREND_DAYS = 90;
const CHART_HEIGHT = 200;

// The axis starts at the first day with data, but never shows fewer days
// than this, so a week-old metric is not stretched into three bars.
const MIN_AXIS_DAYS = 14;
const DAY_MS = 86400000;

// Daily roll-ups start at UTC midnight; label them in UTC too, or a viewer
// west of Greenwich sees every bucket a day early.
const dayKey = (date: Date) => date.toISOString().slice(0, 10);
const dayLabel = (date: Date) =>
  date.toLocaleDateString(undefined, {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  });

const trendDays = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Array.from(
    { length: TREND_DAYS },
    (_, index) => new Date(today.getTime() - (TREND_DAYS - 1 - index) * DAY_MS),
  );
};

/**
 * One metric's card: a project's combined figure, with its goal, or, given
 * resourceUuid, one resource's own figure. Goals apply to the project figure,
 * so a resource's card has none.
 */
export const MetricCard: FC<{
  item: ProjectMetric | ResourceMetric;
  project?: { uuid: string; name: string; customer_uuid?: string };
  resourceUuid?: string;
  refetch(): void;
}> = ({ item, project, resourceUuid, refetch }) => {
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
  const days = useMemo(trendDays, []);
  const { data } = useMetricSeries({
    offering_metric_uuid: metric.uuid,
    ...(resourceUuid
      ? { resource_uuid: resourceUuid }
      : { project_uuid: project.uuid }),
    start: days[0].toISOString(),
    granularity: 'day',
    aggregate: 'last',
    ...(splitBy ? { group_by: splitBy } : {}),
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

  const axisDays = useMemo(() => {
    const keys = points.map((point) => dayKey(new Date(point.timestamp)));
    const first = keys.length
      ? days.findIndex((day) => keys.includes(dayKey(day)))
      : -1;
    const from = first < 0 ? 0 : Math.min(first, days.length - MIN_AXIS_DAYS);
    return days.slice(Math.max(from, 0));
  }, [points, days]);
  const groups = useMemo(
    () => (splitBy ? splitSeries(data?.series ?? [], splitBy, additive) : null),
    [data, splitBy, additive],
  );
  const chartOptions = useMemo(() => {
    const byDay = new Map(
      points.map((point) => [
        dayKey(new Date(point.timestamp)),
        point.value === null ? null : Number(point.value),
      ]),
    );
    const palette = SPLIT_RAMPS.map((ramp) => getCssVar(`--color-${ramp}-500`));
    const slots = assignColorSlots((groups ?? []).map((group) => group.key));
    const series = groups
      ? groups.map((group) => ({
          name: group.key === OTHER_GROUP ? translate('Other') : group.key,
          type: isCounter ? ('bar' as const) : ('line' as const),
          stack: additive ? 'split' : undefined,
          areaStyle: !isCounter && additive ? { opacity: 0.3 } : undefined,
          showSymbol: false,
          data: axisDays.map((day) => {
            const value = group.byDay.get(dayKey(day));
            return { value: value === undefined ? null : value };
          }),
          color:
            group.key === OTHER_GROUP
              ? theme.neutral
              : palette[slots.get(group.key)],
        }))
      : [
          {
            name: metric.name,
            type: isCounter ? ('bar' as const) : ('line' as const),
            // A day without data is a gap, not a zero.
            data: axisDays.map((day) => {
              const value = byDay.get(dayKey(day));
              return { value: value === undefined ? null : value };
            }),
            color: getChartBrandColor(),
          },
        ];
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
      axisDays.map(dayLabel),
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
        splitNumber: 2,
        axisLabel: { hideOverlap: true },
      })),
    };
  }, [points, groups, axisDays, goal, isCounter, additive, metric, theme]);

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
      className="h-100"
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
      meta={
        // The goal is where people look for it: on the card. Whoever may
        // change it can click it; a card without one offers to set one.
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
        ) : canSetGoal ? (
          <BaseButton
            variant="text-primary"
            size="sm"
            iconNode={<FlagIcon weight="bold" />}
            label={translate('Set goal')}
            onClick={openGoal}
          />
        ) : undefined
      }
      right={
        hasChange ? (
          <Col xs="auto" className="align-self-center">
            <Tooltip label={getChangeLabel(item.period)}>
              <span>
                <ChangesAmountBadge
                  changes={change}
                  showOnZero
                  asBadge
                  badgeOutline
                  badgePill
                  fractionDigits={0}
                  reverseColor={metric.good_direction === 'down'}
                />
              </span>
            </Tooltip>
          </Col>
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
      {points.length ? (
        <EChart options={chartOptions} height={`${CHART_HEIGHT}px`} />
      ) : (
        // Same height as a chart, so cards in a row line up.
        <div
          className="d-flex align-items-center justify-content-center text-muted fs-7"
          style={{ height: CHART_HEIGHT }}
        >
          {translate('No data reported yet.')}
        </div>
      )}
    </WidgetCard>
  );
};
