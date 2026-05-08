import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import {
  ComponentsUsageStatsPerOffering,
  Project,
  marketplaceCustomerUsageComponentsUsageByProjectRetrieve,
  marketplaceCustomerUsageComponentsUsageTimeseriesRetrieve,
  marketplaceProjectUsageComponentsUsageTimeseriesRetrieve,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { EChart } from '@/core/EChart';
import { generateBrandColors } from '@/core/generateColors';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getBrandColor } from '@/core/utils';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { getUserLocale } from '@/i18n/LanguageUtilsService';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { CompactActionButton } from '@/table/CompactActionButton';
import { Customer } from '@/workspace/types';

import { ComponentOptionLabel } from './experimental/ComponentOptionLabel';
import { TraceabilityPopover } from './experimental/TraceabilityPopover';

interface AggregateUsageTimelineWidgetProps {
  project?: Project;
  customer?: Customer;
  components?: ComponentsUsageStatsPerOffering['components'];
}

const numberFormatter = new Intl.NumberFormat(getUserLocale(), {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pct = (used: number, limit: number) =>
  limit > 0 ? Math.round((used / limit) * 100) : 0;

const TOP_N_PROJECTS = 5;

const ProjectUsageBreakdownDialog = lazyComponent(() =>
  import('./ProjectUsageBreakdownDialog').then((module) => ({
    default: module.ProjectUsageBreakdownDialog,
  })),
);

function buildPeriodOptions(
  limitPeriod: string | null | undefined,
  today: Date,
): Array<{ offset: number; label: string }> {
  if (!limitPeriod || limitPeriod === 'total') {
    return [{ offset: 0, label: translate('Total') }];
  }
  const opts: Array<{ offset: number; label: string }> = [];
  for (let off = 0; off >= -3; off--) {
    let label = '';
    if (limitPeriod === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth() + off, 1);
      label = d.toLocaleString(getUserLocale(), {
        month: 'short',
        year: 'numeric',
      });
    } else if (limitPeriod === 'quarterly') {
      const currentQ = Math.floor(today.getMonth() / 3) + 1;
      let q = currentQ + off;
      let y = today.getFullYear();
      while (q < 1) {
        q += 4;
        y -= 1;
      }
      label = `Q${q} ${y}`;
    } else if (limitPeriod === 'annual') {
      label = `${today.getFullYear() + off}`;
      // Annual offers little value beyond the current and previous year for
      // most demos — bail out at -1.
      if (off === -1) {
        opts.push({ offset: off, label });
        break;
      }
    } else {
      label = `${off === 0 ? translate('Current') : `${off}`}`;
    }
    if (off === 0) label += ` (${translate('current')})`;
    opts.push({ offset: off, label });
  }
  return opts;
}

const monthLabel = (d: Date) =>
  d.toLocaleString(getUserLocale(), {
    month: 'short',
    year: 'numeric',
  });

export const AggregateUsageTimelineWidget = ({
  project,
  customer,
  components,
}: AggregateUsageTimelineWidgetProps) => {
  const { openDialog } = useModal();

  const offerings = useMemo(() => {
    if (!components?.length) return [];
    const seen = new Map<
      string,
      {
        uuid: string;
        name: string;
        type: string;
        component_name: string;
        billing_type?: string;
        limit_period?: string | null;
        current_period_label?: string | null;
      }
    >();
    for (const c of components) {
      const k = `${c.offering_uuid}::${c.type}`;
      if (!seen.has(k)) {
        seen.set(k, {
          uuid: c.offering_uuid,
          name: c.offering_name,
          type: c.type,
          component_name: c.name,
          billing_type: (c as any).billing_type,
          limit_period: (c as any).limit_period,
          current_period_label: (c as any).current_period_label,
        });
      }
    }
    return Array.from(seen.values());
  }, [components]);

  const [selectedKey, setSelectedKey] = useState<string | undefined>();
  const effectiveKey =
    selectedKey ??
    (offerings.length
      ? `${offerings[0].uuid}::${offerings[0].type}`
      : undefined);
  const selected = offerings.find(
    (o) => `${o.uuid}::${o.type}` === effectiveKey,
  );

  const [periodOffset, setPeriodOffset] = useState(0);
  const isProject = !!project;
  // 'By project' decomposition only makes sense at customer scope.
  const [viewMode, setViewMode] = useState<'total' | 'by-project'>('total');
  const effectiveViewMode = isProject ? 'total' : viewMode;

  const scope = project ?? customer;

  const { data: timeseries, isLoading: isTimeseriesLoading } = useQuery({
    queryKey: [
      'offering-usage-timeseries',
      isProject ? 'project' : 'customer',
      scope?.uuid,
      selected?.uuid,
      selected?.type,
      periodOffset,
    ],
    queryFn: () => {
      if (!scope?.uuid || !selected) return null;
      const opts = {
        path: { uuid: scope.uuid },
        query: {
          offering_uuid: selected.uuid,
          component_type: selected.type,
          period_offset: periodOffset,
        },
      };
      const fetch = isProject
        ? marketplaceProjectUsageComponentsUsageTimeseriesRetrieve
        : marketplaceCustomerUsageComponentsUsageTimeseriesRetrieve;
      return (fetch as any)(opts).then((r: any) => r.data);
    },
    enabled: !!scope?.uuid && !!selected,
    staleTime: SHORT_STALE_TIME,
  });

  const { data: byProject, isLoading: isByProjectLoading } = useQuery({
    queryKey: [
      'offering-usage-by-project',
      scope?.uuid,
      selected?.uuid,
      selected?.type,
      periodOffset,
    ],
    queryFn: () => {
      if (!scope?.uuid || !selected || isProject) return null;
      return marketplaceCustomerUsageComponentsUsageByProjectRetrieve({
        path: { uuid: scope.uuid },
        query: {
          offering_uuid: selected.uuid,
          component_type: selected.type,
          period_offset: periodOffset,
        },
      } as any).then((r: any) => r.data);
    },
    enabled:
      !isProject &&
      effectiveViewMode === 'by-project' &&
      !!scope?.uuid &&
      !!selected,
    staleTime: SHORT_STALE_TIME,
  });

  const isLoading =
    isTimeseriesLoading ||
    (effectiveViewMode === 'by-project' && isByProjectLoading);

  const periodOptions = useMemo(
    () =>
      buildPeriodOptions(
        timeseries?.limit_period,
        timeseries?.today ? new Date(timeseries.today) : new Date(),
      ),
    [timeseries?.limit_period, timeseries?.today],
  );

  const handleViewAll = useCallback(() => {
    if (!selected || !byProject) return;
    openDialog(ProjectUsageBreakdownDialog, {
      resolve: { data: byProject, offering: selected },
      size: 'lg',
    });
  }, [byProject, selected, openDialog]);

  const isMonthly = timeseries?.limit_period === 'month';

  const options = useMemo(() => {
    if (effectiveViewMode === 'total') {
      if (!timeseries?.buckets?.length) return null;
      if (isMonthly) return buildMonthlyBarsOptions(timeseries, selected);
      return buildTotalOptions(timeseries, selected);
    }
    if (!byProject?.projects?.length) return null;
    return buildByProjectOptions(byProject, TOP_N_PROJECTS);
  }, [effectiveViewMode, timeseries, byProject, selected, isMonthly]);

  if (!offerings.length) return null;

  const hasMoreProjects =
    effectiveViewMode === 'by-project' &&
    byProject &&
    byProject.projects.length > TOP_N_PROJECTS;

  return (
    <WidgetCard
      cardTitle={
        <span className="d-inline-flex align-items-center gap-2">
          {translate('Aggregate usage and limits — timeline')}
          <TraceabilityPopover
            id="timeline-title"
            title={translate('Where this widget gets its data')}
            rows={[
              {
                label: translate('Bucket data endpoint'),
                value: isProject
                  ? 'GET /api/marketplace-project-usage/{uuid}/components-usage-timeseries/?offering_uuid&component_type&period_offset'
                  : 'GET /api/marketplace-customer-usage/{uuid}/components-usage-timeseries/?offering_uuid&component_type&period_offset',
              },
              {
                label: translate('Backend view'),
                value:
                  'MarketplaceProjectUsageViewSet.components_usage_timeseries / MarketplaceCustomerUsageViewSet.components_usage_timeseries (waldur-mastermind/src/waldur_mastermind/marketplace/views.py)',
              },
              {
                label: translate('Source rows'),
                value:
                  'ComponentUsage rows for the selected offering+type, filtered by billing_period inside the resolved period window. Aggregated as SUM(usage) per bucket.',
              },
              {
                label: translate('Limit line'),
                value:
                  'SUM(Resource.limits[component.type]) over the offering’s resources at the cut-off date. For limit_period=month, the cap resets each bucket; for quarterly/annual/total it is constant for the window.',
              },
              {
                label: translate('By-project endpoint (customer scope only)'),
                value:
                  'GET /api/marketplace-customer-usage/{uuid}/components-usage-by-project/?offering_uuid&component_type&period_offset → MarketplaceCustomerUsageViewSet.components_usage_by_project',
              },
            ]}
          />
        </span>
      }
      className="h-100"
    >
      <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-medium text-secondary">
            {translate('Offering')}:
          </span>
          <TraceabilityPopover
            id="timeline-offering"
            title={translate('Offering dropdown')}
            rows={[
              {
                label: translate('Source'),
                value:
                  'Distinct (offering_uuid, component.type) pairs from ComponentsUsageStatsPerOffering returned by the components-usage endpoint.',
              },
              {
                label: translate('Subtitle (Limit-based · Period)'),
                value:
                  'OfferingComponent.billing_type and OfferingComponent.limit_period (DB: marketplace_offeringcomponent.billing_type, .limit_period).',
              },
              {
                label: translate('Frontend code'),
                value:
                  'src/marketplace/aggregate-limits/AggregateUsageTimelineWidget.tsx:119 (offerings useMemo)',
              },
            ]}
          />
          <div style={{ minWidth: 280, maxWidth: 360 }}>
            <Select
              size="sm"
              isClearable={false}
              isSearchable={false}
              value={
                selected
                  ? {
                      value: `${selected.uuid}::${selected.type}`,
                      label: `${selected.name} · ${selected.type}`,
                      offering: selected,
                    }
                  : null
              }
              onChange={(opt: any) => setSelectedKey(opt?.value)}
              options={offerings.map((o) => ({
                value: `${o.uuid}::${o.type}`,
                label: `${o.name} · ${o.type}`,
                offering: o,
              }))}
              formatOptionLabel={(opt: any, ctx: any) => (
                <ComponentOptionLabel
                  option={{
                    offering_name: opt.offering.name,
                    component_name:
                      opt.offering.component_name ?? opt.offering.type,
                    billing_type: opt.offering.billing_type,
                    limit_period: opt.offering.limit_period,
                    current_period_label: opt.offering.current_period_label,
                  }}
                  compact={ctx?.context === 'value'}
                />
              )}
            />
          </div>
        </div>
        {!isMonthly && (
          <div className="d-flex align-items-center gap-2">
            <span className="fw-medium text-secondary">
              {translate('Period')}:
            </span>
            <TraceabilityPopover
              id="timeline-period"
              title={translate('Period selector')}
              rows={[
                {
                  label: translate('Offset semantics'),
                  value:
                    'period_offset query param. 0 = current period, -1 = previous, -2/-3 = older. Resolved server-side in _resolve_period_bounds (waldur-mastermind/src/waldur_mastermind/marketplace/utils.py:1261).',
                },
                {
                  label: translate('Available periods'),
                  value:
                    'Built from OfferingComponent.limit_period: month/quarterly/annual/total. See buildPeriodOptions (AggregateUsageTimelineWidget.tsx:64).',
                },
                {
                  label: translate('Window applied to'),
                  value:
                    'ComponentUsage.billing_period filter: [period_start, period_end]. Buckets within the window are returned by the timeseries endpoint.',
                },
              ]}
            />
            <div style={{ minWidth: 160, maxWidth: 220 }}>
              <Select
                size="sm"
                isClearable={false}
                isSearchable={false}
                value={
                  periodOptions.find((p) => p.offset === periodOffset)
                    ? {
                        value: periodOffset,
                        label: periodOptions.find(
                          (p) => p.offset === periodOffset,
                        )!.label,
                      }
                    : null
                }
                onChange={(opt: any) =>
                  setPeriodOffset(Number(opt?.value ?? 0))
                }
                options={periodOptions.map((p) => ({
                  value: p.offset,
                  label: p.label,
                }))}
              />
            </div>
          </div>
        )}
        {!isProject && !isMonthly && (
          <div className="d-flex align-items-center gap-2 ms-auto">
            <ToggleButtonGroup
              type="radio"
              name="aggregate-usage-view-mode"
              value={effectiveViewMode}
              onChange={(v) => setViewMode(v as 'total' | 'by-project')}
              size="sm"
            >
              <ToggleButton
                id="aggregate-usage-total"
                value="total"
                variant="tertiary"
              >
                {translate('Total')}
              </ToggleButton>
              <ToggleButton
                id="aggregate-usage-by-project"
                value="by-project"
                variant="tertiary"
              >
                {translate('By project')}
              </ToggleButton>
            </ToggleButtonGroup>
            <TraceabilityPopover
              id="timeline-viewmode"
              title={translate('Total vs By project')}
              rows={[
                {
                  label: translate('Total'),
                  value:
                    'SUM(ComponentUsage.usage) across all projects in the customer for each bucket. One series per chart.',
                },
                {
                  label: translate('By project'),
                  value:
                    'SUM(ComponentUsage.usage) GROUPBY ComponentUsage.resource.project per bucket. Top 5 projects rendered as stacked bars; the rest fold into a “View all” dialog.',
                },
                {
                  label: translate('By-project endpoint'),
                  value:
                    'GET /api/marketplace-customer-usage/{uuid}/components-usage-by-project/ → MarketplaceCustomerUsageViewSet.components_usage_by_project',
                },
                {
                  label: translate('Frontend code'),
                  value:
                    'AggregateUsageTimelineWidget.tsx:192 (byProject useQuery), buildByProjectOptions helper below in same file.',
                },
              ]}
            />
          </div>
        )}
        {hasMoreProjects && (
          <CompactActionButton
            action={handleViewAll}
            title={`${translate('View all')} (${byProject.projects.length})`}
            variant="link"
            className={`py-0 ${isProject ? 'ms-auto' : ''}`}
          />
        )}
      </div>
      <div
        style={{ height: 240 }}
        className="d-flex align-items-center justify-content-center"
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : options ? (
          <EChart options={options} height="240px" width="100%" />
        ) : (
          <NoResult
            title={translate('No usage data')}
            message={translate('No usage data for this offering yet.')}
            noAction
          />
        )}
      </div>
    </WidgetCard>
  );
};

// Helpers split out below to keep the component readable.

function buildMonthlyBarsOptions(timeseries: any, selected: any) {
  // For MONTH-limit offerings, the cap resets each month. Render each
  // month's reported usage as an independent bar; the dashed orange
  // limit line marks the per-month cap.
  const brand = getBrandColor();
  const brandColors = generateBrandColors(brand);

  const points = timeseries.buckets.map((b: any) => {
    const d = new Date(b.billing_period);
    return { label: monthLabel(d), value: Number(b.usage) || 0 };
  });

  const xAxisData = points.map((p: any) => p.label);
  const series: any[] = [
    {
      name: translate('Monthly usage'),
      type: 'bar',
      data: points.map((p: any) => p.value),
      itemStyle: { color: brandColors[600] },
      barMaxWidth: 36,
    },
  ];

  if (timeseries.limit != null) {
    series[0].markLine = {
      symbol: 'none',
      data: [
        {
          yAxis: timeseries.limit,
          name: translate('Limit'),
          lineStyle: { color: '#f97316', type: 'dashed' },
          label: { formatter: translate('Limit'), position: 'insideEndTop' },
        },
      ],
    };
  }

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const p = params[0];
        if (!p) return '';
        let html = `<strong>${selected?.name}</strong><br/>`;
        html += `<small>${translate('Date')}: ${p.axisValueLabel}</small><br/>`;
        html += `${translate('Used')}: ${numberFormatter.format(p.value)} ${timeseries.measured_unit}`;
        if (timeseries.limit != null) {
          html += `<br/>${translate('% of limit')}: ${pct(p.value, timeseries.limit)}%`;
        }
        return html;
      },
    },
    grid: { left: 50, right: 30, top: 30, bottom: 30, containLabel: true },
    xAxis: { type: 'category', data: xAxisData },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => {
          if (v >= 1000000) return v / 1000000 + 'M';
          if (v >= 1000) return v / 1000 + 'k';
          return v;
        },
      },
    },
    series,
  };
}

function buildTotalOptions(timeseries: any, selected: any) {
  const brand = getBrandColor();
  const brandColors = generateBrandColors(brand);

  let running = 0;
  const points = timeseries.buckets.map((b: any) => {
    running += b.usage;
    const d = new Date(b.billing_period);
    return {
      label: monthLabel(d),
      value: running,
      date: d,
      monthly: b.usage,
      projected: false as const,
    };
  });

  // Project forward at the average monthly rate of the last 1–3 buckets,
  // to period_end (or 6 months for TOTAL).
  const projection: typeof points = [];
  const lastPoint = points[points.length - 1];
  if (lastPoint && timeseries.limit != null && points.length >= 1) {
    const window = Math.min(3, points.length);
    const recentTotal = points
      .slice(-window)
      .reduce((s: number, p: any) => s + p.monthly, 0);
    const monthlyRate = recentTotal / window;
    const periodEnd = timeseries.current_period_end
      ? new Date(timeseries.current_period_end)
      : null;
    const cursor = new Date(lastPoint.date);
    let projectedRunning = lastPoint.value;
    const horizon = periodEnd
      ? Math.max(
          0,
          (periodEnd.getFullYear() - cursor.getFullYear()) * 12 +
            periodEnd.getMonth() -
            cursor.getMonth(),
        )
      : 6;
    for (let i = 0; i < horizon; i++) {
      cursor.setMonth(cursor.getMonth() + 1);
      projectedRunning += monthlyRate;
      projection.push({
        label: monthLabel(new Date(cursor)),
        value: projectedRunning,
        date: new Date(cursor),
        monthly: monthlyRate,
        projected: true,
      });
    }
  }

  const allPoints = [...points, ...projection];
  const xAxisData = allPoints.map((p: any) => p.label);
  const actualSeries: (number | null)[] = points.map((p: any) => p.value);
  while (actualSeries.length < allPoints.length) actualSeries.push(null);

  const projectedSeries: (number | null)[] = points.map(() => null);
  if (projection.length > 0) {
    projectedSeries[projectedSeries.length - 1] = lastPoint!.value;
    projection.forEach((p: any) => projectedSeries.push(p.value));
  }

  const crossingPoint = timeseries.limit
    ? projection.find((p: any) => p.value >= (timeseries.limit as number))
    : null;

  const todayDate = timeseries.today ? new Date(timeseries.today) : null;
  const todayLabelStr = todayDate ? monthLabel(todayDate) : null;
  const todayIndex =
    todayLabelStr != null ? xAxisData.indexOf(todayLabelStr) : -1;

  // Next reset event — for non-total limit periods, current_period_end marks
  // when the cap rolls over. We show it as a vertical event so the reader can
  // see how much budget is left in the current cycle.
  const periodEndDate = timeseries.current_period_end
    ? new Date(timeseries.current_period_end)
    : null;
  const isResettingPeriod =
    timeseries.limit_period &&
    timeseries.limit_period !== 'total' &&
    periodEndDate;
  const nextResetLabel =
    isResettingPeriod && periodEndDate ? monthLabel(periodEndDate) : null;
  const nextResetIndex =
    nextResetLabel != null ? xAxisData.indexOf(nextResetLabel) : -1;

  const markLines: any[] = [];
  if (timeseries.limit != null) {
    markLines.push({
      yAxis: timeseries.limit,
      name: translate('Limit'),
      lineStyle: { color: '#f97316', type: 'dashed' },
      label: { formatter: translate('Limit'), position: 'insideEndTop' },
    });
  }
  if (todayIndex >= 0) {
    markLines.push({
      xAxis: xAxisData[todayIndex],
      name: translate('Today'),
      lineStyle: { color: '#94a3b8', type: 'dashed' },
      label: { formatter: translate('Today'), position: 'insideEndTop' },
    });
  }
  if (nextResetIndex >= 0) {
    markLines.push({
      xAxis: xAxisData[nextResetIndex],
      name: translate('Next reset'),
      lineStyle: { color: '#0ea5e9', type: 'dotted', width: 2 },
      label: {
        formatter: `↻ ${translate('Next reset')}`,
        position: 'insideEndTop',
        color: '#0ea5e9',
      },
    });
  }
  if (crossingPoint) {
    markLines.push({
      xAxis: crossingPoint.label,
      name: translate('Crosses limit'),
      lineStyle: { color: '#dc2626', type: 'dashed', width: 2 },
      label: {
        formatter: translate('Crosses limit'),
        position: 'insideEndTop',
        color: '#dc2626',
      },
    });
  }

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const p = params[0];
        const point = allPoints[p.dataIndex];
        if (!point) return '';
        const dateLine = point.projected
          ? `${translate('Date')}: ${point.label} (${translate('projected')})`
          : `${translate('Date')}: ${point.label}`;
        let html = `<strong>${selected?.name}</strong><br/>`;
        html += `<small>${dateLine}</small><br/>`;
        html += `${translate('Used')}: ${numberFormatter.format(point.value)} ${timeseries.measured_unit}`;
        if (timeseries.limit != null) {
          html += `<br/>${translate('% of limit')}: ${pct(point.value, timeseries.limit)}%`;
        }
        return html;
      },
    },
    grid: { left: 50, right: 30, top: 30, bottom: 30, containLabel: true },
    xAxis: { type: 'category', data: xAxisData, boundaryGap: false },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => {
          if (v >= 1000000) return v / 1000000 + 'M';
          if (v >= 1000) return v / 1000 + 'k';
          return v;
        },
      },
    },
    series: [
      {
        name: translate('Cumulative usage'),
        type: 'line',
        smooth: false,
        showSymbol: true,
        symbolSize: 8,
        data: actualSeries,
        color: brandColors[600],
        lineStyle: { width: 2 },
        areaStyle: { color: brandColors[100], opacity: 0.5 },
        markLine: markLines.length
          ? { symbol: 'none', data: markLines }
          : undefined,
      },
      {
        name: translate('Projected'),
        type: 'line',
        smooth: false,
        showSymbol: false,
        data: projectedSeries,
        color: brandColors[600],
        lineStyle: { type: 'dashed', width: 2, opacity: 0.7 },
      },
    ],
  };
}

function buildByProjectOptions(byProject: any, topN: number) {
  // Build a unified x-axis from the union of all project buckets so lines
  // share the same time domain even when projects start mid-period.
  const xLabels: string[] = [];
  const seenLabels = new Set<string>();
  for (const p of byProject.projects) {
    for (const b of p.buckets) {
      const lbl = monthLabel(new Date(b.billing_period));
      if (!seenLabels.has(lbl)) {
        seenLabels.add(lbl);
        xLabels.push(lbl);
      }
    }
  }

  // Top-N by total in-period usage (already sorted desc by the backend).
  const topProjects = byProject.projects.slice(0, topN);

  const palette = [
    '#0ea5e9',
    '#8b5cf6',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#14b8a6',
    '#f97316',
  ];

  const series = topProjects.map((p: any, idx: number) => {
    const byLabel = new Map<string, number>();
    let running = 0;
    for (const b of p.buckets) {
      running += b.usage;
      byLabel.set(monthLabel(new Date(b.billing_period)), running);
    }
    return {
      name: p.project_name,
      type: 'line',
      smooth: false,
      showSymbol: true,
      symbolSize: 6,
      data: xLabels.map((lbl) => byLabel.get(lbl) ?? null),
      color: palette[idx % palette.length],
      connectNulls: true,
    };
  });

  const markLines: any[] = [];
  if (byProject.limit != null) {
    markLines.push({
      yAxis: byProject.limit,
      name: translate('Limit'),
      lineStyle: { color: '#f97316', type: 'dashed' },
      label: { formatter: translate('Limit'), position: 'insideEndTop' },
    });
  }
  // Today + next-reset events when the period rolls over.
  const todayDateBP = byProject.today ? new Date(byProject.today) : null;
  const todayLabelBP = todayDateBP ? monthLabel(todayDateBP) : null;
  if (todayLabelBP && xLabels.includes(todayLabelBP)) {
    markLines.push({
      xAxis: todayLabelBP,
      name: translate('Today'),
      lineStyle: { color: '#94a3b8', type: 'dashed' },
      label: { formatter: translate('Today'), position: 'insideEndTop' },
    });
  }
  if (
    byProject.limit_period &&
    byProject.limit_period !== 'total' &&
    byProject.current_period_end
  ) {
    const resetLabel = monthLabel(new Date(byProject.current_period_end));
    if (xLabels.includes(resetLabel)) {
      markLines.push({
        xAxis: resetLabel,
        name: translate('Next reset'),
        lineStyle: { color: '#0ea5e9', type: 'dotted', width: 2 },
        label: {
          formatter: `↻ ${translate('Next reset')}`,
          position: 'insideEndTop',
          color: '#0ea5e9',
        },
      });
    }
  }
  if (markLines.length && series.length) {
    series[0].markLine = { symbol: 'none', data: markLines };
  }

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        if (!params.length) return '';
        let html = `<strong>${params[0].axisValueLabel}</strong><br/>`;
        for (const p of params) {
          if (p.value == null) continue;
          let line = `${p.marker} ${p.seriesName}: ${numberFormatter.format(p.value)} ${byProject.measured_unit}`;
          if (byProject.limit) {
            line += ` <small>(${pct(p.value, byProject.limit)}%)</small>`;
          }
          html += line + '<br/>';
        }
        return html;
      },
    },
    legend: {
      type: 'scroll',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 12 },
      top: 0,
      right: 0,
    },
    grid: { left: 50, right: 30, top: 30, bottom: 30, containLabel: true },
    xAxis: { type: 'category', data: xLabels, boundaryGap: false },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => {
          if (v >= 1000000) return v / 1000000 + 'M';
          if (v >= 1000) return v / 1000 + 'k';
          return v;
        },
      },
    },
    series,
  };
}
