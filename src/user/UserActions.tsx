import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

export const UserActions = () => (
  <>
    <Link state="profile.manage" className="btn btn-light me-3">
      {translate('Manage')}
    </Link>

    <Link state="profile.events" className="btn btn-light me-3">
      {translate('Audit logs')}
    </Link>

    {hasSupport && (
      <Link state="profile.issues" className="btn btn-light me-3">
        {translate('Issues')}
      </Link>
    )}
  </>
);
