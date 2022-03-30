import React from 'react';
import { Form } from 'react-bootstrap';

export const OrderItemDetailsSection: React.FC = (props) => (
  <Form.Control plaintext>
    <strong>{props.children}</strong>
  </Form.Control>
);
