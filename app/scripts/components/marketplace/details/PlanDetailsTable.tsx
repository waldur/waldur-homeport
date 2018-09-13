import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { connectPrices } from '@waldur/marketplace/details/utils';

export const PlanDetailsTable = connectPrices(props => props.hasComponents ? (
  <div className="form-group">
    <div className="col-sm-offset-3 col-sm-9">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>{translate('Component name')}</th>
            <th>{translate('Quantity')}</th>
            {props.periods.map((period, index) => (
              <th key={index}>{period}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.components.map((component, index) => (
            <tr key={index}>
              <td>{component.label}</td>
              <td>{component.amount} {component.units}</td>
              {component.prices.map((price, innerIndex) => (
                <td key={innerIndex}>{defaultCurrency(price)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
) : null);
