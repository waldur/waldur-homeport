import { useQueryClient } from '@tanstack/react-query';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';

/** PATCHes the call, then reloads the page's copy and the cached `Call`. */
export const useUpdateCall = (
  call: Pick<Call, 'uuid'>,
  refetch?: () => void,
) => {
  const queryClient = useQueryClient();
  const { mutateAsync } = useManagedMutation({
    mutationFn: (body: Record<string, any>) =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: call.uuid },
        body,
      }),
    successMessage: translate('The call has been updated.'),
    errorMessage: translate('Unable to update call.'),
    onSuccess: async () => {
      refetch?.();
      await queryClient.invalidateQueries({
        queryKey: ['Call', call.uuid],
      });
    },
    closeModal: false,
  });
  return mutateAsync;
};
