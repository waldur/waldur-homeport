import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { getProjectRoles } from '@waldur/permissions/utils';

export const RoleGroup: FunctionComponent = () => (
  <Form.Group>
    <Form.Label>{translate('Role')}</Form.Label>
    <Field
      name="role"
      component={SelectField}
      options={getProjectRoles()}
      getOptionLabel={({ description }) => description}
      getOptionValue={({ name }) => name}
      validate={[required]}
    />
  </Form.Group>
);
