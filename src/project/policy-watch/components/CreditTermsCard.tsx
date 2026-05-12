import {
  CalendarBlankIcon,
  GaugeIcon,
  InfoIcon,
  ShieldIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { CreditTerms } from '../types';

interface Props {
  terms: CreditTerms;
}

export const CreditTermsCard: FC<Props> = ({ terms }) => {
  const {
    expectedConsumption,
    minimalConsumption,
    minimalConsumptionLogic,
    graceCoefficient,
    applyAsMinimalConsumption,
    endDate,
    daysUntilEndDate,
    consumptionLastMonth,
  } = terms;

  const isLinear = (minimalConsumptionLogic || '').toLowerCase() === 'linear';
  const expiringSoon = daysUntilEndDate !== null && daysUntilEndDate < 31;

  return (
    <div className="card card-bordered mb-3">
      <div className="card-body py-3">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="text-muted">
            <GaugeIcon weight="bold" size={28} />
          </div>
          <div>
            <small className="text-muted d-block">
              {translate('Expected monthly consumption')}
            </small>
            <div className="fw-semibold">
              {defaultCurrency(expectedConsumption)}
              <small className="text-muted ms-1">
                {isLinear ? translate('(linear)') : translate('(fixed)')}
              </small>
            </div>
          </div>
          {applyAsMinimalConsumption && minimalConsumption > 0 && (
            <>
              <div className="vr d-none d-md-block" />
              <div>
                <div className="d-flex align-items-center gap-1">
                  <ShieldIcon weight="bold" className="text-warning" />
                  <small className="text-muted">
                    {translate('Minimum monthly draw')}
                  </small>
                </div>
                <div className="fw-semibold text-warning">
                  {defaultCurrency(minimalConsumption)}
                </div>
                {graceCoefficient > 0 && (
                  <small className="text-muted">
                    {translate('grace {grace}%', { grace: graceCoefficient })}
                  </small>
                )}
              </div>
            </>
          )}
          <div className="vr d-none d-md-block" />
          <div>
            <small className="text-muted d-block">
              {translate('Last month drew')}
            </small>
            <div className="fw-semibold">
              {defaultCurrency(consumptionLastMonth)}
            </div>
          </div>
          {endDate && (
            <>
              <div className="vr d-none d-md-block" />
              <div>
                <div className="d-flex align-items-center gap-1">
                  <CalendarBlankIcon
                    weight="bold"
                    className={expiringSoon ? 'text-danger' : 'text-muted'}
                  />
                  <small className="text-muted">{translate('Expires')}</small>
                </div>
                <div
                  className={`fw-semibold ${expiringSoon ? 'text-danger' : ''}`}
                >
                  {formatDate(endDate)}
                </div>
                {daysUntilEndDate !== null && (
                  <small
                    className={expiringSoon ? 'text-danger' : 'text-muted'}
                  >
                    {translate('in {days} days', { days: daysUntilEndDate })}
                  </small>
                )}
              </div>
            </>
          )}
          {applyAsMinimalConsumption && minimalConsumption > 0 && (
            <div className="w-100">
              <small className="text-muted d-flex align-items-start gap-2 mt-2">
                <InfoIcon weight="bold" className="flex-shrink-0 mt-1" />
                <span>
                  {translate(
                    'Credit is debited at least {min} per month even if actual cost is lower. The shortfall is silently drawn from the credit pool — it does not appear as an invoice item.',
                    { min: defaultCurrency(minimalConsumption) },
                  )}
                </span>
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
