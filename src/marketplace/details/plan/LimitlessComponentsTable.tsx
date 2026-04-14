import { ENV } from '@waldur/core/config';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { Component } from './types';

export const LimitlessComponentsTable = ({
  components,
  concealBillingInfo,
}: {
  components: Component[];
  concealBillingInfo?: boolean;
}) => {
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) || concealBillingInfo;
  return (
    <table className="table align-middle table-row-bordered fs-6 gy-4 no-footer">
      <thead>
        <tr className="align-middle">
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
