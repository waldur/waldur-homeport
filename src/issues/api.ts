import { useQuery } from '@tanstack/react-query';
import { supportRequestTypesList, type RequestType } from 'waldur-js-client';

export type { RequestType };

export const useRequestTypes = () => {
  return useQuery({
    queryKey: ['RequestTypes'],
    queryFn: () =>
      supportRequestTypesList().then((response) => response.data ?? []),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
