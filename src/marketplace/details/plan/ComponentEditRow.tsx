import React, { useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { PublicOfferingDetails, Offering } from 'waldur-js-client';

import { Switch } from 'waldur-ui';

import { composeValidators } from '@/core/validators';
import { FieldError } from '@/form';
import {
  formatIntField,
  getLimitParser,
  getLimitStep,
} from '@/marketplace/common/utils';
import { getOfferingComponentValidator } from '@/marketplace/offerings/store/limits';

import { ComponentRow, ComponentRow2 } from './ComponentRow';
import {
  getLimitErrorId,
  getLimitFieldError,
  MeasuredUnitInput,
} from './MeasuredUnitInput';
import { Component, PlanPeriod } from './types';

interface ComponentEditRowProps {
  component: Component;
  hidePrices?: boolean;
  period?: PlanPeriod;
  activePriceIndex?: number;
  offering?: PublicOfferingDetails | Offering;
}

const RowWrapper = (
  props: any & {
    offeringComponent: Component;
    concealBillingInfo?: boolean;
  },
) => {
  const error = getLimitFieldError(props.meta);
  return (
    <ComponentRow
      offeringComponent={props.offeringComponent}
      hidePrices={props.concealBillingInfo}
    >
      {props.offeringComponent.is_boolean ? (
        <Switch
          label=""
          checked={parseInt(props.input.value) === 1}
          onCheckedChange={(value) => props.input.onChange(value ? 1 : 0)}
        />
      ) : (
        <>
          <Form.Control
            type="number"
            step={getLimitStep(props.offeringComponent)}
            min={props.offeringComponent.min_value || 0}
            max={props.offeringComponent.max_value}
            isInvalid={Boolean(error)}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? getLimitErrorId(props.offeringComponent) : undefined
            }
            {...props.input}
          />
          <FieldError
            id={getLimitErrorId(props.offeringComponent)}
            error={error}
          />
        </>
      )}
    </ComponentRow>
  );
};

export const ComponentEditRow: React.FC<ComponentEditRowProps> = (props) => {
  const validate = useMemo(
    () => getOfferingComponentValidator(props.component),
    [props.component.min_value, props.component.max_value],
  );
  const validateValue = composeValidators(...validate);

  return (
    <Field
      name={`limits.${props.component.type}`}
      parse={getLimitParser(props.component)}
      format={formatIntField}
      validate={validateValue}
      component={RowWrapper}
      offeringComponent={props.component}
      offering={props.offering}
    />
  );
};

const RowWrapper2 = (
  props: any & {
    offeringComponent: Component;
    hidePrices?: boolean;
    period?: PlanPeriod;
    activePriceIndex?: number;
    offering: PublicOfferingDetails | Offering;
  },
) => (
  <ComponentRow2
    offeringComponent={props.offeringComponent}
    hidePrices={props.hidePrices}
    period={props.period}
    activePriceIndex={props.activePriceIndex}
    className="control"
  >
    {props.offeringComponent.is_boolean ? (
      <Switch
        label=""
        checked={parseInt(props.input.value) === 1}
        onCheckedChange={(value) => props.input.onChange(value ? 1 : 0)}
      />
    ) : (
      <MeasuredUnitInput
        id={`limit-${props.offeringComponent.type}`}
        input={props.input}
        meta={props.meta}
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
  const validateValue = composeValidators(...validate);

  return (
    <Field
      name={`limits.${props.component.type}`}
      parse={getLimitParser(props.component)}
      format={formatIntField}
      validate={validateValue}
      component={RowWrapper2}
      offeringComponent={props.component}
      hidePrices={props.hidePrices}
      period={props.period}
      activePriceIndex={props.activePriceIndex}
      offering={props.offering}
    />
  );
};
