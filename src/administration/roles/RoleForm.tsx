import { FC } from 'react';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';

import { ROLE_TYPES } from '../../permissions/constants';

import { PermissionField } from './PermissionField';

export const RoleForm: FC<{ role?; submitting? }> = (props) => {
  return (
    <FormContainer submitting={props.submitting}>
      <StringField
        name="name"
        label={translate('Name')}
        validate={required}
        required
        disabled={props.role?.is_system_role}
      />

      <SelectField
        name="content_type"
        label={translate('Type')}
        validate={required}
        required
        disabled={props.role?.is_system_role}
        options={ROLE_TYPES}
        simpleValue
      />

      <PermissionField
        name="permissions"
        label={translate('Permissions')}
        validate={required}
        required
      />
    </FormContainer>
  );
};
