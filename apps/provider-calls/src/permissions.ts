import { useQuery } from '@tanstack/react-query';
import { getAllPages, MAX_PAGE_SIZE } from 'waldur-api-client';
import { MePermission, rolesList, usersMeRetrieve } from 'waldur-js-client';

/**
 * Client-side mirrors of the backend's gates on the provider's actions, so a
 * member whose role cannot act is not offered a button the backend would
 * refuse. Roles are configurable per deployment, so what a role grants is
 * read from /api/roles/, as the portal's own hasPermission does.
 */
export const ACCEPT_CALL_REQUEST = 'OFFERING.ACCEPT_CALL_REQUEST';
export const APPROVE_ORDER = 'ORDER.APPROVE';
export const REJECT_ORDER = 'ORDER.REJECT';

/** Where a grant may sit for the gate to count it (permission_factory's sources). */
export interface Scopes {
  /** A role on the offering itself. */
  offeringUuid?: string;
  /** A role on the offering's organisation. */
  customerUuid?: string;
  /** Also a role on that organisation's service provider (orders only). */
  serviceProvider?: boolean;
}

export interface Grants {
  isStaff: boolean;
  /** /users/me/'s roles: active ones only, each with its expiry. */
  permissions: MePermission[];
  /** Role name → the permissions it carries. */
  roles: Map<string, Set<string>>;
}

const isCurrent = (permission: MePermission, now: number) =>
  !permission.expiration_time ||
  new Date(permission.expiration_time).getTime() > now;

export const can = (
  grants: Grants | undefined,
  permission: string,
  scopes: Scopes,
): boolean => {
  if (!grants) {
    return false;
  }
  if (grants.isStaff) {
    return true;
  }
  const now = Date.now();
  return grants.permissions.some((grant) => {
    if (!isCurrent(grant, now)) {
      return false;
    }
    if (!grants.roles.get(grant.role_name)?.has(permission)) {
      return false;
    }
    switch (grant.scope_type) {
      case 'global':
        return true;
      case 'offering':
        return (
          Boolean(scopes.offeringUuid) &&
          grant.scope_uuid === scopes.offeringUuid
        );
      case 'customer':
        return (
          Boolean(scopes.customerUuid) &&
          grant.scope_uuid === scopes.customerUuid
        );
      case 'service_provider':
        // Keyed by the provider's organisation, as /users/me/ reports it.
        return (
          Boolean(scopes.serviceProvider && scopes.customerUuid) &&
          grant.customer_uuid === scopes.customerUuid
        );
      default:
        return false;
    }
  });
};

const fetchGrants = async (): Promise<Grants> => {
  const [{ data: user }, roles] = await Promise.all([
    usersMeRetrieve(),
    getAllPages((page) =>
      rolesList({
        query: {
          field: ['name', 'permissions'],
          page,
          page_size: MAX_PAGE_SIZE,
        },
      }),
    ),
  ]);
  return {
    isStaff: Boolean(user?.is_staff),
    permissions: user?.permissions ?? [],
    roles: new Map(
      roles.map((role) => [role.name, new Set(role.permissions ?? [])]),
    ),
  };
};

export const useGrants = () =>
  useQuery({
    queryKey: ['provider-calls', 'grants'],
    queryFn: fetchGrants,
    staleTime: 5 * 60_000,
  });
