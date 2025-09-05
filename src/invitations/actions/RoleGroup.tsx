import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { Role } from '@waldur/permissions/types';

export const RoleGroup: FunctionComponent<{ roles: Role[]; disabled }> = ({
  roles,
  disabled,
}) => (
  <Field
    name="role"
    component={FormGroup}
    label={translate('Role')}
    description={translate(
      'For public invitations, only project-level roles can be selected.',
    )}
    required
    validate={[required]}
    options={roles}
    getOptionLabel={(item) => item.description || item.name}
    getOptionValue={(item) => item.uuid}
    space={5}
    isDisabled={disabled}
  >
    <SelectField />
  </Field>
);
