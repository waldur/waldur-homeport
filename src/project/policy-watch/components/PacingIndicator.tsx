import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { ProgressBar } from '@/core/ProgressBar';
import { translate } from '@/i18n';

import { PacingSnapshot } from '../types';

const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

interface Props {
  pacing: PacingSnapshot;
}

export const PacingIndicator: FC<Props> = ({ pacing }) => {
  const {
    monthlyBudget,
    incurredCost,
    compensationAmount,
    netCost,
    periodFraction,
    spendFraction,
    paceDelta,
    projectedMonthlyCost,
  } = pacing;

  if (monthlyBudget === null || monthlyBudget <= 0 || spendFraction === null) {
    return (
      <div className="alert alert-info py-2 mb-3">
        {translate(
          'Pacing not available — no monthly budget or cost data yet.',
        )}
      </div>
    );
  }

  const isOverPace = (paceDelta ?? 0) > 0.05;
  const isUnderPace = (paceDelta ?? 0) < -0.05;
  const tone = isOverPace ? 'danger' : isUnderPace ? 'success' : 'warning';
  const PaceIcon = isOverPace
    ? ArrowUpIcon
    : isUnderPace
      ? ArrowDownIcon
      : ArrowRightIcon;
  const paceLabel = isOverPace
    ? translate('Over pace')
    : isUnderPace
      ? translate('Under pace')
      : translate('On pace');
  const deltaLabel =
    paceDelta === null ? '' : (paceDelta >= 0 ? '+' : '') + fmtPct(paceDelta);

  const willOverrun = projectedMonthlyCost > monthlyBudget;
  const hasCompensation = compensationAmount > 0;

  return (
    <div className={`card card-bordered mb-3 border-${tone}`}>
      <div className="card-body py-3">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className={`text-${tone}`}>
            {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
            <PaceIcon weight="bold" size={28} />
          </div>
          <div>
            <small className="text-muted d-block">{translate('Pacing')}</small>
            <h5 className="mb-0">{paceLabel}</h5>
            <small className={`text-${tone}`}>{deltaLabel}</small>
          </div>
          <div className="vr d-none d-md-block" />
          <div className="flex-grow-1" style={{ minWidth: 280 }}>
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <small className="text-muted">
                {translate('Incurred: {x}', {
                  x: defaultCurrency(incurredCost),
                })}
              </small>
              {hasCompensation && (
                <small className="text-success">
                  {translate('Compensation: -{x}', {
                    x: defaultCurrency(compensationAmount),
                  })}
                </small>
              )}
              <small className="fw-semibold">
                {translate('Net: {x}', { x: defaultCurrency(netCost) })}
              </small>
              <small className="text-muted">
                {translate('Budget: {x}', {
                  x: defaultCurrency(monthlyBudget),
                })}
              </small>
            </div>
            <ProgressBar
              now={Math.min(spendFraction * 100, 100)}
              max={100}
              variant={tone}
              compact
            />
            <div className="d-flex justify-content-between mt-1">
              <small className="text-muted">
                {translate('{pct} of budget used (net)', {
                  pct: fmtPct(spendFraction),
                })}
              </small>
              <small className="text-muted">
                {translate('{pct} of month elapsed', {
                  pct: fmtPct(periodFraction),
                })}
              </small>
            </div>
          </div>
          <div className="vr d-none d-md-block" />
          <div>
            <small className="text-muted d-block">
              {translate('Projected net month-end')}
            </small>
            <div className={`fw-semibold ${willOverrun ? 'text-danger' : ''}`}>
              {defaultCurrency(projectedMonthlyCost)}
            </div>
            {willOverrun && (
              <small className="text-danger">
                {translate('Overrun by {amount}', {
                  amount: defaultCurrency(projectedMonthlyCost - monthlyBudget),
                })}
              </small>
            )}
          </div>
        </div>
        {hasCompensation && (
          <small className="text-muted d-block mt-2">
            {translate(
              'Cost policy fires on net (incurred − compensation) crossing the budget, matching ProjectEstimatedCostPolicy.is_triggered.',
            )}
          </small>
        )}
      </div>
    </div>
  );
};
