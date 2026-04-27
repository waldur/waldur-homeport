import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

export const UserGroup: FunctionComponent<{ permission }> = ({
  permission,
}) => (
  <Form.Group>
    <p>
      <strong>{translate('User')}</strong>:{' '}
      {permission.full_name || DASH_ESCAPE_CODE}
    </p>
    {Boolean(permission.email) && (
      <p>
        <strong>{translate('Email')}</strong>: {permission.email}
      </p>
    )}
    <p>
      <strong>{translate('Username')}</strong>: {permission.username}
    </p>
  </Form.Group>
);
