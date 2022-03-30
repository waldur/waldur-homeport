import React from 'react';
import { Form } from 'react-bootstrap';

interface StaticFieldProps {
  label: string;
  value: string;
  labelClass?: string;
  controlClass?: string;
}

export const StaticField: React.FC<StaticFieldProps> = (props) => (
  <Form.Group>
    <Form.Label className={props.labelClass}>{props.label}</Form.Label>
    <div className={props.controlClass}>
      <Form.Control plaintext>{props.value}</Form.Control>
    </div>
  </Form.Group>
);

StaticField.defaultProps = {
  labelClass: 'col-sm-3 col-md-4 col-lg-3',
  controlClass: 'col-sm-9 col-md-8',
};
