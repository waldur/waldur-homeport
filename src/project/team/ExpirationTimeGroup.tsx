import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { ControlLabel, FormGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { datePickerOverlayContainerInDialogs } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';

import './ExpirationTimeGroup.scss';

export const ExpirationTimeGroup: FunctionComponent<{ disabled }> = ({
  disabled,
}) => (
  <FormGroup id="expiration-time-group">
    <ControlLabel>{translate('Role expires on')}</ControlLabel>
    <Field
      name="expiration_time"
      component={DateField}
      disabled={disabled}
      minDate={DateTime.now().plus({ days: 1 }).toISO()}
      weekStartsOn={1}
      {...datePickerOverlayContainerInDialogs()}
    />
  </FormGroup>
);
