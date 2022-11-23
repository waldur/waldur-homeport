import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const PermissionDetails = ({ row }) => (
  <>
    <Field
      label={translate('Permission granted by')}
      value={row.created_by_full_name || row.created_by_username}
    />
    <Field
      label={translate('Permission granted at')}
      value={formatDateTime(row.created)}
    />
    <Field
      label={translate('Permission expires at')}
      value={formatDateTime(row.expiration_time)}
    />
  </>
);
