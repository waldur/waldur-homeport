import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n/translate';

export const CallEditButton = ({ row }) => {
  return (
    <Link
      state="call-management.protected-call-update-details"
      params={{ call_uuid: row.uuid }}
      className="btn btn-primary"
    >
      <i className="fa fa-edit" />
      <span>{translate('Edit')}</span>
    </Link>
  );
};
