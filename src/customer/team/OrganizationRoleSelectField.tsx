import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { getCustomerRoles } from '@/permissions/utils';

export const OrganizationRoleSelectField: FunctionComponent = () => (
  <Field
    name="organization_role"
    component={(prop) => (
      <Select
        placeholder={translate('Select organization roles')}
        value={prop.input.value}
        onChange={(value) => prop.input.onChange(value)}
        options={getCustomerRoles()}
        getOptionLabel={(role) => role.description || role.name}
        getOptionValue={({ name }) => name}
        isClearable={true}
        variant="tableFilter"
        isMulti
      />
    )}
  />
);
