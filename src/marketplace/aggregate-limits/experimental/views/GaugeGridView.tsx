import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { EChart } from '@/core/EChart';
import { getSaturationRamp } from '@/dashboard/chartColors';
import { translate } from '@/i18n';

import { LimitPeriodChip } from '../LimitPeriodChip';
import { MixBanner } from '../MixBanner';
import { ComponentRow, detectMix } from '../mixDetection';

interface Props {
  components: ComponentRow[];
}

interface GaugeRow {
  key: string;
  offeringUuid: string;
  offeringName: string;
  componentName: string;
  measuredUnit: string;
  pct: number;
  used: number;
  limit: number;
  periodLabel: string;
  billingType: string;
  limitPeriod: string;
}

interface GaugeGroup {
  uuid: string;
  name: string;
  rows: GaugeRow[];
  // True if every row in this offering shares one limit_period — drives a
  // single offering-level period chip in the group header.
  uniformPeriod: boolean;
  representativeLimitPeriod: string;
  representativePeriodLabel: string;
}

const PERIOD_GAUGE_LABEL: Record<string, string> = {
  month: 'this month',
  quarterly: 'this quarter',
  annual: 'this year',
  total: 'lifetime',
};

function buildGaugeOption(row: GaugeRow) {
  const value = Math.min(row.pct, 200);
  const ramp = getSaturationRamp();
  const palette = [
    [0.7, ramp.ok], // healthy
    [0.9, ramp.notice], // early notice
    [1.0, ramp.warning], // approaching
    [2.0, ramp.danger], // overage
  ];
  // The period subtitle inside the dial removes the need for the reader to
  // glance back at the card header — at 0–100 % the question "of what?"
  // matters. PERIOD_GAUGE_LABEL maps OfferingComponent.limit_period →
  // human phrase ("this quarter", "lifetime", …). Falls back to the
  // server-rendered current_period_label when limit_period is unrecognised.
  const periodSubtitle =
    PERIOD_GAUGE_LABEL[row.limitPeriod] ?? row.periodLabel ?? '';
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        radius: '95%',
        progress: { show: false },
        axisLine: {
          lineStyle: {
            width: 16,
            color: palette,
          },
        },
        pointer: {
          length: '60%',
          width: 4,
          itemStyle: { color: '#344054' },
        },
        axisTick: { show: false },
        splitLine: { length: 8, lineStyle: { color: '#fff', width: 2 } },
        axisLabel: {
          distance: -28,
          fontSize: 10,
          color: '#667085',
          formatter: (v: number) => `${Math.round(v * 100)}`,
        },
        title: {
          offsetCenter: [0, '78%'],
          fontSize: 11,
          fontWeight: 500,
          color: '#667085',
        },
        detail: {
          valueAnimation: false,
          fontSize: 18,
          fontWeight: 600,
          offsetCenter: [0, '38%'],
          formatter: () => `${Math.round(row.pct)}%`,
        },
        max: 1,
        min: 0,
        data: [
          {
            value: Math.min(value / 100, 2),
            name: periodSubtitle ? `of ${periodSubtitle}` : '',
          },
        ],
      },
    ],
  };
}

export const GaugeGridView: FC<Props> = ({ components }) => {
  const mix = useMemo(() => detectMix(components), [components]);

  const gauges = useMemo<GaugeRow[]>(() => {
    if (!components?.length) return [];
    return components
      .filter(
        (r) => r.billing_type === 'limit' && r.limit != null && r.limit > 0,
      )
      .map((r) => {
        const used =
          r.billing_type === 'limit' ? r.limit_usage || 0 : r.usage || 0;
        const pct = r.limit ? Math.round((used / r.limit) * 100) : 0;
        return {
          key: `${r.offering_uuid}-${r.type}`,
          offeringUuid: r.offering_uuid,
          offeringName: r.offering_name,
          componentName: r.name,
          measuredUnit: r.measured_unit,
          pct,
          used,
          limit: r.limit ?? 0,
          // eslint-disable-next-line waldur-custom/enforce-render-field-or-dash
          periodLabel: (r as any).current_period_label ?? '—',
          billingType: r.billing_type,
          // eslint-disable-next-line waldur-custom/enforce-render-field-or-dash
          limitPeriod: (r as any).limit_period ?? '—',
        };
      });
  }, [components]);

  // Group gauges by offering so each offering's components are visually
  // grouped under one header, and the offering-level period chip shows up
  // once instead of being repeated on every tile.
  const groups = useMemo<GaugeGroup[]>(() => {
    const map = new Map<string, GaugeGroup>();
    for (const g of gauges) {
      let group = map.get(g.offeringUuid);
      if (!group) {
        group = {
          uuid: g.offeringUuid,
          name: g.offeringName,
          rows: [],
          uniformPeriod: true,
          representativeLimitPeriod: g.limitPeriod,
          representativePeriodLabel: g.periodLabel,
        };
        map.set(g.offeringUuid, group);
      }
      if (group.representativeLimitPeriod !== g.limitPeriod) {
        group.uniformPeriod = false;
      }
      group.rows.push(g);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [gauges]);

  const skippedUsage = mix.usageComponentCount;
  const skippedNoLimit =
    (components?.length ?? 0) - gauges.length - skippedUsage;

  return (
    <>
      <MixBanner
        mix={mix}
        groupedBy={translate(
          'gauges grouped by offering — one card per offering, one gauge per (component) row inside',
        )}
        normalization={translate(
          '0–100% saturation against the row’s configured limit (over 100% rendered in red — overage)',
        )}
        scenarioNote={
          !gauges.length && !mix.hasLimit
            ? translate(
                'No limits configured anywhere — gauges have nothing to render. Switch to Treemap or Radar.',
              )
            : mix.code === 'C' || mix.code === 'E'
              ? translate(
                  'Gauges look uniform but their periods differ — read each tile’s “period” label before comparing.',
                )
              : undefined
        }
        trace={[
          {
            label: translate('Filter applied'),
            value:
              'Only rows with billing_type=limit AND limit > 0 are rendered. Usage-based rows are skipped (they have no cap).',
          },
          {
            label: translate('Pct formula'),
            value:
              '100 × ComponentStatsPerOffering.limit_usage / ComponentStatsPerOffering.limit (capped visually at 200%; computed values >100% are highlighted as overage).',
          },
          {
            label: translate('Period label'),
            value:
              'ComponentStatsPerOffering.current_period_label, server-resolved by _resolve_period_bounds (waldur-mastermind/src/waldur_mastermind/marketplace/utils.py:1261).',
          },
          {
            label: translate('Frontend code'),
            value:
              'src/marketplace/aggregate-limits/experimental/views/GaugeGridView.tsx',
          },
        ]}
      />
      {!gauges.length ? (
        <div className="alert alert-info">
          {translate(
            'No limit-based components with caps were returned for this scope.',
          )}
        </div>
      ) : (
        <>
          {(() => {
            const singletons = groups.filter((g) => g.rows.length === 1);
            const multi = groups.filter((g) => g.rows.length > 1);
            return (
              <>
                {singletons.length > 0 && (
                  <Row className="g-3 mb-3">
                    {singletons.map((group) => {
                      const g = group.rows[0];
                      return (
                        <Col xs={12} sm={6} md={4} lg={3} key={group.uuid}>
                          <div
                            className={`card card-bordered h-100 ${
                              g.pct >= 100
                                ? 'border-danger'
                                : g.pct >= 90
                                  ? 'border-warning'
                                  : ''
                            }`}
                          >
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                                <div className="text-truncate">
                                  <strong
                                    className="d-block text-truncate"
                                    title={g.offeringName}
                                  >
                                    {g.offeringName}
                                  </strong>
                                  <small className="text-muted text-truncate d-block">
                                    {g.componentName}
                                  </small>
                                </div>
                                <LimitPeriodChip
                                  billingType={g.billingType}
                                  limitPeriod={g.limitPeriod}
                                  periodLabel={g.periodLabel}
                                />
                              </div>
                              <EChart
                                options={buildGaugeOption(g)}
                                height="160px"
                                width="100%"
                              />
                              <div className="text-center small text-secondary">
                                {g.used.toLocaleString()} /{' '}
                                {g.limit.toLocaleString()} {g.measuredUnit}
                              </div>
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                )}
                {multi.length > 0 && (
                  <div className="d-flex flex-column gap-3">
                    {multi.map((group) => {
                      const worstPct = Math.max(
                        ...group.rows.map((r) => r.pct),
                      );
                      const headerBorder =
                        worstPct >= 100
                          ? 'border-danger'
                          : worstPct >= 90
                            ? 'border-warning'
                            : '';
                      return (
                        <div
                          key={group.uuid}
                          className={`card card-bordered ${headerBorder}`}
                        >
                          <div className="card-header bg-body-secondary py-2 px-3 d-flex flex-wrap align-items-center gap-2">
                            <strong title={group.name}>{group.name}</strong>
                            <small className="text-muted">
                              · {group.rows.length} {translate('components')}
                            </small>
                            {group.uniformPeriod ? (
                              <LimitPeriodChip
                                billingType="limit"
                                limitPeriod={group.representativeLimitPeriod}
                                periodLabel={group.representativePeriodLabel}
                              />
                            ) : (
                              <small className="text-warning fw-medium">
                                {translate(
                                  'Mixed periods within this offering — see each gauge.',
                                )}
                              </small>
                            )}
                          </div>
                          <div className="card-body p-3">
                            <Row className="g-3">
                              {group.rows.map((g) => (
                                <Col xs={12} sm={6} md={4} lg={3} key={g.key}>
                                  <div
                                    className={`card card-bordered h-100 ${
                                      g.pct >= 100
                                        ? 'border-danger'
                                        : g.pct >= 90
                                          ? 'border-warning'
                                          : ''
                                    }`}
                                  >
                                    <div className="card-body p-3">
                                      <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                                        <div className="text-truncate">
                                          <strong
                                            className="d-block text-truncate"
                                            title={g.componentName}
                                          >
                                            {g.componentName}
                                          </strong>
                                        </div>
                                        {!group.uniformPeriod && (
                                          <LimitPeriodChip
                                            billingType={g.billingType}
                                            limitPeriod={g.limitPeriod}
                                            periodLabel={g.periodLabel}
                                          />
                                        )}
                                      </div>
                                      <EChart
                                        options={buildGaugeOption(g)}
                                        height="160px"
                                        width="100%"
                                      />
                                      <div className="text-center small text-secondary">
                                        {g.used.toLocaleString()} /{' '}
                                        {g.limit.toLocaleString()}{' '}
                                        {g.measuredUnit}
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
          {(skippedUsage > 0 || skippedNoLimit > 0) && (
            <small className="text-muted d-block mt-3">
              {translate('Skipped')}:{' '}
              {skippedUsage > 0 &&
                `${skippedUsage} ${translate(
                  'usage-based row(s) — no cap to gauge against',
                )}`}
              {skippedUsage > 0 && skippedNoLimit > 0 && '; '}
              {skippedNoLimit > 0 &&
                `${skippedNoLimit} ${translate(
                  'limit row(s) without configured cap',
                )}`}
              .
            </small>
          )}
        </>
      )}
    </>
  );
};
