import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { Role } from '@waldur/permissions/types';

export const RoleGroup: FunctionComponent<{ roles: Role[] }> = ({ roles }) => (
  <Form.Group className="mb-5">
    <Form.Label>
      {translate('Role')} <span className="text-danger">*</span>
    </Form.Label>

    <Field
      name="role"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select role...')}
          options={roles}
          validate={[required]}
          value={fieldProps.input.value}
          onChange={(item) => fieldProps.input.onChange(item)}
          getOptionLabel={(item) => item.description || item.name}
          getOptionValue={(item) => item.uuid}
        />
      )}
    />
  </Form.Group>
);
