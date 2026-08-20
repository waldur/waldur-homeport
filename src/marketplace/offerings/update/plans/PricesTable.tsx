import { FC } from 'react';
import { Field } from 'react-final-form';
import {
  OfferingComponent,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { composeValidators, required } from '@/core/validators';
import { translate } from '@/i18n';
import { validateNonNegative } from '@/marketplace/common/utils';

interface PricesTableProps {
  components: OfferingComponent[];
  plan: Plan;
}

const parseInput = (value) => {
  if (value === '' || value === undefined || value === null) return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? value : num;
};

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
              // An omitted component is priced at 0 by the backend, so a blank
              // field must block submission instead of silently zeroing.
              validate={composeValidators(required, validateNonNegative)}
              parse={parseInput}
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
