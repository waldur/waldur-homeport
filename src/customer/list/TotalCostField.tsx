import { FunctionComponent } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

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
