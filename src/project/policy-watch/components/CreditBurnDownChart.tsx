import { QuestionIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';

import { ENV } from '@/core/config';
import { EChart } from '@/core/EChart';
import { defaultCurrency } from '@/core/formatCurrency';
import { generateBrandColors } from '@/core/generateColors';
import { Tip } from '@/core/Tooltip';
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

interface Props {
  data: PolicyWatchData;
}

/**
 * Balance over time with the projected exhaustion line and the dates policies
 * are expected to fire. It lives inside the credit card because it is the same
 * balance the figures above it describe — the dates on its x-axis are the ones
 * listed in "What happens next".
 */
export const CreditBurnDownChart: FC<Props> = ({ data }) => {
  const burnDown = useMemo(() => burnDownOptions(data), [data]);

  if (!burnDown || data.invoices.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <ChartBlock
        title={translate('Balance over time')}
        hint={
          data.creditTerms?.expectedConsumption
            ? translate(
                'Projection uses expected_consumption of {amount}/month ({logic}). The dashed line crosses zero on the credit’s end_date if the linear plan stays on track.',
                {
                  amount: defaultCurrency(data.creditTerms.expectedConsumption),
                  logic: data.creditTerms.minimalConsumptionLogic,
                },
              )
            : data.runway.exhaustionDate
              ? translate(
                  'Balance history reflects credit actually drawn each month. Projected exhaustion: {date} at current daily burn of {burn}/d',
                  {
                    date: data.runway.exhaustionDate,
                    burn: defaultCurrency(data.runway.burnPerDay.toFixed(2)),
                  },
                )
              : undefined
        }
        id="spend-burndown"
        options={burnDown}
      />
    </div>
  );
};

/**
 * A titled chart inside the section card. The title sits in markup rather than
 * in the ECharts options so it picks up theme typography, and the explanation
 * rides on an info tip instead of a paragraph of fine print under the canvas.
 */
const ChartBlock: FC<{
  title: string;
  hint?: string;
  id: string;
  options: any;
}> = ({ title, hint, id, options }) => (
  <>
    <div className="d-flex align-items-center gap-2 mb-2">
      <h5 className="mb-0">{title}</h5>
      {hint && (
        <Tip id={id} label={hint}>
          <QuestionIcon weight="bold" />
        </Tip>
      )}
    </div>
    <EChart options={options} height="320px" />
  </>
);
