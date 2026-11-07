import { useQuery } from '@tanstack/react-query';
import {
  ResourcePoolUsage,
  proposalProtectedCallsResourcePoolUsageList,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';
import { callResourcePoolUsageKey } from '@/proposals/budgets';

/**
 * What the call's pools offer and what was requested, awarded and remains of
 * them, per offering component, for the whole call and each round. Readable
 * by the call team; anyone else is answered 404, shown as nothing.
 */
export const useCallResourcePoolUsage = (callUuid: string, enabled = true) =>
  useQuery<ResourcePoolUsage[]>({
    queryKey: callResourcePoolUsageKey(callUuid),
    queryFn: () =>
      proposalProtectedCallsResourcePoolUsageList({
        path: { uuid: callUuid },
      }).then((response) => response.data),
    enabled: Boolean(callUuid) && enabled,
    refetchOnWindowFocus: false,
    retry: false,
    meta: OWN_ERROR_STATE,
  });
