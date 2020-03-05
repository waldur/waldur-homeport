import * as React from 'react';
import { Field } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import {
  validateNonNegative,
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

interface PlanComponentsProps extends TranslateProps {
  archived: boolean;
  components: OfferingComponent[];
  limits: string[];
}

const numberValidators = validateNonNegative;

export const PlanComponents = withTranslation((props: PlanComponentsProps) => (
  <table className="table table-borderless">
    <thead>
      <tr>
        <th>{/* Name */}</th>
        <th>{props.translate('Amount')}</th>
        <th>
          {props.translate('Price')} <span className="text-danger"> *</span>
        </th>
        <th>{props.translate('Units')}</th>
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
                validate={props.archived ? undefined : numberValidators}
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
              validate={props.archived ? undefined : numberValidators}
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
));
