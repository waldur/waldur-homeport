import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { RoleEnum } from '@waldur/permissions/enums';
import { formatRole } from '@waldur/permissions/utils';

interface OwnerExpirationTimeGroupProps {
  disabled?: boolean;
}

export const OwnerExpirationTimeGroup: FunctionComponent<OwnerExpirationTimeGroupProps> =
  ({ disabled }) => (
    <Form.Group>
      <Form.Label>
        {translate('{role} role expires on', {
          role: formatRole(RoleEnum.CUSTOMER_OWNER),
        })}
      </Form.Label>
      <Field
        name="expiration_time"
        component={DateField}
        disabled={disabled}
        minDate={DateTime.now().plus({ days: 1 }).toISO()}
      />
    </Form.Group>
  );

OwnerExpirationTimeGroup.defaultProps = {
  disabled: false,
};
