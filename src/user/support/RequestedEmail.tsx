import { FunctionComponent } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface RequestedEmailProps {
  requestedEmail: string;
  onCancelRequest(): void;
  waiting: boolean;
}

export const RequestedEmail: FunctionComponent<RequestedEmailProps> = (
  props,
) => (
  <Form.Group as={Row} className="mb-8">
    <Form.Label column sm={3} md={4}>
      {translate('Requested email')}
    </Form.Label>
    <Col>
      <Form.Control
        readOnly
        defaultValue={props.requestedEmail}
        className="form-control-solid"
      />
    </Col>
    <Col xs="auto">
      <Button onClick={props.onCancelRequest} variant="secondary" size="sm">
        {props.waiting && <i className="fa fa-spinner fa-spin me-1 spinner" />}
        {translate('Cancel request')}
      </Button>
    </Col>
  </Form.Group>
);
