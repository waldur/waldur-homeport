import moment from 'moment-timezone';
import { FunctionComponent } from 'react';
import { ControlLabel, FormGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { datePickerOverlayContainerInDialogs } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';

interface OwnerExpirationTimeGroupProps {
  disabled?: boolean;
}

export const OwnerExpirationTimeGroup: FunctionComponent<OwnerExpirationTimeGroupProps> = ({
  disabled,
}) => (
  <FormGroup>
    <ControlLabel>
      {translate('Organization owner role expires on')}
    </ControlLabel>
    <Field
      name="expiration_time"
      component={DateField}
      disabled={disabled}
      minDate={moment().add(1, 'days').toISOString()}
      weekStartsOn={1}
      {...datePickerOverlayContainerInDialogs()}
    />
  </FormGroup>
);

OwnerExpirationTimeGroup.defaultProps = {
  disabled: false,
};
