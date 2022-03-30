import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { Field } from 'redux-form';

import { getRoles } from '@waldur/customer/team/utils';
import { translate } from '@waldur/i18n';

export const ProjectRoleSelectField: FunctionComponent = () => (
  <Form.Group className="col-sm-3">
    <Form.Label>{translate('Project role')}</Form.Label>
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
  </Form.Group>
);
