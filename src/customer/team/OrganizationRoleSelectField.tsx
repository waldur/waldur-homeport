import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getCustomerRoles } from '@waldur/permissions/utils';

export const OrganizationRoleSelectField: FunctionComponent = () => (
  <Field
    name="organization_role"
    component={(prop) => (
      <Select
        placeholder={translate('Select organization roles')}
        value={prop.input.value}
        onChange={(value) => prop.input.onChange(value)}
        options={getCustomerRoles()}
        getOptionLabel={({ description }) => description}
        getOptionValue={({ name }) => name}
        isClearable={true}
        isMulti={true}
      />
    )}
  />
);
