import { useQuery } from '@tanstack/react-query';
import { marketplaceResourcesOfferingRetrieve } from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';

/**
 * Fetches the offering of a marketplace resource. The result is cached under a
 * shared query key, so multiple actions on the same resource reuse one request.
 */
export const useResourceOffering = (
  resourceUuid: string | null | undefined,
  enabled = true,
) => {
  const { data: offering } = useQuery({
    queryKey: ['resource-offering', resourceUuid],
    queryFn: () =>
      marketplaceResourcesOfferingRetrieve({
        path: { uuid: resourceUuid! },
      }).then((response) => response.data),
    enabled: Boolean(resourceUuid) && enabled,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
  return offering;
};
