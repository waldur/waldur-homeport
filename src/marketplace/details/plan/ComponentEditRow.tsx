import React from 'react';
import { Field, WrappedFieldProps } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
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

const RowWrapper = (
  props: WrappedFieldProps & { offeringComponent: Component },
) => (
  <ComponentRow
    offeringComponent={props.offeringComponent}
    className={props.meta.error ? 'form-group has-error' : 'form-group'}
  >
    {props.offeringComponent.is_boolean ? (
      <AwesomeCheckbox
        label=""
        value={parseInt(props.input.value) === 1}
        onChange={(value) => props.input.onChange(value ? 1 : 0)}
      />
    ) : (
      <input
        className="form-control"
        type="number"
        min={props.offeringComponent.min_value || 0}
        max={props.offeringComponent.max_value}
        {...props.input}
      />
    )}
  </ComponentRow>
);

export const ComponentEditRow: React.FC<Props> = (props) => (
  <Field
    name={`limits.${props.component.type}`}
    parse={parseIntField}
    format={formatIntField}
    validate={getOfferingComponentValidator(props.component)}
    component={RowWrapper}
    offeringComponent={props.component}
  />
);
