import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';

export const UserGroup: FunctionComponent<{
  permission: GenericPermission;
}> = ({ permission }) => (
  <Form.Group>
    <p>
      <strong>{translate('User')}</strong>:{' '}
      {permission.user_full_name || permission.user_username}
    </p>
  </Form.Group>
);
