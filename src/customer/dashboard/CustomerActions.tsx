import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const CustomerActions = () => (
  <div>
    <Link state="organization.manage" className="btn btn-light me-3">
      {translate('Manage')}
    </Link>

    <Link state="organization.events" className="btn btn-light me-3">
      {translate('Audit logs')}
    </Link>

    <Link state="organization.issues" className="btn btn-light">
      {translate('Issues')}
    </Link>
  </div>
);
