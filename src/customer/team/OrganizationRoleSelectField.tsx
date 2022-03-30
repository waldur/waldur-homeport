import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { Field } from 'redux-form';

import { getOrganizationRoles } from '@waldur/customer/team/utils';
import { translate } from '@waldur/i18n';

export const OrganizationRoleSelectField: FunctionComponent = () => (
  <Form.Group className="col-sm-3">
    <Form.Label>{translate('Organization role')}</Form.Label>
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
  </Form.Group>
);
