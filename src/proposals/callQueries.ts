import { useQuery } from '@tanstack/react-query';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { Call } from './types';

/**
 * Cache key for a partial call fetch.
 *
 * The field selector belongs in the key, not only in the request. Two callers
 * asking for different slices of the same call are asking different questions,
 * and sharing one cache entry hands whichever loses the race a payload without
 * the field it came for — silently, since the field is simply absent rather
 * than wrong.
 *
 * ProjectDetailsStep (`fixed_duration_in_days`) and ProjectDetailsSummary
 * (`proposal_field_config`) render on the same page and did exactly that: the
 * duration went unprefilled, or the configured fields fell back to defaults,
 * depending on which resolved first.
 *
 * Sorted so two callers naming the same fields in a different order still
 * share the entry they should share.
 */
export const publicCallKey = (uuid: string, fields: readonly string[]) =>
  ['Call', uuid, [...fields].sort().join(',')] as const;

const FIXED_DURATION_FIELDS = ['fixed_duration_in_days'] as const;

/**
 * The call's fixed duration, for the surfaces that state how long the awarded
 * project will run (see projectDuration.ts). One query, shared by every panel
 * on the page that names it.
 */
export const useCallFixedDuration = (callUuid?: string) => {
  const { data } = useQuery({
    queryKey: publicCallKey(callUuid, FIXED_DURATION_FIELDS),
    queryFn: () =>
      proposalPublicCallsRetrieve({
        path: { uuid: callUuid },
        query: { field: FIXED_DURATION_FIELDS },
      }).then(
        (response) => response.data as Pick<Call, 'fixed_duration_in_days'>,
      ),
    enabled: Boolean(callUuid),
    refetchOnWindowFocus: false,
  });
  return data?.fixed_duration_in_days ?? null;
};
