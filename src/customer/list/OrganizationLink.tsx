import { useRouter } from '@uirouter/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, useCallback, useMemo } from 'react';
import { RoleType } from 'waldur-js-client';

import { ButtonVariant, buttonVariants, ButtonSize } from 'waldur-ui';

import { Link } from '@/core/Link';
import { canManageCallsOf } from '@/proposals/callOperators';
import { useUser } from '@/workspace/hooks';

interface OwnProps {
  uuid: string;
  className?: string;
  onClick?(): void;
  asButton?: boolean;
  buttonVariant?: ButtonVariant;
  /** Size and shape of the link when it renders as a button (`buttonVariant`). */
  buttonSize?: ButtonSize;
  buttonIconOnly?: boolean;
}

// The page each kind of role scope opens, typed by the SDK's role scopes.
const PERMISSION_MAP: Partial<Record<RoleType, string>> = {
  customer: 'organization.dashboard',
  project: 'marketplace-projects',
  call_organizer: 'call-management.dashboard',
  call: 'call-management.dashboard',
  // A service provider manager may only read the organization's identity
  // (waldur/waldur-mastermind#396); their pages are the provider workspace.
  service_provider: 'marketplace-provider-dashboard',
};

const PERMISSION_PRIORITY: RoleType[] = [
  'customer',
  'project',
  'call_organizer',
  'call',
  'service_provider',
];

const useOrganizationLinkState = (uuid: string) => {
  const user = useUser();

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
      if (!hasPermission) continue;
      // A call role leads to the organisation's call management only for
      // those who may run its calls; a reviewer or panel member of a call
      // would be refused there, and reads the organisation instead.
      if (
        (scope === 'call' || scope === 'call_organizer') &&
        !canManageCallsOf(user, uuid)
      ) {
        return PERMISSION_MAP.customer;
      }
      return PERMISSION_MAP[scope];
    }

    // No role that opens the organisation: there is no link. An offering
    // role alone does not -- the organisation is not readable through it.
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
  buttonSize,
  buttonIconOnly,
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
        buttonSize={buttonSize}
        buttonIconOnly={buttonIconOnly}
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
          buttonVariant &&
            buttonVariants({
              variant: buttonVariant,
              size: buttonSize,
              iconOnly: buttonIconOnly,
            }),
        )}
        disabled
      >
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
};
