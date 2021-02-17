import { FunctionComponent } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';

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
      {changedPrice !== 0 ? (
        changedPrice > 0 ? (
          <>+{defaultCurrency(changedPrice)}</>
        ) : (
          <>-{defaultCurrency(-changedPrice)}</>
        )
      ) : null}
    </sub>
  </>
);
