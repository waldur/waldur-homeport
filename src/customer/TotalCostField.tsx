import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

interface TotalCostFieldProps {
  total: number;
}

export const TotalCostField = (props: TotalCostFieldProps) => (
  <div className="text-right">
    {translate('Total cost:')}
    <PriceTooltip />
    {' '}
    {defaultCurrency(props.total)}
  </div>
);
