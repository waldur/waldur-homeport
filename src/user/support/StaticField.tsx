import { FunctionComponent } from 'react';
import { Col, Form, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface StaticFieldProps {
  label: string;
  value: string;
  plaintext?: boolean;
  disabled?: boolean;
  protected?: boolean;
}

export const StaticField: FunctionComponent<StaticFieldProps> = (props) => (
  <Form.Group as={Row} className="mb-7">
    <Form.Label column sm={3} md={4}>
      {props.label}
    </Form.Label>
    <Col sm={9} md={8}>
      <Form.Control
        readOnly
        plaintext={props.plaintext}
        className={!props.plaintext && 'form-control-solid'}
        defaultValue={props.value}
        disabled={props.disabled}
      />
      {props.protected && (
        <Form.Text muted>
          {translate('Synchronized from identity provider')}
        </Form.Text>
      )}
    </Col>
  </Form.Group>
);
