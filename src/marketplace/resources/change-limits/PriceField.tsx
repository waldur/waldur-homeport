import { FunctionComponent } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';

interface PriceFieldProps {
  price: number;
  changedPrice: number;
  /** Period label appended to the formatted price, e.g. " /mo" or " one-time". */
  suffix?: string;
}

export const PriceField: FunctionComponent<PriceFieldProps> = ({
  price,
  changedPrice,
  suffix = '',
}) => (
  <>
    {defaultCurrency(price)}
    {suffix}
    {changedPrice !== 0 && (
      <>
        <br />
        <sub>{defaultCurrency(changedPrice, false, true) + suffix}</sub>
      </>
    )}
  </>
);
