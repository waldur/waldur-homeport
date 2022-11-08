import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { getOrganizationRoles } from '@waldur/customer/team/utils';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const OrganizationRoleSelectField: FunctionComponent = () => (
  <Field
    name="organization_role"
    component={(prop) => (
      <Select
        placeholder={translate('Select organization roles')}
        value={prop.input.value}
        onChange={(value) => prop.input.onChange(value)}
        options={getOrganizationRoles()}
        isClearable={true}
        isMulti={true}
      />
    )}
  />
);
