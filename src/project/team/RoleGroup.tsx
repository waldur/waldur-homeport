import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { getProjectRoles } from '@waldur/permissions/utils';

export const RoleGroup: FunctionComponent = () => (
  <>
    {getProjectRoles().map((role) => (
      <Form.Group key={role.value}>
        <label>
          <Field
            name="role"
            component="input"
            type="radio"
            value={role.value}
          />{' '}
          {role.label}
        </label>
      </Form.Group>
    ))}
  </>
);
