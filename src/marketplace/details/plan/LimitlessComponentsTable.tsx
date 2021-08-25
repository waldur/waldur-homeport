import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { Component } from './types';

export const LimitlessComponentsTable = ({
  components,
}: {
  components: Component[];
}) => {
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, 'marketplace.conceal_prices'),
  );
  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>{translate('Component name')}</th>
          <th>{translate('Unit')}</th>
          {!shouldConcealPrices && (
            <th>
              {translate('Price per unit')}
              <PriceTooltip />
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {components.map((component, index) => (
          <tr key={index}>
            <td>
              <p>{component.name}</p>
            </td>
            <td>
              <p>{component.measured_unit}</p>
            </td>
            {!shouldConcealPrices && (
              <td>
                <p>
                  {formatCurrency(
                    component.price,
                    ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                    4,
                  )}
                </p>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
