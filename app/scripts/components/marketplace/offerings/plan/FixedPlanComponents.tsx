import * as React from 'react';
import { Field } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { PlanComponentDescription } from '@waldur/marketplace/types';

export const FixedPlanComponents = withTranslation(props => (
  <table className="table table-borderless">
    <thead>
      <tr>
        <th>{/* Name */}</th>
        <th>{props.translate('Amount')}</th>
        <th>{props.translate('Price')}</th>
        <th>{props.translate('Units')}</th>
      </tr>
    </thead>
    <tbody>
      {props.components.map((component: PlanComponentDescription, index) => (
        <tr key={index}>
          <td>
            <div className="form-control-static">
              {component.name}
            </div>
          </td>
          <td>
            <Field
              component="input"
              min={0}
              className="form-control"
              name={`${props.plan}.fixedComponentQuotas.${component.type}`}
              type="number"
            />
          </td>
          <td>
            <Field
              component="input"
              min={0}
              className="form-control"
              name={`${props.plan}.fixedComponentPrices.${component.type}`}
              type="number"
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
