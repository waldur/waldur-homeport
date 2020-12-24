import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { Component } from './types';

export const LimitlessComponentsTable = ({
  components,
}: {
  components: Component[];
}) => (
  <table className="table table-bordered">
    <thead>
      <tr>
        <th>{translate('Component name')}</th>
        <th>{translate('Unit')}</th>
        <th>
          {translate('Price per unit')}
          <PriceTooltip />
        </th>
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
          <td>
            <p>{formatCurrency(component.price, ENV.currency, 4)}</p>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
