import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { datePickerOverlayContainerInDialogs } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';

interface OwnerExpirationTimeGroupProps {
  disabled?: boolean;
}

export const OwnerExpirationTimeGroup: FunctionComponent<OwnerExpirationTimeGroupProps> =
  ({ disabled }) => (
    <Form.Group>
      <Form.Label>{translate('Organization owner role expires on')}</Form.Label>
      <Field
        name="expiration_time"
        component={DateField}
        disabled={disabled}
        minDate={DateTime.now().plus({ days: 1 }).toISO()}
        weekStartsOn={1}
        {...datePickerOverlayContainerInDialogs()}
      />
    </Form.Group>
  );

OwnerExpirationTimeGroup.defaultProps = {
  disabled: false,
};
