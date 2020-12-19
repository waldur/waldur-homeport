import { FunctionComponent } from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { getRoles } from '@waldur/customer/team/utils';
import { translate } from '@waldur/i18n';

export const ProjectRoleSelectField: FunctionComponent = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('Project role')}</label>
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
  </div>
);
