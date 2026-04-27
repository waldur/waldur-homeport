import { useQuery } from '@tanstack/react-query';
import {
  marketplaceOfferingUsersList,
  OfferingUserState,
} from 'waldur-js-client';

import { MINUTE } from '@/core/constants';
import { useUser } from '@/workspace/hooks';

const PENDING_STATES: OfferingUserState[] = [
  'Pending account linking',
  'Pending additional validation',
];

export const usePendingOfferingUsers = () => {
  const user = useUser();

  return useQuery({
    queryKey: ['pendingOfferingUsers', user?.uuid],
    queryFn: async () => {
      if (!user?.uuid) return [];

      const response = await marketplaceOfferingUsersList({
        query: {
          user_uuid: user.uuid,
          state: PENDING_STATES,
          field: ['uuid', 'state'],
        },
      });

      return response.data;
    },
    enabled: !!user?.uuid,
    staleTime: 2 * MINUTE,
  });
};
