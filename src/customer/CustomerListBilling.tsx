import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { TranslateProps } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

interface CustomerListBillingProps extends TranslateProps {
  total: number;
}
export const CustomerListBilling = (props: CustomerListBillingProps) => {
  return (
    <div className="text-right">
      {props.translate('Total cost:')}
      <PriceTooltip />
      {' '}
      {defaultCurrency(props.total)}
    </div>
  );
};
