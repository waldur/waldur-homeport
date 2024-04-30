import React from 'react';
import { Form } from 'react-bootstrap';

interface StaticFieldProps {
  label: string;
  value: string;
  labelClass?: string;
  controlClass?: string;
}

export const StaticField: React.FC<StaticFieldProps> = ({
  label,
  value,
  labelClass = 'col-sm-3 col-md-4 col-lg-3',
  controlClass = 'col-sm-9 col-md-8',
}) => (
  <Form.Group>
    <Form.Label className={labelClass}>{label}</Form.Label>
    <div className={controlClass}>
      <p>{value}</p>
    </div>
  </Form.Group>
);
