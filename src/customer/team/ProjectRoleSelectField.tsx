import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { REACT_MULTI_SELECT_TABLE_FILTER, Select } from '@/form/themed-select';
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
        {...REACT_MULTI_SELECT_TABLE_FILTER}
      />
    )}
  />
);
