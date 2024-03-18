import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getProjectRoles } from '@waldur/permissions/utils';

export const ProjectRoleSelectField: FunctionComponent = () => (
  <Field
    name="project_role"
    component={(prop) => (
      <Select
        placeholder={translate('Select project roles')}
        value={prop.input.value}
        onChange={(value) => prop.input.onChange(value)}
        options={getProjectRoles()}
        getOptionLabel={(role) => role.description || role.name}
        getOptionValue={({ name }) => name}
        isClearable={true}
        isMulti={true}
      />
    )}
  />
);
