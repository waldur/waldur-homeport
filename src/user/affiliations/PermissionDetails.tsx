import { Permission } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { formatGrantSource } from './GrantSourceIndicator';

export const PermissionDetails = ({
  permission,
}: {
  permission: Permission;
}) => (
  <>
    <PropertyItem
      label={translate('Role')}
      value={permission.role_description}
    />
    <PropertyItem
      label={translate('Permission granted by')}
      value={
        formatGrantSource(permission.source) ||
        permission.created_by_full_name ||
        permission.created_by_username
      }
    />

    <PropertyItem
      label={translate('Permission granted at')}
      value={propVal.date(permission.created, { precision: 'datetime' })}
    />

    {permission.expiration_time ? (
      <PropertyItem
        label={translate('Permission expires at')}
        value={propVal.date(permission.expiration_time, {
          precision: 'datetime',
        })}
      />
    ) : null}
  </>
);
