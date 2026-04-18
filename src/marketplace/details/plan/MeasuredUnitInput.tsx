import { Form, InputGroup } from 'react-bootstrap';
import { PublicOfferingDetails } from 'waldur-js-client';

import { Component } from './types';

export const MeasuredUnitInput = ({
  input,
  component,
}: {
  input: any;
  component: Component;
  offering?: PublicOfferingDetails;
}) => (
  <InputGroup className="mw-200px">
    <Form.Control
      name={input.name}
      type="number"
      min={component.min_value || 0}
      max={component.max_value}
      aria-describedby={`basic-addon-${component.type}`}
      value={input.value}
      onChange={(e: any) => input.onChange(e.target.value)}
    />

    {component.measured_unit && (
      <InputGroup.Text
        className="text-muted"
        id={`basic-addon-${component.type}`}
      >
        {component.measured_unit}
      </InputGroup.Text>
    )}
  </InputGroup>
);
