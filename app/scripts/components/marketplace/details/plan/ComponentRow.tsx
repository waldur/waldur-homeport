import * as React from 'react';
import { Field } from 'redux-form';

import { defaultCurrency } from '@waldur/core/services';
import { parseIntField, formatIntField } from '@waldur/marketplace/common/utils';

import { Component } from './types';

export const ComponentRow = (props: {component: Component}) => {
  const className = props.component.billing_type === 'fixed' ? undefined : 'form-control-static';
  const field = (props.component.billing_type === 'fixed') ? props.component.amount : (
    <Field
      name={`limits.${props.component.type}`}
      component="input"
      className="form-control"
      type="number"
      min={0}
      parse={parseIntField}
      format={formatIntField}
    />
  );
  return (
    <tr>
      <td>
        <p className={className}>{props.component.label}</p>
      </td>
      <td>{field}</td>
      <td>
        <p className={className}>{props.component.units}</p>
      </td>
      {props.component.prices.map((price, innerIndex) => (
        <td key={innerIndex}>
          <p className={className}>{defaultCurrency(price)}</p>
        </td>
      ))}
    </tr>
  );
};
