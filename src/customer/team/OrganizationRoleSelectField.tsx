import { FunctionComponent } from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { getOrganizationRoles } from '@waldur/customer/team/utils';
import { translate } from '@waldur/i18n';

export const OrganizationRoleSelectField: FunctionComponent = () => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('Organization role')}</label>
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
  </div>
);
