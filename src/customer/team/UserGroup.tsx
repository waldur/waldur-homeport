import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const UserGroup: FunctionComponent<{ editUser }> = ({ editUser }) =>
  editUser ? (
    <Form.Group>
      <p>
        <strong>{translate('User')}</strong>:{' '}
        {editUser.full_name || editUser.username}
      </p>
    </Form.Group>
  ) : null;
