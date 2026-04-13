/**
 * Pure functions that build EChartsOption objects from ProjectUsageReport data.
 * No React, no API calls — accepts wrapper class instances and returns options.
 */

import type { EChartsOption } from 'echarts';

import { translate } from '@waldur/i18n';

import { ProjectUsageReport } from './ProjectUsageReport';
import { secondsToHours } from './storage';

/** Colour palette */
const PALETTE = [
  '#003366',
  '#006699',
  '#23c6c8',
  '#1c84c6',
  '#2ecc71',
  '#e74c3c',
  '#e67e22',
  '#f1c40f',
  '#9b59b6',
  '#1abc9c',
  '#e91e63',
  '#ff5722',
];

export type UsageMetric = 'usage' | 'jobs' | 'avg_wait';
export type UsageComponent = 'total' | string;
export type GroupBy = 'day' | 'month';

export interface NameMaps {
  offering?: Record<string, string>;
  project?: Record<string, string>;
  user?: Record<string, string>;
}

// ── Label helpers ──────────────────────────────────────────────────────────────

/** Strip the project suffix from a local username: "chris.aiproject" → "chris" */
const shortName = (s: string) => s.split('.')[0];

/** Truncate a string at the last word boundary ≤ maxLen characters */
export function truncateLabel(s: string, maxLen = 50): string {
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 4 ? cut.slice(0, lastSpace) : cut) + '…';
}

/**
 * Middle-truncate a string: keep the first `head` characters and the last
 * `tail` characters, joined with "…".  Works well for names like
 * "AIRR-GF01 - 2024-01 - A very long project description" where both the
 * code prefix and the trailing description are meaningful.
 */
export function truncateMiddle(s: string, head = 28, tail = 18): string {
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

// ── Tooltip helpers ────────────────────────────────────────────────────────────

const MAX_TOOLTIP_ITEMS = 25;
const MAX_PIE_SLICES = 40;
const OTHERS_THRESHOLD = 0.05; // include items until "Others" < this fraction of total
const TOP_N_USERS = 20;

const LEGEND_HIDE_THRESHOLD = 15; // hide legend when more than this many series

/** Legend config for timeseries/bar charts; hides when series count exceeds threshold. */
export function timeseriesLegend(names: string[]): object {
  if (names.length > LEGEND_HIDE_THRESHOLD) return { show: false };
  return { data: names, type: 'scroll', bottom: 60 };
}

/** Legend config for pie charts; hides when slice count exceeds threshold. */
function pieLegend(itemCount: number): object {
  if (itemCount > LEGEND_HIDE_THRESHOLD) return { show: false };
  return { orient: 'vertical', right: 10, type: 'scroll' };
}

/**
 * When the legend is hidden, override grid.bottom to reclaim the space it
 * would have occupied (legend sits at bottom=60 above the dataZoom slider).
 */
export function gridOverride(seriesCount: number, hiddenBottom = 70): object {
  return seriesCount > LEGEND_HIDE_THRESHOLD
    ? { grid: { bottom: hiddenBottom } }
    : {};
}

const tooltipDot = (color: string) =>
  `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:4px"></span>`;

/**
 * Build tooltip rows from axis params, sorted largest-first.
 * Shows at most MAX_TOOLTIP_ITEMS entries with an "others" summary.
 * Returns both the rows HTML and the grand total.
 */
export function buildTooltipRows(
  params: any[],
  fmtVal: (v: number) => string,
): { rows: string; total: number } {
  const active = (params as any[]).filter((p) => (p.value as number) > 0);
  active.sort((a, b) => (b.value as number) - (a.value as number));
  const shown = active.slice(0, MAX_TOOLTIP_ITEMS);
  const rest = active.slice(MAX_TOOLTIP_ITEMS);
  const othersTotal = rest.reduce(
    (s: number, p: any) => s + (p.value as number),
    0,
  );
  const total = active.reduce(
    (s: number, p: any) => s + (p.value as number),
    0,
  );
  const rowLines = [
    ...shown.map(
      (p: any) =>
        `${tooltipDot(p.color)}${p.seriesName}: <b>${fmtVal(p.value as number)}</b>`,
    ),
    ...(rest.length > 0
      ? [
          `<i style="color:#888">…${rest.length} others: <b>${fmtVal(othersTotal)}</b></i>`,
        ]
      : []),
  ];
  return { rows: rowLines.join('<br/>'), total };
}

/**
 * Dynamic pie data: sort largest-first, then include items until the
 * remaining "Others" slice is < threshold (default 5%) of the total, capped
 * at MAX_PIE_SLICES (40).  This prevents the "Others" wedge from dominating
 * the chart when usage is spread across many users/projects.
 *
 * `othersLabelFn` overrides the label for the aggregated slice; receives the
 * hidden items and the shown items so callers can derive a contextual label.
 */
function topNPieData(
  data: Array<{ name: string; value: number; itemStyle: { color: string } }>,
  options?: {
    threshold?: number;
    othersLabelFn?: (
      rest: Array<{ name: string; value: number }>,
      shown: Array<{ name: string; value: number }>,
    ) => string;
  },
): Array<{ name: string; value: number; itemStyle: { color: string } }> {
  const threshold = options?.threshold ?? OTHERS_THRESHOLD;
  const sorted = [...data].sort((a, b) => b.value - a.value);
  if (sorted.length <= MAX_PIE_SLICES) return sorted;

  const total = sorted.reduce((s, d) => s + d.value, 0);
  let n = MAX_PIE_SLICES;
  if (total > 0) {
    let cumulative = 0;
    for (let i = 0; i < Math.min(sorted.length - 1, MAX_PIE_SLICES); i++) {
      cumulative += sorted[i].value;
      if ((total - cumulative) / total < threshold) {
        n = i + 1;
        break;
      }
    }
  }

  const shown = sorted.slice(0, n);
  const rest = sorted.slice(n);
  const label = options?.othersLabelFn
    ? options.othersLabelFn(rest, shown)
    : translate('Others ({count})', { count: rest.length });
  return [
    ...shown,
    {
      name: label,
      value: rest.reduce((s, d) => s + d.value, 0),
      itemStyle: { color: '#bbb' },
    },
  ];
}

// ── X-axis range helper ────────────────────────────────────────────────────────

/**
 * Compute dataZoom start/end percentages so the chart shows only the range
 * that contains non-zero data (hides leading/trailing empty periods).
 */
export function computeDataZoomRange(
  labels: string[],
  seriesData: (number | null)[][],
): { start: number; end: number } {
  let firstIdx = labels.length;
  let lastIdx = -1;
  for (const data of seriesData) {
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      if (v !== null && v !== undefined && (v as number) > 0) {
        if (i < firstIdx) firstIdx = i;
        if (i > lastIdx) lastIdx = i;
      }
    }
  }
  if (firstIdx > lastIdx || labels.length === 0) return { start: 0, end: 100 };
  const start = Math.max(0, Math.floor((firstIdx / labels.length) * 100));
  const end = Math.min(100, Math.ceil(((lastIdx + 1) / labels.length) * 100));
  return { start, end };
}

// ── Aggregation helpers ────────────────────────────────────────────────────────

function computeLabels(dates: string[], groupBy: GroupBy): string[] {
  if (groupBy === 'month') {
    return [...new Set(dates.map((d) => d.slice(0, 7)))].sort();
  }
  return dates;
}

function sumOverLabel(
  dates: string[],
  label: string,
  groupBy: GroupBy,
  getValue: (d: string) => number,
): number {
  if (groupBy === 'month') {
    return dates
      .filter((d) => d.startsWith(label))
      .reduce((s, d) => s + getValue(d), 0);
  }
  return getValue(label);
}

/**
 * Maximum plausible average job wait before a day is considered spurious.
 * Jobs that waited through maintenance windows or ran out of credits can
 * inflate daily aggregates to thousands of minutes. Any day whose per-day
 * average exceeds this threshold is excluded from both day-mode and
 * month-mode aggregations.
 */
const MAX_PLAUSIBLE_WAIT_MINUTES = 1440; // 24 hours

/** Returns true when a day's aggregate wait data looks spurious. */
export function isDayWaitSpurious(waitSec: number, jobs: number): boolean {
  if (jobs === 0) return false;
  return waitSec / jobs / 60 > MAX_PLAUSIBLE_WAIT_MINUTES;
}

function avgWaitOverLabel(
  dates: string[],
  label: string,
  groupBy: GroupBy,
  getTotalWaitSec: (d: string) => number,
  getJobs: (d: string) => number,
): number | null {
  const relevantDates =
    groupBy === 'month' ? dates.filter((d) => d.startsWith(label)) : [label];

  // Exclude days whose per-day average wait exceeds the plausibility threshold.
  // In month mode this means bad days are simply skipped when summing; the
  // remaining good days still contribute an aggregate for that month.
  const cleanDates = relevantDates.filter(
    (d) => !isDayWaitSpurious(getTotalWaitSec(d), getJobs(d)),
  );

  const totalJobs = cleanDates.reduce((s, d) => s + getJobs(d), 0);
  const totalWait = cleanDates.reduce((s, d) => s + getTotalWaitSec(d), 0);
  return totalJobs > 0 ? Math.round(totalWait / totalJobs / 60) : null;
}

// ── Shared base config ────────────────────────────────────────────────────────

function baseTimeseriesConfig(
  labels: string[],
  groupBy: GroupBy,
  yName: string,
  yFormatter: string,
  dataZoomRange: { start: number; end: number } = { start: 0, end: 100 },
) {
  return {
    toolbox: {
      right: 10,
      feature: {
        magicType: {
          type: ['bar', 'line'] as ('line' | 'bar' | 'stack')[],
          title: {
            bar: translate('Bar chart'),
            line: translate('Line chart'),
          },
        },
        saveAsImage: { title: translate('Save image') },
      },
    },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        bottom: 10,
        height: 40,
        start: dataZoomRange.start,
        end: dataZoomRange.end,
      },
    ],
    grid: { bottom: 130 },
    xAxis: {
      type: 'category' as const,
      data: labels,
      axisLabel: {
        rotate: 30,
        formatter: groupBy === 'month' ? undefined : (v: string) => v.slice(5),
      },
    },
    yAxis: {
      type: 'value' as const,
      name: yName,
      axisLabel: { formatter: yFormatter },
    },
  };
}

// ── Group reports by project ──────────────────────────────────────────────────

function groupByProject(reports: ProjectUsageReport[]): ProjectUsageReport[] {
  const map = new Map<string, ProjectUsageReport[]>();
  for (const r of reports) {
    const existing = map.get(r.project) ?? [];
    map.set(r.project, [...existing, r]);
  }
  return [...map.values()].map((group) =>
    group.length === 1 ? group[0] : ProjectUsageReport.combine(group),
  );
}

// ── Resolve display names ─────────────────────────────────────────────────────

function resolveUserName(
  u: string,
  report: ProjectUsageReport,
  fullNames: boolean,
  nameMaps?: NameMaps,
): string {
  if (nameMaps?.user) {
    const uid = report.localToIdentifier[u];
    if (uid && nameMaps.user[uid]) return truncateLabel(nameMaps.user[uid]);
    // Unmapped users (no UserIdentifier) may be keyed directly by their email.
    if (nameMaps.user[u]) return truncateLabel(nameMaps.user[u]);
  }
  return truncateLabel(fullNames ? u : shortName(u));
}

function resolveProjectName(projId: string, nameMaps?: NameMaps): string {
  return truncateMiddle(nameMaps?.project?.[projId] ?? projId);
}

// ─── Usage (hours) ────────────────────────────────────────────────────────────

export function buildTimeseriesOptions(
  report: ProjectUsageReport,
  component: UsageComponent = 'total',
  groupBy: GroupBy = 'day',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const dates = report.dates;
  const labels = computeLabels(dates, groupBy);
  const users = report.localUsers();
  const displayNames = users.map((u) =>
    resolveUserName(u, report, fullNames, nameMaps),
  );

  const getHoursForDate = (user: string, date: string): number => {
    const daily = report.getReport(date);
    if (!daily) return 0;
    if (component === 'total') {
      return secondsToHours(daily.usageForUser(user).seconds);
    }
    return secondsToHours(daily.componentUsageForUser(component, user).seconds);
  };

  const yLabel =
    component === 'total'
      ? translate('Usage (hours)')
      : translate('{component} (hours)', {
          component: component.charAt(0).toUpperCase() + component.slice(1),
        });

  const seriesData = users.map((user) =>
    labels.map((label) =>
      sumOverLabel(dates, label, groupBy, (d) => getHoursForDate(user, d)),
    ),
  );

  // Rank users by total, keep top N
  const userTotals = seriesData.map((data) => data.reduce((s, v) => s + v, 0));
  const ranked = users
    .map((user, i) => ({
      user,
      display: displayNames[i],
      total: userTotals[i],
      data: seriesData[i],
    }))
    .sort((a, b) => b.total - a.total);
  const topUsers = ranked.slice(0, TOP_N_USERS);
  const hiddenUsers = ranked.slice(TOP_N_USERS).filter((u) => u.total > 0);
  const otherData =
    hiddenUsers.length > 0
      ? labels.map((_, li) =>
          hiddenUsers.reduce((s, u) => s + (u.data[li] ?? 0), 0),
        )
      : null;
  const allNames = [
    ...topUsers.map((u) => u.display),
    ...(otherData
      ? [translate('Others ({count})', { count: hiddenUsers.length })]
      : []),
  ];

  const zoom = computeDataZoomRange(
    labels,
    topUsers.map((u) => u.data),
  );
  const base = baseTimeseriesConfig(labels, groupBy, yLabel, '{value} h', zoom);

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const { rows, total } = buildTooltipRows(params, (v) =>
          translate('{value} h', { value: v.toFixed(2) }),
        );
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>${translate('Total')}: <b>${total.toFixed(2)} h</b>`;
      },
    },
    legend: timeseriesLegend(allNames),
    ...base,
    ...gridOverride(allNames.length),
    series: [
      ...topUsers.map((info, i) => ({
        name: info.display,
        type: 'bar' as const,
        stack: 'usage',
        emphasis: { focus: 'series' as const },
        itemStyle: { color: PALETTE[i % PALETTE.length] },
        data: info.data,
      })),
      ...(otherData
        ? [
            {
              name: translate('Others ({count})', {
                count: hiddenUsers.length,
              }),
              type: 'bar' as const,
              stack: 'usage',
              emphasis: { focus: 'series' as const },
              itemStyle: { color: '#bbb' },
              data: otherData,
            },
          ]
        : []),
    ] as EChartsOption['series'],
  };
}

export function buildPieOptions(
  report: ProjectUsageReport,
  component: UsageComponent = 'total',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const users = report.localUsers();

  const rawData = users
    .map((user, i) => {
      const hours =
        component === 'total'
          ? secondsToHours(report.usageForUser(user).seconds)
          : secondsToHours(
              report.componentUsageForUser(component, user).seconds,
            );
      return {
        name: resolveUserName(user, report, fullNames, nameMaps),
        value: hours,
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d) => d.value > 0);

  const data = topNPieData(rawData);
  const label =
    component === 'total'
      ? translate('Total usage')
      : translate('{component} usage', { component });

  return {
    tooltip: {
      trigger: 'item',
      formatter: translate('{name}: {value} h ({percent}%)', {
        name: '{b}',
        value: '{c}',
        percent: '{d}',
      }),
    },
    legend: pieLegend(data.length),
    series: [
      {
        name: label,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{d}%' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}

// ─── Usage by project ─────────────────────────────────────────────────────────

export function buildProjectTimeseriesOptions(
  reports: ProjectUsageReport[],
  component: UsageComponent = 'total',
  groupBy: GroupBy = 'day',
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);
  const allDates = [...new Set(projectReports.flatMap((r) => r.dates))].sort();
  const labels = computeLabels(allDates, groupBy);

  const getTotalHoursForDate = (
    r: ProjectUsageReport,
    date: string,
  ): number => {
    const daily = r.getReport(date);
    if (!daily) return 0;
    if (component === 'total')
      return secondsToHours(daily.totalUsage().seconds);
    return r
      .localUsers()
      .reduce(
        (s, user) =>
          s +
          secondsToHours(daily.componentUsageForUser(component, user).seconds),
        0,
      );
  };

  const yLabel =
    component === 'total'
      ? translate('Usage (hours)')
      : translate('{component} (hours)', {
          component: component.charAt(0).toUpperCase() + component.slice(1),
        });

  const seriesData = projectReports.map((r) =>
    labels.map((label) =>
      sumOverLabel(allDates, label, groupBy, (d) => getTotalHoursForDate(r, d)),
    ),
  );
  const zoom = computeDataZoomRange(labels, seriesData);
  const base = baseTimeseriesConfig(labels, groupBy, yLabel, '{value} h', zoom);
  const projNames = projectReports.map((r) =>
    resolveProjectName(r.project, nameMaps),
  );

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const { rows, total } = buildTooltipRows(params, (v) =>
          translate('{value} h', { value: v.toFixed(2) }),
        );
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>${translate('Total')}: <b>${total.toFixed(2)} h</b>`;
      },
    },
    legend: timeseriesLegend(projNames),
    ...base,
    ...gridOverride(projNames.length),
    series: projectReports.map((_r, i) => ({
      name: projNames[i],
      type: 'bar' as const,
      stack: 'usage',
      emphasis: { focus: 'series' as const },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: seriesData[i],
    })) as EChartsOption['series'],
  };
}

export function buildProjectPieOptions(
  reports: ProjectUsageReport[],
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);

  const rawData = projectReports
    .map((r, i) => ({
      name: resolveProjectName(r.project, nameMaps),
      value: r.totalUsageHours(),
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }))
    .filter((d) => d.value > 0);

  const data = topNPieData(rawData);

  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: translate('{name}: {value} h ({percent}%)', {
        name: '{b}',
        value: '{c}',
        percent: '{d}',
      }),
    },
    legend: pieLegend(data.length),
    series: [
      {
        name: translate('Usage by project'),
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{d}%' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export function buildJobsTimeseriesOptions(
  report: ProjectUsageReport,
  groupBy: GroupBy = 'day',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const dates = report.dates;
  const labels = computeLabels(dates, groupBy);
  const users = report.localUsers();
  const displayNames = users.map((u) =>
    resolveUserName(u, report, fullNames, nameMaps),
  );

  const seriesData = users.map((user) =>
    labels.map((label) =>
      sumOverLabel(
        dates,
        label,
        groupBy,
        (d) => report.getReport(d)?.userJobCounts[user] ?? 0,
      ),
    ),
  );

  // Rank users by total jobs, keep top N
  const userTotals = seriesData.map((data) => data.reduce((s, v) => s + v, 0));
  const ranked = users
    .map((user, i) => ({
      user,
      display: displayNames[i],
      total: userTotals[i],
      data: seriesData[i],
    }))
    .sort((a, b) => b.total - a.total);
  const topUsers = ranked.slice(0, TOP_N_USERS);
  const hiddenUsers = ranked.slice(TOP_N_USERS).filter((u) => u.total > 0);
  const otherData =
    hiddenUsers.length > 0
      ? labels.map((_, li) =>
          hiddenUsers.reduce((s, u) => s + (u.data[li] ?? 0), 0),
        )
      : null;
  const allNames = [
    ...topUsers.map((u) => u.display),
    ...(otherData
      ? [translate('Others ({count})', { count: hiddenUsers.length })]
      : []),
  ];

  const zoom = computeDataZoomRange(
    labels,
    topUsers.map((u) => u.data),
  );
  const base = baseTimeseriesConfig(
    labels,
    groupBy,
    translate('Jobs'),
    '{value}',
    zoom,
  );

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const { rows, total } = buildTooltipRows(params, (v) =>
          String(Math.round(v)),
        );
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>${translate('Total')}: <b>${Math.round(total)}</b>`;
      },
    },
    legend: timeseriesLegend(allNames),
    ...base,
    ...gridOverride(allNames.length),
    series: [
      ...topUsers.map((info, i) => ({
        name: info.display,
        type: 'bar' as const,
        stack: 'jobs',
        emphasis: { focus: 'series' as const },
        itemStyle: { color: PALETTE[i % PALETTE.length] },
        data: info.data,
      })),
      ...(otherData
        ? [
            {
              name: translate('Others ({count})', {
                count: hiddenUsers.length,
              }),
              type: 'bar' as const,
              stack: 'jobs',
              emphasis: { focus: 'series' as const },
              itemStyle: { color: '#bbb' },
              data: otherData,
            },
          ]
        : []),
    ] as EChartsOption['series'],
  };
}

export function buildJobsPieOptions(
  report: ProjectUsageReport,
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const users = report.localUsers();

  const rawData = users
    .map((user, i) => {
      const total = report
        .dailyReports()
        .reduce((s, d) => s + (d.userJobCounts[user] ?? 0), 0);
      return {
        name: resolveUserName(user, report, fullNames, nameMaps),
        value: total,
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d) => d.value > 0);

  const data = topNPieData(rawData);

  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: translate('{name}: {value} jobs ({percent}%)', {
        name: '{b}',
        value: '{c}',
        percent: '{d}',
      }),
    },
    legend: pieLegend(data.length),
    series: [
      {
        name: translate('Jobs'),
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{d}%' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}

// ─── Jobs by project ──────────────────────────────────────────────────────────

export function buildProjectJobsTimeseriesOptions(
  reports: ProjectUsageReport[],
  groupBy: GroupBy = 'day',
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);
  const allDates = [...new Set(projectReports.flatMap((r) => r.dates))].sort();
  const labels = computeLabels(allDates, groupBy);
  const projNames = projectReports.map((r) =>
    resolveProjectName(r.project, nameMaps),
  );

  const seriesData = projectReports.map((r) =>
    labels.map((label) =>
      sumOverLabel(
        allDates,
        label,
        groupBy,
        (d) => r.getReport(d)?.numJobs ?? 0,
      ),
    ),
  );
  const zoom = computeDataZoomRange(labels, seriesData);
  const base = baseTimeseriesConfig(
    labels,
    groupBy,
    translate('Jobs'),
    '{value}',
    zoom,
  );

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const { rows, total } = buildTooltipRows(params, (v) =>
          String(Math.round(v)),
        );
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>${translate('Total')}: <b>${Math.round(total)}</b>`;
      },
    },
    legend: timeseriesLegend(projNames),
    ...base,
    ...gridOverride(projNames.length),
    series: projectReports.map((_r, i) => ({
      name: projNames[i],
      type: 'bar' as const,
      stack: 'jobs',
      emphasis: { focus: 'series' as const },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: seriesData[i],
    })) as EChartsOption['series'],
  };
}

export function buildProjectJobsPieOptions(
  reports: ProjectUsageReport[],
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);

  const rawData = projectReports
    .map((r, i) => ({
      name: resolveProjectName(r.project, nameMaps),
      value: r.dailyReports().reduce((s, d) => s + d.numJobs, 0),
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }))
    .filter((d) => d.value > 0);

  const data = topNPieData(rawData);

  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: translate('{name}: {value} jobs ({percent}%)', {
        name: '{b}',
        value: '{c}',
        percent: '{d}',
      }),
    },
    legend: pieLegend(data.length),
    series: [
      {
        name: translate('Jobs by project'),
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{d}%' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}

// ─── Average wait ─────────────────────────────────────────────────────────────

export function buildAvgWaitTimeseriesOptions(
  report: ProjectUsageReport,
  groupBy: GroupBy = 'day',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const dates = report.dates;
  const labels = computeLabels(dates, groupBy);
  const allUsers = report.localUsers();

  // Rank users by total jobs, keep top N
  const allUserTotals = allUsers.map((user) =>
    report.dailyReports().reduce((s, d) => s + (d.userJobCounts[user] ?? 0), 0),
  );
  const rankedUsers = allUsers
    .map((user, i) => ({ user, total: allUserTotals[i] }))
    .sort((a, b) => b.total - a.total);
  const users = rankedUsers.slice(0, TOP_N_USERS).map((u) => u.user);
  const displayNames = users.map((u) =>
    resolveUserName(u, report, fullNames, nameMaps),
  );

  const userSeriesData = users.map((user) =>
    labels.map((label) =>
      avgWaitOverLabel(
        dates,
        label,
        groupBy,
        (d) => report.getReport(d)?.userWaitSeconds[user] ?? 0,
        (d) => report.getReport(d)?.userJobCounts[user] ?? 0,
      ),
    ),
  );
  const totalSeriesData = labels.map((label) =>
    avgWaitOverLabel(
      dates,
      label,
      groupBy,
      (d) => report.getReport(d)?.totalWaitSeconds ?? 0,
      (d) => report.getReport(d)?.numJobs ?? 0,
    ),
  );

  const zoom = computeDataZoomRange(
    labels,
    [...userSeriesData, totalSeriesData].map((d) => d.map((v) => v ?? 0)),
  );
  const base = baseTimeseriesConfig(
    labels,
    groupBy,
    translate('Avg wait (min)'),
    translate('{value} min', { value: '{value}' }),
    zoom,
  );

  const userSeries = users.map((_user, i) => ({
    name: displayNames[i],
    type: 'line' as const,
    connectNulls: false,
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: userSeriesData[i],
  }));

  const totalSeries = {
    name: translate('Total avg'),
    type: 'line' as const,
    lineStyle: { type: 'dashed' as const, width: 2 },
    itemStyle: { color: '#999' },
    connectNulls: false,
    data: totalSeriesData,
  };

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const active = (params as any[]).filter(
          (p) => p.value !== null && p.value !== undefined,
        );
        active.sort((a, b) => (b.value as number) - (a.value as number));
        const shown = active.slice(0, MAX_TOOLTIP_ITEMS);
        const rest = active.slice(MAX_TOOLTIP_ITEMS);
        const rowLines = [
          ...shown.map(
            (p: any) =>
              `${tooltipDot(p.color)}${p.seriesName}: <b>${translate('{value} min', { value: p.value })}</b>`,
          ),
          ...(rest.length > 0
            ? [
                `<i style="color:#888">${translate('…{count} others', { count: rest.length })}</i>`,
              ]
            : []),
        ];
        return `<b>${label}</b><br/>${rowLines.join('<br/>')}`;
      },
    },
    legend: timeseriesLegend([...displayNames, translate('Total avg')]),
    ...base,
    ...gridOverride(displayNames.length + 1),
    toolbox: {
      right: 10,
      feature: { saveAsImage: { title: translate('Save image') } },
    },
    series: [...userSeries, totalSeries],
  };
}

export function buildAvgWaitPieOptions(
  report: ProjectUsageReport,
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const users = report.localUsers();

  const rawData = users
    .map((user, i) => {
      // Exclude spurious days (same threshold as the timeseries chart)
      const cleanDays = report
        .dailyReports()
        .filter(
          (d) =>
            !isDayWaitSpurious(
              d.userWaitSeconds[user] ?? 0,
              d.userJobCounts[user] ?? 0,
            ),
        );
      const totalJobs = cleanDays.reduce(
        (s, d) => s + (d.userJobCounts[user] ?? 0),
        0,
      );
      const totalWait = cleanDays.reduce(
        (s, d) => s + (d.userWaitSeconds[user] ?? 0),
        0,
      );
      if (totalJobs === 0) return null;
      return {
        name: resolveUserName(user, report, fullNames, nameMaps),
        value: Math.round(totalWait / totalJobs / 60),
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null && d.value > 0);

  const data = topNPieData(rawData, {
    threshold: 0.1,
    othersLabelFn: (_, shown) =>
      translate('< {value} min (others)', {
        value: shown[shown.length - 1].value,
      }),
  });

  return {
    tooltip: {
      trigger: 'item',
      formatter: translate('{name}: {value} min avg ({percent}%)', {
        name: '{b}',
        value: '{c}',
        percent: '{d}',
      }),
    },
    legend: pieLegend(data.length),
    series: [
      {
        name: translate('Avg wait'),
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: {
          show: true,
          formatter: translate('{name}\n{value} min', {
            name: '{b}',
            value: '{c}',
          }),
        },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}

// ─── Avg wait by project ──────────────────────────────────────────────────────

export function buildProjectAvgWaitTimeseriesOptions(
  reports: ProjectUsageReport[],
  groupBy: GroupBy = 'day',
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);
  const allDates = [...new Set(projectReports.flatMap((r) => r.dates))].sort();
  const labels = computeLabels(allDates, groupBy);
  const projNames = projectReports.map((r) =>
    resolveProjectName(r.project, nameMaps),
  );

  const seriesData = projectReports.map((r) =>
    labels.map((label) =>
      avgWaitOverLabel(
        allDates,
        label,
        groupBy,
        (d) => r.getReport(d)?.totalWaitSeconds ?? 0,
        (d) => r.getReport(d)?.numJobs ?? 0,
      ),
    ),
  );
  const zoom = computeDataZoomRange(
    labels,
    seriesData.map((d) => d.map((v) => v ?? 0)),
  );
  const base = baseTimeseriesConfig(
    labels,
    groupBy,
    translate('Avg wait (min)'),
    translate('{value} min', { value: '{value}' }),
    zoom,
  );

  const series = projectReports.map((_r, i) => ({
    name: projNames[i],
    type: 'line' as const,
    connectNulls: false,
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: seriesData[i],
  }));

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const active = (params as any[]).filter(
          (p) => p.value !== null && p.value !== undefined,
        );
        active.sort((a, b) => (b.value as number) - (a.value as number));
        const shown = active.slice(0, MAX_TOOLTIP_ITEMS);
        const rest = active.slice(MAX_TOOLTIP_ITEMS);
        const rowLines = [
          ...shown.map(
            (p: any) =>
              `${tooltipDot(p.color)}${p.seriesName}: <b>${p.value} min</b>`,
          ),
          ...(rest.length > 0
            ? [`<i style="color:#888">…${rest.length} others</i>`]
            : []),
        ];
        return `<b>${label}</b><br/>${rowLines.join('<br/>')}`;
      },
    },
    legend: timeseriesLegend(projNames),
    ...base,
    ...gridOverride(projNames.length),
    toolbox: {
      right: 10,
      feature: { saveAsImage: { title: translate('Save image') } },
    },
    series,
  };
}

export function buildProjectAvgWaitPieOptions(
  reports: ProjectUsageReport[],
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);

  const rawData = projectReports
    .map((r, i) => {
      // Exclude spurious days (same threshold as the timeseries chart)
      const cleanDays = r
        .dailyReports()
        .filter((d) => !isDayWaitSpurious(d.totalWaitSeconds, d.numJobs));
      const totalJobs = cleanDays.reduce((s, d) => s + d.numJobs, 0);
      const totalWait = cleanDays.reduce((s, d) => s + d.totalWaitSeconds, 0);
      if (totalJobs === 0) return null;
      return {
        name: resolveProjectName(r.project, nameMaps),
        value: Math.round(totalWait / totalJobs / 60),
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null && d.value > 0);

  const data = topNPieData(rawData, {
    threshold: 0.1,
    othersLabelFn: (_, shown) =>
      translate('< {value} min (others)', {
        value: shown[shown.length - 1].value,
      }),
  });

  return {
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: translate('{name}: {value} min avg ({percent}%)', {
        name: '{b}',
        value: '{c}',
        percent: '{d}',
      }),
    },
    legend: pieLegend(data.length),
    series: [
      {
        name: translate('Avg wait by project'),
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: {
          show: true,
          formatter: translate('{name}\n{value} min', {
            name: '{b}',
            value: '{c}',
          }),
        },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}
