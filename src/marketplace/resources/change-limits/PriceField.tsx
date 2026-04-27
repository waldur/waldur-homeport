import { FunctionComponent } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';

interface PriceFieldProps {
  price: number;
  changedPrice: number;
}

export const PriceField: FunctionComponent<PriceFieldProps> = ({
  price,
  changedPrice,
}) => (
  <>
    {defaultCurrency(price)}
    <br />
    <sub>
      {changedPrice !== 0 ? defaultCurrency(changedPrice, false, true) : null}
    </sub>
  </>
);
