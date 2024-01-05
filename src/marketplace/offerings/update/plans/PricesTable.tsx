import { FC } from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { validateNonNegative } from '@waldur/marketplace/common/utils';
import { OfferingComponent, Plan } from '@waldur/marketplace/types';

interface PricesTableProps {
  components: OfferingComponent[];
  plan: Plan;
}

export const PricesTable: FC<PricesTableProps> = (props) => (
  <table className="table table-borderless">
    <thead>
      <tr>
        <th>{translate('Name')}</th>
        <th>{translate('Current month price')}</th>
        <th>{translate('Next month price')}</th>
        <th>{translate('New price')}</th>
        <th>{translate('Units')}</th>
      </tr>
    </thead>
    <tbody>
      {props.components.map((component: OfferingComponent, index) => (
        <tr key={index}>
          <td>
            <div className="form-control-static">{component.name}</div>
          </td>
          <td>{props.plan.prices[component.type]}</td>
          <td>{props.plan.future_prices[component.type]}</td>
          <td>
            <Field
              component="input"
              min={0}
              className="form-control"
              name={`new_prices.${component.type}`}
              type="number"
              validate={validateNonNegative}
              inputMode="numeric"
              step="0.0000001"
            />
          </td>
          <td>
            <div className="form-control-static">{component.measured_unit}</div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
