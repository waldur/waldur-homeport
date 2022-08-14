import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

export const LayoutWrapper: FunctionComponent<{ header; body }> = ({
  header,
  body,
}) => (
  <Form.Group>
    <Form.Label>{header}</Form.Label>
    {body}
  </Form.Group>
);
