import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';

import './ExpirationTimeGroup.scss';

export const ExpirationTimeGroup: FunctionComponent<{ disabled }> = ({
  disabled,
}) => (
  <Form.Group id="expiration-time-group">
    <Form.Label>{translate('Role expires on')}</Form.Label>
    <Field
      name="expiration_time"
      component={DateField}
      disabled={disabled}
      minDate={DateTime.now().plus({ days: 1 }).toISO()}
    />
  </Form.Group>
);
