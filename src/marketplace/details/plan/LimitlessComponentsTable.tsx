import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
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
    isVisible(state, MarketplaceFeatures.conceal_prices),
  );
  return (
    <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
      <thead>
        <tr className="text-start text-muted bg-light fw-bolder fs-7 text-uppercase gs-0">
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
