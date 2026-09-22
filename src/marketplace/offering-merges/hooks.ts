import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  marketplaceOfferingMergesRetrieve,
  marketplaceProviderOfferingsRetrieve,
  OfferingMerge,
  ProviderOfferingDetails,
  User,
} from 'waldur-js-client';

import { useUser } from '@/workspace/hooks';

import { MERGE_QUERY_KEY } from './constants';
import { getRefetchInterval } from './utils';

/**
 * Only staff write merges; support reads them. There is no role-based
 * permission for merges, so the staff flag is the whole rule.
 */
const canManageMerges = (user?: Pick<User, 'is_staff'> | null) =>
  Boolean(user?.is_staff);

export const useCanManageMerges = () => canManageMerges(useUser());

/**
 * The merge record, polled while a task works on it. The state lives on the
 * record, so a reload resumes polling where it left off.
 */
export const useOfferingMerge = (uuid?: string) =>
  useQuery({
    queryKey: MERGE_QUERY_KEY(uuid),
    queryFn: () =>
      marketplaceOfferingMergesRetrieve({ path: { uuid } }).then(
        (response) => response.data as OfferingMerge,
      ),
    enabled: Boolean(uuid),
    refetchInterval: (query) => getRefetchInterval(query.state.data),
  });

/**
 * Plans, components and order-form keys of the offerings in a merge, keyed
 * by uuid. One query for the whole set keeps the result identity stable.
 */
export const useMergeOfferings = (uuids: string[]) => {
  const key = useMemo(() => [...uuids].filter(Boolean).sort(), [uuids]);
  return useQuery({
    queryKey: ['OfferingMergeOfferings', ...key],
    queryFn: async () => {
      const offerings = await Promise.all(
        key.map((uuid) =>
          marketplaceProviderOfferingsRetrieve({ path: { uuid } }).then(
            (response) => response.data as ProviderOfferingDetails,
          ),
        ),
      );
      return Object.fromEntries(
        offerings.map((offering) => [offering.uuid, offering]),
      ) as Record<string, ProviderOfferingDetails>;
    },
    enabled: key.length > 0,
    staleTime: 60 * 1000,
  });
};
