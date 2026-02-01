import React, { useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { Field, WrappedFieldProps } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { getOfferingComponentValidator } from '@waldur/marketplace/offerings/store/limits';

import { ComponentRow, ComponentRow2 } from './ComponentRow';
import { MeasuredUnitInput } from './MeasuredUnitInput';
import { Component, PlanPeriod } from './types';

interface ComponentEditRowProps {
  component: Component;
  hidePrices?: boolean;
  period?: PlanPeriod;
  activePriceIndex?: number;
}

const RowWrapper = (
  props: WrappedFieldProps & {
    offeringComponent: Component;
    concealBillingInfo?: boolean;
  },
) => (
  <ComponentRow
    offeringComponent={props.offeringComponent}
    hidePrices={props.concealBillingInfo}
  >
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

export const ComponentEditRow: React.FC<ComponentEditRowProps> = (props) => {
  const validate = useMemo(
    () => getOfferingComponentValidator(props.component),
    [props.component.min_value, props.component.max_value],
  );
  return (
    <Field
      name={`limits.${props.component.type}`}
      parse={parseIntField}
      format={formatIntField}
      validate={validate}
      component={RowWrapper}
      offeringComponent={props.component}
    />
  );
};

const RowWrapper2 = (
  props: WrappedFieldProps & {
    offeringComponent: Component;
    hidePrices?: boolean;
    period?: PlanPeriod;
    activePriceIndex?: number;
  },
) => (
  <ComponentRow2
    offeringComponent={props.offeringComponent}
    hidePrices={props.hidePrices}
    period={props.period}
    activePriceIndex={props.activePriceIndex}
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
      <MeasuredUnitInput
        input={props.input}
        component={props.offeringComponent}
      />
    )}
  </ComponentRow2>
);

export const ComponentEditRow2: React.FC<ComponentEditRowProps> = (props) => {
  const validate = useMemo(
    () => getOfferingComponentValidator(props.component),
    [props.component.min_value, props.component.max_value],
  );
  return (
    <Field
      name={`limits.${props.component.type}`}
      parse={parseIntField}
      format={formatIntField}
      validate={validate}
      component={RowWrapper2}
      offeringComponent={props.component}
      hidePrices={props.hidePrices}
      period={props.period}
      activePriceIndex={props.activePriceIndex}
    />
  );
};
