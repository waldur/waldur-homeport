import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { getCustomerRoles } from '@waldur/permissions/utils';

export const CustomerRoleGroup: FunctionComponent = () => (
  <>
    {getCustomerRoles().map((role) => (
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
