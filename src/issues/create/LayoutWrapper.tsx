import { FunctionComponent } from 'react';
import { Col, Form } from 'react-bootstrap';

export const LayoutWrapper: FunctionComponent<{ layout; header; body }> = ({
  layout,
  header,
  body,
}) =>
  layout === 'horizontal' ? (
    <Form.Group>
      <Col sm={3} as={Form.Label}>
        {header}
      </Col>
      <Col sm={6}>{body}</Col>
    </Form.Group>
  ) : (
    <Form.Group>
      <Form.Label>{header}</Form.Label>
      {body}
    </Form.Group>
  );
