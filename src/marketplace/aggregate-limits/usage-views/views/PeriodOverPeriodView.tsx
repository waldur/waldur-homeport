import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import {
  Project,
  marketplaceCustomerUsageComponentsUsageTimeseriesRetrieve,
  marketplaceProjectUsageComponentsUsageTimeseriesRetrieve,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { EChart } from '@/core/EChart';
import { getChartThemeColors } from '@/dashboard/chartColors';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { Customer } from '@/workspace/types';

import { ComponentOptionLabel } from '../ComponentOptionLabel';
import { MixBanner } from '../MixBanner';
import { ComponentRow, detectMix } from '../mixDetection';
import { buildPeriodOptions } from '../periodOptions';

interface Props {
  project?: Project;
  customer?: Customer;
  components: ComponentRow[];
}

interface SelectableTarget {
  uuid: string;
  type: string;
  name: string;
  offering_name: string;
  billing_type: string;
  limit_period: string | null;
  current_period_label: string | null;
}

function buildTargets(rows: ComponentRow[]): SelectableTarget[] {
  const seen = new Map<string, SelectableTarget>();
  for (const r of rows) {
    const k = `${r.offering_uuid}::${r.type}`;
    if (!seen.has(k)) {
      seen.set(k, {
        uuid: r.offering_uuid,
        type: r.type,
        name: r.name,
        offering_name: r.offering_name,
        billing_type: r.billing_type,
        limit_period: (r as any).limit_period ?? null,
        current_period_label: (r as any).current_period_label ?? null,
      });
    }
  }
  return [...seen.values()];
}

export const PeriodOverPeriodView: FC<Props> = ({
  project,
  customer,
  components,
}) => {
  const mix = detectMix(components);
  const targets = useMemo(() => buildTargets(components ?? []), [components]);
  const [selectedKey, setSelectedKey] = useState<string | undefined>();
  const effectiveKey =
    selectedKey ??
    (targets.length ? `${targets[0].uuid}::${targets[0].type}` : undefined);
  const target = targets.find((t) => `${t.uuid}::${t.type}` === effectiveKey);

  const isProject = !!project;
  const scope = project ?? customer;

  // Available period offsets are derived from the selected target's
  // limit_period; default A=0 (current), B=-1 (previous).
  const periodOpts = useMemo(
    () => buildPeriodOptions(target?.limit_period, new Date(), 6),
    [target?.limit_period],
  );
  const [offsetA, setOffsetA] = useState<number>(0);
  const [offsetB, setOffsetB] = useState<number>(-1);
  // Whenever the target changes, reset offsets if they fall outside the new options.
  useMemo(() => {
    const valid = new Set(periodOpts.map((p) => p.offset));
    if (!valid.has(offsetA)) setOffsetA(periodOpts[0]?.offset ?? 0);
    if (!valid.has(offsetB)) {
      const fallback =
        periodOpts.find((p) => p.offset !== periodOpts[0]?.offset)?.offset ??
        periodOpts[0]?.offset ??
        -1;
      setOffsetB(fallback);
    }
  }, [periodOpts, offsetA, offsetB]);

  const fetchOne = (offset: number) => {
    if (!scope?.uuid || !target) return null;
    const opts = {
      path: { uuid: scope.uuid },
      query: {
        offering_uuid: target.uuid,
        component_type: target.type,
        period_offset: offset,
      },
    };
    const fetcher = isProject
      ? marketplaceProjectUsageComponentsUsageTimeseriesRetrieve
      : marketplaceCustomerUsageComponentsUsageTimeseriesRetrieve;
    return (fetcher as any)(opts).then((r: any) => r.data);
  };

  const { data: current } = useQuery({
    queryKey: ['exp-pop-A', scope?.uuid, target?.uuid, target?.type, offsetA],
    queryFn: () => fetchOne(offsetA),
    enabled: !!scope?.uuid && !!target,
    staleTime: SHORT_STALE_TIME,
  });
  const { data: previous } = useQuery({
    queryKey: ['exp-pop-B', scope?.uuid, target?.uuid, target?.type, offsetB],
    queryFn: () => fetchOne(offsetB),
    enabled:
      !!scope?.uuid && !!target && offsetA !== offsetB && periodOpts.length > 1,
    staleTime: SHORT_STALE_TIME,
  });

  const options = useMemo(() => {
    if (!current?.buckets?.length) return null;
    // Align buckets by index: bucket[i] in current corresponds to bucket[i]
    // in previous — same bucket position within the period (week 1 vs week 1, etc.).
    const labels = current.buckets.map((_b: any, i: number) => `#${i + 1}`);
    const currentSeries = current.buckets.map((b: any) => b.usage);
    const previousSeries = (previous?.buckets ?? []).map((b: any) => b.usage);

    const currentTotal = currentSeries.reduce(
      (a: number, b: number) => a + b,
      0,
    );
    const previousTotal = previousSeries.reduce(
      (a: number, b: number) => a + b,
      0,
    );
    const deltaPct =
      previousTotal > 0
        ? Math.round(((currentTotal - previousTotal) / previousTotal) * 1000) /
          10
        : null;

    const tc = getChartThemeColors();
    const seriesList: any[] = [
      {
        name: `${current.current_period_label}`,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        color: tc.brand500,
        data: currentSeries,
        areaStyle: { opacity: 0.18 },
      },
    ];
    if (previousSeries.length) {
      seriesList.push({
        name: previous?.current_period_label
          ? `${previous.current_period_label}`
          : translate('Previous period'),
        type: 'line',
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 5,
        color: tc.muted,
        lineStyle: { type: 'dashed' },
        data: previousSeries,
      });
    }
    if (target?.billing_type === 'limit' && current.limit) {
      seriesList.push({
        name: translate('Limit'),
        type: 'line',
        markLine: {
          symbol: 'none',
          lineStyle: { type: 'dashed', color: '#d92d20' },
          data: [
            {
              yAxis: current.limit,
              label: { formatter: `${translate('Limit')} ${current.limit}` },
            },
          ],
        },
        data: [],
      });
    }

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          if (!params?.length) return '';
          const lines = params.map(
            (p) =>
              `${p.marker} ${p.seriesName}: <strong>${p.value}</strong> ${current.measured_unit ?? ''}`,
          );
          if (deltaPct !== null) {
            lines.push(
              `<small>${translate('Period total Δ')}: ${deltaPct >= 0 ? '+' : ''}${deltaPct}%</small>`,
            );
          }
          return lines.join('<br/>');
        },
      },
      legend: { top: 0 },
      grid: { left: 40, right: 20, bottom: 30, top: 30 },
      xAxis: {
        type: 'category',
        data: labels,
        boundaryGap: false,
        axisLabel: { fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v,
        },
      },
      series: seriesList,
    };
  }, [current, previous, target]);

  return (
    <>
      <MixBanner
        mix={mix}
        groupedBy={translate(
          'one selectable (offering, component_type) — two timeseries overlaid by bucket index',
        )}
        normalization={translate(
          'absolute usage in measured_unit per bucket; tooltip shows period-total Δ%.',
        )}
        scenarioNote={translate(
          'Mix-agnostic: each (offering, component) compares against its own previous period — periods are aligned per row, not across rows.',
        )}
      />
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div className="d-flex align-items-center gap-2">
          <small className="text-secondary fw-medium">
            {translate('Offering · component')}:
          </small>
          <div style={{ minWidth: 320 }}>
            <Select
              size="sm"
              isClearable={false}
              isSearchable={false}
              value={
                target
                  ? {
                      value: `${target.uuid}::${target.type}`,
                      label: `${target.offering_name} · ${target.name}`,
                      component: target,
                    }
                  : null
              }
              onChange={(opt: any) => setSelectedKey(opt?.value)}
              options={targets.map((t) => ({
                value: `${t.uuid}::${t.type}`,
                label: `${t.offering_name} · ${t.name}`,
                component: t,
              }))}
              formatOptionLabel={(opt: any, ctx: any) => (
                <ComponentOptionLabel
                  option={{
                    offering_name: opt.component.offering_name,
                    component_name: opt.component.name,
                    billing_type: opt.component.billing_type,
                    limit_period: opt.component.limit_period,
                    current_period_label: opt.component.current_period_label,
                  }}
                  compact={ctx?.context === 'value'}
                />
              )}
            />
          </div>
        </div>
        {target?.limit_period && target.limit_period !== 'total' ? (
          <>
            <div className="d-flex align-items-center gap-2">
              <small className="text-secondary fw-medium">
                {translate('Period A')}:
              </small>
              <div style={{ minWidth: 160 }}>
                <Select
                  size="sm"
                  isClearable={false}
                  isSearchable={false}
                  value={{
                    value: offsetA,
                    label:
                      periodOpts.find((p) => p.offset === offsetA)?.label ??
                      String(offsetA),
                  }}
                  onChange={(opt: any) => setOffsetA(Number(opt?.value ?? 0))}
                  options={periodOpts.map((p) => ({
                    value: p.offset,
                    label: p.label,
                  }))}
                />
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <small className="text-secondary fw-medium">
                {translate('Period B')}:
              </small>
              <div style={{ minWidth: 160 }}>
                <Select
                  size="sm"
                  isClearable={false}
                  isSearchable={false}
                  value={{
                    value: offsetB,
                    label:
                      periodOpts.find((p) => p.offset === offsetB)?.label ??
                      String(offsetB),
                  }}
                  onChange={(opt: any) => setOffsetB(Number(opt?.value ?? -1))}
                  options={periodOpts.map((p) => ({
                    value: p.offset,
                    label: p.label,
                  }))}
                />
              </div>
            </div>
            {offsetA === offsetB && (
              <small className="text-warning">
                {translate('Pick two different periods to see the comparison.')}
              </small>
            )}
          </>
        ) : (
          <small className="text-muted">
            {translate(
              'Selected target uses limit_period=total — there is only one lifetime period to plot.',
            )}
          </small>
        )}
      </div>
      {!options ? (
        <div className="text-center py-5 text-muted">
          {translate('Loading or no data for the selected target.')}
        </div>
      ) : (
        <EChart options={options} height="320px" width="100%" />
      )}
    </>
  );
};
