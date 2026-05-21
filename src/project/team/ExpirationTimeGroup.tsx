import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const ExpirationTimeGroup: FunctionComponent<{
  disabled?: boolean;
}> = ({ disabled }) => {
  return (
    <FormGroup
      id="expiration-time-group"
      label={translate('Role expires on')}
      controlId="expiration_time"
      spaceless
    >
      <Field
        name="expiration_time"
        component={DateField}
        disabled={disabled}
        minDate={DateTime.now().plus({ days: 1 }).toISO()}
        placeholder="YYYY-MM-DD"
      />
    </FormGroup>
  );
};
