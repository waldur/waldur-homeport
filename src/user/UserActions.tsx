import { GearSix, ListMagnifyingGlass, Warning } from '@phosphor-icons/react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';

export const UserActions = () => (
  <>
    <Link state="profile.manage" className="btn btn-secondary me-3">
      <span className="svg-icon svg-icon-2">
        <GearSix />
      </span>
      {translate('Manage')}
    </Link>

    <Link state="profile.events" className="btn btn-secondary me-3">
      <span className="svg-icon svg-icon-2">
        <ListMagnifyingGlass />
      </span>
      {translate('Audit logs')}
    </Link>

    {hasSupport && (
      <Link state="profile.issues" className="btn btn-secondary me-3">
        <span className="svg-icon svg-icon-2">
          <Warning />
        </span>
        {translate('Issues')}
      </Link>
    )}
  </>
);
