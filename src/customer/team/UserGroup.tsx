import { FunctionComponent } from 'react';

import { FormField } from 'waldur-ui';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

export const UserGroup: FunctionComponent<{ permission }> = ({
  permission,
}) => (
  <FormField>
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
  </FormField>
);
