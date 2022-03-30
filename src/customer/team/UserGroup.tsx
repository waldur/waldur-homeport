import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const UserGroup: FunctionComponent<{ editUser }> = ({ editUser }) =>
  editUser ? (
    <Form.Group>
      <Form.Control plaintext>
        <strong>{translate('User')}</strong>:{' '}
        {editUser.full_name || editUser.username}
      </Form.Control>
    </Form.Group>
  ) : null;
