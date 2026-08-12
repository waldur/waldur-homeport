import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';

import { ENV } from '@/core/config';
import { EChart } from '@/core/EChart';
import { defaultCurrency } from '@/core/formatCurrency';
import { generateBrandColors } from '@/core/generateColors';
import { getBrandColor } from '@/core/utils';
import { translate } from '@/i18n';

import { getWatchColors } from '../chartColors';
import { PolicyWatchData } from '../types';

const currency = () => ENV.plugins.WALDUR_CORE.CURRENCY_NAME;

interface MonthPoint {
  iso: string;
  label: string;
  /** Net of credit — what the organization actually pays, and what a cost
   *  policy with `use_credit` is enforced against. */
  cost: number;
  /** Gross charge before credit compensation. */
  incurred: number;
  /** Credit drawn down that month (positive). */
  compensation: number;
  /** False when the month has no invoice at all, as opposed to an invoice
   *  that genuinely totals ~0 because credit covered it. */
  hasInvoice: boolean;
  isFuture: boolean;
}

// `/api/invoice-items/costs/` returns three figures per month; the SDK type
// only declares `price`, so the other two are read as untyped fields.
type InvoiceCostFigures = {
  price?: number | string;
  incurred?: number | string;
  compensation?: number | string;
};

const num = (value: unknown): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const padMonths = (
  invoices: PolicyWatchData['invoices'],
  monthsBack = 6,
  monthsForward = 3,
): MonthPoint[] => {
  const now = DateTime.now().startOf('month');
  const points: MonthPoint[] = [];
  for (let i = -monthsBack; i <= monthsForward; i++) {
    const d = now.plus({ months: i });
    const match = invoices.find(
      (inv) => inv.year === d.year && inv.month === d.month,
    ) as InvoiceCostFigures | undefined;
    points.push({
      iso: d.toISODate() || '',
      label: d.toFormat('LLL yy'),
      cost: num(match?.price),
      incurred: num(match?.incurred),
      // Compensation arrives negative; credit drawn is its magnitude.
      compensation: Math.abs(num(match?.compensation)),
      hasInvoice: match !== undefined,
      isFuture: i > 0,
    });
  }
  return points;
};

const linearForecastBand = (
  history: number[],
  horizon: number,
): { p10: number[]; p50: number[]; p90: number[] } => {
  // Callers pass only months that have an invoice. A month that really cost
  // ~0 — typically because credit covered all of it — is a genuine data point;
  // the previous `> 0` filter discarded exactly those and biased the trend up.
  const valid = history.map((v) => Math.max(0, v));
  if (valid.length < 2) {
    const last = valid[valid.length - 1] ?? 0;
    return {
      p10: Array(horizon).fill(last),
      p50: Array(horizon).fill(last),
      p90: Array(horizon).fill(last),
    };
  }
  const n = valid.length;
  const xs = valid.map((_, i) => i);
  const ys = valid;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0);
  const den = xs.reduce((s, x) => s + (x - meanX) ** 2, 0) || 1;
  const slope = num / den;
  const intercept = meanY - slope * meanX;
  const residuals = ys.map((y, i) => y - (slope * i + intercept));
  const variance =
    residuals.reduce((s, r) => s + r * r, 0) / Math.max(n - 1, 1);
  const std = Math.sqrt(variance);

  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];
  for (let i = 0; i < horizon; i++) {
    const x = n + i;
    const center = slope * x + intercept;
    p10.push(Math.max(0, center - 1.28 * std));
    p50.push(Math.max(0, center));
    p90.push(Math.max(0, center + 1.28 * std));
  }
  return { p10, p50, p90 };
};

// Locate which calendar-month bucket on the chart x-axis a date falls into.
// Returns the xAxis category string, or null if the date is outside the range.
const findXAxisBucket = (date: string, labels: string[]): string | null => {
  try {
    const d = DateTime.fromISO(date);
    if (!d.isValid) return null;
    const target = d.startOf('month').toFormat('LLL yy');
    return labels.includes(target) ? target : null;
  } catch {
    return null;
  }
};

const policyMarkerColor = (
  hasFired: boolean,
  saturationPct: number,
): string => {
  const c = getWatchColors();
  if (hasFired) return c.danger;
  if (saturationPct >= 80) return c.warning;
  return c.muted;
};

// Cost-axis threshold lines for project + customer cost policies.
// Returns an array of horizontal markLine entries keyed at `yAxis: limit`.
const costPolicyThresholdLines = (data: PolicyWatchData) => {
  // Only caps that are enforced against the series plotted here.
  //
  // Organization caps measure the whole organization's spend; drawn over a
  // single project they invite reading that project's cost as a fraction of an
  // organization-wide limit. Resource-scoped policies measure one resource's
  // invoice items, which is likewise not this series. Both are excluded and
  // called out in the chart footnote instead of being drawn misleadingly.
  const rawByUuid = new Map(data.projectPolicies.map((p) => [p.uuid, p]));
  return data.policies
    .filter((p) => p.policyKind === 'project-cost' && p.thresholdValue > 0)
    .filter((p) => !rawByUuid.get(p.policyUuid)?.resource)
    .map((p) => {
      const color = policyMarkerColor(p.hasFired, p.saturationPct);
      const status = p.hasFired
        ? translate('fired')
        : p.saturationPct >= 80
          ? translate('approaching')
          : translate('idle');
      // is_triggered compares net cost when the policy uses credit, and the
      // raw invoice total when it does not — say which line to read it against.
      const basis =
        rawByUuid.get(p.policyUuid)?.use_credit === false
          ? translate('vs incurred')
          : translate('vs net of credit');
      return {
        yAxis: p.thresholdValue,
        lineStyle: { color, type: 'dashed' as const, width: 2 },
        label: {
          show: true,
          position: 'insideEndTop' as const,
          formatter: `${p.thresholdLabel} ${defaultCurrency(p.thresholdValue)} · ${basis} · ${status}`,
          color,
          fontSize: 10,
        },
      };
    });
};

// Vertical "policy fires here" markers along the date axis for any policy
// (project cost, customer cost, or SLURM periodic) whose ETA falls inside the
// chart's x-axis range.
const policyFireDateMarkers = (data: PolicyWatchData, xLabels: string[]) => {
  return data.policies
    .filter(
      (p) =>
        !p.hasFired &&
        p.etaDate &&
        p.etaDays !== null &&
        p.etaDays > 0 &&
        p.etaDays < 365,
    )
    .map((p) => {
      const bucket = findXAxisBucket(p.etaDate as string, xLabels);
      if (!bucket) return null;
      const color = policyMarkerColor(p.hasFired, p.saturationPct);
      const kindLabel =
        p.policyKind === 'slurm-periodic'
          ? translate('SLURM')
          : p.policyKind === 'customer-cost'
            ? translate('Org')
            : translate('Project');
      return {
        xAxis: bucket,
        lineStyle: { color, type: 'solid' as const, width: 1, opacity: 0.7 },
        label: {
          show: true,
          position: 'end' as const,
          formatter: `${kindLabel}: ${p.actionLabel} (~${p.etaDays}d)`,
          color,
          fontSize: 10,
        },
      };
    })
    .filter(Boolean);
};

const burnDownOptions = (data: PolicyWatchData): any => {
  const brand = getBrandColor();
  const brandColors = generateBrandColors(brand);
  const c = getWatchColors();
  const creditValue = Number(data.runway.credit?.value || 0);
  if (creditValue <= 0) return null;
  const series = padMonths(data.invoices, 6, 0);
  // Credit drawn in a month is the compensation, not the net cost. Netting
  // already subtracts the credit, so a month fully covered by credit has a
  // price near zero and would read as "no burn" — the same mistake fixed for
  // the credit consumption chart in b0c1bef39.
  //
  // Walk backwards from today's balance so the line ends where the balance
  // actually is: start = current balance + everything drawn since.
  const drawn = series.reduce((s, p) => s + p.compensation, 0);
  let balance = creditValue + drawn;
  const balancePoints = series.map((p) => {
    balance = Math.max(0, balance - p.compensation);
    return balance;
  });
  // Use the credit's expected_consumption as the projected monthly burn when
  // available; otherwise fall back to the runway daily burn × 30.
  const expectedMonthly = data.creditTerms?.expectedConsumption || 0;
  const burnPerMonth =
    expectedMonthly > 0
      ? expectedMonthly
      : data.runway.burnPerDay > 0
        ? data.runway.burnPerDay * 30
        : null;
  const futureLabels: string[] = [];
  const futureValues: (number | null)[] = [];
  if (burnPerMonth) {
    let projected = balancePoints[balancePoints.length - 1];
    let monthCursor = DateTime.now().startOf('month');
    for (let i = 0; i < 12 && projected > 0; i++) {
      monthCursor = monthCursor.plus({ months: 1 });
      projected = Math.max(0, projected - burnPerMonth);
      futureLabels.push(monthCursor.toFormat('LLL yy'));
      futureValues.push(projected);
    }
  }
  const xAxis = [...series.map((s) => s.label), ...futureLabels];
  const historicalSeries = [
    ...balancePoints,
    ...Array(futureValues.length).fill(null),
  ];
  const projectedSeries = [
    ...Array(balancePoints.length - 1).fill(null),
    balancePoints[balancePoints.length - 1],
    ...futureValues,
  ];

  return {
    title: {
      text: translate('Credit burn-down'),
      left: 'center',
      textStyle: { fontSize: 14 },
    },
    grid: { left: 60, right: 20, top: 50, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: number) => defaultCurrency(v),
    },
    legend: { bottom: 0 },
    xAxis: { type: 'category', data: xAxis },
    yAxis: {
      type: 'value',
      name: translate('Remaining ({currency})', { currency: currency() }),
      axisLabel: { formatter: (v: number) => defaultCurrency(v) },
    },
    series: [
      {
        name: translate('Actual remaining'),
        type: 'line',
        data: historicalSeries,
        color: brandColors[500],
        smooth: false,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { width: 3 },
        markLine: {
          symbol: 'none',
          silent: true,
          data: [
            {
              yAxis: 0,
              label: {
                show: true,
                formatter: translate('Zero'),
                position: 'insideEndTop' as const,
              },
              lineStyle: { color: c.danger, type: 'dashed' as const },
            },
            ...policyFireDateMarkers(data, xAxis),
          ],
        },
      },
      {
        name: translate('Projected'),
        type: 'line',
        data: projectedSeries,
        color: c.neutral,
        smooth: false,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { width: 2, type: 'dashed' },
      },
    ],
  };
};

const forecastFanOptions = (data: PolicyWatchData): any => {
  const series = padMonths(data.invoices, 6, 0);
  const historicalCosts = series.map((p) => p.cost);
  const historicalIncurred = series.map((p) => p.incurred);
  const horizon = 3;
  // Regress on invoiced months only; padded gaps are absence of data, not a
  // month that cost nothing.
  const { p10, p50, p90 } = linearForecastBand(
    series.filter((p) => p.hasInvoice).map((p) => p.cost),
    horizon,
  );
  const labels = [
    ...series.map((s) => s.label),
    ...Array.from({ length: horizon }, (_, i) =>
      DateTime.now()
        .startOf('month')
        .plus({ months: i + 1 })
        .toFormat('LLL yy'),
    ),
  ];

  const brand = getBrandColor();
  const brandColors = generateBrandColors(brand);
  const c = getWatchColors();

  const histPadded = [...historicalCosts, ...Array(horizon).fill(null)];
  const lo = [...Array(historicalCosts.length).fill(null), ...p10];
  const mid = [
    ...Array(historicalCosts.length - 1).fill(null),
    historicalCosts[historicalCosts.length - 1],
    ...p50,
  ];
  const hi = [...Array(historicalCosts.length).fill(null), ...p90];

  return {
    title: {
      text: translate('Monthly spend forecast'),
      left: 'center',
      textStyle: { fontSize: 14 },
    },
    grid: { left: 60, right: 20, top: 50, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: number) => defaultCurrency(v),
    },
    legend: { bottom: 0 },
    xAxis: { type: 'category', data: labels },
    yAxis: {
      type: 'value',
      name: translate('Spend ({currency})', { currency: currency() }),
      axisLabel: { formatter: (v: number) => defaultCurrency(v) },
    },
    series: [
      // Both bases are plotted because a cap is enforced against one or the
      // other: with credit in play a single line cannot be read against every
      // threshold. Where no credit was applied the two lines coincide.
      {
        name: translate('Incurred'),
        type: 'line',
        data: [...historicalIncurred, ...Array(horizon).fill(null)],
        color: c.muted,
        smooth: false,
        showSymbol: false,
        lineStyle: { width: 1, type: 'dotted' },
      },
      {
        name: translate('Net of credit'),
        type: 'line',
        data: histPadded,
        color: brandColors[500],
        smooth: false,
        showSymbol: true,
        symbolSize: 6,
        lineStyle: { width: 3 },
        markLine: {
          symbol: 'none',
          silent: true,
          data: [
            ...costPolicyThresholdLines(data),
            ...policyFireDateMarkers(data, labels),
          ],
        },
      },
      {
        name: translate('Forecast P10'),
        type: 'line',
        data: lo,
        color: c.neutral,
        showSymbol: false,
        lineStyle: { width: 0 },
        stack: 'fan-lo',
      },
      {
        name: translate('Forecast band'),
        type: 'line',
        data: hi.map((v, i) => (v === null ? null : v - (lo[i] || 0))),
        color: c.neutral,
        showSymbol: false,
        lineStyle: { width: 0 },
        stack: 'fan-lo',
        areaStyle: { color: 'rgba(208, 213, 221, 0.25)' },
      },
      {
        name: translate('Forecast P50'),
        type: 'line',
        data: mid,
        color: c.muted,
        smooth: false,
        showSymbol: true,
        symbolSize: 5,
        lineStyle: { width: 2, type: 'dashed' },
      },
    ],
  };
};

interface Props {
  data: PolicyWatchData;
}

export const SpendView: FC<Props> = ({ data }) => {
  const burnDown = useMemo(() => burnDownOptions(data), [data]);
  const forecast = useMemo(() => forecastFanOptions(data), [data]);

  if (data.invoices.length === 0) {
    return (
      <div className="alert alert-info">
        {translate(
          'No invoice history yet — burn-down and forecast charts will appear once cost data is available.',
        )}
      </div>
    );
  }

  return (
    <div className="row g-3">
      {burnDown && (
        <div className="col-lg-6">
          <div className="card card-bordered h-100">
            <div className="card-body p-3">
              <EChart options={burnDown} height="320px" />
              {data.creditTerms?.expectedConsumption ? (
                <small className="text-muted d-block text-center mt-2">
                  {translate(
                    'Projection uses expected_consumption of {amount}/month ({logic}). The dashed line crosses zero on the credit’s end_date if the linear plan stays on track.',
                    {
                      amount: defaultCurrency(
                        data.creditTerms.expectedConsumption,
                      ),
                      logic: data.creditTerms.minimalConsumptionLogic,
                    },
                  )}
                </small>
              ) : (
                data.runway.exhaustionDate && (
                  <small className="text-muted d-block text-center mt-2">
                    {translate(
                      'Balance history reflects credit actually drawn each month. Projected exhaustion: {date} at current daily burn of {burn}/d',
                      {
                        date: data.runway.exhaustionDate,
                        burn: defaultCurrency(
                          data.runway.burnPerDay.toFixed(2),
                        ),
                      },
                    )}
                  </small>
                )
              )}
            </div>
          </div>
        </div>
      )}
      <div className={burnDown ? 'col-lg-6' : 'col-12'}>
        <div className="card card-bordered h-100">
          <div className="card-body p-3">
            <EChart options={forecast} height="320px" />
            <small className="text-muted d-block text-center mt-2">
              {translate(
                'Solid: monthly spend net of credit. Dotted: incurred before credit. Dashed: P50 projection. Shaded band: P10–P90. Horizontal dashed lines: project cost-policy thresholds, labelled with the figure each is enforced against (red = fired, orange = approaching, gray = idle). Organization-wide and single-resource caps are not shown here, because neither is measured against this project-wide series.',
              )}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};
