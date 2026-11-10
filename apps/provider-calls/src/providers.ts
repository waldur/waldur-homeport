import { useQuery } from '@tanstack/react-query';
import { fetchResultCount } from 'waldur-api-client';
import {
  Permission,
  proposalRequestedOfferingsCount,
  usersMeRetrieve,
} from 'waldur-js-client';

export interface Provider {
  uuid: string;
  name: string;
  /** Owns the provider organisation: answers requests, does not assess. */
  isOwner: boolean;
  /** Holds OFFERING.MANAGER on at least one of its offerings: the team. */
  isOfferingManager: boolean;
}

const OWNER = 'CUSTOMER.OWNER';
const OFFERING_MANAGER = 'OFFERING.MANAGER';

/**
 * The provider organisations the user works for, from their own roles: an
 * offering role names its offering's organisation, an owner role the
 * organisation itself. Listing every customer would show organisations the
 * user only consumes from; owned organisations are kept only when a call has
 * asked for one of their offerings, since an owner role says nothing about
 * being a provider.
 */
const collectProviders = async (): Promise<Provider[]> => {
  const { data: user } = await usersMeRetrieve();
  const active = (user?.permissions ?? []).filter(
    (permission: Permission) => permission.is_active !== false,
  );
  const byUuid = new Map<string, Provider>();
  const entry = (uuid: string, name: string) => {
    if (!byUuid.has(uuid)) {
      byUuid.set(uuid, {
        uuid,
        name,
        isOwner: false,
        isOfferingManager: false,
      });
    }
    return byUuid.get(uuid);
  };

  for (const permission of active) {
    if (permission.scope_type === 'offering' && permission.customer_uuid) {
      const provider = entry(
        permission.customer_uuid,
        permission.customer_name ?? permission.customer_uuid,
      );
      if (permission.role_name === OFFERING_MANAGER) {
        provider.isOfferingManager = true;
      }
    }
  }

  const owned = active.filter(
    (permission) =>
      permission.scope_type === 'customer' && permission.role_name === OWNER,
  );
  const ownedInCalls = await Promise.all(
    owned.map(async (permission) => {
      const result = await proposalRequestedOfferingsCount({
        query: { provider_uuid: permission.scope_uuid },
      });
      return fetchResultCount(result as never) > 0 ? permission : null;
    }),
  );
  for (const permission of ownedInCalls.filter(Boolean)) {
    entry(permission.scope_uuid, permission.scope_name).isOwner = true;
  }

  return [...byUuid.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const useProviders = () =>
  useQuery({
    queryKey: ['provider-calls', 'providers'],
    queryFn: collectProviders,
    staleTime: 5 * 60_000,
  });
