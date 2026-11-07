import { useQuery } from '@tanstack/react-query';
import { proposalRequestedOfferingsCount, User } from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

/** A provider organisation whose part in calls the user answers for. */
export interface ProviderCallScope {
  uuid: string;
  name: string;
}

type PermissionHolder = Pick<User, 'is_staff' | 'permissions'>;

const addScope = (
  scopes: Map<string, ProviderCallScope>,
  uuid: string,
  name: string,
) => {
  if (!scopes.has(uuid)) {
    scopes.set(uuid, { uuid, name });
  }
};

/**
 * The providers on whose offerings the user may answer call requests as an
 * offering manager. The grant itself says so: no request needed.
 */
export const getOfferingManagerProviders = (
  user: PermissionHolder | undefined,
): ProviderCallScope[] => {
  const scopes = new Map<string, ProviderCallScope>();
  for (const grant of user?.permissions ?? []) {
    if (
      grant.scope_type === 'offering' &&
      grant.customer_uuid &&
      hasPermission(
        { is_staff: false, permissions: [grant] },
        {
          permission: PermissionEnum.ACCEPT_REQUESTED_OFFERING,
          offeringId: grant.scope_uuid,
        },
      )
    ) {
      addScope(scopes, grant.customer_uuid, grant.customer_name);
    }
  }
  return [...scopes.values()];
};

/**
 * The organisations whose call requests the user answers through a role on
 * the organisation itself (an owner). Any organisation can have an owner, so
 * whether it provides offerings to calls is asked of the API.
 */
export const getOrganisationCandidates = (
  user: PermissionHolder | undefined,
): ProviderCallScope[] => {
  const scopes = new Map<string, ProviderCallScope>();
  for (const grant of user?.permissions ?? []) {
    if (
      ['customer', 'service_provider'].includes(grant.scope_type) &&
      grant.customer_uuid &&
      hasPermission(
        { is_staff: false, permissions: user.permissions },
        {
          permission: PermissionEnum.ACCEPT_REQUESTED_OFFERING,
          customerId: grant.customer_uuid,
        },
      )
    ) {
      addScope(scopes, grant.customer_uuid, grant.customer_name);
    }
  }
  return [...scopes.values()];
};

/**
 * The providers the user takes part in calls for: those whose offerings they
 * manage, and the organisations they own whose offerings some call requests.
 *
 * Offering managers come from the user's grants alone. Owners cost one count
 * per owned organisation, asked again at most once a minute and only of
 * users who own one, so applicants and reviewers cost nothing.
 */
export const useProviderCallScopes = (): ProviderCallScope[] => {
  const user = useUser();
  const managed = getOfferingManagerProviders(user);
  const candidates = getOrganisationCandidates(user).filter(
    (candidate) => !managed.some(({ uuid }) => uuid === candidate.uuid),
  );
  const candidateKey = candidates.map(({ uuid }) => uuid).join(',');
  const { data: owned = [] } = useQuery({
    queryKey: ['provider-call-scopes', user?.uuid, candidateKey],
    queryFn: async () => {
      const counts = await Promise.all(
        candidates.map(async (candidate) =>
          fetchResultCount(
            await proposalRequestedOfferingsCount({
              query: { provider_uuid: candidate.uuid },
            }),
          ),
        ),
      );
      return candidates.filter((_, index) => counts[index] > 0);
    },
    enabled: !!user?.uuid && candidates.length > 0,
    refetchOnWindowFocus: false,
    // A request answered or a new call's request changes the list; accepting
    // or rejecting one invalidates it at once, the rest is caught within a
    // minute.
    staleTime: 60 * 1000,
  });
  // By name, owned and managed alike, so the entries keep their places.
  const scopes = new Map<string, ProviderCallScope>();
  for (const scope of [...managed, ...owned]) {
    addScope(scopes, scope.uuid, scope.name);
  }
  return [...scopes.values()].sort((a, b) => a.name.localeCompare(b.name));
};
