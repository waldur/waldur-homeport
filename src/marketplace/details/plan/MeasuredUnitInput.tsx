import { Form, InputGroup } from 'react-bootstrap';
import { FieldMetaState } from 'react-final-form';
import { PublicOfferingDetails, Offering } from 'waldur-js-client';

import { FieldError } from '@/form';
import { getLimitStep } from '@/marketplace/common/utils';

import { Component } from './types';

// Shown on first change, not only on blur: the form disables Next as you type.
export const getLimitFieldError = (meta?: FieldMetaState<any>) =>
  meta && (meta.modified || meta.touched) ? meta.error : undefined;

export const getLimitErrorId = (component: Pick<Component, 'type'>) =>
  `limit-${component.type}-error`;

export const MeasuredUnitInput = ({
  id,
  input,
  meta,
  component,
}: {
  id?: string;
  input: any;
  meta?: FieldMetaState<any>;
  component: Component;
  offering?: PublicOfferingDetails | Offering;
}) => {
  const error = getLimitFieldError(meta);
  const unitId = component.measured_unit
    ? `basic-addon-${component.type}`
    : undefined;
  const describedBy =
    [unitId, error && getLimitErrorId(component)].filter(Boolean).join(' ') ||
    undefined;
  return (
    <div>
      <InputGroup className="mw-200px">
        <Form.Control
          id={id}
          name={input.name}
          type="number"
          step={getLimitStep(component)}
          min={component.min_value || 0}
          max={component.max_value}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          isInvalid={Boolean(error)}
          value={input.value}
          onChange={(e: any) => input.onChange(e.target.value)}
          onBlur={input.onBlur}
          onFocus={input.onFocus}
        />

        {component.measured_unit && (
          <InputGroup.Text className="text-muted" id={unitId}>
            {component.measured_unit}
          </InputGroup.Text>
        )}
      </InputGroup>
      <FieldError id={getLimitErrorId(component)} error={error} />
    </div>
  );
};
