import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { getProjectRoles } from '@/permissions/utils';

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
        variant="tableFilter"
        isMulti
      />
    )}
  />
);
