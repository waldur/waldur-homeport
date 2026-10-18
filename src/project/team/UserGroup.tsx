import { FunctionComponent } from 'react';

import { FormField } from 'waldur-ui';

import { translate } from '@/i18n';
import { GenericPermission } from '@/permissions/types';
import { DASH_ESCAPE_CODE } from '@/table/constants';

export const UserGroup: FunctionComponent<{
  permission: GenericPermission;
}> = ({ permission }) => (
  <FormField>
    <p>
      <strong>{translate('User')}</strong>:{' '}
      {permission.user_full_name || DASH_ESCAPE_CODE}
    </p>
    {Boolean(permission.user_email) && (
      <p>
        <strong>{translate('Email')}</strong>: {permission.user_email}
      </p>
    )}
    <p>
      <strong>{translate('Username')}</strong>: {permission.user_username}
    </p>
  </FormField>
);
