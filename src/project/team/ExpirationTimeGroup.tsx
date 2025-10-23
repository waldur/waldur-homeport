import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ExpirationTimeGroup: FunctionComponent<{ disabled?: boolean }> = ({
  disabled,
}) => (
  <FormGroup
    id="expiration-time-group"
    label={translate('Role expires on')}
    spaceless
  >
    <Field
      name="expiration_time"
      component={DateField as any}
      disabled={disabled}
      minDate={DateTime.now().plus({ days: 1 }).toISO()}
      placeholder="YYYY-MM-DD"
    />
  </FormGroup>
);
