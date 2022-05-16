import { FunctionComponent } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

interface StaticFieldProps {
  label: string;
  value: string;
}

export const StaticField: FunctionComponent<StaticFieldProps> = (props) => (
  <Form.Group as={Row} className="mb-8">
    <Form.Label column sm={3} md={4}>
      {props.label}
    </Form.Label>
    <Col sm={9} md={8}>
      <p>{props.value}</p>
    </Col>
  </Form.Group>
);
