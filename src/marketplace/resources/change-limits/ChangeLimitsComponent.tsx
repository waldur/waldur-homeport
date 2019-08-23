import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FetchedData } from './utils';

export const ChangeLimitsComponent = (props: FetchedData) => (
  <div>
    {props.resource.plan_name ? (
      <p>
        <strong>{translate('Current plan')}</strong>:{' '}
        {props.resource.plan_name}
      </p>
    ) : (
      <p>{translate('Resource does not have any plan.')}</p>
    )}
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>{translate('Name')}</th>
          <th>{translate('Usage')}</th>
          <th>{translate('Old limit')}</th>
          <th>{translate('New limit')}</th>
        </tr>
      </thead>
      <tbody>
        {props.offering.components.map((component, index) => (
          <tr key={index}>
            <td>{component.name}</td>
            <td>{props.resource.current_usages[component.type]}</td>
            <td>{props.resource.limits[component.type]}</td>
            <td>
            <div className="input-group">
              <Field
                name={`limits.${component.type}`}
                component="input"
                className="form-control"
                type="number"
              />
              <span className="input-group-addon">
                {component.measured_unit}
              </span>
            </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
