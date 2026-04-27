import { FunctionComponent } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { PriceTooltip } from '@/price/PriceTooltip';

interface TotalCostFieldProps {
  total: number;
}

export const TotalCostField: FunctionComponent<TotalCostFieldProps> = (
  props,
) => (
  <div className="text-right">
    {translate('Total cost:')}
    <PriceTooltip /> {defaultCurrency(props.total)}
  </div>
);
