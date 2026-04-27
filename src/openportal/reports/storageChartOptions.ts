/**
 * Pure functions that build EChartsOption objects from ProjectStorageReport data.
 *
 * Two chart modes:
 *   'bar'     — grouped horizontal bar chart: used vs limit per user per volume.
 *   'treemap' — hierarchical treemap: user → volume → usage bytes.
 *               Requires the treemap chart type to be registered in echarts/index.ts.
 */

import type { EChartsOption } from 'echarts';

import { translate } from '@/i18n';

import { ProjectStorageReport, Quota } from './ProjectStorageReport';
import {
  GroupBy,
  NameMaps,
  buildTooltipRows,
  computeDataZoomRange,
  gridOverride,
  timeseriesLegend,
  truncateLabel,
  truncateMiddle,
} from './usageChartOptions';

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
];

const TOP_N_USERS = 20;
const TOP_N_PROJECTS = 15;

/** Strip the project suffix from a local username: "chris.aiproject" → "chris" */
const shortName = (s: string) => s.split('.')[0];

/** Slightly transparent version of a palette colour for the limit bar */
const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

function getStorageUnit(maxBytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;
  const unitIndex =
    maxBytes > 0
      ? Math.min(
          Math.floor(Math.log(maxBytes) / Math.log(1024)),
          units.length - 1,
        )
      : 3;
  const unitDivisor = 1024 ** unitIndex;
  const unitLabel = units[unitIndex];
  const toUnit = (bytes: number) => +(bytes / unitDivisor).toFixed(3);
  return { unitLabel, toUnit };
}

/**
 * Horizontal bar chart showing storage usage vs quota limit.
 *
 * Y-axis layout — project-level quotas first, then per-user quotas:
 *   "Project · projects"   ← from report.projectQuotas (shared across all users)
 *   "chris.aiproject"      ← from report.userQuotas (per-user volumes like home/scratch)
 *   "david.aiproject"
 *   …
 *
 * Each volume is a solid "used" bar with a transparent "limit" ghost bar behind it.
 * Project volumes and user volumes are separate series so they never conflict.
 */
export function buildStorageBarOptions(
  report: ProjectStorageReport,
  volumeFilter: string | 'all' = 'all',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const projectQuotas = report.projectQuotas;
  const projectVolNames = Object.keys(projectQuotas).sort();

  const allUids = report.userIdentifiers();
  const allLocalNames = allUids.map((uid) => {
    if (nameMaps?.user?.[uid]) return truncateLabel(nameMaps.user[uid]);
    const raw = fullNames
      ? (report.users[uid] ?? uid)
      : shortName(report.users[uid] ?? uid);
    return truncateLabel(raw);
  });

  // Rank uids by total usage, keep top N
  const userTotals = allUids.map((uid) =>
    Object.values(report.quotaForUser(uid)).reduce(
      (s, q) => s + q.usageBytes,
      0,
    ),
  );
  const uidRanked = allUids
    .map((uid, i) => ({ uid, name: allLocalNames[i], total: userTotals[i] }))
    .sort((a, b) => b.total - a.total);
  const topUids = uidRanked.slice(0, TOP_N_USERS);
  const hiddenUids = uidRanked.slice(TOP_N_USERS).filter((u) => u.total > 0);

  const uids = topUids.map((u) => u.uid);
  const localNames = topUids.map((u) => u.name);

  // Derive user-level volume names from actual quota data
  const userVolSet = new Set<string>();
  for (const uid of allUids) {
    for (const v of Object.keys(report.quotaForUser(uid))) userVolSet.add(v);
  }
  const userVolNames = [...userVolSet].sort();

  const visibleProjectVols =
    volumeFilter === 'all'
      ? projectVolNames
      : projectVolNames.filter((v) => v === volumeFilter);
  const visibleUserVols =
    volumeFilter === 'all'
      ? userVolNames
      : userVolNames.filter((v) => v === volumeFilter);

  // Y-axis: project rows first, then top user rows, then optional "Others" row
  const projectRowLabels = visibleProjectVols.map((v) =>
    translate('Project · {volume}', { volume: v }),
  );
  const othersLabel =
    hiddenUids.length > 0
      ? translate('Others ({count})', { count: hiddenUids.length })
      : null;
  const yAxisData = [
    ...projectRowLabels,
    ...localNames,
    ...(othersLabel ? [othersLabel] : []),
  ];
  const totalRows = yAxisData.length;
  const projectRowCount = projectRowLabels.length;

  // Determine a readable unit from the largest limit seen anywhere
  let maxBytes = 0;
  for (const [, q] of Object.entries(projectQuotas)) {
    if (isFinite(q.limitBytes)) maxBytes = Math.max(maxBytes, q.limitBytes);
  }
  for (const uid of uids) {
    for (const [, q] of Object.entries(report.quotaForUser(uid))) {
      if (isFinite(q.limitBytes)) maxBytes = Math.max(maxBytes, q.limitBytes);
    }
  }
  const { unitLabel, toUnit } = getStorageUnit(maxBytes);

  // Sparse data array: value at specific index, 0 elsewhere
  const sparse = (index: number, value: number) =>
    Array.from({ length: totalRows }, (_, i) => (i === index ? value : 0));

  const series: EChartsOption['series'] = [];
  const legendItems: string[] = [];

  // ── Project-level volume series ──────────────────────────────────────────
  visibleProjectVols.forEach((vol, vi) => {
    const q: Quota | undefined = projectQuotas[vol];
    const color = PALETTE[vi % PALETTE.length];
    const rowIndex = vi; // project rows are at the top

    legendItems.push(vol);
    series.push(
      {
        name: vol,
        type: 'bar' as const,
        data: sparse(rowIndex, q ? toUnit(q.usageBytes) : 0),
        itemStyle: { color },
        emphasis: { focus: 'series' as const },
        z: 10,
      },
      {
        name: translate('{volume} (limit)', { volume: vol }),
        type: 'bar' as const,
        data: sparse(
          rowIndex,
          q && isFinite(q.limitBytes) ? toUnit(q.limitBytes) : 0,
        ),
        barGap: '-100%',
        itemStyle: { color: withAlpha(color, 0.15) },
        silent: true,
        z: 1,
      },
    );
  });

  // ── Per-user volume series ────────────────────────────────────────────────
  visibleUserVols.forEach((vol, vi) => {
    const color = PALETTE[(visibleProjectVols.length + vi) % PALETTE.length];

    // Data array: zeros for project rows, then one value per top user row, then optional Others row
    const othersUsed = hiddenUids.reduce((s, u) => {
      const q = report.quotaForUser(u.uid)[vol];
      return s + (q ? q.usageBytes : 0);
    }, 0);
    const usedData = [
      ...Array(projectRowCount).fill(0),
      ...uids.map((uid) => {
        const q = report.quotaForUser(uid)[vol];
        return q ? toUnit(q.usageBytes) : 0;
      }),
      ...(othersLabel ? [toUnit(othersUsed)] : []),
    ];
    const othersLimit = hiddenUids.reduce((s, u) => {
      const q = report.quotaForUser(u.uid)[vol];
      return s + (q && isFinite(q.limitBytes) ? q.limitBytes : 0);
    }, 0);
    const limitData = [
      ...Array(projectRowCount).fill(0),
      ...uids.map((uid) => {
        const q = report.quotaForUser(uid)[vol];
        return q && isFinite(q.limitBytes) ? toUnit(q.limitBytes) : 0;
      }),
      ...(othersLabel ? [toUnit(othersLimit)] : []),
    ];

    legendItems.push(vol);
    series.push(
      {
        name: vol,
        type: 'bar' as const,
        data: usedData,
        itemStyle: { color },
        emphasis: { focus: 'series' as const },
        z: 10,
      },
      {
        name: translate('{volume} (limit)', { volume: vol }),
        type: 'bar' as const,
        data: limitData,
        barGap: '-100%',
        itemStyle: { color: withAlpha(color, 0.15) },
        silent: true,
        z: 1,
      },
    );
  });

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const rowLabel: string = params[0].axisValueLabel ?? params[0].name;
        const projectPrefix = translate('Project · {volume}', { volume: '' });
        const isProjectRow = rowLabel.startsWith(projectPrefix);

        if (isProjectRow) {
          const vol = rowLabel.replace(projectPrefix, '');
          const q = projectQuotas[vol];
          if (!q) return rowLabel;
          const pct = (q.usedFraction * 100).toFixed(1);
          return `<b>${rowLabel}</b><br/>${translate(
            '{usage} / {limit} ({percent}%)',
            {
              usage: q.usageFormatted,
              limit: q.limitFormatted,
              percent: pct,
            },
          )}`;
        }

        const uid = uids[localNames.indexOf(rowLabel)] ?? rowLabel;
        const lines: string[] = [`<b>${rowLabel}</b> <small>(${uid})</small>`];
        for (const vol of visibleUserVols) {
          const q = report.quotaForUser(uid)?.[vol];
          if (q) {
            const pct = (q.usedFraction * 100).toFixed(1);
            lines.push(
              translate('{volume}: {usage} / {limit} ({percent}%)', {
                volume: vol,
                usage: q.usageFormatted,
                limit: q.limitFormatted,
                percent: pct,
              }),
            );
          }
        }
        return lines.join('<br/>');
      },
    },
    legend:
      legendItems.length > 15
        ? { show: false }
        : { data: legendItems, bottom: 0 },
    toolbox: {
      right: 10,
      feature: { saveAsImage: { title: translate('Save image') } },
    },
    grid: {
      left: '18%',
      right: '5%',
      bottom: legendItems.length > 15 ? 10 : 40,
    },
    xAxis: {
      type: 'value',
      name: unitLabel,
      axisLabel: {
        formatter: (value: number) =>
          translate('{value} {unit}', { value, unit: unitLabel }),
      },
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLabel: {
        // Visually distinguish project rows with a different style
        formatter: (v: string) => v,
        rich: {
          project: { fontWeight: 'bold', color: '#555' },
        },
      },
    },
    series,
  };
}

/**
 * Timeseries stacked-bar chart: daily storage usage over time.
 *
 * Shows project-level volumes first ("Project · vol"), then per-user totals
 * (sum across all of that user's volumes). Uses daily_reports snapshots.
 */
export function buildStorageTimeseriesOptions(
  report: ProjectStorageReport,
  groupBy: GroupBy = 'day',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const allDates = report.dates;

  // For 'month' mode: use the last snapshot date within each month as the representative value
  const dates: string[] =
    groupBy === 'month'
      ? [...new Set(allDates.map((d) => d.slice(0, 7)))].sort().map((month) => {
          const monthDates = allDates.filter((d) => d.startsWith(month));
          return monthDates[monthDates.length - 1]; // last reading of each month
        })
      : allDates;

  // Labels shown on x-axis
  const labels = groupBy === 'month' ? dates.map((d) => d.slice(0, 7)) : dates;
  const allUids = report.userIdentifiers();
  const allLocalNames = allUids.map((uid) => {
    if (nameMaps?.user?.[uid]) return truncateLabel(nameMaps.user[uid]);
    const raw = fullNames
      ? (report.users[uid] ?? uid)
      : shortName(report.users[uid] ?? uid);
    return truncateLabel(raw);
  });

  // Rank uids by total bytes across all dates
  const userTotals = allUids.map((uid) =>
    dates.reduce((s, date) => {
      const daily = report.getReport(date);
      return (
        s +
        Object.values(daily?.userQuotas[uid] ?? {}).reduce(
          (ss, q) => ss + q.usageBytes,
          0,
        )
      );
    }, 0),
  );
  const ranked = allUids
    .map((uid, i) => ({ uid, name: allLocalNames[i], total: userTotals[i] }))
    .sort((a, b) => b.total - a.total);
  const topN = ranked.slice(0, TOP_N_USERS);
  const hidden = ranked.slice(TOP_N_USERS).filter((u) => u.total > 0);

  const uids = topN.map((u) => u.uid);
  const localNames = topN.map((u) => u.name);

  // Project volumes present across any daily snapshot
  const projectVolSet = new Set<string>();
  for (const date of dates) {
    const daily = report.getReport(date);
    if (!daily) continue;
    for (const v of Object.keys(daily.projectQuotas)) projectVolSet.add(v);
  }
  const projectVols = [...projectVolSet].sort();

  // Determine unit from largest value seen (project or user)
  let maxBytes = 0;
  for (const date of dates) {
    const daily = report.getReport(date);
    if (!daily) continue;
    for (const q of Object.values(daily.projectQuotas)) {
      maxBytes = Math.max(maxBytes, q.usageBytes);
    }
    for (const uid of allUids) {
      const total = Object.values(daily.userQuotas[uid] ?? {}).reduce(
        (s, q) => s + q.usageBytes,
        0,
      );
      maxBytes = Math.max(maxBytes, total);
    }
  }
  const { unitLabel, toUnit } = getStorageUnit(maxBytes);

  // Project-volume series (one per volume, not stacked with users)
  const projectSeries = projectVols.map((vol, vi) => ({
    name: translate('Project · {volume}', { volume: vol }),
    type: 'line' as const,
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[vi % PALETTE.length] },
    data: dates.map((date) => {
      const daily = report.getReport(date);
      return daily ? toUnit(daily.projectQuotas[vol]?.usageBytes ?? 0) : 0;
    }),
  }));

  // Per-user series for top N (stacked together)
  const userSeries = uids.map((uid, i) => ({
    name: localNames[i],
    type: 'bar' as const,
    stack: 'users',
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[(projectVols.length + i) % PALETTE.length] },
    data: dates.map((date) => {
      const daily = report.getReport(date);
      if (!daily) return 0;
      const total = Object.values(daily.userQuotas[uid] ?? {}).reduce(
        (s, q) => s + q.usageBytes,
        0,
      );
      return toUnit(total);
    }),
  }));

  // "Others" series summing hidden users
  const othersSeries =
    hidden.length > 0
      ? [
          {
            name: translate('Others ({count})', { count: hidden.length }),
            type: 'bar' as const,
            stack: 'users',
            emphasis: { focus: 'series' as const },
            itemStyle: { color: '#bbb' },
            data: dates.map((date) => {
              const daily = report.getReport(date);
              if (!daily) return 0;
              return toUnit(
                hidden.reduce(
                  (s, u) =>
                    s +
                    Object.values(daily.userQuotas[u.uid] ?? {}).reduce(
                      (ss, q) => ss + q.usageBytes,
                      0,
                    ),
                  0,
                ),
              );
            }),
          },
        ]
      : [];

  const allNames = [
    ...projectVols.map((v) => translate('Project · {volume}', { volume: v })),
    ...localNames,
    ...(hidden.length > 0
      ? [translate('Others ({count})', { count: hidden.length })]
      : []),
  ];

  const allSeriesData = [
    ...projectSeries.map((s) => s.data as number[]),
    ...userSeries.map((s) => s.data as number[]),
  ];
  const zoom = computeDataZoomRange(labels, allSeriesData);

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const date = params[0].axisValueLabel ?? params[0].name;
        const { rows } = buildTooltipRows(params, (v) =>
          translate('{value} {unit}', { value: v.toFixed(2), unit: unitLabel }),
        );
        return `<b>${date}</b><br/>${rows}`;
      },
    },
    legend: timeseriesLegend(allNames),
    toolbox: {
      right: 10,
      feature: {
        saveAsImage: { title: translate('Save image') },
      },
    },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        bottom: 10,
        height: 40,
        start: zoom.start,
        end: zoom.end,
      },
    ],
    grid: { bottom: 130 },
    ...gridOverride(allNames.length, 70),
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        rotate: 30,
        formatter: groupBy === 'month' ? undefined : (v: string) => v.slice(5),
      },
    },
    yAxis: {
      type: 'value',
      name: unitLabel,
      axisLabel: {
        formatter: (value: number) =>
          translate('{value} {unit}', { value, unit: unitLabel }),
      },
    },
    series: [...projectSeries, ...userSeries, ...othersSeries],
  };
}

// ── Per-project builders ──────────────────────────────────────────────────────

/** Group storage reports by project, combining months within each project. */
function groupStorageByProject(
  reports: ProjectStorageReport[],
): ProjectStorageReport[] {
  const map = new Map<string, ProjectStorageReport[]>();
  for (const r of reports) {
    const existing = map.get(r.project) ?? [];
    map.set(r.project, [...existing, r]);
  }
  return [...map.values()].map((group) =>
    group.length === 1 ? group[0] : ProjectStorageReport.combine(group),
  );
}

/**
 * Horizontal bar chart: total user storage per project.
 */
export function buildStorageProjectBarOptions(
  reports: ProjectStorageReport[],
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupStorageByProject(reports);
  const resolveProject = (projId: string) =>
    truncateMiddle(nameMaps?.project?.[projId] ?? projId);

  // Rank by total bytes, keep top N
  const withTotals = projectReports
    .map((r) => {
      const uids = r.userIdentifiers();
      const userBytes = uids.reduce(
        (s, uid) =>
          s +
          Object.values(r.quotaForUser(uid)).reduce(
            (ss, q) => ss + q.usageBytes,
            0,
          ),
        0,
      );
      const projectBytes = Object.values(r.projectQuotas).reduce(
        (s, q) => s + q.usageBytes,
        0,
      );
      return { r, bytes: userBytes + projectBytes };
    })
    .sort((a, b) => b.bytes - a.bytes);

  const topN = withTotals.slice(0, TOP_N_PROJECTS);
  const hidden = withTotals.slice(TOP_N_PROJECTS).filter((p) => p.bytes > 0);
  const othersBytes = hidden.reduce((s, p) => s + p.bytes, 0);

  const yAxisData = [
    ...topN.map((p) => resolveProject(p.r.project)),
    ...(hidden.length > 0
      ? [translate('Others ({count})', { count: hidden.length })]
      : []),
  ];
  const barValues = [
    ...topN.map((p, i) => ({ value: p.bytes, idx: i })),
    ...(hidden.length > 0 ? [{ value: othersBytes, idx: topN.length }] : []),
  ];

  const maxBytes = Math.max(...barValues.map((b) => b.value), 0);
  const { unitLabel, toUnit } = getStorageUnit(maxBytes);

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        return `<b>${label}</b><br/>${translate('{value} {unit}', {
          value: (params[0].value as number).toFixed(2),
          unit: unitLabel,
        })}`;
      },
    },
    toolbox: {
      right: 10,
      feature: { saveAsImage: { title: translate('Save image') } },
    },
    grid: { left: '20%', right: '5%', bottom: 40 },
    xAxis: {
      type: 'value',
      name: unitLabel,
      axisLabel: {
        formatter: (value: number) =>
          translate('{value} {unit}', { value, unit: unitLabel }),
      },
    },
    yAxis: { type: 'category', data: yAxisData },
    series: [
      {
        name: translate('Storage'),
        type: 'bar',
        data: barValues.map(({ value, idx }) => ({
          value: toUnit(value),
          itemStyle: {
            color: idx < topN.length ? PALETTE[idx % PALETTE.length] : '#bbb',
          },
        })),
        emphasis: { focus: 'series' as const },
      },
    ],
  };
}

/**
 * Timeseries chart: total storage per project over time.
 */
export function buildStorageProjectTimeseriesOptions(
  reports: ProjectStorageReport[],
  groupBy: GroupBy = 'day',
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupStorageByProject(reports);
  const resolveProject = (projId: string) =>
    truncateMiddle(nameMaps?.project?.[projId] ?? projId);
  const allDates = [...new Set(projectReports.flatMap((r) => r.dates))].sort();

  const dates: string[] =
    groupBy === 'month'
      ? [...new Set(allDates.map((d) => d.slice(0, 7)))].sort().map((month) => {
          const monthDates = allDates.filter((d) => d.startsWith(month));
          return monthDates[monthDates.length - 1];
        })
      : allDates;

  const labels = groupBy === 'month' ? dates.map((d) => d.slice(0, 7)) : dates;

  // Determine unit
  let maxBytes = 0;
  for (const r of projectReports) {
    for (const date of dates) {
      const daily = r.getReport(date);
      if (!daily) continue;
      const total =
        Object.values(daily.userQuotas).reduce(
          (s, vols) =>
            s + Object.values(vols).reduce((ss, q) => ss + q.usageBytes, 0),
          0,
        ) +
        Object.values(daily.projectQuotas).reduce(
          (s, q) => s + q.usageBytes,
          0,
        );
      if (total > maxBytes) maxBytes = total;
    }
  }

  const { unitLabel, toUnit } = getStorageUnit(maxBytes);

  // Rank projects by total bytes, keep top N
  const getProjectTotal = (r: ProjectStorageReport) =>
    dates.reduce((s, date) => {
      const daily = r.getReport(date);
      if (!daily) return s;
      return (
        s +
        Object.values(daily.userQuotas).reduce(
          (ss, vols) =>
            ss + Object.values(vols).reduce((sss, q) => sss + q.usageBytes, 0),
          0,
        ) +
        Object.values(daily.projectQuotas).reduce(
          (ss, q) => ss + q.usageBytes,
          0,
        )
      );
    }, 0);

  const ranked = projectReports
    .map((r) => ({ r, total: getProjectTotal(r) }))
    .sort((a, b) => b.total - a.total);
  const topN = ranked.slice(0, TOP_N_PROJECTS);
  const hidden = ranked.slice(TOP_N_PROJECTS).filter((p) => p.total > 0);

  const getDateTotal = (r: ProjectStorageReport, date: string) => {
    const daily = r.getReport(date);
    if (!daily) return 0;
    const userBytes = Object.values(daily.userQuotas).reduce(
      (s, vols) =>
        s + Object.values(vols).reduce((ss, q) => ss + q.usageBytes, 0),
      0,
    );
    const projectBytes = Object.values(daily.projectQuotas).reduce(
      (s, q) => s + q.usageBytes,
      0,
    );
    return toUnit(userBytes + projectBytes);
  };

  const topSeries = topN.map(({ r }, i) => ({
    name: resolveProject(r.project),
    type: 'bar' as const,
    stack: 'projects',
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: dates.map((date) => getDateTotal(r, date)),
  }));

  const othersSeries =
    hidden.length > 0
      ? [
          {
            name: translate('Others ({count})', { count: hidden.length }),
            type: 'bar' as const,
            stack: 'projects',
            emphasis: { focus: 'series' as const },
            itemStyle: { color: '#bbb' },
            data: dates.map((date) =>
              hidden.reduce((s, { r }) => s + getDateTotal(r, date), 0),
            ),
          },
        ]
      : [];

  const allSeries = [...topSeries, ...othersSeries];
  const allNames = [
    ...topN.map(({ r }) => resolveProject(r.project)),
    ...(hidden.length > 0
      ? [translate('Others ({count})', { count: hidden.length })]
      : []),
  ];
  const zoom = computeDataZoomRange(
    labels,
    allSeries.map((s) => s.data as number[]),
  );

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const date = params[0].axisValueLabel ?? params[0].name;
        const { rows } = buildTooltipRows(params, (v) =>
          translate('{value} {unit}', { value: v.toFixed(2), unit: unitLabel }),
        );
        return `<b>${date}</b><br/>${rows}`;
      },
    },
    legend: timeseriesLegend(allNames),
    toolbox: {
      right: 10,
      feature: { saveAsImage: { title: translate('Save image') } },
    },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        bottom: 10,
        height: 40,
        start: zoom.start,
        end: zoom.end,
      },
    ],
    grid: { bottom: 120 },
    ...gridOverride(allNames.length, 70),
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        rotate: 30,
        formatter: groupBy === 'month' ? undefined : (v: string) => v.slice(5),
      },
    },
    yAxis: {
      type: 'value',
      name: unitLabel,
      axisLabel: { formatter: `{value} ${unitLabel}` },
    },
    series: allSeries,
  };
}
