import { useQueries } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  Project,
  marketplaceCustomerUsageComponentsUsageByProjectRetrieve,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { EChart } from '@/core/EChart';
import {
  getChartThemeColors,
  getSaturationRamp,
} from '@/dashboard/chartColors';
import { translate } from '@/i18n';
import { getUserLocale } from '@/i18n/LanguageUtilsService';
import { Customer } from '@/workspace/types';

import { LimitPeriodChip } from '../LimitPeriodChip';
import { MixBanner } from '../MixBanner';
import { ComponentRow, detectMix } from '../mixDetection';

interface Props {
  project?: Project;
  customer?: Customer;
  components: ComponentRow[];
}

interface RowData {
  label: string;
  offeringUuid: string;
  offeringName: string;
  componentName: string;
  componentType: string;
  billingType: string;
  limitPeriod: string | null;
  periodLabel: string | null;
  start: number;
  end: number;
  used: number;
  limit: number;
  fillRatio: number;
  measuredUnit: string;
}

const SATURATION_COLOR = (ratio: number): string => {
  const ramp = getSaturationRamp();
  if (ratio >= 1.0) return ramp.danger; // over cap
  if (ratio >= 0.9) return ramp.warning; // almost at cap
  if (ratio >= 0.7) return ramp.notice; // warning
  return ramp.ok; // healthy
};

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString(getUserLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// Inspired by the Figma "Limit Cuts Summary" design (node 21726-38689):
// each row is an (offering · component) pair, the horizontal bar spans the
// current period, the inner fill represents usage saturation, and a single
// "Today" line crosses every row at the server-supplied wall time. The right
// edge of every bar is implicitly the "next reset" event for that row.
export const LimitHorizonView: FC<Props> = ({
  project,
  customer,
  components,
}) => {
  const mix = useMemo(() => detectMix(components), [components]);
  const isProject = !!project;

  const rows = useMemo<RowData[]>(() => {
    if (!components?.length) return [];
    return components
      .filter(
        (r) =>
          r.billing_type === 'limit' &&
          r.limit != null &&
          r.limit > 0 &&
          (r as any).current_period_start &&
          (r as any).current_period_end,
      )
      .map((r) => {
        const start = new Date((r as any).current_period_start).getTime();
        const end = new Date((r as any).current_period_end).getTime();
        const used = r.limit_usage || 0;
        const fillRatio = r.limit ? used / r.limit : 0;
        return {
          label: `${r.offering_name} · ${r.name} · [${r.type}]`,
          offeringUuid: r.offering_uuid,
          offeringName: r.offering_name,
          componentName: r.name,
          componentType: r.type,
          billingType: r.billing_type,
          limitPeriod: (r as any).limit_period ?? null,
          periodLabel: (r as any).current_period_label ?? null,
          start,
          end,
          used,
          limit: r.limit ?? 0,
          fillRatio,
          measuredUnit: r.measured_unit,
        };
      })
      .sort((a, b) => a.offeringName.localeCompare(b.offeringName));
  }, [components]);

  // Fire one by-project query per row at customer scope so the tooltip can
  // surface a real per-project breakdown. Disabled at project scope (the
  // chart is already a single project's data, no further split exists).
  const byProjectQueries = useQueries({
    queries: rows.map((r) => ({
      queryKey: [
        'exp-horizon-byproject',
        customer?.uuid,
        r.offeringUuid,
        r.componentType,
      ],
      queryFn: () => {
        if (!customer?.uuid || isProject) return Promise.resolve(null);
        return marketplaceCustomerUsageComponentsUsageByProjectRetrieve({
          path: { uuid: customer.uuid },
          query: {
            offering_uuid: r.offeringUuid,
            component_type: r.componentType,
            period_offset: 0,
          },
        } as any).then((res: any) => res.data);
      },
      enabled: !isProject && !!customer?.uuid,
      staleTime: SHORT_STALE_TIME,
    })),
  });

  // Map row index → list of {project_name, usage} for the tooltip.
  const projectBreakdownByIndex = useMemo(() => {
    const m: Record<number, { name: string; usage: number }[]> = {};
    byProjectQueries.forEach((q, i) => {
      const projects = (q.data as any)?.projects;
      if (Array.isArray(projects)) {
        m[i] = projects
          .map((p: any) => ({
            name: p.project_name,
            usage: Number(p.usage || p.total_usage || 0),
          }))
          .sort((a: any, b: any) => b.usage - a.usage);
      }
    });
    return m;
  }, [byProjectQueries]);

  const todayMs = Date.now();
  const tc = getChartThemeColors();
  const banner = (
    <MixBanner
      mix={mix}
      groupedBy={translate(
        'one row per (offering · component) — bar spans current_period_start → current_period_end',
      )}
      normalization={translate(
        'inner-fill width = usage / limit; colour: <70% green, <90% amber, <100% orange, ≥100% red',
      )}
      scenarioNote={
        !rows.length
          ? translate(
              'Nothing to plot — no limit-based components with caps and explicit period bounds.',
            )
          : translate(
              'A single "Today" line crosses every row, and the right edge of each bar is implicitly the next reset for that row (visible because periods can differ across rows).',
            )
      }
      trace={[
        {
          label: translate('Bar bounds'),
          value:
            'ComponentStatsPerOffering.current_period_start / .current_period_end (server-resolved by _resolve_period_bounds in waldur-mastermind/src/waldur_mastermind/marketplace/utils.py:1261).',
        },
        {
          label: translate('Inner fill'),
          value:
            '100 × ComponentStatsPerOffering.limit_usage / .limit. Capped visually at 100% bar width; values above 100% colour the fill red as overage.',
        },
        {
          label: translate('Today line'),
          value:
            'Client wall time at render. The figma reference uses a server-supplied today, but ComponentStatsPerOffering does not expose it; we fall back to Date.now().',
        },
        {
          label: translate('Filtering'),
          value:
            'Skips usage-only components (no cap to render) and limit components missing limit/period bounds. Skipped count surfaced under the chart.',
        },
        {
          label: translate('Inspiration'),
          value:
            'Figma frame "Limit Cuts Summary" (node 21726-38689). Applied/Scheduled cut markers from the figma require server-side cut history that the API does not yet expose — they are reserved for a future iteration.',
        },
        {
          label: translate('Frontend code'),
          value:
            'src/marketplace/aggregate-limits/experimental/views/LimitHorizonView.tsx',
        },
      ]}
    />
  );

  if (!rows.length) {
    return (
      <>
        {banner}
        <div className="alert alert-info">
          {translate(
            'No limit-based components with caps and period bounds for this scope. Try the Treemap or Timeline.',
          )}
        </div>
      </>
    );
  }

  const minStart = Math.min(...rows.map((r) => r.start), todayMs);
  const maxEnd = Math.max(...rows.map((r) => r.end), todayMs);

  const yLabels = rows.map((r) => r.label);

  const renderItem = (_params: any, api: any) => {
    // Data tuple: [yIdx, startMs, endMs, ratio] — y dim must be index 0 when
    // combining a category y-axis with a time x-axis, otherwise ECharts
    // dereferences ordinalMeta on the wrong dimension and throws.
    const yIdx = api.value(0);
    const startMs = api.value(1);
    const endMs = api.value(2);
    const ratio = api.value(3);
    const fillRatio = Math.min(ratio, 1);
    const overflowRatio = Math.max(0, ratio - 1);

    const start = api.coord([startMs, yIdx]);
    const end = api.coord([endMs, yIdx]);
    const yCenter = start[1];
    const x = Math.min(start[0], end[0]);
    const w = Math.max(2, Math.abs(end[0] - start[0]));
    const usedW = w * fillRatio;
    const overflowW = w * overflowRatio;
    const height = 22;

    const fillColor = SATURATION_COLOR(ratio);

    const children: any[] = [
      // Track (light grey) — "remaining capacity"
      {
        type: 'rect',
        shape: { x, y: yCenter - height / 2, width: w, height, r: 3 },
        style: { fill: '#f3f4f6', stroke: '#d0d5dd', lineWidth: 1 },
      },
      // Used portion
      {
        type: 'rect',
        shape: {
          x,
          y: yCenter - height / 2,
          width: usedW,
          height,
          r: 3,
        },
        style: { fill: fillColor },
      },
    ];

    if (overflowW > 0) {
      // Overage hatch beyond the cap (visualised as a darker red bar past
      // the right edge to make over-cap rows unmistakable).
      children.push({
        type: 'rect',
        shape: {
          x: x + w,
          y: yCenter - height / 2,
          width: Math.min(overflowW, w * 0.5),
          height,
          r: 3,
        },
        style: { fill: '#d92d20', opacity: 0.7 },
      });
    }

    // "Next reset" marker at the right edge of each bar.
    children.push({
      type: 'circle',
      shape: { cx: x + w, cy: yCenter, r: 4 },
      style: { fill: '#6938ef' },
    });

    return { type: 'group', children };
  };

  const options = {
    tooltip: {
      trigger: 'item',
      enterable: true,
      formatter: (info: any) => {
        const idx = info.dataIndex;
        const r = rows[idx];
        if (!r) return '';
        const pct = Math.round(r.fillRatio * 100);
        const period = r.periodLabel
          ? `<small>${r.periodLabel}</small><br/>`
          : '';
        const headerLines = [
          `<strong>${r.offeringName} · ${r.componentName}</strong>`,
          `<small style="color:#667085">${translate('Type')}: <code>${r.componentType}</code> · ${
            r.billingType === 'limit'
              ? translate('Limit-based')
              : translate('Usage-based')
          }</small>`,
          period,
          `${translate('Period')}: ${formatDate(r.start)} → <strong>${formatDate(r.end)}</strong>`,
          `${translate('Used')}: <strong>${r.used.toLocaleString()}</strong> / ${r.limit.toLocaleString()} ${r.measuredUnit} (${pct}%)`,
          `<small style="color:#6938ef">↻ ${translate('Next reset')}: ${formatDate(r.end)}</small>`,
        ];

        // Per-project breakdown (customer scope only).
        const breakdown = projectBreakdownByIndex[idx];
        if (!isProject) {
          if (byProjectQueries[idx]?.isLoading) {
            headerLines.push(
              `<hr style="margin:6px 0;border-color:#e4e7ec"/><small>${translate('Loading per-project split…')}</small>`,
            );
          } else if (breakdown && breakdown.length) {
            const top = breakdown.slice(0, 5);
            const total = breakdown.reduce((s, p) => s + p.usage, 0) || 1;
            const rest = breakdown.length - top.length;
            const rows2 = top
              .map((p) => {
                const share = Math.round((p.usage / total) * 100);
                return `<div style="display:flex;justify-content:space-between;gap:8px"><span>${p.name}</span><span><strong>${p.usage.toLocaleString()}</strong> ${r.measuredUnit} <small>(${share}%)</small></span></div>`;
              })
              .join('');
            headerLines.push(
              `<hr style="margin:6px 0;border-color:#e4e7ec"/>` +
                `<small style="color:#667085">${translate('Per-project split')} (${breakdown.length} ${translate('projects')})</small>` +
                rows2 +
                (rest > 0
                  ? `<small style="color:#667085">+ ${rest} ${translate('more…')}</small>`
                  : ''),
            );
          } else if (breakdown && !breakdown.length) {
            headerLines.push(
              `<hr style="margin:6px 0;border-color:#e4e7ec"/><small style="color:#667085">${translate('No per-project usage reported.')}</small>`,
            );
          }
        }
        return headerLines.join('<br/>');
      },
    },
    grid: {
      left: 220,
      right: 30,
      top: 30,
      bottom: 40,
      containLabel: false,
    },
    xAxis: {
      type: 'time',
      min: minStart - 1000 * 60 * 60 * 24, // pad 1d on each side
      max: maxEnd + 1000 * 60 * 60 * 24,
      axisLabel: { hideOverlap: true, fontSize: 11 },
    },
    yAxis: {
      type: 'category',
      data: yLabels,
      axisLabel: {
        fontSize: 11,
        formatter: (val: string) => {
          // Label format from RowData.label: `${offering} · ${component} · [${type}]`
          const parts = val.split(' · ');
          if (parts.length < 3) return val;
          const [offering, component, typeBracket] = parts;
          return `{name|${offering}}\n{sub|${component}} {type|${typeBracket}}`;
        },
        rich: {
          name: {
            color: '#344054',
            fontWeight: 500,
            fontSize: 12,
            lineHeight: 16,
          },
          sub: {
            color: '#667085',
            fontSize: 11,
            lineHeight: 14,
          },
          type: {
            color: '#6938ef',
            backgroundColor: '#f4f3ff',
            padding: [1, 4, 1, 4],
            borderRadius: 3,
            fontSize: 10,
            lineHeight: 14,
          },
        },
      },
      inverse: true,
    },
    series: [
      {
        type: 'custom',
        renderItem,
        // y first, then the two x dimensions — see renderItem comment for why.
        encode: { x: [1, 2], y: 0 },
        dimensions: ['rowIndex', 'start', 'end', 'ratio'],
        data: rows.map((r, i) => [i, r.start, r.end, r.fillRatio]),
        markLine: {
          symbol: 'none',
          silent: true,
          data: [
            {
              xAxis: todayMs,
              lineStyle: { color: tc.brand500, width: 2 },
              label: {
                formatter: translate('Today'),
                color: tc.brand500,
                position: 'insideStartTop',
                fontWeight: 600,
              },
            },
          ],
        },
      },
    ],
  };

  // Skipped components (usage-only or missing bounds) — surfaced so the
  // reader knows why some rows from other charts don't appear here.
  const skipped =
    (components?.length ?? 0) - rows.length - mix.usageComponentCount;

  // The chart needs a deterministic height so all rows are visible.
  const chartHeight = Math.max(280, rows.length * 44 + 70);

  return (
    <>
      {banner}
      {/* Inline legend matches the Figma spec */}
      <div className="d-flex flex-wrap align-items-center gap-3 small mb-2">
        <span className="d-inline-flex align-items-center gap-1">
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 2,
              background: tc.brand500,
            }}
          />
          {translate('Usage <70%')}
        </span>
        <span className="d-inline-flex align-items-center gap-1">
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 2,
              background: '#fdb022',
            }}
          />
          {translate('70–90%')}
        </span>
        <span className="d-inline-flex align-items-center gap-1">
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 2,
              background: '#dc6803',
            }}
          />
          {translate('90–100%')}
        </span>
        <span className="d-inline-flex align-items-center gap-1">
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 2,
              background: '#d92d20',
            }}
          />
          {translate('Over cap')}
        </span>
        <span className="d-inline-flex align-items-center gap-1">
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 14,
              background: tc.brand500,
            }}
          />
          {translate('Today')}
        </span>
        <span className="d-inline-flex align-items-center gap-1">
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#6938ef',
            }}
          />
          {translate('Next reset')}
        </span>
        {rows[0]?.limitPeriod && (
          <LimitPeriodChip
            limitPeriod={rows[0].limitPeriod}
            periodLabel={null}
            billingType="limit"
          />
        )}
      </div>
      <EChart options={options} height={`${chartHeight}px`} width="100%" />
      {skipped > 0 && (
        <small className="d-block text-muted mt-2">
          {translate('Skipped')}: {skipped}{' '}
          {translate('limit row(s) without configured caps or period bounds.')}
        </small>
      )}
    </>
  );
};
