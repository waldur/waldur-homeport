import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { BasePermission } from '@waldur/permissions/types';
import { Field } from '@waldur/resource/summary';

export const PermissionDetails = ({
  permission,
}: {
  permission: BasePermission;
}) => (
  <>
    <Field label={translate('Role')} value={permission.role_description} />
    <Field
      label={translate('Permission granted by')}
      value={permission.created_by_full_name || permission.created_by_username}
    />
    <Field
      label={translate('Permission granted at')}
      value={formatDateTime(permission.created)}
    />
    {permission.expiration_time ? (
      <Field
        label={translate('Permission expires at')}
        value={formatDateTime(permission.expiration_time)}
      />
    ) : null}
  </>
);
