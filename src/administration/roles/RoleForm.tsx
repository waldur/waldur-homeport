import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectField } from '@/form';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

import { ROLE_TYPES } from '../../permissions/constants';

import { PermissionField } from './PermissionField';

export const RoleForm: FC<{ role? }> = (props) => {
  return (
    <>
      <FormGroup label={translate('Name')} required>
        <Field
          component={StringField as any}
          name="name"
          validate={required}
          disabled={props.role?.is_system_role}
        />
      </FormGroup>

      <FormGroup label={translate('Type')} required>
        <Field
          component={SelectField as any}
          name="content_type"
          validate={required}
          disabled={props.role?.is_system_role}
          options={ROLE_TYPES}
          simpleValue
        />
      </FormGroup>

      <FormGroup label={translate('Permissions')} required>
        <Field
          component={PermissionField as any}
          name="permissions"
          validate={required}
        />
      </FormGroup>
    </>
  );
};
