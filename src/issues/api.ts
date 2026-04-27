import { useQuery } from '@tanstack/react-query';
import { supportRequestTypesList, type RequestType } from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';

export type { RequestType };

export const useRequestTypes = () => {
  return useQuery({
    queryKey: ['RequestTypes'],
    queryFn: () =>
      supportRequestTypesList().then((response) => response.data ?? []),
    staleTime: STALE_TIME, // Cache for 5 minutes
  });
};
