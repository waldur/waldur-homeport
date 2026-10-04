import { FlagIcon, ListBulletsIcon, QuestionIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Col } from 'react-bootstrap';
import { ProjectMetric } from 'waldur-js-client';

import { Badge, Tooltip } from 'waldur-ui';

import { EChart } from '@/core/EChart';
import { lazyComponent } from '@/core/lazyComponent';
import { getCostWidgetChartOptions } from '@/dashboard/chart';
import { getChartBrandColor } from '@/dashboard/constants';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { translate } from '@/i18n';
import {
  formatFigure,
  getGoalPeriodOptions,
} from '@/marketplace/metrics/options';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

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

export const MetricCard: FC<{
  item: ProjectMetric;
  project: { uuid: string; name: string; customer_uuid?: string };
  refetch(): void;
}> = ({ item, project, refetch }) => {
  const { openDialog } = useModal();
  const user = useUser();
  const metric = item.offering_metric;
  const isCounter = metric.kind === 'counter';
  const days = useMemo(trendDays, []);
  const { data } = useMetricSeries({
    offering_metric_uuid: metric.uuid,
    project_uuid: project.uuid,
    start: days[0].toISOString(),
    granularity: 'day',
    aggregate: 'last',
  });
  const points = data?.series?.[0]?.points ?? [];
  const goal = item.goal;
  const attributes = metric.attribute_keys ?? [];
  const period = getGoalPeriodOptions().find(
    (o) => o.value === item.period,
  )?.label;
  // The backend refuses a project goal without PROJECT.UPDATE; don't offer it.
  const canSetGoal =
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
  const chartOptions = useMemo(() => {
    const byDay = new Map(
      points.map((point) => [
        dayKey(new Date(point.timestamp)),
        point.value === null ? null : Number(point.value),
      ]),
    );
    const base = getCostWidgetChartOptions(
      [
        {
          name: metric.name,
          type: isCounter ? 'bar' : 'line',
          // A day without data is a gap, not a zero.
          data: axisDays.map((day) => {
            const value = byDay.get(dayKey(day));
            return { value: value === undefined ? null : value };
          }),
          color: getChartBrandColor(),
        },
      ],
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
      legend: { show: false },
      grid: { ...base.grid, top: 8 },
      yAxis: base.yAxis.map((axis) => ({
        ...axis,
        splitNumber: 2,
        axisLabel: { hideOverlap: true },
      })),
    };
  }, [points, axisDays, goal, isCounter, metric]);

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
          <Tooltip
            label={translate('Reported by {offering}', {
              offering: metric.offering_name,
            })}
            body={
              isCounter
                ? translate('The figure is the total for {period}.', {
                    period: period?.toLowerCase(),
                  })
                : translate('The figure is the latest level in {period}.', {
                    period: period?.toLowerCase(),
                  })
            }
          >
            <QuestionIcon weight="bold" className="text-muted" />
          </Tooltip>
        </>
      }
      title={formatFigure(item.current, metric.unit)}
      meta={
        goal ? (
          <Badge
            variant={
              item.goal_met === null
                ? 'neutral'
                : item.goal_met
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
        ) : undefined
      }
      right={
        hasChange ? (
          <Col xs="auto" className="align-self-center">
            <Tooltip label={translate('Change vs the previous period')}>
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
        ...attributes.map((attribute) => ({
          label: translate('Breakdown by {attribute}', { attribute }),
          icon: <ListBulletsIcon weight="bold" />,
          callback: () =>
            openDialog(MetricBreakdownDialog, {
              resolve: { item, projectUuid: project.uuid, attribute },
            }),
        })),
        ...(canSetGoal
          ? [
              {
                label: item.goal_is_project
                  ? translate('Edit project goal')
                  : translate('Set project goal'),
                icon: <FlagIcon weight="bold" />,
                callback: () =>
                  openDialog(MetricGoalDialog, {
                    resolve: {
                      offeringMetric: metric,
                      project,
                      goal: item.goal_is_project ? goal : null,
                      refetch,
                    },
                  }),
              },
            ]
          : []),
      ]}
    >
      {points.length ? (
        <EChart options={chartOptions} height="160px" />
      ) : (
        // Same height as a chart, so cards in a row line up.
        <div
          className="d-flex align-items-center justify-content-center text-muted fs-7"
          style={{ height: 160 }}
        >
          {translate('No data reported yet.')}
        </div>
      )}
    </WidgetCard>
  );
};
