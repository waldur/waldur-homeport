import * as React from 'react';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import { translate } from '@waldur/i18n';

export const UserGroup = ({ editUser }) =>
  editUser ? (
    <FormGroup>
      <FormControl.Static>
        <strong>{translate('User')}</strong>:{' '}
        {editUser.full_name || editUser.username}
      </FormControl.Static>
    </FormGroup>
  ) : null;
