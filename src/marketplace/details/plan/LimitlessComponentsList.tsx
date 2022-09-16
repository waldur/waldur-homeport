import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { Component } from './types';

export const LimitlessComponentsList = ({
  components,
}: {
  components: Component[];
}) => {
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, 'marketplace.conceal_prices'),
  );
  return (
    <>
      {components.map((component, index) => (
        <div key={index}>
          {component.name}:{' '}
          <span className="fw-bold">
            {!shouldConcealPrices &&
              formatCurrency(
                component.price,
                ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                4,
              )}
          </span>
        </div>
      ))}
    </>
  );
};
