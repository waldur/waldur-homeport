import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { getRoles } from '@waldur/customer/team/utils';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const ProjectRoleSelectField: FunctionComponent = () => (
  <Field
    name="project_role"
    component={(prop) => (
      <Select
        placeholder={translate('Select project roles')}
        value={prop.input.value}
        onChange={(value) => prop.input.onChange(value)}
        options={getRoles()}
        isClearable={true}
        isMulti={true}
      />
    )}
  />
);
