import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface StaticFieldProps {
  label: string;
  value: string;
  plaintext?: boolean;
  disabled?: boolean;
  protected?: boolean;
}

export const StaticField: FunctionComponent<StaticFieldProps> = (props) => (
  <div className="form-floating mb-7">
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
    <Form.Label>{props.label}</Form.Label>
  </div>
);
