import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

export const CustomerActions = () => {
  const showIssues = useSelector(hasSupport);
  return (
    <div>
      <Link state="organization.manage" className="btn btn-light me-3">
        {translate('Manage')}
      </Link>

      <Link state="organization.events" className="btn btn-light me-3">
        {translate('Audit logs')}
      </Link>

      {showIssues && (
        <Link state="organization.issues" className="btn btn-light">
          {translate('Issues')}
        </Link>
      )}
    </div>
  );
};
