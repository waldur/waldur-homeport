import { FC } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { CreditTerms } from '../types';

interface Props {
  terms: CreditTerms;
}

// Compact monthly context not already on the pace bar. Expected and minimal
// live on the bar (with the compensation note in a tooltip there); the credit
// end date lives on the lifecycle card.
export const CreditTermsCard: FC<Props> = ({ terms }) => (
  <div className="mt-3">
    <small className="text-muted d-block">{translate('Last month drew')}</small>
    <div className="fw-semibold">
      {defaultCurrency(terms.consumptionLastMonth)}
    </div>
  </div>
);
