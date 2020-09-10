import moment from 'moment-timezone';
import * as React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import './ExpirationTimeGroup.scss';

export const ExpirationTimeGroup = ({ disabled }) => (
  <FormGroup id="expiration-time-group">
    <ControlLabel>{translate('Role expires on')}</ControlLabel>
    <Field
      name="expiration_time"
      component={DateField}
      disabled={disabled}
      minDate={moment().add(1, 'days').toISOString()}
      weekStartsOn={1}
    />
  </FormGroup>
);
