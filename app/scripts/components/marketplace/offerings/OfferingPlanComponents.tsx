import * as React from 'react';
import { compose } from 'redux';
import { Field } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { connectPlanComponents } from '@waldur/marketplace/offerings/utils';
import { PlanComponent } from '@waldur/marketplace/types';

const enhance = compose(connectPlanComponents, withTranslation);

export const OfferingPlanComponents = enhance(props => props.components ? (
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
      {props.components.map((component: PlanComponent, index) => (
        <tr key={index}>
          <td>
            <div className="form-control-static">
              {component.label}
            </div>
          </td>
          <td>
            <Field
              component="input"
              min={0}
              className="form-control"
              name={`${props.plan}.components.${component.type}.amount`}
              type="number"
            />
          </td>
          <td>
            <Field
              component="input"
              min={0}
              className="form-control"
              name={`${props.plan}.components.${component.type}.price`}
              type="number"
            />
          </td>
          <td>
            <div className="form-control-static">
              {component.units}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
) : null);
