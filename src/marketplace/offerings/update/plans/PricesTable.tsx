import { FC } from 'react';
import { Field } from 'react-final-form';

import { translate } from '@/i18n';
import { validateNonNegative } from '@/marketplace/common/utils';
import { OfferingComponent, Plan } from '@/marketplace/types';

interface PricesTableProps {
  components: OfferingComponent[];
  plan: Plan;
}

const formatPrice = (value) => {
  if (value === undefined || value === null || value === '') return '0';
  const num = parseFloat(value);
  return isNaN(num) ? String(value) : String(num);
};

export const PricesTable: FC<PricesTableProps> = (props) => (
  <table className="table table-borderless">
    <thead>
      <tr>
        <th>{translate('Name')}</th>
        <th>{translate('Current price')}</th>
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
          <td>{formatPrice(props.plan.prices[component.type])}</td>
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
