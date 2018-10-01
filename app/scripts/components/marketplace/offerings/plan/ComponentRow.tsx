import * as React from 'react';

import { Field } from 'redux-form';

export const ComponentRow = props => (
  <tr>
    <td>
      <Field
        component="input"
        className="form-control"
        name={`${props.component}.type`}
        type="text"
      />
    </td>
    <td>
      <Field
        component="input"
        className="form-control"
        name={`${props.component}.name`}
        type="text"
      />
    </td>
    <td>
      <Field
        component="input"
        min={0}
        className="form-control"
        name={`${props.component}.amount`}
        type="number"
      />
    </td>
    <td>
      <Field
        component="input"
        min={0}
        className="form-control"
        name={`${props.component}.price`}
        type="number"
      />
    </td>
    <td>
      <Field
        component="input"
        className="form-control"
        name={`${props.component}.measured_unit`}
        type="text"
      />
    </td>
    <td>
      {props.children}
    </td>
  </tr>
);
