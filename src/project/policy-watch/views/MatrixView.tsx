import { FC } from 'react';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { ProgressBar } from '@/core/ProgressBar';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import type { Column } from '@/table/types';

import { PolicySaturation, PolicyWatchData } from '../types';

type StatusKind = { label: string; variant: 'success' | 'warning' | 'danger' };

const statusFor = (p: PolicySaturation): StatusKind => {
  if (p.hasFired) return { label: translate('Fired'), variant: 'danger' };
  if (p.saturationPct >= 80)
    return { label: translate('Approaching'), variant: 'warning' };
  return { label: translate('Idle'), variant: 'success' };
};

const formatThreshold = (p: PolicySaturation): string => {
  if (p.policyKind === 'project-cost' || p.policyKind === 'customer-cost') {
    return defaultCurrency(p.thresholdValue);
  }
  return `${p.thresholdValue.toFixed(0)} ${translate('units')}`;
};

const formatCurrent = (p: PolicySaturation): string => {
  if (p.policyKind === 'project-cost' || p.policyKind === 'customer-cost') {
    return defaultCurrency(p.currentValue);
  }
  return p.currentValue.toFixed(0);
};

const saturationVariant = (
  pct: number,
): 'success' | 'warning' | 'danger' | undefined => {
  if (pct >= 100) return 'danger';
  if (pct >= 80) return 'warning';
  return 'success';
};

const COLUMNS: Column<PolicySaturation>[] = [
  {
    title: translate('Policy'),
    render: ({ row }) => (
      <>
        <div className="fw-semibold">{row.thresholdLabel}</div>
        <small className="text-muted">{row.policyKind}</small>
      </>
    ),
  },
  {
    title: translate('Scope'),
    render: ({ row }) => <>{row.scopeName}</>,
  },
  {
    title: translate('Threshold'),
    className: 'text-end',
    render: ({ row }) => <>{formatThreshold(row)}</>,
  },
  {
    title: translate('Current'),
    className: 'text-end',
    render: ({ row }) => <>{formatCurrent(row)}</>,
  },
  {
    title: translate('Saturation'),
    width: '180px',
    render: ({ row }) => (
      <>
        <ProgressBar
          now={Math.min(Math.max(row.saturationPct, 0), 100)}
          max={100}
          variant={saturationVariant(row.saturationPct)}
          compact
        />
        <small className="text-muted">{row.saturationPct.toFixed(1)}%</small>
      </>
    ),
  },
  {
    title: translate('Action'),
    render: ({ row }) => <small>{row.actionLabel}</small>,
  },
  {
    title: translate('ETA'),
    render: ({ row }) => {
      if (row.etaDays === 0) {
        return <small className="text-danger">{translate('Reached')}</small>;
      }
      if (row.etaDate && row.etaDays !== null && row.etaDays > 0) {
        return (
          <>
            <div>{formatDate(row.etaDate)}</div>
            <small className="text-muted">
              {translate('in ~{days}d', { days: row.etaDays })}
            </small>
          </>
        );
      }
      return <small className="text-muted">—</small>;
    },
  },
  {
    title: translate('Status'),
    render: ({ row }) => {
      const s = statusFor(row);
      return (
        <>
          <StateIndicator label={s.label} variant={s.variant} pill outline />
          {row.hasFired && row.affectedResourcesCount > 0 && (
            <div>
              <small className="text-muted">
                {translate('{n} resources affected', {
                  n: row.affectedResourcesCount,
                })}
              </small>
            </div>
          )}
        </>
      );
    },
  },
];

interface Props {
  data: PolicyWatchData;
}

export const MatrixView: FC<Props> = ({ data }) => {
  if (data.policies.length === 0) {
    return (
      <div className="alert alert-info">
        {translate('No cost or SLURM usage policies are configured.')}
      </div>
    );
  }

  const sorted = [...data.policies].sort((a, b) => {
    if (a.hasFired !== b.hasFired) return a.hasFired ? -1 : 1;
    return b.saturationPct - a.saturationPct;
  });

  return <SimpleTable columns={COLUMNS} rows={sorted} rowKey="policyUuid" />;
};
