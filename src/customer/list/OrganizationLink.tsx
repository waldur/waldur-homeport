import { FC, PropsWithChildren, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getUser } from '@waldur/workspace/selectors';

interface OwnProps {
  uuid: string;
  className?: string;
  onClick?(): void;
  asButton?: boolean;
}

const PERMISSION_MAP = {
  customer: 'organization.dashboard',
  project: 'marketplace-projects',
  callmanagingorganisation: 'call-management.dashboard',
  call: 'call-management.dashboard',
};

const PERMISSION_PRIORITY = [
  'customer',
  'project',
  'callmanagingorganisation',
  'call',
];

export const OrganizationLink: FC<PropsWithChildren<OwnProps>> = ({
  uuid,
  onClick,
  className,
  asButton,
  children,
}) => {
  const user = useSelector(getUser);

  const linkState = useMemo(() => {
    // Staff and support have the highest priority access
    if (user.is_staff || user.is_support) {
      return PERMISSION_MAP.customer;
    }

    // Find the highest-priority permission the user has for this organization
    for (const scope of PERMISSION_PRIORITY) {
      const hasPermission = user.permissions.some(
        (p) => p.scope_type === scope && p.customer_uuid === uuid,
      );
      if (hasPermission) {
        return PERMISSION_MAP[scope];
      }
    }

    // If no permissions match, there is no link
    return null;
  }, [user, uuid]);

  if (linkState) {
    return (
      <Link
        state={linkState}
        params={{ uuid }}
        onClick={onClick}
        className={className}
      >
        {children}
      </Link>
    );
  }

  // Fallback rendering for users without link permissions
  if (asButton) {
    return (
      <button type="button" className={className} disabled>
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
};
