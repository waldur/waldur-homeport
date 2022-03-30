import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import {
  validateNonNegative,
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

interface PlanComponentsProps {
  archived: boolean;
  components: OfferingComponent[];
  limits: string[];
}

export const PlanComponents = (props: PlanComponentsProps) => (
  <table className="table table-borderless">
    <thead>
      <tr>
        <th>{/* Name */}</th>
        <th>{translate('Amount')}</th>
        <th>
          {translate('Price')} <span className="text-danger"> *</span>
        </th>
        <th>{translate('Units')}</th>
      </tr>
    </thead>
    <tbody>
      {props.components.map((component: OfferingComponent, index) => (
        <tr key={index}>
          <td>
            <div className="form-control-static">{component.name}</div>
          </td>
          <td>
            {component.billing_type === 'fixed' &&
            !props.limits.includes(component.type) ? (
              <Field
                component="input"
                min={0}
                className="form-control"
                name={`quotas.${component.type}`}
                type="number"
                validate={props.archived ? undefined : validateNonNegative}
                inputMode="numeric"
                parse={parseIntField}
                format={formatIntField}
              />
            ) : (
              <div className="form-control-static">&mdash;</div>
            )}
          </td>
          <td>
            <Field
              component="input"
              min={0}
              className="form-control"
              name={`prices.${component.type}`}
              type="number"
              validate={props.archived ? undefined : validateNonNegative}
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
