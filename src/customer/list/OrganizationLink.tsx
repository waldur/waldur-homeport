import { useRouter } from '@uirouter/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, useCallback, useMemo } from 'react';
import { Variant } from 'react-bootstrap/esm/types';
import { useSelector } from 'react-redux';

import { Link } from '@/core/Link';
import { getUser } from '@/workspace/selectors';

interface OwnProps {
  uuid: string;
  className?: string;
  onClick?(): void;
  asButton?: boolean;
  buttonVariant?: Variant;
}

const PERMISSION_MAP = {
  customer: 'organization.dashboard',
  project: 'marketplace-projects',
  call_organizer: 'call-management.dashboard',
  call: 'call-management.dashboard',
};

const PERMISSION_PRIORITY = ['customer', 'project', 'call_organizer', 'call'];

const useOrganizationLinkState = (uuid: string) => {
  const user = useSelector(getUser);

  return useMemo(() => {
    // Staff and support have the highest priority access
    if (user.is_staff || user.is_support) {
      return PERMISSION_MAP.customer;
    }

    // Find the highest-priority permission the user has for this organization
    for (const scope of PERMISSION_PRIORITY) {
      const hasPermission = user.permissions.some(
        (p) =>
          p.scope_type === scope &&
          (p.customer_uuid === uuid || p.scope_uuid === uuid),
      );
      if (hasPermission) {
        return PERMISSION_MAP[scope];
      }
    }

    // If no permissions match, there is no link
    return null;
  }, [user, uuid]);
};

export const useOrganizationLink = (uuid: string) => {
  const router = useRouter();
  const linkState = useOrganizationLinkState(uuid);

  const navigate = useCallback(() => {
    if (linkState) {
      router.stateService.go(linkState, { uuid });
    }
  }, [router, linkState, uuid]);

  return { linkState, navigate };
};

export const OrganizationLink: FC<PropsWithChildren<OwnProps>> = ({
  uuid,
  onClick,
  className,
  asButton,
  buttonVariant,
  children,
}) => {
  const linkState = useOrganizationLinkState(uuid);

  if (linkState) {
    return (
      <Link
        state={linkState}
        params={{ uuid }}
        onClick={onClick}
        className={className}
        buttonVariant={buttonVariant}
      >
        {children}
      </Link>
    );
  }

  // Fallback rendering for users without link permissions
  if (asButton) {
    return (
      <button
        type="button"
        className={classNames(
          className,
          buttonVariant && `btn btn-${buttonVariant}`,
        )}
        disabled
      >
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
};
