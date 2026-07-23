import { FC, useMemo } from 'react';

import { ENV } from '@/core/config';
import { EChart } from '@/core/EChart';
import { defaultCurrency } from '@/core/formatCurrency';
import { generateBrandColors } from '@/core/generateColors';
import { ProgressBar } from '@/core/ProgressBar';
import { getBrandColor } from '@/core/utils';
import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import type { Column } from '@/table/types';

import { getWatchColors } from '../chartColors';
import { BreakdownBucket, PolicyWatchData } from '../types';

const currency = () => ENV.plugins.WALDUR_CORE.CURRENCY_NAME;

const TOP_N = 12;

const buildOptions = (
  rows: BreakdownBucket[],
  total: number,
  color: string,
): any => {
  const top = rows.slice(0, TOP_N);
  const labels = top.map((r) => r.label).reverse();
  const values = top.map((r) => r.cost).reverse();
  return {
    grid: { left: 220, right: 40, top: 10, bottom: 20 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (v: number) =>
        `${defaultCurrency(v)} (${total > 0 ? ((v / total) * 100).toFixed(1) : '0'}%)`,
    },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => defaultCurrency(v) },
      name: translate('Cost ({currency})', { currency: currency() }),
    },
    yAxis: {
      type: 'category',
      data: labels,
      axisLabel: { width: 200, overflow: 'truncate', interval: 0 },
    },
    series: [
      {
        type: 'bar',
        data: values,
        color,
        label: {
          show: true,
          position: 'right',
          formatter: (p: any) => defaultCurrency(p.value),
        },
        barMaxWidth: 22,
      },
    ],
  };
};

interface SummaryProps {
  incurred: number;
  compensation: number;
  net: number;
}

const TotalsHeader: FC<SummaryProps> = ({ incurred, compensation, net }) => (
  <div className="d-flex flex-wrap align-items-baseline gap-4 mb-3">
    <div>
      <small className="text-muted d-block">{translate('Incurred')}</small>
      <strong>{defaultCurrency(incurred)}</strong>
    </div>
    {compensation > 0 && (
      <>
        <div className="text-muted">−</div>
        <div>
          <small className="text-muted d-block">
            {translate('Compensation (credit)')}
          </small>
          <strong className="text-success">
            {defaultCurrency(compensation)}
          </strong>
        </div>
        <div className="text-muted">=</div>
      </>
    )}
    <div>
      <small className="text-muted d-block">{translate('Net')}</small>
      <strong>{defaultCurrency(net)}</strong>
    </div>
  </div>
);

const BreakdownPanel: FC<{
  title: string;
  rows: BreakdownBucket[];
  total: number;
  color: string;
}> = ({ title, rows, total, color }) => {
  const options = useMemo(
    () => buildOptions(rows, total, color),
    [rows, total, color],
  );
  if (rows.length === 0) return null;
  const tableRows = rows.slice(0, TOP_N);
  const columns: Column<BreakdownBucket>[] = [
    {
      title: translate('Line item'),
      render: ({ row }) => <>{row.label}</>,
    },
    {
      title: translate('Cost'),
      className: 'text-end',
      render: ({ row }) => <>{defaultCurrency(row.cost)}</>,
    },
    {
      title: translate('Share'),
      width: '180px',
      render: ({ row }) => (
        <>
          <ProgressBar
            now={total > 0 ? (row.cost / total) * 100 : 0}
            max={100}
            variant="primary"
            compact
          />
          <small className="text-muted">
            {total > 0 ? `${((row.cost / total) * 100).toFixed(1)}%` : '—'}
          </small>
        </>
      ),
    },
  ];

  return (
    <div className="card card-bordered mb-3">
      <div className="card-body p-3">
        <h6 className="mb-3">{title}</h6>
        <div className="row g-3">
          <div className="col-lg-7">
            <EChart
              options={options}
              height={`${Math.max(220, tableRows.length * 32 + 60)}px`}
            />
            {rows.length > TOP_N && (
              <small className="text-muted d-block text-center mt-2">
                {translate('Showing top {n} of {total} line items.', {
                  n: TOP_N,
                  total: rows.length,
                })}
              </small>
            )}
          </div>
          <div className="col-lg-5">
            <SimpleTable columns={columns} rows={tableRows} rowKey="label" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface Props {
  data: PolicyWatchData;
}

export const BreakdownView: FC<Props> = ({ data }) => {
  const brand = getBrandColor();
  const brandColors = generateBrandColors(brand);

  const incurred = data.pacing.incurredCost;
  const compensation = data.pacing.compensationAmount;
  const net = data.pacing.netCost;

  if (
    data.breakdownCharges.length === 0 &&
    data.breakdownCompensations.length === 0
  ) {
    return (
      <div className="alert alert-info">
        {translate(
          'No current-month spend recorded yet. Once invoice items are created this month, the breakdown will appear here.',
        )}
      </div>
    );
  }

  return (
    <>
      <TotalsHeader incurred={incurred} compensation={compensation} net={net} />
      <BreakdownPanel
        title={translate('Charges')}
        rows={data.breakdownCharges}
        total={incurred}
        color={brandColors[400]}
      />
      {data.breakdownCompensations.length > 0 && (
        <BreakdownPanel
          title={translate('Compensations (credit applied)')}
          rows={data.breakdownCompensations}
          total={compensation}
          color={getWatchColors().success}
        />
      )}
    </>
  );
};
