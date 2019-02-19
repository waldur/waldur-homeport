import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

interface PlanComponentsProps extends TranslateProps {
  components: OfferingComponent[];
  plan: string;
}

export const PlanComponents = withTranslation((props: PlanComponentsProps) => (
  <table className="table table-borderless">
    <thead>
      <tr>
        <th>{/* Name */}</th>
        <th>
          {props.translate('Amount')}
          {' '}
          <span className="text-danger"> *</span>
        </th>
        <th>
          {props.translate('Price')}
          {' '}
          <span className="text-danger"> *</span>
        </th>
        <th>{props.translate('Units')}</th>
      </tr>
    </thead>
    <tbody>
      {props.components.map((component: OfferingComponent, index) => (
        <tr key={index}>
          <td>
            <div className="form-control-static">
              {component.name}
            </div>
          </td>
          <td>
            {component.billing_type === 'fixed' ? (
              <Field
                component="input"
                min={0}
                className="form-control"
                name={`${props.plan}.quotas.${component.type}`}
                type="number"
                validate={required}
              />
            ) : (
              <div className="form-control-static">
                &mdash;
              </div>
            )}
          </td>
          <td>
            <Field
              component="input"
              min={0}
              className="form-control"
              name={`${props.plan}.prices.${component.type}`}
              type="number"
              validate={required}
            />
          </td>
          <td>
            <div className="form-control-static">
              {component.measured_unit}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
));
