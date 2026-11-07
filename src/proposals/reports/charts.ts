import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import {
  BudgetReportPool,
  PortfolioReportBlock,
  PortfolioReportMonth,
  ReviewerReportRow,
  RoundReportRow,
  WorkflowReportStep,
} from 'waldur-js-client';

import { getChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';

import { isOverspent } from './budgetRows';
import { formatDays, formatNumber, formatShare } from './format';

type ThemeColors = ReturnType<typeof getChartThemeColors>;

/** Pixels per bar of a horizontal bar chart, so long lists stay readable. */
const ROW_HEIGHT = 32;

/** The height of a horizontal bar chart of `count` bars. */
export const barChartHeight = (count: number) =>
  `${Math.max(240, count * ROW_HEIGHT + 80)}px`;

const escapeHtml = (value: string) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** The tooltip of one bar of a stacked chart: its name, then a line a series. */
const stackTooltip =
  (format: (value: number, seriesIndex: number) => string = formatNumber) =>
  (params: any) => {
    const items = Array.isArray(params) ? params : [params];
    if (!items.length) return '';
    const lines = items
      .filter((item) => item.value !== null && item.value !== undefined)
      .map(
        (item) =>
          `${item.marker} ${escapeHtml(item.seriesName)}: ${escapeHtml(
            format(item.value, item.seriesIndex),
          )}`,
      );
    return [`<b>${escapeHtml(items[0].name)}</b>`, ...lines].join('<br/>');
  };

const categoryAxis = (names: string[], colors: ThemeColors) => ({
  type: 'category' as const,
  data: names,
  // The first item on top, as in the table below.
  inverse: true,
  axisLabel: {
    width: 220,
    overflow: 'truncate' as const,
    color: colors.textSecondary,
  },
  axisTick: { show: false },
});

const valueAxis = (colors: ThemeColors, extra: object = {}) => ({
  type: 'value' as const,
  minInterval: 1,
  axisLabel: { color: colors.muted },
  splitLine: { lineStyle: { color: colors.border } },
  ...extra,
});

const horizontalGrid = {
  left: 8,
  right: 24,
  top: 40,
  bottom: 8,
  containLabel: true,
};

const legend = (colors: ThemeColors) => ({
  top: 0,
  textStyle: { color: colors.textSecondary },
});

export interface OutcomeUnit {
  name: string;
  block: PortfolioReportBlock;
}

/** Where the proposals of each call (or round) stand, stacked. */
export const buildOutcomesOptions = (
  units: OutcomeUnit[],
  colors: ThemeColors,
): EChartsOption => {
  const series: Array<{
    key: keyof PortfolioReportBlock;
    name: string;
    color: string;
  }> = [
    { key: 'draft', name: translate('Draft'), color: colors.neutral },
    {
      key: 'awaiting_review',
      name: translate('Awaiting review'),
      color: colors.notice,
    },
    { key: 'in_review', name: translate('In review'), color: colors.progress },
    { key: 'accepted', name: translate('Accepted'), color: colors.success },
    { key: 'rejected', name: translate('Rejected'), color: colors.danger },
    {
      key: 'canceled',
      name: translate('Withdrawn or canceled'),
      color: colors.neutralStrong,
    },
  ];
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: stackTooltip(),
    },
    legend: legend(colors),
    grid: horizontalGrid,
    xAxis: valueAxis(colors),
    yAxis: categoryAxis(
      units.map((unit) => unit.name),
      colors,
    ),
    series: series.map((item) => ({
      name: item.name,
      type: 'bar',
      stack: 'outcomes',
      barMaxWidth: 20,
      itemStyle: { color: item.color },
      data: units.map((unit) => unit.block[item.key] as number),
    })),
  };
};

/** The longest run of months filled in, so a stray date cannot hang the page. */
const MAX_MONTHS = 240;

/**
 * Every month from the first to the last, those with no submission at zero:
 * the report leaves them out, which would set January next to April. With
 * dates chosen, the months they span.
 */
export const fillMonths = (
  months: PortfolioReportMonth[],
  from?: string,
  to?: string,
): PortfolioReportMonth[] => {
  const byMonth = new Map(
    months.map((month) => [
      DateTime.fromISO(month.month).startOf('month').toISODate(),
      month,
    ]),
  );
  const firstKnown = months.length
    ? DateTime.fromISO(months[0].month)
    : undefined;
  const lastKnown = months.length
    ? DateTime.fromISO(months[months.length - 1].month)
    : undefined;
  const start = (from ? DateTime.fromISO(from) : firstKnown)?.startOf('month');
  const end = (to ? DateTime.fromISO(to) : lastKnown)?.startOf('month');
  if (!start?.isValid || !end?.isValid || end < start) {
    return months;
  }
  const filled: PortfolioReportMonth[] = [];
  for (
    let month = start;
    month <= end && filled.length < MAX_MONTHS;
    month = month.plus({ months: 1 })
  ) {
    const key = month.toISODate();
    filled.push(byMonth.get(key) ?? { month: key, submitted: 0, accepted: 0 });
  }
  return filled;
};

/** Proposals submitted per month, and how many of them were accepted. */
export const buildMonthsOptions = (
  months: PortfolioReportMonth[],
  colors: ThemeColors,
): EChartsOption => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: stackTooltip(),
  },
  legend: legend(colors),
  grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
  xAxis: {
    type: 'category',
    data: months.map((month) =>
      DateTime.fromISO(month.month).toFormat('LLL yyyy'),
    ),
    axisLabel: { color: colors.muted },
  },
  yAxis: valueAxis(colors),
  series: [
    {
      name: translate('Submitted'),
      type: 'bar',
      barMaxWidth: 28,
      itemStyle: { color: colors.brand300 },
      data: months.map((month) => month.submitted),
    },
    {
      name: translate('Accepted'),
      type: 'bar',
      barMaxWidth: 28,
      itemStyle: { color: colors.success },
      data: months.map((month) => month.accepted),
    },
  ],
});

/** The step's name, and its overdue proposals when there are any. */
const workflowStepLabel = (step: WorkflowReportStep) =>
  step.overdue
    ? translate('{name} ({count} overdue)', {
        name: step.name,
        count: formatNumber(step.overdue),
      })
    : step.name;

/** How many days each step takes: the median and the slowest tenth. */
export const buildWorkflowOptions = (
  steps: WorkflowReportStep[],
  colors: ThemeColors,
): EChartsOption => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any) => {
      const items = Array.isArray(params) ? params : [params];
      const step = steps[items[0]?.dataIndex];
      if (!step) return '';
      return [
        `<b>${escapeHtml(step.name)}</b>`,
        ...items
          .filter((item) => item.value !== null && item.value !== undefined)
          .map(
            (item) =>
              `${item.marker} ${escapeHtml(item.seriesName)}: ${escapeHtml(
                formatDays(item.value),
              )}`,
          ),
        escapeHtml(
          translate('At the step now: {count}', {
            count: formatNumber(step.waiting),
          }),
        ),
        escapeHtml(
          translate('Overdue: {count}', { count: formatNumber(step.overdue) }),
        ),
      ].join('<br/>');
    },
  },
  legend: legend(colors),
  grid: horizontalGrid,
  xAxis: valueAxis(colors, {
    minInterval: undefined,
    name: translate('Days'),
    nameLocation: 'middle',
    nameGap: 28,
    nameTextStyle: { color: colors.muted },
  }),
  yAxis: categoryAxis(steps.map(workflowStepLabel), colors),
  series: [
    {
      name: translate('Median days'),
      type: 'bar',
      barMaxWidth: 14,
      itemStyle: { color: colors.brand500 },
      data: steps.map((step) => step.median_days),
    },
    {
      name: translate('Slowest 10% (days)'),
      type: 'bar',
      barMaxWidth: 14,
      itemStyle: { color: colors.neutral },
      data: steps.map((step) => step.p90_days),
    },
  ],
});

/** Each reviewer's reviews by where they stand, busiest first. */
export const buildReviewerLoadOptions = (
  reviewers: ReviewerReportRow[],
  colors: ThemeColors,
): EChartsOption => {
  const series: Array<{
    key: keyof ReviewerReportRow;
    name: string;
    color: string;
  }> = [
    {
      key: 'reviews_submitted',
      name: translate('Submitted'),
      color: colors.success,
    },
    {
      key: 'reviews_in_progress',
      name: translate('In progress'),
      color: colors.progress,
    },
    {
      key: 'reviews_not_started',
      name: translate('Not started'),
      color: colors.neutral,
    },
    {
      key: 'reviews_declined',
      name: translate('Declined'),
      color: colors.danger,
    },
    {
      key: 'reviews_expired',
      name: translate('Expired'),
      color: colors.warning,
    },
    {
      key: 'reviews_withdrawn',
      name: translate('Withdrawn'),
      color: colors.neutralStrong,
    },
  ];
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: stackTooltip(),
    },
    legend: legend(colors),
    grid: horizontalGrid,
    xAxis: valueAxis(colors),
    yAxis: categoryAxis(
      // An invitee with no account is named by the address invited.
      reviewers.map(
        (reviewer) => reviewer.reviewer_name || reviewer.reviewer_email,
      ),
      colors,
    ),
    series: series.map((item) => ({
      name: item.name,
      type: 'bar',
      stack: 'reviews',
      barMaxWidth: 20,
      itemStyle: { color: item.color },
      data: reviewers.map((reviewer) => reviewer[item.key] as number),
    })),
  };
};

export const roundLabel = (round: RoundReportRow, withCall: boolean) =>
  withCall ? `${round.round_name} · ${round.call_name}` : round.round_name;

/** The stages of a round from its cut-off to its results, in order. */
const TIMELINE_STAGES: Array<{
  key: 'days_cutoff_to_evaluation' | 'days_evaluating' | 'days_deciding';
  /** The `current_stage` of a round still at this stage. */
  stage: 'awaiting_evaluation' | 'evaluating' | 'deciding';
  name: () => string;
  color: (colors: ThemeColors) => string;
}> = [
  {
    key: 'days_cutoff_to_evaluation',
    stage: 'awaiting_evaluation',
    name: () => translate('Cut-off to evaluation'),
    color: (colors) => colors.neutral,
  },
  {
    key: 'days_evaluating',
    stage: 'evaluating',
    name: () => translate('Evaluating'),
    color: (colors) => colors.progress,
  },
  {
    key: 'days_deciding',
    stage: 'deciding',
    name: () => translate('Deciding'),
    color: (colors) => colors.notice,
  },
];

/** The timeline stage a round is at now, if it is between cut-off and results. */
const openStage = (round: RoundReportRow) =>
  TIMELINE_STAGES.find((stage) => stage.stage === round.current_stage);

/** Days the round has spent so far at a timeline stage it has not finished. */
const daysUnderWay = (round: RoundReportRow): number | null =>
  openStage(round) ? round.days_in_current_stage : null;

/** Whether the round has anything to draw: a stage done, or one under way. */
export const hasRoundSpans = (round: RoundReportRow) =>
  [
    ...TIMELINE_STAGES.map((stage) => round[stage.key]),
    daysUnderWay(round),
  ].some((value) => value !== null && value !== undefined);

/**
 * Each round from its cut-off to publishing results, in its three stages.
 * The stage a round is at now is drawn last, hatched and lighter, up to today.
 */
export const buildRoundTimelineOptions = (
  rounds: RoundReportRow[],
  colors: ThemeColors,
  withCall: boolean,
): EChartsOption => {
  const underWayName = translate('Under way, so far');
  // The hatching, in the card's own colour so it reads in either theme.
  const decal = {
    symbol: 'rect',
    symbolSize: 1,
    dashArrayX: [1, 0],
    dashArrayY: [2, 4],
    rotation: -Math.PI / 4,
    color: colors.surface,
  };
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const items = Array.isArray(params) ? params : [params];
        const round = rounds[items[0]?.dataIndex];
        if (!round) return '';
        const lines = [
          `<b>${escapeHtml(roundLabel(round, withCall))}</b>`,
          ...items
            .filter(
              (item) =>
                item.seriesName !== underWayName &&
                item.value !== null &&
                item.value !== undefined,
            )
            .map(
              (item) =>
                `${item.marker} ${escapeHtml(item.seriesName)}: ${escapeHtml(
                  translate('{days} days', { days: formatDays(item.value) }),
                )}`,
            ),
        ];
        const open = openStage(round);
        if (open && daysUnderWay(round) !== null) {
          lines.push(
            escapeHtml(
              translate('{stage}, under way: {days} days so far', {
                stage: open.name(),
                days: formatDays(daysUnderWay(round)),
              }),
            ),
          );
        }
        if (round.late) {
          lines.push(
            escapeHtml(translate('Results came after the allocation date.')),
          );
        }
        return lines.join('<br/>');
      },
    },
    legend: legend(colors),
    grid: horizontalGrid,
    xAxis: valueAxis(colors, {
      minInterval: undefined,
      name: translate('Days'),
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: colors.muted },
    }),
    yAxis: categoryAxis(
      rounds.map((round) => roundLabel(round, withCall)),
      colors,
    ),
    series: [
      ...TIMELINE_STAGES.map((stage) => ({
        name: stage.name(),
        type: 'bar' as const,
        stack: 'stages',
        barMaxWidth: 20,
        itemStyle: { color: stage.color(colors) },
        data: rounds.map((round) => round[stage.key]),
      })),
      {
        name: underWayName,
        type: 'bar' as const,
        stack: 'stages',
        barMaxWidth: 20,
        // The legend's swatch; each bar takes its stage's colour.
        itemStyle: { color: colors.neutralStrong, opacity: 0.5, decal },
        data: rounds.map((round) => {
          const open = openStage(round);
          const days = daysUnderWay(round);
          return open && days !== null
            ? {
                value: days,
                itemStyle: { color: open.color(colors), opacity: 0.5, decal },
              }
            : null;
        }),
      },
    ],
  };
};

/** A pool's name: what it offers, and of which round. */
export const poolLabel = (pool: BudgetReportPool, withCall: boolean) => {
  // The component first: the offering is in the tooltip, and two pools of
  // one component differ by their scope, so that is what the label names.
  const parts = [
    pool.component_name,
    pool.round_name || translate('call-wide'),
  ];
  if (withCall) parts.push(pool.call_name);
  return parts.join(' · ');
};

/**
 * Each pool's offer split into awarded, asked for by proposals still waiting
 * for their decision, and free, as shares of the offer: pools are offered in
 * different units, so only shares compare across them.
 */
const getPoolShares = (pool: BudgetReportPool) => {
  const offered = pool.offered_total || 0;
  if (offered <= 0) {
    return { awarded: 0, undecided: 0, free: 0 };
  }
  const awarded = Math.min(pool.awarded, offered);
  const remaining = Math.max(pool.remaining ?? offered - awarded, 0);
  const undecided = Math.min(pool.undecided, remaining);
  return {
    awarded: awarded / offered,
    undecided: undecided / offered,
    free: (remaining - undecided) / offered,
  };
};

/**
 * The budgets tiles, all by one rule: a budget is a pool, and a round's pool
 * within a call-wide pool is not one of its own -- what it awards and is
 * asked for counts in the call's pool already.
 */
export const countBudgets = (pools: BudgetReportPool[]) => {
  const budgets = pools.filter(
    (pool) => pool.pool_uuid && !pool.within_call_pool,
  );
  return {
    pools: budgets.length,
    usedUp: budgets.filter(
      (pool) => pool.remaining !== null && pool.remaining <= 0,
    ).length,
    // Asked for and still undecided, whether or not the pool has room left.
    undecided: budgets.filter((pool) => pool.undecided > 0).length,
  };
};

/** What the pool has left to award, never below nothing. */
const left = (pool: BudgetReportPool) => Math.max(pool.remaining ?? 0, 0);

export const buildPoolOptions = (
  pools: BudgetReportPool[],
  colors: ThemeColors,
  withCall: boolean,
  formatAmount: (pool: BudgetReportPool, value: number) => string,
): EChartsOption => {
  const parts: Array<{
    key: 'awarded' | 'undecided' | 'free';
    name: string;
    color: string;
    amount: (pool: BudgetReportPool) => number;
  }> = [
    {
      key: 'awarded',
      name: translate('Awarded'),
      color: colors.brand500,
      amount: (pool) => pool.awarded,
    },
    {
      key: 'undecided',
      name: translate('Asked for, undecided'),
      color: colors.notice,
      amount: (pool) => Math.min(pool.undecided, left(pool)),
    },
    {
      key: 'free',
      name: translate('Free'),
      color: colors.remaining,
      amount: (pool) => left(pool) - Math.min(pool.undecided, left(pool)),
    },
  ];
  const shares = pools.map(getPoolShares);
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const items = Array.isArray(params) ? params : [params];
        const index = items[0]?.dataIndex;
        const pool = pools[index];
        if (!pool) return '';
        const lines = [
          `<b>${escapeHtml(poolLabel(pool, withCall))}</b>`,
          escapeHtml(pool.offering_name),
          escapeHtml(
            translate('Offered: {amount}', {
              amount: formatAmount(pool, pool.offered_total),
            }),
          ),
          ...items.map((item) => {
            const part = parts[item.seriesIndex];
            return `${item.marker} ${escapeHtml(part.name)}: ${escapeHtml(
              `${formatAmount(pool, part.amount(pool))} (${formatShare(
                shares[index][part.key],
              )})`,
            )}`;
          }),
        ];
        if (isOverspent(pool)) {
          lines.push(
            escapeHtml(
              translate('Over budget by {amount}', {
                amount: formatAmount(pool, pool.awarded - pool.offered_total),
              }),
            ),
          );
        }
        return lines.join('<br/>');
      },
    },
    legend: legend(colors),
    grid: horizontalGrid,
    xAxis: valueAxis(colors, {
      minInterval: undefined,
      max: 1,
      axisLabel: {
        color: colors.muted,
        formatter: (value: number) => formatShare(value),
      },
    }),
    yAxis: categoryAxis(
      pools.map((pool) => poolLabel(pool, withCall)),
      colors,
    ),
    series: parts.map((part) => ({
      name: part.name,
      type: 'bar',
      stack: 'pool',
      barMaxWidth: 20,
      itemStyle: { color: part.color },
      // An award past the offer fills the bar, capped at 100%, in the
      // danger colour.
      data: shares.map((share, index) =>
        part.key === 'awarded' && isOverspent(pools[index])
          ? { value: share.awarded, itemStyle: { color: colors.danger } }
          : share[part.key],
      ),
    })),
  };
};
