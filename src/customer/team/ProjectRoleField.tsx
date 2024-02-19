import React from 'react';
import { Field } from 'redux-form';

import { SelectField } from '@waldur/form';

import { getProjectRoles } from '../../permissions/utils';

export const ProjectRoleField: React.FC<{
  index: number;
  canChangeRole: boolean;
}> = ({ index, canChangeRole }) => {
  const options = React.useMemo(getProjectRoles, []);
  return (
    <Field
      name={`projects[${index}].role_name`}
      component={SelectField}
      isDisabled={!canChangeRole}
      getOptionLabel={({ description }) => description}
      getOptionValue={({ name }) => name}
      options={options}
      isClearable={true}
    />
  );
};
