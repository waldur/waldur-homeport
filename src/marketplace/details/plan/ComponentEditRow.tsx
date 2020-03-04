import * as React from 'react';
import { Field } from 'redux-form';

import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { getOfferingComponentValidator } from '@waldur/marketplace/offerings/store/limits';

import { ComponentRow } from './ComponentRow';
import { Component } from './types';

interface Props {
  component: Component;
}

const RowWrapper = props => (
  <ComponentRow
    offeringComponent={props.offeringComponent}
    className={props.meta.error ? 'form-group has-error' : 'form-group'}
  >
    <input
      className="form-control"
      type="number"
      min={props.offeringComponent.min_value || 0}
      max={props.offeringComponent.max_value}
      {...props.input}
    />
  </ComponentRow>
);

export const ComponentEditRow: React.FC<Props> = props => (
  <Field
    name={`limits.${props.component.type}`}
    parse={parseIntField}
    format={formatIntField}
    validate={getOfferingComponentValidator(props.component)}
    component={RowWrapper}
    offeringComponent={props.component}
  />
);
