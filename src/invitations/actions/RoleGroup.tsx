import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { Role } from '@/permissions/types';

export const RoleGroup: FunctionComponent<{ roles: Role[]; disabled }> = ({
  roles,
  disabled,
}) => (
  <FormGroup
    label={translate('Role')}
    description={translate(
      'For public invitations, only project-level roles can be selected.',
    )}
    required
  >
    <Field
      name="role"
      component={SelectField}
      validate={required}
      options={roles}
      getOptionLabel={(item) => item.description || item.name}
      getOptionValue={(item) => item.uuid}
      isDisabled={disabled}
    />
  </FormGroup>
);
