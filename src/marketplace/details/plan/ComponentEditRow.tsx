import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Field, WrappedFieldProps } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { getOfferingComponentValidator } from '@waldur/marketplace/offerings/store/limits';

import { ComponentRow, ComponentRow2 } from './ComponentRow';
import { Component, PlanPeriod } from './types';

interface ComponentEditRowProps {
  component: Component;
  hidePrices?: boolean;
  period?: PlanPeriod;
}

const RowWrapper = (
  props: WrappedFieldProps & { offeringComponent: Component },
) => (
  <ComponentRow offeringComponent={props.offeringComponent}>
    {props.offeringComponent.is_boolean ? (
      <AwesomeCheckbox
        label=""
        value={parseInt(props.input.value) === 1}
        onChange={(value) => props.input.onChange(value ? 1 : 0)}
      />
    ) : (
      <Form.Control
        type="number"
        min={props.offeringComponent.min_value || 0}
        max={props.offeringComponent.max_value}
        {...props.input}
      />
    )}
  </ComponentRow>
);

export const ComponentEditRow: React.FC<ComponentEditRowProps> = (props) => (
  <Field
    name={`limits.${props.component.type}`}
    parse={parseIntField}
    format={formatIntField}
    validate={getOfferingComponentValidator(props.component)}
    component={RowWrapper}
    offeringComponent={props.component}
  />
);

const RowWrapper2 = (
  props: WrappedFieldProps & {
    offeringComponent: Component;
    hidePrices?: boolean;
    period?: PlanPeriod;
  },
) => (
  <ComponentRow2
    offeringComponent={props.offeringComponent}
    hidePrices={props.hidePrices}
    period={props.period}
    hasX={!props.offeringComponent.is_boolean}
    className="control"
  >
    {props.offeringComponent.is_boolean ? (
      <AwesomeCheckbox
        label=""
        value={parseInt(props.input.value) === 1}
        onChange={(value) => props.input.onChange(value ? 1 : 0)}
      />
    ) : (
      <InputGroup>
        <Form.Control
          type="number"
          min={props.offeringComponent.min_value || 0}
          max={props.offeringComponent.max_value}
          aria-describedby={`basic-addon-${props.offeringComponent.type}`}
          {...props.input}
        />
        {props.offeringComponent.measured_unit && (
          <InputGroup.Text
            className="text-muted"
            id={`basic-addon-${props.offeringComponent.type}`}
          >
            {props.offeringComponent.measured_unit}
          </InputGroup.Text>
        )}
      </InputGroup>
    )}
  </ComponentRow2>
);

export const ComponentEditRow2: React.FC<ComponentEditRowProps> = (props) => (
  <Field
    name={`limits.${props.component.type}`}
    parse={parseIntField}
    format={formatIntField}
    validate={getOfferingComponentValidator(props.component)}
    component={RowWrapper2}
    offeringComponent={props.component}
    hidePrices={props.hidePrices}
    period={props.period}
  />
);
