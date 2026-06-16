import { useQuery } from '@tanstack/react-query';

import { MINUTE } from '@/core/constants';
import { fetchAttentionRequiredOfferingUsers } from '@/user/offeringUserAttention';
import { useUser } from '@/workspace/hooks';

export const usePendingOfferingUsers = () => {
  const user = useUser();

  return useQuery({
    queryKey: ['pendingOfferingUsers', user?.uuid],
    queryFn: () =>
      user?.uuid
        ? fetchAttentionRequiredOfferingUsers({
            userUuid: user.uuid,
            field: ['uuid'],
          })
        : [],
    enabled: !!user?.uuid,
    staleTime: 2 * MINUTE,
  });
};
